use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tauri::{AppHandle, Emitter};

use super::audio;
use super::models::{EngineType, ModelRequirement, RecognitionResult, SpeechConfig};

pub struct WhisperApiEngine;

impl WhisperApiEngine {
    pub fn start(
        app: AppHandle,
        config: &SpeechConfig,
        running: Arc<AtomicBool>,
    ) -> Result<(), String> {
        let api_key = config
            .whisper_api_key
            .as_ref()
            .ok_or("Whisper API key not configured")?
            .clone();
        let language = config.language.clone();
        let app_clone = app.clone();
        let running_clone = running.clone();

        std::thread::spawn(move || {
            if let Err(e) = run_whisper_loop(app_clone, &api_key, &language, running_clone) {
                eprintln!("Whisper API loop error: {}", e);
            }
        });

        Ok(())
    }

    #[allow(dead_code)]
    pub fn is_model_available(_app: &AppHandle, config: &SpeechConfig) -> bool {
        config.whisper_api_key.is_some()
    }

    #[allow(dead_code)]
    pub fn required_model_info(_config: &SpeechConfig) -> ModelRequirement {
        ModelRequirement {
            model_id: "whisper-1".to_string(),
            engine: EngineType::WhisperApi,
            needs_libs: false,
        }
    }
}

fn run_whisper_loop(
    app: AppHandle,
    api_key: &str,
    language: &str,
    running: Arc<AtomicBool>,
) -> Result<(), String> {
    let (tx, rx) = std::sync::mpsc::channel::<Vec<i16>>();
    let (_stream, capture) = audio::create_audio_stream(running.clone(), tx)?;

    let mut audio_buffer: Vec<i16> = Vec::new();
    let sample_rate = capture.sample_rate as u32;
    // Accumulate ~3 seconds of audio before sending to API
    let samples_threshold = (sample_rate * 3) as usize;

    let lang = if language.to_lowercase().starts_with("es") {
        "es"
    } else {
        "en"
    };

    let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;

    while running.load(Ordering::Relaxed) {
        if let Ok(data) = rx.recv_timeout(std::time::Duration::from_millis(100)) {
            audio_buffer.extend_from_slice(&data);

            if audio_buffer.len() >= samples_threshold {
                let wav_data = encode_wav(&audio_buffer, sample_rate);
                audio_buffer.clear();

                let api_key = api_key.to_string();
                let lang = lang.to_string();
                let app_ref = app.clone();

                match rt.block_on(send_to_whisper_api(&api_key, &lang, &wav_data)) {
                    Ok(text) => {
                        if !text.is_empty() {
                            let event = RecognitionResult {
                                text,
                                is_final: true,
                                speaker_id: None,
                                confidence: None,
                            };
                            app_ref.emit("dictation-event", &event).unwrap_or_default();
                        }
                    }
                    Err(e) => {
                        eprintln!("Whisper API error: {}", e);
                    }
                }
            }
        }
    }

    // Send remaining buffer
    if !audio_buffer.is_empty() {
        let wav_data = encode_wav(&audio_buffer, sample_rate);
        let api_key = api_key.to_string();
        let lang = lang.to_string();

        if let Ok(text) = rt.block_on(send_to_whisper_api(&api_key, &lang, &wav_data)) {
            if !text.is_empty() {
                let event = RecognitionResult {
                    text,
                    is_final: true,
                    speaker_id: None,
                    confidence: None,
                };
                app.emit("dictation-event", &event).unwrap_or_default();
            }
        }
    }

    Ok(())
}

fn encode_wav(samples: &[i16], sample_rate: u32) -> Vec<u8> {
    let num_samples = samples.len() as u32;
    let data_size = num_samples * 2;
    let file_size = 36 + data_size;

    let mut buf = Vec::with_capacity(file_size as usize + 8);

    // RIFF header
    buf.extend_from_slice(b"RIFF");
    buf.extend_from_slice(&file_size.to_le_bytes());
    buf.extend_from_slice(b"WAVE");

    // fmt chunk
    buf.extend_from_slice(b"fmt ");
    buf.extend_from_slice(&16u32.to_le_bytes()); // chunk size
    buf.extend_from_slice(&1u16.to_le_bytes()); // PCM
    buf.extend_from_slice(&1u16.to_le_bytes()); // mono
    buf.extend_from_slice(&sample_rate.to_le_bytes());
    buf.extend_from_slice(&(sample_rate * 2).to_le_bytes()); // byte rate
    buf.extend_from_slice(&2u16.to_le_bytes()); // block align
    buf.extend_from_slice(&16u16.to_le_bytes()); // bits per sample

    // data chunk
    buf.extend_from_slice(b"data");
    buf.extend_from_slice(&data_size.to_le_bytes());
    for &sample in samples {
        buf.extend_from_slice(&sample.to_le_bytes());
    }

    buf
}

async fn send_to_whisper_api(
    api_key: &str,
    language: &str,
    wav_data: &[u8],
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let part = reqwest::multipart::Part::bytes(wav_data.to_vec())
        .file_name("audio.wav")
        .mime_str("audio/wav")
        .map_err(|e| e.to_string())?;

    let form = reqwest::multipart::Form::new()
        .text("model", "whisper-1")
        .text("language", language.to_string())
        .text("response_format", "json")
        .part("file", part);

    let response = client
        .post("https://api.openai.com/v1/audio/transcriptions")
        .header("Authorization", format!("Bearer {}", api_key))
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Whisper API request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Whisper API error {}: {}", status, body));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Whisper response: {}", e))?;

    Ok(json["text"].as_str().unwrap_or("").to_string())
}
