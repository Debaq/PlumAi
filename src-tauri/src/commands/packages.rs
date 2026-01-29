use crate::database::{self, DbConn};
use crate::packages::{
    catalog, db as pkg_db, installer, list_available_packages,
    models::*,
    registry,
};
use tauri::{command, AppHandle};

// ============================================================================
// Existing commands (unchanged)
// ============================================================================

#[command]
pub async fn get_available_packages(app: AppHandle) -> Result<Vec<PackageManifest>, String> {
    list_available_packages(&app)
}

#[command]
pub async fn get_package_by_id(
    app: AppHandle,
    id: String,
) -> Result<Option<PackageManifest>, String> {
    let packages = list_available_packages(&app)?;
    Ok(packages.into_iter().find(|p| p.id == id))
}

#[command]
pub async fn resolve_package_asset(
    app: AppHandle,
    package_id: String,
    asset_path: String,
) -> Result<String, String> {
    use crate::packages::get_packages_dir;
    let packages_dir = get_packages_dir(&app)?;
    let asset = packages_dir
        .join(package_id)
        .join("assets")
        .join(asset_path);

    if asset.exists() {
        Ok(asset.to_string_lossy().into_owned())
    } else {
        Err("Asset not found".to_string())
    }
}

#[command]
pub async fn inject_package_content(
    app: AppHandle,
    db: crate::database::DbConn<'_>,
    project_id: String,
    package_id: String,
    _lang: String,
) -> Result<(), String> {
    let packages = crate::packages::list_available_packages(&app)?;
    let package = packages
        .into_iter()
        .find(|p| p.id == package_id)
        .ok_or_else(|| "Package not found".to_string())?;

    let content = package
        .content
        .ok_or_else(|| "Package has no content to inject".to_string())?;
    let package_dir = crate::packages::get_packages_dir(&app)?.join(&package_id);
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    // Inject Characters
    if let Some(characters) = content.characters {
        for char_val in characters {
            let mut character: crate::database::Character = serde_json::from_value(char_val)
                .map_err(|e| format!("Invalid character data: {}", e))?;

            character.project_id = project_id.clone();
            character.origin_package_id = Some(package_id.clone());

            // Resolve relative avatar path
            if let Some(avatar) = character.avatar_url.as_mut() {
                if !avatar.starts_with("http")
                    && !avatar.starts_with("data:")
                    && !avatar.starts_with("/")
                {
                    let abs_path = package_dir.join("assets").join(&avatar);
                    *avatar = abs_path.to_string_lossy().into_owned();
                }
            }

            crate::database::create_character(&conn, &character)
                .map_err(|e| format!("Failed to inject character {}: {}", character.name, e))?;
        }
    }

    // Inject Creatures (stored in project's creatures JSON column)
    if let Some(creatures) = content.creatures {
        if !creatures.is_empty() {
            let project = crate::database::get_project(&conn, &project_id)
                .map_err(|e| format!("Failed to load project for creature injection: {}", e))?
                .ok_or_else(|| "Project not found".to_string())?;

            let mut existing: Vec<serde_json::Value> = project
                .creatures
                .clone()
                .and_then(|v| serde_json::from_value(v).ok())
                .unwrap_or_default();

            for mut creature_val in creatures {
                if let Some(obj) = creature_val.as_object_mut() {
                    if let Some(img) = obj.get("imageUrl").and_then(|v| v.as_str()) {
                        if !img.starts_with("http")
                            && !img.starts_with("data:")
                            && !img.starts_with("/")
                        {
                            let abs_path = package_dir.join("assets").join(img);
                            obj.insert(
                                "imageUrl".to_string(),
                                serde_json::Value::String(abs_path.to_string_lossy().into_owned()),
                            );
                        }
                    }
                }
                existing.push(creature_val);
            }

            let mut updated_project = project;
            updated_project.creatures = Some(
                serde_json::to_value(&existing)
                    .map_err(|e| format!("Failed to serialize creatures: {}", e))?,
            );

            crate::database::update_project(&conn, &updated_project)
                .map_err(|e| format!("Failed to update project with creatures: {}", e))?;
        }
    }

    // Inject Lore Items
    if let Some(lore_items) = content.lore_items {
        for lore_val in lore_items {
            let mut item: crate::database::LoreItem = serde_json::from_value(lore_val)
                .map_err(|e| format!("Invalid lore item data: {}", e))?;

            item.project_id = project_id.clone();
            item.origin_package_id = Some(package_id.clone());

            crate::database::create_lore_item(&conn, &item)
                .map_err(|e| format!("Failed to inject lore item {}: {}", item.title, e))?;
        }
    }

    Ok(())
}

