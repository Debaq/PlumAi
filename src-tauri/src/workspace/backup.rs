//! Backup module - .pluma file compression/decompression

use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

/// Compress a project folder into a .pluma backup file
pub fn compress_project(
    project_path: &Path,
    backup_dir: &Path,
    project_slug: &str,
) -> Result<PathBuf, String> {
    if !project_path.exists() {
        return Err(format!("Project folder does not exist: {}", project_path.display()));
    }

    std::fs::create_dir_all(backup_dir)
        .map_err(|e| format!("Failed to create backup dir: {}", e))?;

    let date = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let backup_filename = format!("{}-{}.pluma", project_slug, date);
    let backup_path = backup_dir.join(&backup_filename);

    let file = File::create(&backup_path)
        .map_err(|e| format!("Failed to create backup file: {}", e))?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    add_dir_to_zip(&mut zip, project_path, project_path, options)?;

    zip.finish()
        .map_err(|e| format!("Failed to finalize zip: {}", e))?;

    log::info!("Backup created: {}", backup_path.display());
    Ok(backup_path)
}

/// Decompress a .pluma backup into a project folder
pub fn decompress_project(
    backup_path: &Path,
    projects_dir: &Path,
) -> Result<PathBuf, String> {
    let file = File::open(backup_path)
        .map_err(|e| format!("Failed to open backup: {}", e))?;
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read zip: {}", e))?;

    // Determine project folder name from backup filename
    let stem = backup_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown-project");
    // Remove date suffix: "slug-YYYYMMDD-HHMMSS" -> "slug"
    let folder_name = if let Some(pos) = stem.rfind('-') {
        if let Some(pos2) = stem[..pos].rfind('-') {
            // Check if the two suffixes look like date-time
            let date_part = &stem[pos2 + 1..pos];
            let time_part = &stem[pos + 1..];
            if date_part.len() == 8 && time_part.len() == 6 {
                &stem[..pos2]
            } else {
                stem
            }
        } else {
            stem
        }
    } else {
        stem
    };

    let project_path = projects_dir.join(folder_name);
    std::fs::create_dir_all(&project_path)
        .map_err(|e| format!("Failed to create project dir: {}", e))?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {}", e))?;

        let out_path = project_path.join(entry.name());

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path)
                .map_err(|e| format!("Failed to create dir: {}", e))?;
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create parent dir: {}", e))?;
            }
            let mut outfile = File::create(&out_path)
                .map_err(|e| format!("Failed to create file: {}", e))?;
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| format!("Failed to extract file: {}", e))?;
        }
    }

    log::info!("Backup decompressed to: {}", project_path.display());
    Ok(project_path)
}

/// List all backups for a project slug
pub fn list_backups(backup_dir: &Path, project_slug: &str) -> Result<Vec<PathBuf>, String> {
    let mut backups = Vec::new();

    if !backup_dir.exists() {
        return Ok(backups);
    }

    let entries = std::fs::read_dir(backup_dir)
        .map_err(|e| format!("Failed to read backup dir: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            if name.starts_with(project_slug) && name.ends_with(".pluma") {
                backups.push(path);
            }
        }
    }

    // Sort by modification time (newest first)
    backups.sort_by(|a, b| {
        let a_time = std::fs::metadata(a).and_then(|m| m.modified()).ok();
        let b_time = std::fs::metadata(b).and_then(|m| m.modified()).ok();
        b_time.cmp(&a_time)
    });

    Ok(backups)
}

/// Remove old backups, keeping only the N most recent
pub fn cleanup_old_backups(
    backup_dir: &Path,
    project_slug: &str,
    keep_count: usize,
) -> Result<usize, String> {
    let backups = list_backups(backup_dir, project_slug)?;
    let mut removed = 0;

    if backups.len() > keep_count {
        for backup in &backups[keep_count..] {
            if let Err(e) = std::fs::remove_file(backup) {
                log::warn!("Failed to remove old backup {}: {}", backup.display(), e);
            } else {
                removed += 1;
            }
        }
    }

    Ok(removed)
}

fn add_dir_to_zip(
    zip: &mut ZipWriter<File>,
    base_path: &Path,
    current_path: &Path,
    options: SimpleFileOptions,
) -> Result<(), String> {
    let entries = std::fs::read_dir(current_path)
        .map_err(|e| format!("Failed to read dir: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        let relative = path
            .strip_prefix(base_path)
            .map_err(|e| format!("Strip prefix error: {}", e))?;
        let name = relative.to_string_lossy().replace('\\', "/");

        if path.is_dir() {
            zip.add_directory(&format!("{}/", name), options)
                .map_err(|e| format!("Failed to add dir to zip: {}", e))?;
            add_dir_to_zip(zip, base_path, &path, options)?;
        } else {
            zip.start_file(&name, options)
                .map_err(|e| format!("Failed to start file in zip: {}", e))?;
            let mut f = File::open(&path)
                .map_err(|e| format!("Failed to open file: {}", e))?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer)
                .map_err(|e| format!("Failed to read file: {}", e))?;
            zip.write_all(&buffer)
                .map_err(|e| format!("Failed to write to zip: {}", e))?;
        }
    }

    Ok(())
}
