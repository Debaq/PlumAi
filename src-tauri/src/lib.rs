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
mod workspace;

use database::DbState;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};
use log::LevelFilter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .level(LevelFilter::Error)
                .level_for("plumai_lib", LevelFilter::Debug)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Setup Ctrl+R reload in debug mode
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let script = r#"
                        window.addEventListener('keydown', (e) => {
                            if (e.ctrlKey && e.key === 'r') {
                                console.log('🔄 Forzando recarga desde el teclado...');
                                window.location.reload();
                            }
                        });
                    "#;
                    window.eval(script)?;
                }
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

            // Migrate local packages to DB
            let packages_dir = app_dir.join("packages");
            if let Err(e) = packages::migration::migrate_local_packages(&conn, &packages_dir) {
                log::warn!("Package migration warning: {}", e);
            }

            // Create installation directories
            let installation_dir = app_dir.join("installation");
            let dirs_to_create = [
                installation_dir.join("libs").join("onnxruntime"),
                installation_dir.join("libs").join("sherpa-onnx"),
                installation_dir.join("models").join("vosk"),
                installation_dir.join("models").join("sherpa"),
                installation_dir.join("models").join("downloads"),
                installation_dir.join("manifests"),
            ];
            for dir in &dirs_to_create {
                std::fs::create_dir_all(dir).unwrap_or_else(|e| {
                    log::warn!("Failed to create directory {:?}: {}", dir, e);
                });
            }

            // Store connection in app state
            app.manage(DbState(Mutex::new(conn)));
            app.manage(ai::speech::SpeechState(Mutex::new(None)));

            // Initialize workspace state from DB setting
            {
                let db_state = app.state::<DbState>();
                let db_conn = db_state.0.lock().expect("Failed to lock DB for workspace init");
                let ws_path = database::get_setting(&db_conn, "workspace_path")
                    .unwrap_or(None);
                if let Some(ref path) = ws_path {
                    // Verify workspace is accessible
                    if workspace::config::is_workspace_accessible(std::path::Path::new(path)) {
                        log::info!("Workspace loaded: {}", path);
                    } else {
                        log::warn!("Workspace not accessible: {}", path);
                    }
                }
                app.manage(workspace::WorkspaceState(Mutex::new(ws_path)));
            }

            // Auto-setup: verify runtime readiness in background
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                ai::speech::downloader::ensure_runtime_ready(&app_handle).await;
            });

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
            ai::speech::speech_get_available_models,
            ai::speech::speech_get_installed_models,
            ai::speech::speech_download_model,
            ai::speech::speech_cancel_download,
            ai::speech::speech_delete_model,
            ai::speech::speech_get_config,
            ai::speech::speech_set_config,
            ai::speech::speech_check_status,
            ai::speech::speech_check_libs,
            ai::speech::speech_download_libs,
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
            // Packages (legacy)
            commands::get_available_packages,
            commands::get_package_by_id,
            commands::resolve_package_asset,
            commands::inject_package_content,
            // Package Store
            commands::pkg_get_registries,
            commands::pkg_add_registry,
            commands::pkg_remove_registry,
            commands::pkg_toggle_registry,
            commands::pkg_fetch_catalog,
            commands::pkg_install_package,
            commands::pkg_update_package,
            commands::pkg_uninstall_package,
            commands::pkg_get_installed,
            commands::pkg_check_updates,
            // Workspace
            commands::ws_get_default_path,
            commands::ws_get_workspace_path,
            commands::ws_set_workspace_path,
            commands::ws_is_first_launch,
            commands::ws_initialize_workspace,
            commands::ws_validate_path,
            commands::ws_save_project_to_folder,
            commands::ws_load_project_from_folder,
            commands::ws_project_folder_exists,
            commands::ws_get_project_path,
            commands::ws_compress_project,
            commands::ws_decompress_project,
            commands::ws_list_backups,
            commands::ws_close_project,
            commands::ws_save_image,
            commands::ws_resolve_image,
            commands::ws_sync_to_disk,
            commands::ws_sync_from_disk,
            commands::ws_migrate_existing_data,
            commands::ws_open_project,
            commands::ws_move_workspace,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
