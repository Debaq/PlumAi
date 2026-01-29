//! IPC Commands for PlumAi
//!
//! This module contains all the commands that can be invoked from the frontend.

use serde::{Deserialize, Serialize};

use crate::ai::{self, AiChatRequest, AiChatResponse};
use crate::crypto::{self, EncryptedData};
use crate::database::{self, DbConn};
use crate::filesystem::{self, ProjectData};
use crate::publishing::{self, DocxOptions, ExportDocument, PdfOptions};
use crate::workspace::{self, WorkspaceState};
use std::path::PathBuf;
use tauri::State;

pub mod packages;

pub use packages::*;

// ============================================================================
// App Info Commands
// ============================================================================

/// Application information returned to frontend
#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub tauri_version: String,
    pub platform: String,
}

/// Simple greeting command for testing IPC communication
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to PlumAi.", name)
}

/// Get application information
#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "PlumAi".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        tauri_version: tauri::VERSION.to_string(),
        platform: std::env::consts::OS.to_string(),
    }
}

// ============================================================================
// Database Commands - Projects
// ============================================================================

#[tauri::command]
pub fn db_create_project(db: DbConn<'_>, project: database::Project) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_project(&conn, &project).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_project(db: DbConn<'_>, id: String) -> Result<Option<database::Project>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_project(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_all_projects(db: DbConn<'_>) -> Result<Vec<database::Project>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_all_projects(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_project(db: DbConn<'_>, project: database::Project) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_project(&conn, &project).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_project(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_project(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Chapters
// ============================================================================

#[tauri::command]
pub fn db_create_chapter(db: DbConn<'_>, chapter: database::Chapter) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_chapter(&conn, &chapter).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_chapters_by_project(
    db: DbConn<'_>,
    project_id: String,
) -> Result<Vec<database::Chapter>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_chapters_by_project(&conn, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_chapter(db: DbConn<'_>, chapter: database::Chapter) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_chapter(&conn, &chapter).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_chapter(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_chapter(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Scenes
// ============================================================================

#[tauri::command]
pub fn db_create_scene(db: DbConn<'_>, scene: database::Scene) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_scene(&conn, &scene).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_scenes_by_chapter(
    db: DbConn<'_>,
    chapter_id: String,
) -> Result<Vec<database::Scene>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_scenes_by_chapter(&conn, &chapter_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_scene(db: DbConn<'_>, scene: database::Scene) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_scene(&conn, &scene).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_scene(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_scene(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Characters
// ============================================================================

#[tauri::command]
pub fn db_create_character(db: DbConn<'_>, character: database::Character) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_character(&conn, &character).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_characters_by_project(
    db: DbConn<'_>,
    project_id: String,
) -> Result<Vec<database::Character>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_characters_by_project(&conn, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_character(db: DbConn<'_>, character: database::Character) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_character(&conn, &character).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_character(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_character(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Relationships
// ============================================================================

#[tauri::command]
pub fn db_create_relationship(
    db: DbConn<'_>,
    character_id: String,
    relationship: database::Relationship,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_relationship(&conn, &character_id, &relationship).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_relationships_by_character(
    db: DbConn<'_>,
    character_id: String,
) -> Result<Vec<database::Relationship>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_relationships_by_character(&conn, &character_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_relationship(
    db: DbConn<'_>,
    character_id: String,
    relationship: database::Relationship,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_relationship(&conn, &character_id, &relationship).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_relationship(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_relationship(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Locations
// ============================================================================

#[tauri::command]
pub fn db_create_location(db: DbConn<'_>, location: database::Location) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_location(&conn, &location).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_locations_by_project(
    db: DbConn<'_>,
    project_id: String,
) -> Result<Vec<database::Location>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_locations_by_project(&conn, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_location(db: DbConn<'_>, location: database::Location) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_location(&conn, &location).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_location(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_location(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Lore Items
// ============================================================================

#[tauri::command]
pub fn db_create_lore_item(db: DbConn<'_>, item: database::LoreItem) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_lore_item(&conn, &item).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_lore_items_by_project(
    db: DbConn<'_>,
    project_id: String,
) -> Result<Vec<database::LoreItem>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_lore_items_by_project(&conn, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_lore_item(db: DbConn<'_>, item: database::LoreItem) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_lore_item(&conn, &item).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_lore_item(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_lore_item(&conn, &id).map_err(|e| e.to_string())
}

// ============================================================================
// Database Commands - Timeline Events
// ============================================================================

#[tauri::command]
pub fn db_create_timeline_event(
    db: DbConn<'_>,
    event: database::TimelineEvent,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::create_timeline_event(&conn, &event).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_timeline_events_by_project(
    db: DbConn<'_>,
    project_id: String,
) -> Result<Vec<database::TimelineEvent>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_timeline_events_by_project(&conn, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update_timeline_event(
    db: DbConn<'_>,
    event: database::TimelineEvent,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::update_timeline_event(&conn, &event).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete_timeline_event(db: DbConn<'_>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::delete_timeline_event(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_clear_all_data(db: DbConn<'_>) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::clear_database(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_setting(db: DbConn<'_>, key: String) -> Result<Option<String>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::get_setting(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_set_setting(db: DbConn<'_>, key: String, value: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::set_setting(&conn, &key, &value).map_err(|e| e.to_string())
}

// ============================================================================
// AI Commands
// ============================================================================

#[tauri::command]
pub async fn ai_chat(request: AiChatRequest) -> Result<AiChatResponse, String> {
    ai::send_chat(request).await.map_err(|e| e.to_string())
}

// ============================================================================
// Crypto Commands
// ============================================================================

#[tauri::command]
pub fn crypto_encrypt(plaintext: String, password: String) -> Result<EncryptedData, String> {
    crypto::encrypt(&plaintext, &password).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn crypto_decrypt(encrypted: EncryptedData, password: String) -> Result<String, String> {
    crypto::decrypt(&encrypted, &password).map_err(|e| e.to_string())
}

// ============================================================================
// Publishing Commands
// ============================================================================

#[tauri::command]
pub fn publish_pdf(
    document: ExportDocument,
    options: PdfOptions,
    output_path: String,
) -> Result<(), String> {
    let path = PathBuf::from(output_path);
    publishing::generate_pdf(&document, &options, &path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn publish_pdf_bytes(document: ExportDocument, options: PdfOptions) -> Result<Vec<u8>, String> {
    publishing::generate_pdf_bytes(&document, &options).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn publish_docx(
    document: ExportDocument,
    options: DocxOptions,
    output_path: String,
) -> Result<(), String> {
    let path = PathBuf::from(output_path);
    publishing::generate_docx(&document, &options, &path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn publish_docx_bytes(
    document: ExportDocument,
    options: DocxOptions,
) -> Result<Vec<u8>, String> {
    publishing::generate_docx_bytes(&document, &options).map_err(|e| e.to_string())
}

// ============================================================================
// Filesystem Commands
// ============================================================================

#[tauri::command]
pub fn fs_save_project(data: ProjectData, output_path: String) -> Result<(), String> {
    let path = PathBuf::from(output_path);
    filesystem::save_project(&data, &path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_load_project(input_path: String) -> Result<ProjectData, String> {
    let path = PathBuf::from(input_path);
    filesystem::load_project(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_project_to_json(data: ProjectData) -> Result<Vec<u8>, String> {
    filesystem::project_to_json_bytes(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_project_from_json(bytes: Vec<u8>) -> Result<ProjectData, String> {
    filesystem::project_from_json_bytes(&bytes).map_err(|e| e.to_string())
}

// ============================================================================
// Workspace Commands
// ============================================================================

#[tauri::command]
pub fn ws_get_default_path() -> Result<String, String> {
    let path = workspace::config::get_default_workspace_path()?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn ws_get_workspace_path(
    ws: State<'_, WorkspaceState>,
) -> Result<Option<String>, String> {
    let lock = ws.0.lock().map_err(|e| e.to_string())?;
    Ok(lock.clone())
}

#[tauri::command]
pub fn ws_set_workspace_path(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    path: String,
) -> Result<(), String> {
    let p = PathBuf::from(&path);
    workspace::config::validate_workspace_path(&p)?;

    // Store in DB setting
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::set_setting(&conn, "workspace_path", &path).map_err(|e| e.to_string())?;

    // Update state
    let mut lock = ws.0.lock().map_err(|e| e.to_string())?;
    *lock = Some(path);

    Ok(())
}

#[tauri::command]
pub fn ws_is_first_launch(db: DbConn<'_>) -> Result<bool, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let path = database::get_setting(&conn, "workspace_path").map_err(|e| e.to_string())?;
    Ok(path.is_none())
}

#[tauri::command]
pub fn ws_initialize_workspace(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    path: String,
) -> Result<(), String> {
    let p = PathBuf::from(&path);
    workspace::config::validate_workspace_path(&p)?;
    workspace::config::create_workspace_structure(&p)?;

    // Store in DB
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::set_setting(&conn, "workspace_path", &path).map_err(|e| e.to_string())?;

    // Update state
    let mut lock = ws.0.lock().map_err(|e| e.to_string())?;
    *lock = Some(path);

    log::info!("Workspace initialized");
    Ok(())
}

#[tauri::command]
pub fn ws_validate_path(path: String) -> Result<bool, String> {
    let p = PathBuf::from(&path);
    match workspace::config::validate_workspace_path(&p) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}

// --- Project Filesystem Commands ---

#[tauri::command]
pub fn ws_save_project_to_folder(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    project_id: String,
) -> Result<String, String> {
    let ws_path = get_ws_path(&ws)?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    workspace::sync::sync_sql_to_filesystem(&conn, &PathBuf::from(&ws_path), &project_id)?;

    let project_path = workspace::project_fs::find_project_folder(&PathBuf::from(&ws_path), &project_id)
        .ok_or("Project folder not found after sync")?;

    Ok(project_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn ws_load_project_from_folder(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    project_id: String,
) -> Result<bool, String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);

    let project_path = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id)
        .ok_or("Project folder not found")?;

    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workspace::sync::sync_filesystem_to_sql(&conn, &project_path)?;

    Ok(true)
}

#[tauri::command]
pub fn ws_project_folder_exists(
    ws: State<'_, WorkspaceState>,
    project_id: String,
) -> Result<bool, String> {
    let ws_path = get_ws_path(&ws)?;
    Ok(workspace::project_fs::find_project_folder(&PathBuf::from(&ws_path), &project_id).is_some())
}

#[tauri::command]
pub fn ws_get_project_path(
    ws: State<'_, WorkspaceState>,
    project_id: String,
) -> Result<Option<String>, String> {
    let ws_path = get_ws_path(&ws)?;
    Ok(workspace::project_fs::find_project_folder(&PathBuf::from(&ws_path), &project_id)
        .map(|p| p.to_string_lossy().to_string()))
}

// --- Backup Commands ---

#[tauri::command]
pub fn ws_compress_project(
    ws: State<'_, WorkspaceState>,
    project_id: String,
    project_title: String,
) -> Result<String, String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);

    let project_path = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id)
        .ok_or("Project folder not found")?;

    let slug = workspace::project_fs::project_slug(&project_title, &project_id);
    let backup_dir = ws_pathbuf.join("backups");

    let backup_path = workspace::backup::compress_project(&project_path, &backup_dir, &slug)?;
    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn ws_decompress_project(
    ws: State<'_, WorkspaceState>,
    backup_path: String,
) -> Result<String, String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);
    let projects_dir = ws_pathbuf.join("projects");

    let project_path = workspace::backup::decompress_project(&PathBuf::from(&backup_path), &projects_dir)?;
    Ok(project_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn ws_list_backups(
    ws: State<'_, WorkspaceState>,
    project_slug: String,
) -> Result<Vec<String>, String> {
    let ws_path = get_ws_path(&ws)?;
    let backup_dir = PathBuf::from(&ws_path).join("backups");

    let backups = workspace::backup::list_backups(&backup_dir, &project_slug)?;
    Ok(backups.iter().map(|p| p.to_string_lossy().to_string()).collect())
}

#[tauri::command]
pub fn ws_close_project(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    project_id: String,
    project_title: String,
) -> Result<(), String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);

    // 1. Sync SQL -> filesystem
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workspace::sync::sync_sql_to_filesystem(&conn, &ws_pathbuf, &project_id)?;

    // 2. Compress to .pluma backup
    if let Some(project_path) = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id) {
        let slug = workspace::project_fs::project_slug(&project_title, &project_id);
        let backup_dir = ws_pathbuf.join("backups");
        workspace::backup::compress_project(&project_path, &backup_dir, &slug)?;

        // 3. Cleanup old backups (keep 5)
        workspace::backup::cleanup_old_backups(&backup_dir, &slug, 5)?;
    }

    log::info!("Project {} closed with backup", project_id);
    Ok(())
}

// --- Image Commands ---

#[tauri::command]
pub fn ws_save_image(
    ws: State<'_, WorkspaceState>,
    project_id: String,
    category: String,
    image_data: String,
) -> Result<String, String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);

    let project_path = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id)
        .ok_or("Project folder not found")?;

    workspace::images::save_image_from_base64(&project_path, &category, &image_data)
}

#[tauri::command]
pub fn ws_resolve_image(
    ws: State<'_, WorkspaceState>,
    project_id: String,
    relative_path: String,
) -> Result<String, String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);

    let project_path = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id)
        .ok_or("Project folder not found")?;

    let resolved = workspace::images::resolve_image_path(&project_path, &relative_path);
    Ok(resolved.to_string_lossy().to_string())
}

// --- Sync Commands ---

#[tauri::command]
pub fn ws_sync_to_disk(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    project_id: String,
) -> Result<(), String> {
    let ws_path = get_ws_path(&ws)?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workspace::sync::sync_sql_to_filesystem(&conn, &PathBuf::from(&ws_path), &project_id)
}

#[tauri::command]
pub fn ws_sync_from_disk(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    project_id: String,
) -> Result<(), String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);

    let project_path = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id)
        .ok_or("Project folder not found")?;

    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workspace::sync::sync_filesystem_to_sql(&conn, &project_path)?;
    Ok(())
}

// --- Migration Commands ---

#[tauri::command]
pub fn ws_migrate_existing_data(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
) -> Result<usize, String> {
    let ws_path = get_ws_path(&ws)?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    workspace::migration::migrate_all_projects(&conn, &PathBuf::from(&ws_path))
}

// --- Open/Close Hybrid Commands ---

#[tauri::command]
pub fn ws_open_project(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    project_id: String,
) -> Result<String, String> {
    let ws_path = get_ws_path(&ws)?;
    let ws_pathbuf = PathBuf::from(&ws_path);
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    // 1. Check if folder exists -> load from folder, sync to SQL
    if let Some(project_path) = workspace::project_fs::find_project_folder(&ws_pathbuf, &project_id) {
        workspace::sync::sync_filesystem_to_sql(&conn, &project_path)?;
        return Ok("folder".to_string());
    }

    // 2. Check if .pluma backup exists -> decompress, load, sync to SQL
    let projects = database::get_all_projects(&conn).map_err(|e| e.to_string())?;
    if let Some(project) = projects.iter().find(|p| p.id == project_id) {
        let slug = workspace::project_fs::project_slug(&project.title, &project.id);
        let backup_dir = ws_pathbuf.join("backups");
        let backups = workspace::backup::list_backups(&backup_dir, &slug)?;

        if let Some(latest_backup) = backups.first() {
            let projects_dir = ws_pathbuf.join("projects");
            let project_path = workspace::backup::decompress_project(latest_backup, &projects_dir)?;
            workspace::sync::sync_filesystem_to_sql(&conn, &project_path)?;
            return Ok("backup".to_string());
        }
    }

    // 3. Fallback -> create folder from SQL
    workspace::sync::sync_sql_to_filesystem(&conn, &ws_pathbuf, &project_id)?;
    Ok("sql".to_string())
}

// --- Move Workspace Command ---

#[tauri::command]
pub fn ws_move_workspace(
    ws: State<'_, WorkspaceState>,
    db: DbConn<'_>,
    new_path: String,
) -> Result<(), String> {
    let old_path = get_ws_path(&ws)?;
    let old = PathBuf::from(&old_path);
    let new = PathBuf::from(&new_path);

    workspace::config::move_workspace(&old, &new)?;

    // Update DB setting
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    database::set_setting(&conn, "workspace_path", &new_path).map_err(|e| e.to_string())?;

    // Update state
    let mut lock = ws.0.lock().map_err(|e| e.to_string())?;
    *lock = Some(new_path);

    Ok(())
}

/// Helper: get workspace path from state or return error
fn get_ws_path(ws: &State<'_, WorkspaceState>) -> Result<String, String> {
    let lock = ws.0.lock().map_err(|e| e.to_string())?;
    lock.clone().ok_or_else(|| "Workspace not configured".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("World");
        assert_eq!(result, "Hello, World! Welcome to PlumAi.");
    }

    #[test]
    fn test_app_info() {
        let info = get_app_info();
        assert_eq!(info.name, "PlumAi");
    }
}
