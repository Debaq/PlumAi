//! IPC Commands for PlumAi
//!
//! This module contains all the commands that can be invoked from the frontend.

use serde::{Deserialize, Serialize};

use crate::ai::{self, AiChatRequest, AiChatResponse};
use crate::crypto::{self, EncryptedData};
use crate::database::{self, DbConn};
use crate::filesystem::{self, ProjectData};
use crate::publishing::{self, DocxOptions, ExportDocument, PdfOptions};
use std::path::PathBuf;

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
pub fn publish_pdf_bytes(
    document: ExportDocument,
    options: PdfOptions,
) -> Result<Vec<u8>, String> {
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
