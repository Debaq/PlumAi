use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::AsyncWriteExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DownloadItemType {
    Model,
    Library,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgress {
    pub item_id: String,
    pub item_type: DownloadItemType,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub percent: f64,
    pub status: DownloadStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DownloadStatus {
    Downloading,
    Extracting,
    Verifying,
    Completed,
    Failed,
    Cancelled,
}

pub struct DownloadOptions {
    pub url: String,
    pub dest_path: PathBuf,
    pub expected_sha256: String,
    pub item_id: String,
    pub item_type: DownloadItemType,
}

static CANCEL_FLAG: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn request_cancel() {
    CANCEL_FLAG.store(true, Ordering::Relaxed);
}

pub fn reset_cancel() {
    CANCEL_FLAG.store(false, Ordering::Relaxed);
}

pub fn is_cancelled() -> bool {
    CANCEL_FLAG.load(Ordering::Relaxed)
}

pub async fn download_file(
    app: &AppHandle,
    options: &DownloadOptions,
) -> Result<(), String> {
    reset_cancel();

    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let downloads_dir = app_dir.join("installation").join("models").join("downloads");
    std::fs::create_dir_all(&downloads_dir).map_err(|e| e.to_string())?;

    let part_file = downloads_dir.join(format!("{}.part", &options.item_id));

    let max_retries = 3;
    let delays = [1, 3, 10];

    for attempt in 0..max_retries {
        if is_cancelled() {
            emit_progress(app, &options, 0, 0, DownloadStatus::Cancelled);
            return Err("Download cancelled".to_string());
        }

        match download_with_resume(app, options, &part_file).await {
            Ok(()) => {
                // Verify checksum if provided
                if !options.expected_sha256.is_empty() {
                    emit_progress(app, options, 0, 0, DownloadStatus::Verifying);
                    if !verify_sha256(&part_file, &options.expected_sha256)? {
                        // Checksum failed, remove part file and retry from scratch
                        let _ = std::fs::remove_file(&part_file);
                        if attempt < max_retries - 1 {
                            log::warn!(
                                "SHA-256 mismatch for {}, retrying from scratch",
                                options.item_id
                            );
                            continue;
                        }
                        emit_progress(app, options, 0, 0, DownloadStatus::Failed);
                        return Err("SHA-256 verification failed after all retries".to_string());
                    }
                }

                // Extract based on file type
                if options.url.ends_with(".zip") {
                    emit_progress(app, options, 0, 0, DownloadStatus::Extracting);
                    extract_zip(&part_file, &options.dest_path)?;
                    let _ = std::fs::remove_file(&part_file);
                } else if options.url.ends_with(".tar.bz2") {
                    emit_progress(app, options, 0, 0, DownloadStatus::Extracting);
                    extract_tar_bz2(&part_file, &options.dest_path)?;
                    let _ = std::fs::remove_file(&part_file);
                } else {
                    // Move part file to destination
                    if let Some(parent) = options.dest_path.parent() {
                        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                    }
                    std::fs::rename(&part_file, &options.dest_path)
                        .map_err(|e| format!("Failed to move file: {}", e))?;
                }

                emit_progress(app, options, 0, 0, DownloadStatus::Completed);
                return Ok(());
            }
            Err(e) => {
                if is_cancelled() {
                    emit_progress(app, options, 0, 0, DownloadStatus::Cancelled);
                    return Err("Download cancelled".to_string());
                }
                if attempt < max_retries - 1 {
                    let delay = delays[attempt as usize];
                    log::warn!(
                        "Download attempt {} failed for {}: {}. Retrying in {}s",
                        attempt + 1,
                        options.item_id,
                        e,
                        delay
                    );
                    tokio::time::sleep(std::time::Duration::from_secs(delay)).await;
                } else {
                    emit_progress(app, options, 0, 0, DownloadStatus::Failed);
                    return Err(format!("Download failed after {} retries: {}", max_retries, e));
                }
            }
        }
    }

    Err("Download failed".to_string())
}

async fn download_with_resume(
    app: &AppHandle,
    options: &DownloadOptions,
    part_file: &Path,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let mut existing_size: u64 = 0;

    if part_file.exists() {
        existing_size = std::fs::metadata(part_file)
            .map(|m| m.len())
            .unwrap_or(0);
    }

    let mut request = client.get(&options.url);
    if existing_size > 0 {
        request = request.header("Range", format!("bytes={}-", existing_size));
    }

    let response = request
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if !response.status().is_success() && response.status() != reqwest::StatusCode::PARTIAL_CONTENT {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let total_bytes = if response.status() == reqwest::StatusCode::PARTIAL_CONTENT {
        response
            .headers()
            .get("content-range")
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.split('/').last())
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(0)
    } else {
        existing_size = 0; // Server doesn't support range, start over
        response.content_length().unwrap_or(0)
    };

    let mut file = if existing_size > 0 {
        tokio::fs::OpenOptions::new()
            .append(true)
            .open(part_file)
            .await
            .map_err(|e| e.to_string())?
    } else {
        tokio::fs::File::create(part_file)
            .await
            .map_err(|e| e.to_string())?
    };

    let mut downloaded = existing_size;
    let mut last_emit = 0u64;
    let progress_interval = 102_400u64; // emit every ~100KB

    use futures::StreamExt;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        if is_cancelled() {
            return Err("Download cancelled".to_string());
        }

        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;

        if downloaded - last_emit >= progress_interval {
            let _percent = if total_bytes > 0 {
                (downloaded as f64 / total_bytes as f64) * 100.0
            } else {
                0.0
            };
            emit_progress(
                app,
                options,
                downloaded,
                total_bytes,
                DownloadStatus::Downloading,
            );
            last_emit = downloaded;
        }
    }

    file.flush().await.map_err(|e| e.to_string())?;

    Ok(())
}

fn verify_sha256(file_path: &Path, expected: &str) -> Result<bool, String> {
    let data = std::fs::read(file_path).map_err(|e| format!("Failed to read file for verification: {}", e))?;
    let mut hasher = Sha256::new();
    hasher.update(&data);
    let result = format!("{:x}", hasher.finalize());
    Ok(result == expected.to_lowercase())
}

fn extract_tar_bz2(archive_path: &Path, dest_dir: &Path) -> Result<(), String> {
    let file = std::fs::File::open(archive_path)
        .map_err(|e| format!("Failed to open tar.bz2: {}", e))?;
    let decompressor = bzip2::read::BzDecoder::new(file);
    let mut archive = tar::Archive::new(decompressor);

    std::fs::create_dir_all(dest_dir).map_err(|e| e.to_string())?;

    archive
        .unpack(dest_dir)
        .map_err(|e| format!("Failed to extract tar.bz2: {}", e))?;

    Ok(())
}

fn extract_zip(zip_path: &Path, dest_dir: &Path) -> Result<(), String> {
    let file = std::fs::File::open(zip_path)
        .map_err(|e| format!("Failed to open zip: {}", e))?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("Failed to read zip: {}", e))?;

    std::fs::create_dir_all(dest_dir).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let out_path = dest_dir.join(file.mangled_name());

        if file.name().ends_with('/') {
            std::fs::create_dir_all(&out_path).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut outfile = std::fs::File::create(&out_path).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

fn emit_progress(
    app: &AppHandle,
    options: &DownloadOptions,
    downloaded: u64,
    total: u64,
    status: DownloadStatus,
) {
    let percent = if total > 0 {
        (downloaded as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    let progress = DownloadProgress {
        item_id: options.item_id.clone(),
        item_type: options.item_type.clone(),
        downloaded_bytes: downloaded,
        total_bytes: total,
        percent,
        status,
    };

    app.emit("download-progress", &progress).unwrap_or_default();
}

pub async fn ensure_runtime_ready(app: &AppHandle) {
    let app_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(e) => {
            log::error!("Failed to get app data dir: {}", e);
            return;
        }
    };

    // Check if libs version.json exists
    let version_file = app_dir
        .join("installation")
        .join("libs")
        .join("version.json");

    if !version_file.exists() {
        log::info!("Native libs not found. They will be downloaded when Sherpa-ONNX is first used.");
    }

    // Check model-registry.json
    let registry_file = app_dir
        .join("installation")
        .join("manifests")
        .join("model-registry.json");

    if !registry_file.exists() {
        // Write default registry
        let registry = super::models::get_model_registry();
        if let Ok(json) = serde_json::to_string_pretty(&registry) {
            let _ = std::fs::write(&registry_file, json);
            log::info!("Default model registry created");
        }
    }
}
