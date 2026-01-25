//! Filesystem module for project file management
//!
//! Handles .pluma files (ZIP archives containing project data)

use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use thiserror::Error;
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

#[derive(Error, Debug)]
pub enum FilesystemError {
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("ZIP error: {0}")]
    ZipError(#[from] zip::result::ZipError),
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("Invalid project file: {0}")]
    InvalidProject(String),
}

/// Project file format version
const PROJECT_VERSION: &str = "1.0";

/// Project manifest stored in .pluma files
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectManifest {
    pub version: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Complete project data for export/import
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectData {
    pub project: serde_json::Value,
    pub chapters: Vec<serde_json::Value>,
    pub scenes: Vec<serde_json::Value>,
    pub characters: Vec<serde_json::Value>,
    pub locations: Vec<serde_json::Value>,
    pub lore_items: Vec<serde_json::Value>,
    pub timeline_events: Vec<serde_json::Value>,
    pub relationships: Vec<serde_json::Value>,
}

/// Save a project to a .pluma file
pub fn save_project(
    data: &ProjectData,
    output_path: &Path,
) -> Result<(), FilesystemError> {
    let file = File::create(output_path)?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    // Write manifest
    let manifest = ProjectManifest {
        version: PROJECT_VERSION.to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };

    zip.start_file("manifest.json", options)?;
    let manifest_json = serde_json::to_string_pretty(&manifest)?;
    zip.write_all(manifest_json.as_bytes())?;

    // Write project data
    zip.start_file("project.json", options)?;
    let project_json = serde_json::to_string_pretty(&data.project)?;
    zip.write_all(project_json.as_bytes())?;

    // Write chapters
    zip.start_file("chapters.json", options)?;
    let chapters_json = serde_json::to_string_pretty(&data.chapters)?;
    zip.write_all(chapters_json.as_bytes())?;

    // Write scenes
    zip.start_file("scenes.json", options)?;
    let scenes_json = serde_json::to_string_pretty(&data.scenes)?;
    zip.write_all(scenes_json.as_bytes())?;

    // Write characters
    zip.start_file("characters.json", options)?;
    let characters_json = serde_json::to_string_pretty(&data.characters)?;
    zip.write_all(characters_json.as_bytes())?;

    // Write locations
    zip.start_file("locations.json", options)?;
    let locations_json = serde_json::to_string_pretty(&data.locations)?;
    zip.write_all(locations_json.as_bytes())?;

    // Write lore items
    zip.start_file("lore_items.json", options)?;
    let lore_json = serde_json::to_string_pretty(&data.lore_items)?;
    zip.write_all(lore_json.as_bytes())?;

    // Write timeline events
    zip.start_file("timeline_events.json", options)?;
    let timeline_json = serde_json::to_string_pretty(&data.timeline_events)?;
    zip.write_all(timeline_json.as_bytes())?;

    // Write relationships
    zip.start_file("relationships.json", options)?;
    let relationships_json = serde_json::to_string_pretty(&data.relationships)?;
    zip.write_all(relationships_json.as_bytes())?;

    zip.finish()?;
    Ok(())
}

/// Load a project from a .pluma file
pub fn load_project(input_path: &Path) -> Result<ProjectData, FilesystemError> {
    let file = File::open(input_path)?;
    let mut archive = ZipArchive::new(file)?;

    // Read and validate manifest
    let manifest: ProjectManifest = {
        let mut manifest_file = archive.by_name("manifest.json")?;
        let mut contents = String::new();
        manifest_file.read_to_string(&mut contents)?;
        serde_json::from_str(&contents)?
    };

    // Check version compatibility
    if !manifest.version.starts_with("1.") {
        return Err(FilesystemError::InvalidProject(format!(
            "Unsupported version: {}",
            manifest.version
        )));
    }

    // Read project data
    let project: serde_json::Value = read_json_from_zip(&mut archive, "project.json")?;
    let chapters: Vec<serde_json::Value> = read_json_from_zip(&mut archive, "chapters.json")?;
    let scenes: Vec<serde_json::Value> = read_json_from_zip(&mut archive, "scenes.json")?;
    let characters: Vec<serde_json::Value> = read_json_from_zip(&mut archive, "characters.json")?;
    let locations: Vec<serde_json::Value> = read_json_from_zip(&mut archive, "locations.json")?;
    let lore_items: Vec<serde_json::Value> = read_json_from_zip(&mut archive, "lore_items.json")?;
    let timeline_events: Vec<serde_json::Value> =
        read_json_from_zip(&mut archive, "timeline_events.json")?;
    let relationships: Vec<serde_json::Value> =
        read_json_from_zip(&mut archive, "relationships.json")?;

    Ok(ProjectData {
        project,
        chapters,
        scenes,
        characters,
        locations,
        lore_items,
        timeline_events,
        relationships,
    })
}

fn read_json_from_zip<T: for<'de> Deserialize<'de>>(
    archive: &mut ZipArchive<File>,
    name: &str,
) -> Result<T, FilesystemError> {
    let mut file = archive.by_name(name)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(serde_json::from_str(&contents)?)
}

/// Export project as JSON bytes (for sending to frontend)
pub fn project_to_json_bytes(data: &ProjectData) -> Result<Vec<u8>, FilesystemError> {
    let json = serde_json::to_vec_pretty(data)?;
    Ok(json)
}

/// Import project from JSON bytes
pub fn project_from_json_bytes(bytes: &[u8]) -> Result<ProjectData, FilesystemError> {
    let data = serde_json::from_slice(bytes)?;
    Ok(data)
}
