use tauri::{AppHandle, Emitter, State, Manager};
use tauri::path::BaseDirectory;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use std::path::PathBuf;
use vosk::{Model, Recognizer, DecodingState};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

pub struct SpeechSession {
    pub running: Arc<AtomicBool>,
}

pub struct SpeechState(pub Mutex<Option<SpeechSession>>);

#[derive(Clone, serde::Serialize)]
struct DictationEvent {
    text: String,
    is_final: bool,
}

#[tauri::command]
pub async fn start_dictation(
    app: AppHandle,
    state: State<'_, SpeechState>,
    language: String,
) -> Result<(), String> {
    // Stop any existing session
    let _ = stop_dictation(state.clone()).await;

    let running = Arc::new(AtomicBool::new(true));
    let running_clone = running.clone();

    // Update state
    {
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        *guard = Some(SpeechSession { running: running.clone() });
    }

    // Spawn thread
    std::thread::spawn(move || {
        if let Err(e) = run_recognition_loop(app, language, running_clone) {
            eprintln!("Recognition loop error: {}", e);
        }
    });

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

fn run_recognition_loop(app: AppHandle, language: String, running: Arc<AtomicBool>) -> Result<(), String> {
    // Resolve model path
    let lang_dir = if language.to_lowercase().starts_with("es") { "es" } else { "en" };
    
    // We assume the models are in src-tauri/models for now.
    // In a production build, we should look in the resource directory.
    // Try to find the resource directory first.
    
    let model_path = app.path().resolve(format!("models/{}", lang_dir), BaseDirectory::Resource)
        .unwrap_or_else(|_| PathBuf::from("src-tauri/models").join(lang_dir));

    if !model_path.exists() {
         return Err(format!("Model path not found: {:?}", model_path));
    }

    let model_str = model_path.to_str().ok_or("Invalid path")?;
    // Vosk logs to stderr by default, we can silence it if needed, but useful for debug
    let model = Model::new(model_str).ok_or("Could not create model")?;

    // Setup Audio
    let host = cpal::default_host();
    let device = host.default_input_device().ok_or("No input device available")?;
    
    let config = device.default_input_config().map_err(|e| e.to_string())?;
    let sample_rate = config.sample_rate().0 as f32;
    let channels = config.channels();

    let mut recognizer = Recognizer::new(&model, sample_rate).ok_or("Could not create recognizer")?;

    // Channel for audio data
    let (tx, rx) = std::sync::mpsc::channel::<Vec<i16>>();

    let err_fn = |err| eprintln!("Stream error: {}", err);

    let stream = match config.sample_format() {
        cpal::SampleFormat::I16 => {
            let tx = tx.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[i16], _: &_| {
                    let mono_data: Vec<i16> = if channels == 2 {
                        // Simple stereo to mono mixing
                        data.chunks(2).map(|c| c[0].wrapping_add(c[1]) / 2).collect()
                    } else {
                        data.to_vec()
                    };
                    let _ = tx.send(mono_data);
                },
                err_fn,
                None
            )
        },
        cpal::SampleFormat::F32 => {
            let tx = tx.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &_| {
                    let mono_data: Vec<i16> = if channels == 2 {
                         data.chunks(2).map(|c| {
                             let v = (c[0] + c[1]) / 2.0;
                             (v * 32767.0) as i16
                         }).collect()
                    } else {
                        data.iter().map(|&v| (v * 32767.0) as i16).collect()
                    };
                    let _ = tx.send(mono_data);
                },
                err_fn,
                None
            )
        },
        _ => return Err("Unsupported sample format".into())
    }.map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    while running.load(Ordering::Relaxed) {
        if let Ok(data) = rx.recv_timeout(std::time::Duration::from_millis(100)) {
            match recognizer.accept_waveform(&data) {
                Ok(DecodingState::Finalized) => {
                    let result = recognizer.result();
                    // Handle CompleteResult enum (Single or Multiple)
                    let text = match result {
                        vosk::CompleteResult::Single(r) => r.text,
                        vosk::CompleteResult::Multiple(r) => r.alternatives.first().map(|a| a.text).unwrap_or(""),
                    };
                    
                    if !text.is_empty() {
                        app.emit("dictation-event", DictationEvent { text: text.to_string(), is_final: true }).unwrap_or_default();
                    }
                },
                Ok(DecodingState::Running) => {
                    let partial = recognizer.partial_result();
                    let partial_text = partial.partial;
                    if !partial_text.is_empty() {
                        app.emit("dictation-event", DictationEvent { text: partial_text.to_string(), is_final: false }).unwrap_or_default();
                    }
                },
                Ok(DecodingState::Failed) => {
                    eprintln!("Vosk decoding failed");
                },
                Err(e) => {
                    eprintln!("Vosk accept_waveform error: {:?}", e);
                }
            }
        }
    }

    Ok(())
}
