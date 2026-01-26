use crate::packages::{list_available_packages, models::PackageManifest};
use tauri::{AppHandle, command};

#[command]
pub async fn get_available_packages(app: AppHandle) -> Result<Vec<PackageManifest>, String> {
    list_available_packages(&app)
}

#[command]
pub async fn get_package_by_id(app: AppHandle, id: String) -> Result<Option<PackageManifest>, String> {
    let packages = list_available_packages(&app)?;
    Ok(packages.into_iter().find(|p| p.id == id))
}

#[command]
pub async fn resolve_package_asset(app: AppHandle, package_id: String, asset_path: String) -> Result<String, String> {
    use crate::packages::get_packages_dir;
    let packages_dir = get_packages_dir(&app)?;
    let asset = packages_dir.join(package_id).join("assets").join(asset_path);
    
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
    let package = packages.into_iter().find(|p| p.id == package_id)
        .ok_or_else(|| "Package not found".to_string())?;

    let content = package.content.ok_or_else(|| "Package has no content to inject".to_string())?;
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
                if !avatar.starts_with("http") && !avatar.starts_with("data:") && !avatar.starts_with("/") {
                    let abs_path = package_dir.join("assets").join(&avatar);
                    *avatar = abs_path.to_string_lossy().into_owned();
                }
            }
            
            crate::database::create_character(&conn, &character)
                .map_err(|e| format!("Failed to inject character {}: {}", character.name, e))?;
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



