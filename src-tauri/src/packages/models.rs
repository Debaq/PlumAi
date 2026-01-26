use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageManifest {
    pub id: String,
    pub version: String,
    pub author: String,
    pub category: PackageCategory,
    pub metadata: HashMap<String, PackageMetadata>, // Language code -> Metadata
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageMetadata {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageStyles {
    pub theme: Option<String>,         // ID del tema o colores base
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
