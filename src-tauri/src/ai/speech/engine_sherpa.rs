use std::sync::{
    atomic::AtomicBool,
    Arc,
};
use tauri::AppHandle;

use super::models::{SherpaMode, SpeechConfig};

pub struct SherpaEngine;

impl SherpaEngine {
    pub fn start(
        _app: AppHandle,
        config: &SpeechConfig,
        _running: Arc<AtomicBool>,
    ) -> Result<(), String> {
        let mode = config.sherpa_mode.as_ref().unwrap_or(&SherpaMode::Writer);
        match mode {
            SherpaMode::Writer => {
                Err("Sherpa-ONNX Writer mode not yet implemented. Download a model from the store first.".to_string())
            }
            SherpaMode::DungeonChaos => {
                Err("Sherpa-ONNX DungeonChaos mode not yet implemented. Download a model from the store first.".to_string())
            }
        }
    }
}
