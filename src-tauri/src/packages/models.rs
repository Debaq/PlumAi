use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageManifest {
    pub id: String,
    pub version: String,
    pub author: String,
    pub category: PackageCategory,
    pub metadata: HashMap<String, PackageMetadata>, // Language code -> Metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_app_version: Option<String>,
    pub styles: Option<PackageStyles>,
    pub content: Option<PackageContent>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum PackageCategory {
    Content,
    Identity,
    Hybrid,
}

impl std::fmt::Display for PackageCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PackageCategory::Content => write!(f, "content"),
            PackageCategory::Identity => write!(f, "identity"),
            PackageCategory::Hybrid => write!(f, "hybrid"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageMetadata {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageStyles {
    pub theme: Option<String>, // ID del tema o colores base
    pub primary_color: Option<String>,
    pub secondary_color: Option<String>,
    pub font_family: Option<String>,
    pub banners: HashMap<String, String>, // Context (sidebar, chapter) -> Image filename
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageContent {
    pub creatures: Option<Vec<serde_json::Value>>,
    pub characters: Option<Vec<serde_json::Value>>,
    pub lore_items: Option<Vec<serde_json::Value>>,
}

// ============================================================================
// Registry types
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegistrySource {
    pub id: String,
    pub url: String,
    pub name: String,
    pub enabled: bool,
    pub is_official: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegistryIndex {
    pub schema_version: String,
    pub registry_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
    pub packages: Vec<RegistryPackageEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegistryPackageEntry {
    pub id: String,
    pub version: String,
    pub author: String,
    pub category: PackageCategory,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_app_version: Option<String>,
    pub metadata: HashMap<String, PackageMetadata>,
    pub download_url: String,
    #[serde(default)]
    pub size_bytes: u64,
    #[serde(default)]
    pub checksum_sha256: String,
    #[serde(default)]
    pub tags: Vec<String>,
}

// ============================================================================
// Catalog types (registry + local state)
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CatalogPackage {
    pub id: String,
    pub version: String,
    pub author: String,
    pub category: PackageCategory,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_app_version: Option<String>,
    pub metadata: HashMap<String, PackageMetadata>,
    pub download_url: String,
    pub size_bytes: u64,
    pub checksum_sha256: String,
    pub tags: Vec<String>,
    pub registry_id: String,
    pub is_installed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub installed_version: Option<String>,
    pub has_update: bool,
}

// ============================================================================
// Installed package info (stored in DB)
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstalledPackageInfo {
    pub id: String,
    pub version: String,
    pub author: String,
    pub category: String,
    pub registry_id: String,
    pub metadata: String, // JSON string
    pub checksum: String,
    pub size_bytes: i64,
    pub install_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub installed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

// ============================================================================
// Update info
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageUpdateInfo {
    pub id: String,
    pub current_version: String,
    pub available_version: String,
    pub registry_id: String,
}
