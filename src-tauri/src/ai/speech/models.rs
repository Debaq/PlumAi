use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum EngineType {
    Vosk,
    SherpaOnnx,
    WhisperApi,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum SherpaMode {
    Writer,
    DungeonChaos,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum QualityTier {
    Small,
    Medium,
    Large,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpeechConfig {
    pub engine: EngineType,
    pub language: String,
    pub model_id: Option<String>,
    pub sherpa_mode: Option<SherpaMode>,
    pub whisper_api_key: Option<String>,
}

impl Default for SpeechConfig {
    fn default() -> Self {
        Self {
            engine: EngineType::Vosk,
            language: "es".to_string(),
            model_id: None,
            sherpa_mode: None,
            whisper_api_key: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpeechModelInfo {
    pub id: String,
    pub engine: EngineType,
    pub language: String,
    pub name: String,
    pub size_bytes: u64,
    pub min_ram_mb: u32,
    pub quality_tier: QualityTier,
    pub download_url: String,
    pub checksum: String,
    pub is_default: bool,
    #[serde(default)]
    pub status: ModelStatus,
    #[serde(default)]
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ModelStatus {
    Tested,
    Untested,
    Broken,
}

impl Default for ModelStatus {
    fn default() -> Self {
        ModelStatus::Untested
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecognitionResult {
    pub text: String,
    pub is_final: bool,
    pub speaker_id: Option<String>,
    pub confidence: Option<f32>,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelRequirement {
    pub model_id: String,
    pub engine: EngineType,
    pub needs_libs: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpeechStatus {
    pub available_ram_mb: u64,
    pub available_disk_mb: u64,
    pub installed_model_ids: Vec<String>,
    pub libs_installed: bool,
    pub libs_version: Option<String>,
}

// Remote model registry schema
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoteModelRegistry {
    pub version: u32,
    pub models: Vec<SpeechModelInfo>,
}

const REGISTRY_URL: &str =
    "https://raw.githubusercontent.com/studio33-lab/plumai-store/main/assets/voice.json";

const CACHE_FILENAME: &str = "voice-registry-cache.json";

/// Returns an empty vec. All models come from the remote registry.
pub fn get_model_registry() -> Vec<SpeechModelInfo> {
    vec![]
}

/// Fetch the model registry from the remote plumai-store repo.
/// Falls back to local cache if the network request fails.
pub async fn fetch_remote_registry(app_data_dir: &Path) -> Vec<SpeechModelInfo> {
    // Try fetching from remote
    match fetch_from_url().await {
        Ok(registry) => {
            // Cache for offline use
            let _ = save_cache(app_data_dir, &registry);
            log::info!(
                "Voice model registry fetched: {} models (v{})",
                registry.models.len(),
                registry.version
            );
            registry.models
        }
        Err(e) => {
            log::warn!("Failed to fetch remote voice registry: {}. Using cache.", e);
            load_cache(app_data_dir)
        }
    }
}

async fn fetch_from_url() -> Result<RemoteModelRegistry, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(REGISTRY_URL)
        .send()
        .await
        .map_err(|e| format!("Registry fetch failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Registry HTTP error: {}", response.status()));
    }

    let registry: RemoteModelRegistry = response
        .json()
        .await
        .map_err(|e| format!("Registry parse error: {}", e))?;

    Ok(registry)
}

fn cache_path(app_data_dir: &Path) -> std::path::PathBuf {
    app_data_dir
        .join("installation")
        .join("manifests")
        .join(CACHE_FILENAME)
}

fn save_cache(app_data_dir: &Path, registry: &RemoteModelRegistry) -> Result<(), String> {
    let path = cache_path(app_data_dir);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(registry).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

fn load_cache(app_data_dir: &Path) -> Vec<SpeechModelInfo> {
    let path = cache_path(app_data_dir);
    if !path.exists() {
        return vec![];
    }
    match std::fs::read_to_string(&path) {
        Ok(json) => match serde_json::from_str::<RemoteModelRegistry>(&json) {
            Ok(registry) => {
                log::info!("Loaded {} models from cache", registry.models.len());
                registry.models
            }
            Err(e) => {
                log::warn!("Failed to parse cached registry: {}", e);
                vec![]
            }
        },
        Err(e) => {
            log::warn!("Failed to read cached registry: {}", e);
            vec![]
        }
    }
}