// ============================================================================
// New Package Store commands
// ============================================================================

/// Helper to load registries from app_settings (takes &Connection directly).
fn load_registries_from_conn(conn: &rusqlite::Connection) -> Vec<RegistrySource> {
    let mut sources = vec![registry::official_registry()];

    if let Ok(Some(json)) = database::get_setting(conn, "package_registries") {
        if let Ok(custom) = serde_json::from_str::<Vec<RegistrySource>>(&json) {
            sources.extend(custom);
        }
    }

    sources
}

/// Helper to save custom registries to app_settings.
fn save_custom_registries_to_conn(
    conn: &rusqlite::Connection,
    registries: &[RegistrySource],
) -> Result<(), String> {
    // Only save non-official registries
    let custom: Vec<&RegistrySource> = registries.iter().filter(|r| !r.is_official).collect();
    let json = serde_json::to_string(&custom).map_err(|e| e.to_string())?;
    database::set_setting(conn, "package_registries", &json).map_err(|e| e.to_string())
}

#[command]
pub async fn pkg_get_registries(db: DbConn<'_>) -> Result<Vec<RegistrySource>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    Ok(load_registries_from_conn(&conn))
}

#[command]
pub async fn pkg_add_registry(
    db: DbConn<'_>,
    url: String,
    name: String,
) -> Result<RegistrySource, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut sources = load_registries_from_conn(&conn);

    let id = format!("custom-{}", uuid::Uuid::new_v4().to_string().split('-').next().unwrap_or("0"));

    let new_source = RegistrySource {
        id: id.clone(),
        url,
        name,
        enabled: true,
        is_official: false,
    };

    sources.push(new_source.clone());
    save_custom_registries_to_conn(&conn, &sources)?;

    Ok(new_source)
}

#[command]
pub async fn pkg_remove_registry(db: DbConn<'_>, registry_id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut sources = load_registries_from_conn(&conn);

    // Don't allow removing the official registry
    if let Some(source) = sources.iter().find(|s| s.id == registry_id) {
        if source.is_official {
            return Err("Cannot remove the official registry".to_string());
        }
    }

    sources.retain(|s| s.id != registry_id);
    save_custom_registries_to_conn(&conn, &sources)?;

    Ok(())
}

#[command]
pub async fn pkg_toggle_registry(
    db: DbConn<'_>,
    registry_id: String,
    enabled: bool,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut sources = load_registries_from_conn(&conn);

    if let Some(source) = sources.iter_mut().find(|s| s.id == registry_id) {
        source.enabled = enabled;
    }

    save_custom_registries_to_conn(&conn, &sources)?;
    Ok(())
}

#[command]
pub async fn pkg_fetch_catalog(db: DbConn<'_>) -> Result<Vec<CatalogPackage>, String> {
    // Collect data from DB, then drop the lock before async work
    let (sources, installed) = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        let sources = load_registries_from_conn(&conn);
        let installed = pkg_db::get_all_installed_packages(&conn).map_err(|e| e.to_string())?;
        (sources, installed)
    }; // MutexGuard dropped here

    let results = registry::fetch_all_registries(&sources).await;

    let registries: Vec<(String, RegistryIndex)> = results
        .into_iter()
        .filter_map(|(id, result)| match result {
            Ok(index) => Some((id, index)),
            Err(e) => {
                log::warn!("Failed to fetch registry {}: {}", id, e);
                None
            }
        })
        .collect();

    Ok(catalog::build_catalog(&registries, &installed))
}

