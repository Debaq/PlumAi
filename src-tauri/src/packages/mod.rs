pub mod models;

use std::fs;
use std::path::PathBuf;
use models::PackageManifest;
use tauri::{AppHandle, Manager};

pub fn get_packages_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir()
        .map_err(|_| "Could not find app data directory".to_string())?;
    
    let packages_dir = app_dir.join("packages");
    
    if !packages_dir.exists() {
        fs::create_dir_all(&packages_dir)
            .map_err(|e| format!("Failed to create packages directory: {}", e))?;
    }
    
    Ok(packages_dir)
}

pub fn list_available_packages(app: &AppHandle) -> Result<Vec<PackageManifest>, String> {
    let mut packages = Vec::new();
    
    // 1. Scan System App Data directory
    if let Ok(dir) = get_packages_dir(app) {
        scan_directory(dir, &mut packages);
    }

    // 2. Scan Local Development directory
    if let Ok(cwd) = std::env::current_dir() {
        let local_packages = cwd.join("packages");
        if local_packages.exists() {
            scan_directory(local_packages, &mut packages);
        } else {
            // Try parent if we are inside src-tauri
            let parent_packages = cwd.parent().map(|p| p.join("packages"));
            if let Some(pp) = parent_packages {
                if pp.exists() {
                    scan_directory(pp, &mut packages);
                }
            }
        }
    }

    Ok(packages)
}

fn scan_directory(dir: PathBuf, packages: &mut Vec<PackageManifest>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let manifest_path = path.join("manifest.json");
                if manifest_path.exists() {
                    if let Ok(content) = fs::read_to_string(manifest_path) {
                        if let Ok(manifest) = serde_json::from_str::<PackageManifest>(&content) {
                            // Avoid duplicates by ID
                            if !packages.iter().any(|p| p.id == manifest.id) {
                                packages.push(manifest);
                            }
                        }
                    }
                }
            }
        }
    }
}

