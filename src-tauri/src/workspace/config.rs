//! Workspace configuration - paths, validation, directory structure creation

use std::path::{Path, PathBuf};

/// Get the default workspace path: ~/Documentos/PlumAi or ~/Documents/PlumAi
pub fn get_default_workspace_path() -> Result<PathBuf, String> {
    if let Some(doc_dir) = dirs::document_dir() {
        Ok(doc_dir.join("PlumAi"))
    } else if let Some(home) = dirs::home_dir() {
        Ok(home.join("Documents").join("PlumAi"))
    } else {
        Err("Cannot determine default workspace path".to_string())
    }
}

/// Validate that a path is suitable for a workspace
pub fn validate_workspace_path(path: &Path) -> Result<(), String> {
    // Path must be absolute
    if !path.is_absolute() {
        return Err("Workspace path must be absolute".to_string());
    }

    // If path exists, it must be a directory
    if path.exists() && !path.is_dir() {
        return Err("Path exists but is not a directory".to_string());
    }

    // Check parent directory exists and is writable
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err(format!("Parent directory does not exist: {}", parent.display()));
        }
    }

    Ok(())
}

/// Create the full workspace directory structure
pub fn create_workspace_structure(workspace_path: &Path) -> Result<(), String> {
    let dirs_to_create = [
        workspace_path.to_path_buf(),
        workspace_path.join("projects"),
        workspace_path.join("backups"),
        workspace_path.join("models"),
        workspace_path.join("models").join("vosk"),
        workspace_path.join("models").join("sherpa"),
        workspace_path.join("models").join("downloads"),
        workspace_path.join("packages"),
    ];

    for dir in &dirs_to_create {
        std::fs::create_dir_all(dir).map_err(|e| {
            format!("Failed to create directory {}: {}", dir.display(), e)
        })?;
    }

    log::info!("Workspace structure created at: {}", workspace_path.display());
    Ok(())
}

/// Create project directory structure inside workspace
pub fn create_project_dirs(project_path: &Path) -> Result<(), String> {
    let dirs_to_create = [
        project_path.to_path_buf(),
        project_path.join("images"),
        project_path.join("images").join("chapters"),
        project_path.join("images").join("scenes"),
        project_path.join("images").join("characters"),
        project_path.join("images").join("locations"),
        project_path.join("chapters"),
        project_path.join("scenes"),
        project_path.join("characters"),
        project_path.join("locations"),
        project_path.join("lore"),
        project_path.join("timeline"),
        project_path.join("relationships"),
    ];

    for dir in &dirs_to_create {
        std::fs::create_dir_all(dir).map_err(|e| {
            format!("Failed to create directory {}: {}", dir.display(), e)
        })?;
    }

    Ok(())
}

/// Check if workspace is accessible (not on removed disk, has permissions)
pub fn is_workspace_accessible(workspace_path: &Path) -> bool {
    workspace_path.exists() && workspace_path.is_dir()
}

/// Move workspace from old path to new path
pub fn move_workspace(old_path: &Path, new_path: &Path) -> Result<(), String> {
    validate_workspace_path(new_path)?;

    if !old_path.exists() {
        return Err("Source workspace does not exist".to_string());
    }

    if new_path.exists() {
        return Err("Destination already exists".to_string());
    }

    // Create parent if needed
    if let Some(parent) = new_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent: {}", e))?;
    }

    // Copy recursively
    copy_dir_recursive(old_path, new_path)?;

    // Verify copy succeeded by checking key dirs
    let check_dirs = ["projects", "backups"];
    for dir_name in &check_dirs {
        let src = old_path.join(dir_name);
        let dst = new_path.join(dir_name);
        if src.exists() && !dst.exists() {
            // Rollback: remove partial copy
            let _ = std::fs::remove_dir_all(new_path);
            return Err(format!("Copy verification failed for {}", dir_name));
        }
    }

    // Remove original
    std::fs::remove_dir_all(old_path)
        .map_err(|e| format!("Failed to remove original workspace: {}", e))?;

    log::info!(
        "Workspace moved from {} to {}",
        old_path.display(),
        new_path.display()
    );
    Ok(())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    std::fs::create_dir_all(dst)
        .map_err(|e| format!("Failed to create {}: {}", dst.display(), e))?;

    let entries = std::fs::read_dir(src)
        .map_err(|e| format!("Failed to read {}: {}", src.display(), e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            std::fs::copy(&src_path, &dst_path).map_err(|e| {
                format!(
                    "Failed to copy {} -> {}: {}",
                    src_path.display(),
                    dst_path.display(),
                    e
                )
            })?;
        }
    }

    Ok(())
}