#[command]
pub async fn pkg_install_package(
    app: AppHandle,
    db: DbConn<'_>,
    registry_id: String,
    package_id: String,
) -> Result<InstalledPackageInfo, String> {
    let packages_dir = crate::packages::get_packages_dir(&app)?;

    // Get source from DB, then drop the lock
    let source = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        let sources = load_registries_from_conn(&conn);
        sources
            .into_iter()
            .find(|s| s.id == registry_id)
            .ok_or_else(|| format!("Registry '{}' not found", registry_id))?
    }; // MutexGuard dropped here

    // Async: fetch registry and download package
    let index = registry::fetch_registry(&source).await?;
    let entry = index
        .packages
        .iter()
        .find(|p| p.id == package_id)
        .ok_or_else(|| format!("Package '{}' not found in registry '{}'", package_id, registry_id))?;

    let info = installer::download_and_extract_package(&source, entry, &packages_dir).await?;

    // Register in DB (sync, re-acquire lock)
    {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        installer::register_package(&conn, &info)?;
    }

    Ok(info)
}

#[command]
pub async fn pkg_update_package(
    app: AppHandle,
    db: DbConn<'_>,
    registry_id: String,
    package_id: String,
) -> Result<InstalledPackageInfo, String> {
    let packages_dir = crate::packages::get_packages_dir(&app)?;

    // Get source for the registry
    let source = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        let sources = load_registries_from_conn(&conn);
        sources
            .into_iter()
            .find(|s| s.id == registry_id)
            .ok_or_else(|| format!("Registry '{}' not found", registry_id))?
    }; // MutexGuard dropped here

    // Async: fetch registry and download new version (replaces files on disk)
    let index = registry::fetch_registry(&source).await?;
    let entry = index
        .packages
        .iter()
        .find(|p| p.id == package_id)
        .ok_or_else(|| format!("Package '{}' not found in registry '{}'", package_id, registry_id))?;

    let info = installer::download_and_extract_package(&source, entry, &packages_dir).await?;

    // Update existing record in DB (preserves installed_at, sets updated_at)
    {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        installer::update_package_record(&conn, &info)?;
    }

    Ok(info)
}

#[command]
pub async fn pkg_uninstall_package(
    app: AppHandle,
    db: DbConn<'_>,
    package_id: String,
) -> Result<(), String> {
    let packages_dir = crate::packages::get_packages_dir(&app)?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    installer::uninstall_package(&conn, &packages_dir, &package_id)
}

#[command]
pub async fn pkg_get_installed(db: DbConn<'_>) -> Result<Vec<InstalledPackageInfo>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    pkg_db::get_all_installed_packages(&conn).map_err(|e| e.to_string())
}

#[command]
pub async fn pkg_check_updates(db: DbConn<'_>) -> Result<Vec<PackageUpdateInfo>, String> {
    // Collect data from DB, then drop the lock before async work
    let (sources, installed) = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        let sources = load_registries_from_conn(&conn);
        let installed = pkg_db::get_all_installed_packages(&conn).map_err(|e| e.to_string())?;
        (sources, installed)
    }; // MutexGuard dropped here

    let results = registry::fetch_all_registries(&sources).await;

    let registries: Vec<(String, RegistryIndex)> = results
        .into_iter()
        .filter_map(|(id, result)| match result {
            Ok(index) => Some((id, index)),
            Err(e) => {
                log::warn!("Failed to fetch registry {}: {}", id, e);
                None
            }
        })
        .collect();

    Ok(catalog::check_updates(&registries, &installed))
}
