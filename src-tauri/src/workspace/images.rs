//! Image management - save images to disk, classify image values, resolve paths

use base64::Engine;
use std::path::{Path, PathBuf};

/// Classification of an image value
#[allow(dead_code)]
pub enum ImageKind {
    /// Base64 data URL (data:image/...) or raw base64 - legacy, should migrate
    Base64(String),
    /// External URL (http/https)
    ExternalUrl(String),
    /// Relative path within project (images/...)
    RelativePath(String),
    /// Empty or null
    Empty,
}

/// Classify an image value to determine its type
pub fn classify_image_value(value: &str) -> ImageKind {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        ImageKind::Empty
    } else if trimmed.starts_with("data:") || is_likely_base64(trimmed) {
        ImageKind::Base64(trimmed.to_string())
    } else if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        ImageKind::ExternalUrl(trimmed.to_string())
    } else if trimmed.starts_with("images/") {
        ImageKind::RelativePath(trimmed.to_string())
    } else {
        // Treat unknown as external URL or relative path
        ImageKind::RelativePath(trimmed.to_string())
    }
}

/// Save a base64-encoded image to the project images directory
/// Returns the relative path (e.g., "images/characters/abc123.png")
pub fn save_image_from_base64(
    project_path: &Path,
    category: &str, // "chapters", "scenes", "characters", "locations"
    image_data: &str,
) -> Result<String, String> {
    let (data_bytes, extension) = decode_image_data(image_data)?;

    let filename = format!("{}.{}", uuid::Uuid::new_v4(), extension);
    let relative_path = format!("images/{}/{}", category, filename);
    let absolute_path = project_path.join(&relative_path);

    // Ensure directory exists
    if let Some(parent) = absolute_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create image dir: {}", e))?;
    }

    std::fs::write(&absolute_path, &data_bytes)
        .map_err(|e| format!("Failed to write image: {}", e))?;

    log::info!("Image saved: {}", relative_path);
    Ok(relative_path)
}

/// Resolve a relative image path to an absolute filesystem path
pub fn resolve_image_path(project_path: &Path, relative_path: &str) -> PathBuf {
    project_path.join(relative_path)
}

fn decode_image_data(image_data: &str) -> Result<(Vec<u8>, String), String> {
    let engine = base64::engine::general_purpose::STANDARD;

    if image_data.starts_with("data:") {
        // data:image/png;base64,iVBOR...
        let parts: Vec<&str> = image_data.splitn(2, ',').collect();
        if parts.len() != 2 {
            return Err("Invalid data URL format".to_string());
        }

        let header = parts[0]; // "data:image/png;base64"
        let data = parts[1];

        // Extract extension from MIME type
        let extension = if header.contains("image/png") {
            "png"
        } else if header.contains("image/jpeg") || header.contains("image/jpg") {
            "jpg"
        } else if header.contains("image/webp") {
            "webp"
        } else if header.contains("image/gif") {
            "gif"
        } else if header.contains("image/svg") {
            "svg"
        } else {
            "png" // default
        };

        let bytes = engine
            .decode(data)
            .map_err(|e| format!("Failed to decode base64: {}", e))?;

        Ok((bytes, extension.to_string()))
    } else {
        // Raw base64 - try to detect format from magic bytes
        let bytes = engine
            .decode(image_data)
            .map_err(|e| format!("Failed to decode base64: {}", e))?;

        let extension = detect_image_format(&bytes).unwrap_or("png");
        Ok((bytes, extension.to_string()))
    }
}

fn detect_image_format(bytes: &[u8]) -> Option<&'static str> {
    if bytes.len() < 4 {
        return None;
    }

    if bytes.starts_with(&[0x89, 0x50, 0x4E, 0x47]) {
        Some("png")
    } else if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        Some("jpg")
    } else if bytes.starts_with(b"RIFF") && bytes.len() > 11 && &bytes[8..12] == b"WEBP" {
        Some("webp")
    } else if bytes.starts_with(b"GIF8") {
        Some("gif")
    } else {
        None
    }
}

fn is_likely_base64(s: &str) -> bool {
    // Quick heuristic: long string with only base64 chars
    s.len() > 100 && s.chars().all(|c| c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '=')
}
