pub mod audio;
pub mod downloader;
pub mod engine_sherpa;
pub mod engine_vosk;
pub mod engine_whisper_api;
pub mod models;

use models::{EngineType, SpeechConfig, SpeechModelInfo, SpeechStatus};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
use tauri::{AppHandle, Manager, State};

pub struct SpeechSession {
    pub running: Arc<AtomicBool>,
}

pub struct SpeechState(pub Mutex<Option<SpeechSession>>);

// =============================================================================
// Tauri Commands
// =============================================================================

#[tauri::command]
pub async fn start_dictation(
    app: AppHandle,
    state: State<'_, SpeechState>,
    config: Option<SpeechConfig>,
) -> Result<(), String> {
    // Stop any existing session
    let _ = stop_dictation(state.clone()).await;

    let config = config.unwrap_or_default();

    let running = Arc::new(AtomicBool::new(true));
    let running_clone = running.clone();

    // Update state
    {
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        *guard = Some(SpeechSession {
            running: running.clone(),
        });
    }

    match config.engine {
        EngineType::Vosk => {
            engine_vosk::VoskEngine::start(app, &config, running_clone)?;
        }
        EngineType::SherpaOnnx => {
            engine_sherpa::SherpaEngine::start(app, &config, running_clone)?;
        }
        EngineType::WhisperApi => {
            engine_whisper_api::WhisperApiEngine::start(app, &config, running_clone)?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_dictation(state: State<'_, SpeechState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(session) = guard.take() {
        session.running.store(false, Ordering::Relaxed);
    }
    Ok(())
}

#[tauri::command]
pub async fn speech_get_available_models(app: AppHandle) -> Result<Vec<SpeechModelInfo>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(models::fetch_remote_registry(&app_dir).await)
}

#[tauri::command]
pub async fn speech_get_installed_models(app: AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let models_dir = app_dir.join("installation").join("models");
    let mut installed = Vec::new();

    // Check vosk models
    let vosk_dir = models_dir.join("vosk");
    if vosk_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(&vosk_dir) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    if let Some(name) = entry.file_name().to_str() {
                        installed.push(name.to_string());
                    }
                }
            }
        }
    }

    // Check sherpa models
    let sherpa_dir = models_dir.join("sherpa");
    if sherpa_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(&sherpa_dir) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    if let Some(name) = entry.file_name().to_str() {
                        installed.push(name.to_string());
                    }
                }
            }
        }
    }

    Ok(installed)
}

#[tauri::command]
pub async fn speech_download_model(
    app: AppHandle,
    model_id: String,
) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let registry = models::fetch_remote_registry(&app_dir).await;
    let model = registry
        .iter()
        .find(|m| m.id == model_id)
        .ok_or_else(|| format!("Model '{}' not found in registry", model_id))?;

    if model.download_url.is_empty() {
        return Err(format!("Model '{}' has no download URL configured", model_id));
    }

    let engine_dir = match model.engine {
        EngineType::Vosk => "vosk",
        EngineType::SherpaOnnx => "sherpa",
        EngineType::WhisperApi => return Err("Whisper API does not require model download".to_string()),
    };

    let dest_path = app_dir
        .join("installation")
        .join("models")
        .join(engine_dir)
        .join(&model.id);

    let options = downloader::DownloadOptions {
        url: model.download_url.clone(),
        dest_path,
        expected_sha256: model.checksum.clone(),
        item_id: model_id,
        item_type: downloader::DownloadItemType::Model,
    };

    downloader::download_file(&app, &options).await
}

#[tauri::command]
pub async fn speech_cancel_download() -> Result<(), String> {
    downloader::request_cancel();
    Ok(())
}

#[tauri::command]
pub async fn speech_delete_model(
    app: AppHandle,
    model_id: String,
) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let models_dir = app_dir.join("installation").join("models");

    // Search in vosk and sherpa directories
    for engine_dir in &["vosk", "sherpa"] {
        let model_path = models_dir.join(engine_dir).join(&model_id);
        if model_path.exists() {
            std::fs::remove_dir_all(&model_path)
                .map_err(|e| format!("Failed to delete model: {}", e))?;
            log::info!("Deleted model: {}", model_id);
            return Ok(());
        }
    }

    Err(format!("Model '{}' not found on disk", model_id))
}

#[tauri::command]
pub async fn speech_get_config(app: AppHandle) -> Result<SpeechConfig, String> {
    let db_state: State<'_, crate::database::DbState> = app.state();
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;

    let config_json: Option<String> = conn
        .query_row(
            "SELECT value FROM app_settings WHERE key = 'speech_config'",
            [],
            |row| row.get(0),
        )
        .ok();

    match config_json {
        Some(json) => serde_json::from_str(&json).map_err(|e| e.to_string()),
        None => Ok(SpeechConfig::default()),
    }
}

#[tauri::command]
pub async fn speech_set_config(
    app: AppHandle,
    config: SpeechConfig,
) -> Result<(), String> {
    let db_state: State<'_, crate::database::DbState> = app.state();
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;

    let json = serde_json::to_string(&config).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('speech_config', ?1)",
        [&json],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn speech_check_status(app: AppHandle) -> Result<SpeechStatus, String> {
    // Get installed models
    let installed = speech_get_installed_models(app).await.unwrap_or_default();

    // Get system info
    use sysinfo::System;
    let mut sys = System::new();
    sys.refresh_memory();

    let available_ram_mb = sys.available_memory() / (1024 * 1024);
    let available_disk_mb = {
        use sysinfo::Disks;
        let disks = Disks::new_with_refreshed_list();
        disks.list().first().map(|d| d.available_space() / (1024 * 1024)).unwrap_or(0)
    };

    Ok(SpeechStatus {
        available_ram_mb,
        available_disk_mb,
        installed_model_ids: installed,
        libs_installed: true,  // Libs are always available (compiled statically or not needed)
        libs_version: None,
    })
}

#[tauri::command]
pub async fn speech_check_libs(_app: AppHandle) -> Result<bool, String> {
    // Libs are always ready: Vosk is bundled, Sherpa will be static, Whisper is API-based
    Ok(true)
}

#[tauri::command]
pub async fn speech_download_libs(_app: AppHandle) -> Result<(), String> {
    // No-op: libs are compiled into the binary or not needed
    Ok(())
}
