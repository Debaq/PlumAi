use super::db;
use super::models::{InstalledPackageInfo, RegistryPackageEntry, RegistrySource};
use super::registry::github_raw_url;
use rusqlite::Connection;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::{Cursor, Read};
use std::path::Path;

/// Download a package from a registry and extract to disk.
/// Returns the InstalledPackageInfo ready to be saved to DB.
/// NOTE: Does NOT interact with the database - caller is responsible for DB operations.
pub async fn download_and_extract_package(
    source: &RegistrySource,
    entry: &RegistryPackageEntry,
    packages_dir: &Path,
) -> Result<InstalledPackageInfo, String> {
    // Resolve download URL
    let download_url = github_raw_url(&source.url, &entry.download_url)?;

    // Download the .plumapkg (ZIP) file
    log::info!("Downloading package {} from {}", entry.id, download_url);
    let response = reqwest::get(&download_url)
        .await
        .map_err(|e| format!("Failed to download package: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Download failed with status {} for {}",
            response.status(),
            download_url
        ));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read package bytes: {}", e))?;

    // Verify SHA-256 checksum if provided
    if !entry.checksum_sha256.is_empty() {
        let mut hasher = Sha256::new();
        hasher.update(&bytes);
        let actual_hash = format!("{:x}", hasher.finalize());

        if actual_hash != entry.checksum_sha256 {
            return Err(format!(
                "Checksum mismatch for {}: expected {}, got {}",
                entry.id, entry.checksum_sha256, actual_hash
            ));
        }
        log::info!("Checksum verified for package {}", entry.id);
    }

    // Extract ZIP to packages_dir/{package_id}/
    let install_path = packages_dir.join(&entry.id);
    if install_path.exists() {
        fs::remove_dir_all(&install_path)
            .map_err(|e| format!("Failed to clean existing package dir: {}", e))?;
    }
    fs::create_dir_all(&install_path)
        .map_err(|e| format!("Failed to create package dir: {}", e))?;

    let cursor = Cursor::new(bytes.as_ref());
    let mut archive =
        zip::ZipArchive::new(cursor).map_err(|e| format!("Failed to open ZIP archive: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read ZIP entry: {}", e))?;

        let file_name = file.name().to_string();

        // Sanitize: skip entries that try to escape
        if file_name.contains("..") {
            continue;
        }

        let out_path = install_path.join(&file_name);

        if file.is_dir() {
            fs::create_dir_all(&out_path)
                .map_err(|e| format!("Failed to create dir {}: {}", file_name, e))?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create parent dir: {}", e))?;
            }
            let mut buf = Vec::new();
            file.read_to_end(&mut buf)
                .map_err(|e| format!("Failed to read file {}: {}", file_name, e))?;
            fs::write(&out_path, &buf)
                .map_err(|e| format!("Failed to write file {}: {}", file_name, e))?;
        }
    }

    let metadata_json = serde_json::to_string(&entry.metadata).unwrap_or_default();

    let info = InstalledPackageInfo {
        id: entry.id.clone(),
        version: entry.version.clone(),
        author: entry.author.clone(),
        category: entry.category.to_string(),
        registry_id: source.id.clone(),
        metadata: metadata_json,
        checksum: entry.checksum_sha256.clone(),
        size_bytes: entry.size_bytes as i64,
        install_path: install_path.to_string_lossy().into_owned(),
        installed_at: None,
        updated_at: None,
    };

    log::info!("Package {} v{} extracted successfully", entry.id, entry.version);
    Ok(info)
}

/// Register an installed package in the database.
pub fn register_package(conn: &Connection, info: &InstalledPackageInfo) -> Result<(), String> {
    db::create_installed_package(conn, info)
        .map_err(|e| format!("Failed to register package in DB: {}", e))
}

/// Uninstall a package: remove from disk and database.
pub fn uninstall_package(conn: &Connection, packages_dir: &Path, package_id: &str) -> Result<(), String> {
    // Remove directory
    let pkg_dir = packages_dir.join(package_id);
    if pkg_dir.exists() {
        fs::remove_dir_all(&pkg_dir)
            .map_err(|e| format!("Failed to remove package directory: {}", e))?;
    }

    // Remove from database
    db::delete_installed_package(conn, package_id)
        .map_err(|e| format!("Failed to remove package from DB: {}", e))?;

    log::info!("Package {} uninstalled", package_id);
    Ok(())
}
