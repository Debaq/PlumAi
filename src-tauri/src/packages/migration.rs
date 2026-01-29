use super::db;
use super::models::{InstalledPackageInfo, PackageManifest};
use rusqlite::Connection;
use std::fs;
use std::path::Path;

/// Scan the packages directory and register any locally-present packages
/// that are not already tracked in the database.
pub fn migrate_local_packages(conn: &Connection, packages_dir: &Path) -> Result<(), String> {
    if !packages_dir.exists() {
        return Ok(());
    }

    let entries = fs::read_dir(packages_dir).map_err(|e| format!("Failed to read packages dir: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let manifest_path = path.join("manifest.json");
        if !manifest_path.exists() {
            continue;
        }

        let content = match fs::read_to_string(&manifest_path) {
            Ok(c) => c,
            Err(_) => continue,
        };

        let manifest: PackageManifest = match serde_json::from_str(&content) {
            Ok(m) => m,
            Err(_) => continue,
        };

        // Check if already registered
        match db::get_installed_package(conn, &manifest.id) {
            Ok(Some(_)) => continue, // Already tracked
            Ok(None) => {}
            Err(_) => continue,
        }

        let metadata_json = serde_json::to_string(&manifest.metadata).unwrap_or_default();

        let info = InstalledPackageInfo {
            id: manifest.id.clone(),
            version: manifest.version,
            author: manifest.author,
            category: manifest.category.to_string(),
            registry_id: "local".to_string(),
            metadata: metadata_json,
            checksum: String::new(),
            size_bytes: 0,
            install_path: path.to_string_lossy().into_owned(),
            installed_at: None,
            updated_at: None,
        };

        if let Err(e) = db::create_installed_package(conn, &info) {
            log::warn!("Failed to register local package {}: {}", manifest.id, e);
        } else {
            log::info!("Registered local package: {}", manifest.id);
        }
    }

    Ok(())
}
