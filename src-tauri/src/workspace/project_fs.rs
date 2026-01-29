//! Project filesystem operations - read/write projects as folder structures

use crate::database;
use slug::slugify;
use std::path::{Path, PathBuf};

/// Generate a slug-shortId folder name for a project
pub fn project_slug(title: &str, id: &str) -> String {
    let slug = slugify(title);
    let short_id = if id.len() > 8 { &id[..8] } else { id };
    format!("{}-{}", slug, short_id)
}

/// Get the project folder path within the workspace
pub fn get_project_path(workspace_path: &Path, title: &str, id: &str) -> PathBuf {
    workspace_path
        .join("projects")
        .join(project_slug(title, id))
}

/// Find existing project folder by project ID (searches all project dirs)
pub fn find_project_folder(workspace_path: &Path, project_id: &str) -> Option<PathBuf> {
    let projects_dir = workspace_path.join("projects");
    if !projects_dir.exists() {
        return None;
    }

    if let Ok(entries) = std::fs::read_dir(&projects_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let manifest_path = path.join("manifest.json");
                if manifest_path.exists() {
                    if let Ok(content) = std::fs::read_to_string(&manifest_path) {
                        if let Ok(manifest) = serde_json::from_str::<serde_json::Value>(&content) {
                            if manifest.get("projectId").and_then(|v| v.as_str()) == Some(project_id) {
                                return Some(path);
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

/// Create project folder structure and write initial files
pub fn create_project_folder(
    workspace_path: &Path,
    project: &database::Project,
) -> Result<PathBuf, String> {
    let project_path = get_project_path(workspace_path, &project.title, &project.id);
    crate::workspace::config::create_project_dirs(&project_path)?;

    // Write manifest
    let manifest = serde_json::json!({
        "version": "1.0",
        "projectId": project.id,
        "title": project.title,
        "createdAt": chrono::Utc::now().to_rfc3339(),
        "updatedAt": chrono::Utc::now().to_rfc3339(),
    });

    let manifest_json = serde_json::to_string_pretty(&manifest)
        .map_err(|e| format!("Failed to serialize manifest: {}", e))?;
    std::fs::write(project_path.join("manifest.json"), manifest_json)
        .map_err(|e| format!("Failed to write manifest: {}", e))?;

    // Write project.json
    let project_json = serde_json::to_string_pretty(project)
        .map_err(|e| format!("Failed to serialize project: {}", e))?;
    std::fs::write(project_path.join("project.json"), project_json)
        .map_err(|e| format!("Failed to write project.json: {}", e))?;

    log::info!("Project folder created at: {}", project_path.display());
    Ok(project_path)
}

/// Write full project data to folder (project + all entities)
pub fn write_project_to_folder(
    project_path: &Path,
    project: &database::Project,
    chapters: &[database::Chapter],
    scenes: &[database::Scene],
    characters: &[database::Character],
    locations: &[database::Location],
    lore_items: &[database::LoreItem],
    timeline_events: &[database::TimelineEvent],
) -> Result<(), String> {
    // Update manifest timestamp
    let manifest_path = project_path.join("manifest.json");
    if manifest_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&manifest_path) {
            if let Ok(mut manifest) = serde_json::from_str::<serde_json::Value>(&content) {
                manifest["updatedAt"] = serde_json::json!(chrono::Utc::now().to_rfc3339());
                let _ = std::fs::write(
                    &manifest_path,
                    serde_json::to_string_pretty(&manifest).unwrap_or_default(),
                );
            }
        }
    }

    // Write project.json
    write_json_file(&project_path.join("project.json"), project)?;

    // Write individual entity files
    for chapter in chapters {
        let filename = format!("chapter-{}.json", chapter.id);
        write_json_file(&project_path.join("chapters").join(filename), chapter)?;
    }

    for scene in scenes {
        let filename = format!("scene-{}.json", scene.id);
        write_json_file(&project_path.join("scenes").join(filename), scene)?;
    }

    for character in characters {
        let filename = format!("character-{}.json", character.id);
        write_json_file(&project_path.join("characters").join(filename), character)?;
    }

    for location in locations {
        let filename = format!("location-{}.json", location.id);
        write_json_file(&project_path.join("locations").join(filename), location)?;
    }

    for lore_item in lore_items {
        let filename = format!("lore-{}.json", lore_item.id);
        write_json_file(&project_path.join("lore").join(filename), lore_item)?;
    }

    for event in timeline_events {
        let filename = format!("event-{}.json", event.id);
        write_json_file(&project_path.join("timeline").join(filename), event)?;
    }

    log::info!("Project written to folder: {}", project_path.display());
    Ok(())
}

/// Read project data from folder
pub fn read_project_from_folder(
    project_path: &Path,
) -> Result<(
    database::Project,
    Vec<database::Chapter>,
    Vec<database::Scene>,
    Vec<database::Character>,
    Vec<database::Location>,
    Vec<database::LoreItem>,
    Vec<database::TimelineEvent>,
), String> {
    // Read project.json
    let project: database::Project = read_json_file(&project_path.join("project.json"))?;

    // Read entity files from directories
    let chapters = read_json_dir::<database::Chapter>(&project_path.join("chapters"))?;
    let scenes = read_json_dir::<database::Scene>(&project_path.join("scenes"))?;
    let characters = read_json_dir::<database::Character>(&project_path.join("characters"))?;
    let locations = read_json_dir::<database::Location>(&project_path.join("locations"))?;
    let lore_items = read_json_dir::<database::LoreItem>(&project_path.join("lore"))?;
    let timeline_events = read_json_dir::<database::TimelineEvent>(&project_path.join("timeline"))?;

    Ok((project, chapters, scenes, characters, locations, lore_items, timeline_events))
}

fn write_json_file<T: serde::Serialize>(path: &Path, data: &T) -> Result<(), String> {
    let json = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Failed to serialize: {}", e))?;
    std::fs::write(path, json)
        .map_err(|e| format!("Failed to write {}: {}", path.display(), e))
}

fn read_json_file<T: for<'de> serde::Deserialize<'de>>(path: &Path) -> Result<T, String> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;
    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse {}: {}", path.display(), e))
}

fn read_json_dir<T: for<'de> serde::Deserialize<'de>>(dir: &Path) -> Result<Vec<T>, String> {
    let mut items = Vec::new();
    if !dir.exists() {
        return Ok(items);
    }

    let entries = std::fs::read_dir(dir)
        .map_err(|e| format!("Failed to read dir {}: {}", dir.display(), e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            match read_json_file::<T>(&path) {
                Ok(item) => items.push(item),
                Err(e) => log::warn!("Skipping {}: {}", path.display(), e),
            }
        }
    }

    Ok(items)
}
