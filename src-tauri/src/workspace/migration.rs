//! Migration module - migrate existing SQL-only projects to hybrid format

use crate::database;
use crate::workspace::{images, project_fs, sync};
use std::path::Path;

/// Migrate all existing projects from SQL to the workspace filesystem
/// Returns the number of projects migrated
pub fn migrate_all_projects(
    conn: &rusqlite::Connection,
    workspace_path: &Path,
) -> Result<usize, String> {
    let projects = database::get_all_projects(conn)
        .map_err(|e| format!("Failed to get projects: {}", e))?;

    let mut migrated = 0;

    for project in &projects {
        // Skip if already has a folder
        if project_fs::find_project_folder(workspace_path, &project.id).is_some() {
            log::info!("Project {} already has folder, skipping", project.id);
            continue;
        }

        match sync::sync_sql_to_filesystem(conn, workspace_path, &project.id) {
            Ok(()) => {
                log::info!("Migrated project: {} ({})", project.title, project.id);
                migrated += 1;

                // Extract base64 images to files
                if let Some(project_path) =
                    project_fs::find_project_folder(workspace_path, &project.id)
                {
                    if let Err(e) = extract_base64_images_for_project(conn, &project_path, &project.id) {
                        log::warn!("Image extraction failed for {}: {}", project.id, e);
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to migrate project {}: {}", project.id, e);
            }
        }
    }

    Ok(migrated)
}

/// Extract base64 images from a project's entities and save them to disk
/// Updates the database records to use relative paths
fn extract_base64_images_for_project(
    conn: &rusqlite::Connection,
    project_path: &Path,
    project_id: &str,
) -> Result<usize, String> {
    let mut extracted = 0;

    // Process chapters
    let chapters = database::get_chapters_by_project(conn, project_id)
        .map_err(|e| e.to_string())?;
    for mut chapter in chapters {
        if let Some(ref image) = chapter.image {
            if let images::ImageKind::Base64(_) = images::classify_image_value(image) {
                match images::save_image_from_base64(project_path, "chapters", image) {
                    Ok(relative_path) => {
                        chapter.image = Some(relative_path);
                        let _ = database::update_chapter(conn, &chapter);
                        extracted += 1;
                    }
                    Err(e) => log::warn!("Failed to extract chapter image: {}", e),
                }
            }
        }
    }

    // Process scenes
    for chapter in database::get_chapters_by_project(conn, project_id).unwrap_or_default() {
        let scenes = database::get_scenes_by_chapter(conn, &chapter.id).unwrap_or_default();
        for mut scene in scenes {
            if let Some(ref image) = scene.image {
                if let images::ImageKind::Base64(_) = images::classify_image_value(image) {
                    match images::save_image_from_base64(project_path, "scenes", image) {
                        Ok(relative_path) => {
                            scene.image = Some(relative_path);
                            let _ = database::update_scene(conn, &scene);
                            extracted += 1;
                        }
                        Err(e) => log::warn!("Failed to extract scene image: {}", e),
                    }
                }
            }
        }
    }

    // Process characters (avatar_url)
    let characters = database::get_characters_by_project(conn, project_id).unwrap_or_default();
    for mut character in characters {
        if let Some(ref avatar) = character.avatar_url {
            if let images::ImageKind::Base64(_) = images::classify_image_value(avatar) {
                match images::save_image_from_base64(project_path, "characters", avatar) {
                    Ok(relative_path) => {
                        character.avatar_url = Some(relative_path);
                        let _ = database::update_character(conn, &character);
                        extracted += 1;
                    }
                    Err(e) => log::warn!("Failed to extract character avatar: {}", e),
                }
            }
        }
    }

    // Process locations (image_url + gallery + plans)
    let locations = database::get_locations_by_project(conn, project_id).unwrap_or_default();
    for mut location in locations {
        let mut updated = false;

        if let Some(ref image_url) = location.image_url {
            if let images::ImageKind::Base64(_) = images::classify_image_value(image_url) {
                match images::save_image_from_base64(project_path, "locations", image_url) {
                    Ok(relative_path) => {
                        location.image_url = Some(relative_path);
                        updated = true;
                        extracted += 1;
                    }
                    Err(e) => log::warn!("Failed to extract location image: {}", e),
                }
            }
        }

        // Process gallery images
        let mut gallery_updated = false;
        let mut new_gallery = Vec::new();
        for item in &location.gallery {
            if let Some(url) = item.get("url").and_then(|v| v.as_str()) {
                if let images::ImageKind::Base64(_) = images::classify_image_value(url) {
                    match images::save_image_from_base64(project_path, "locations", url) {
                        Ok(relative_path) => {
                            let mut new_item = item.clone();
                            new_item["url"] = serde_json::json!(relative_path);
                            new_gallery.push(new_item);
                            gallery_updated = true;
                            extracted += 1;
                            continue;
                        }
                        Err(e) => log::warn!("Failed to extract gallery image: {}", e),
                    }
                }
            }
            new_gallery.push(item.clone());
        }
        if gallery_updated {
            location.gallery = new_gallery;
            updated = true;
        }

        if updated {
            let _ = database::update_location(conn, &location);
        }
    }

    log::info!("Extracted {} base64 images for project {}", extracted, project_id);
    Ok(extracted)
}
