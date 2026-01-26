// PlumAi Tauri Backend
//
// Modules for database, AI, cryptography, publishing, and filesystem

mod ai;
mod commands;
mod crypto;
mod database;
mod filesystem;
mod packages;
mod publishing;

use database::DbState;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Setup logging in debug mode
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize database
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");

            let db_path = app_dir.join("plumai.db");
            log::info!("Database path: {:?}", db_path);

            let conn = Connection::open(&db_path).expect("Failed to open database");

            // Initialize schema
            database::init_database(&conn).expect("Failed to initialize database");

            // Store connection in app state
            app.manage(DbState(Mutex::new(conn)));
            app.manage(ai::speech::SpeechState(Mutex::new(None)));

            log::info!("PlumAi application started");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // App info
            commands::greet,
            commands::get_app_info,
            // Database - Projects
            commands::db_create_project,
            commands::db_get_project,
            commands::db_get_all_projects,
            commands::db_update_project,
            commands::db_delete_project,
            // Database - Chapters
            commands::db_create_chapter,
            commands::db_get_chapters_by_project,
            commands::db_update_chapter,
            commands::db_delete_chapter,
            // Database - Scenes
            commands::db_create_scene,
            commands::db_get_scenes_by_chapter,
            commands::db_update_scene,
            commands::db_delete_scene,
            // Database - Characters
            commands::db_create_character,
            commands::db_get_characters_by_project,
            commands::db_update_character,
            commands::db_delete_character,
            // Database - Relationships
            commands::db_create_relationship,
            commands::db_get_relationships_by_character,
            commands::db_update_relationship,
            commands::db_delete_relationship,
            // Database - Locations
            commands::db_create_location,
            commands::db_get_locations_by_project,
            commands::db_update_location,
            commands::db_delete_location,
            // Database - Lore Items
            commands::db_create_lore_item,
            commands::db_get_lore_items_by_project,
            commands::db_update_lore_item,
            commands::db_delete_lore_item,
            // Database - Timeline Events
            commands::db_create_timeline_event,
            commands::db_get_timeline_events_by_project,
            commands::db_update_timeline_event,
            commands::db_delete_timeline_event,
            // Database - System
            commands::db_clear_all_data,
            commands::db_get_setting,
            commands::db_set_setting,
            // AI
            commands::ai_chat,
            ai::speech::start_dictation,
            ai::speech::stop_dictation,
            // Crypto
            commands::crypto_encrypt,
            commands::crypto_decrypt,
            // Publishing
            commands::publish_pdf,
            commands::publish_pdf_bytes,
            commands::publish_docx,
            commands::publish_docx_bytes,
            // Filesystem
            commands::fs_save_project,
            commands::fs_load_project,
            commands::fs_project_to_json,
            commands::fs_project_from_json,
            // Packages
            commands::get_available_packages,
            commands::get_package_by_id,
            commands::resolve_package_asset,
            commands::inject_package_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
