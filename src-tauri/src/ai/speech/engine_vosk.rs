use std::path::PathBuf;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tauri::{AppHandle, Emitter, Manager};
use vosk::{DecodingState, Model, Recognizer};

use super::audio;
use super::models::{EngineType, ModelRequirement, RecognitionResult, SpeechConfig};

pub struct VoskEngine;

impl VoskEngine {
    pub fn start(
        app: AppHandle,
        config: &SpeechConfig,
        running: Arc<AtomicBool>,
    ) -> Result<(), String> {
        let language = config.language.clone();
        let app_clone = app.clone();
        let running_clone = running.clone();

        std::thread::spawn(move || {
            if let Err(e) = run_vosk_loop(app_clone, &language, running_clone) {
                eprintln!("Vosk recognition loop error: {}", e);
            }
        });

        Ok(())
    }

    #[allow(dead_code)]
    pub fn is_model_available(app: &AppHandle, config: &SpeechConfig) -> bool {
        let model_path = resolve_vosk_model_path(app, &config.language);
        model_path.exists()
    }

    #[allow(dead_code)]
    pub fn required_model_info(config: &SpeechConfig) -> ModelRequirement {
        let lang = if config.language.to_lowercase().starts_with("es") {
            "es"
        } else {
            "en"
        };
        ModelRequirement {
            model_id: format!("vosk-model-small-{}-0.42", lang),
            engine: EngineType::Vosk,
            needs_libs: false,
        }
    }
}

fn resolve_vosk_model_path(app: &AppHandle, language: &str) -> PathBuf {
    let lang_dir = if language.to_lowercase().starts_with("es") {
        "es"
    } else {
        "en"
    };

    // Models are downloaded to the user's app data directory
    let app_dir = app.path().app_data_dir().unwrap_or_default();
    app_dir
        .join("installation")
        .join("models")
        .join("vosk")
        .join(lang_dir)
}

fn run_vosk_loop(
    app: AppHandle,
    language: &str,
    running: Arc<AtomicBool>,
) -> Result<(), String> {
    let model_path = resolve_vosk_model_path(&app, language);

    if !model_path.exists() {
        return Err(format!("Model path not found: {:?}", model_path));
    }

    let model_str = model_path.to_str().ok_or("Invalid path")?;
    let model = Model::new(model_str).ok_or("Could not create Vosk model")?;

    let (tx, rx) = std::sync::mpsc::channel::<Vec<i16>>();
    let (_stream, capture) = audio::create_audio_stream(running.clone(), tx)?;

    let mut recognizer =
        Recognizer::new(&model, capture.sample_rate).ok_or("Could not create recognizer")?;

    while running.load(Ordering::Relaxed) {
        if let Ok(data) = rx.recv_timeout(std::time::Duration::from_millis(100)) {
            match recognizer.accept_waveform(&data) {
                Ok(DecodingState::Finalized) => {
                    let result = recognizer.result();
                    let text = match result {
                        vosk::CompleteResult::Single(r) => r.text,
                        vosk::CompleteResult::Multiple(r) => {
                            r.alternatives.first().map(|a| a.text).unwrap_or("")
                        }
                    };

                    if !text.is_empty() {
                        let event = RecognitionResult {
                            text: text.to_string(),
                            is_final: true,
                            speaker_id: None,
                            confidence: None,
                        };
                        app.emit("dictation-event", &event).unwrap_or_default();
                    }
                }
                Ok(DecodingState::Running) => {
                    let partial = recognizer.partial_result();
                    let partial_text = partial.partial;
                    if !partial_text.is_empty() {
                        let event = RecognitionResult {
                            text: partial_text.to_string(),
                            is_final: false,
                            speaker_id: None,
                            confidence: None,
                        };
                        app.emit("dictation-event", &event).unwrap_or_default();
                    }
                }
                Ok(DecodingState::Failed) => {
                    eprintln!("Vosk decoding failed");
                }
                Err(e) => {
                    eprintln!("Vosk accept_waveform error: {:?}", e);
                }
            }
        }
    }

    Ok(())
}
