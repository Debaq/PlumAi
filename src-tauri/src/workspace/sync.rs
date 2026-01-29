//! Sync module - Dual write SQL + Filesystem

use crate::database;
use crate::workspace::project_fs;
use std::path::Path;

/// Sync a project from SQL database to filesystem
pub fn sync_sql_to_filesystem(
    conn: &rusqlite::Connection,
    workspace_path: &Path,
    project_id: &str,
) -> Result<(), String> {
    // Load from DB
    let project = database::get_project(conn, project_id)
        .map_err(|e| format!("Failed to get project: {}", e))?
        .ok_or_else(|| format!("Project not found: {}", project_id))?;

    let chapters = database::get_chapters_by_project(conn, project_id)
        .map_err(|e| format!("Failed to get chapters: {}", e))?;

    // Collect all scenes from all chapters
    let mut all_scenes = Vec::new();
    for chapter in &chapters {
        let scenes = database::get_scenes_by_chapter(conn, &chapter.id)
            .map_err(|e| format!("Failed to get scenes: {}", e))?;
        all_scenes.extend(scenes);
    }

    let characters = database::get_characters_by_project(conn, project_id)
        .map_err(|e| format!("Failed to get characters: {}", e))?;

    let locations = database::get_locations_by_project(conn, project_id)
        .map_err(|e| format!("Failed to get locations: {}", e))?;

    let lore_items = database::get_lore_items_by_project(conn, project_id)
        .map_err(|e| format!("Failed to get lore items: {}", e))?;

    let timeline_events = database::get_timeline_events_by_project(conn, project_id)
        .map_err(|e| format!("Failed to get timeline events: {}", e))?;

    // Find or create project folder
    let project_path = match project_fs::find_project_folder(workspace_path, project_id) {
        Some(path) => path,
        None => project_fs::create_project_folder(workspace_path, &project)?,
    };

    // Write to filesystem
    project_fs::write_project_to_folder(
        &project_path,
        &project,
        &chapters,
        &all_scenes,
        &characters,
        &locations,
        &lore_items,
        &timeline_events,
    )?;

    log::info!("Synced project {} to filesystem", project_id);
    Ok(())
}

/// Sync a project from filesystem to SQL database
pub fn sync_filesystem_to_sql(
    conn: &rusqlite::Connection,
    project_path: &Path,
) -> Result<String, String> {
    let (project, chapters, scenes, characters, locations, lore_items, timeline_events) =
        project_fs::read_project_from_folder(project_path)?;

    let project_id = project.id.clone();

    // Upsert project
    match database::get_project(conn, &project_id) {
        Ok(Some(_)) => {
            database::update_project(conn, &project)
                .map_err(|e| format!("Failed to update project: {}", e))?;
        }
        _ => {
            database::create_project(conn, &project)
                .map_err(|e| format!("Failed to create project: {}", e))?;
        }
    }

    // Sync chapters
    for chapter in &chapters {
        match database::get_chapters_by_project(conn, &project_id) {
            Ok(existing) => {
                if existing.iter().any(|c| c.id == chapter.id) {
                    database::update_chapter(conn, chapter)
                        .map_err(|e| format!("Failed to update chapter: {}", e))?;
                } else {
                    database::create_chapter(conn, chapter)
                        .map_err(|e| format!("Failed to create chapter: {}", e))?;
                }
            }
            Err(_) => {
                database::create_chapter(conn, chapter)
                    .map_err(|e| format!("Failed to create chapter: {}", e))?;
            }
        }
    }

    // Sync scenes
    for scene in &scenes {
        let chapter_scenes = database::get_scenes_by_chapter(conn, &scene.chapter_id)
            .unwrap_or_default();
        if chapter_scenes.iter().any(|s| s.id == scene.id) {
            database::update_scene(conn, scene)
                .map_err(|e| format!("Failed to update scene: {}", e))?;
        } else {
            database::create_scene(conn, scene)
                .map_err(|e| format!("Failed to create scene: {}", e))?;
        }
    }

    // Sync characters
    for character in &characters {
        let existing = database::get_characters_by_project(conn, &project_id)
            .unwrap_or_default();
        if existing.iter().any(|c| c.id == character.id) {
            database::update_character(conn, character)
                .map_err(|e| format!("Failed to update character: {}", e))?;
        } else {
            database::create_character(conn, character)
                .map_err(|e| format!("Failed to create character: {}", e))?;
        }
    }

    // Sync locations
    for location in &locations {
        let existing = database::get_locations_by_project(conn, &project_id)
            .unwrap_or_default();
        if existing.iter().any(|l| l.id == location.id) {
            database::update_location(conn, location)
                .map_err(|e| format!("Failed to update location: {}", e))?;
        } else {
            database::create_location(conn, location)
                .map_err(|e| format!("Failed to create location: {}", e))?;
        }
    }

    // Sync lore items
    for lore_item in &lore_items {
        let existing = database::get_lore_items_by_project(conn, &project_id)
            .unwrap_or_default();
        if existing.iter().any(|l| l.id == lore_item.id) {
            database::update_lore_item(conn, lore_item)
                .map_err(|e| format!("Failed to update lore item: {}", e))?;
        } else {
            database::create_lore_item(conn, lore_item)
                .map_err(|e| format!("Failed to create lore item: {}", e))?;
        }
    }

    // Sync timeline events
    for event in &timeline_events {
        let existing = database::get_timeline_events_by_project(conn, &project_id)
            .unwrap_or_default();
        if existing.iter().any(|e| e.id == event.id) {
            database::update_timeline_event(conn, event)
                .map_err(|e| format!("Failed to update timeline event: {}", e))?;
        } else {
            database::create_timeline_event(conn, event)
                .map_err(|e| format!("Failed to create timeline event: {}", e))?;
        }
    }

    log::info!("Synced filesystem to SQL for project {}", project_id);
    Ok(project_id)
}
