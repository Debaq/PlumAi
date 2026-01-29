//! Workspace module - User-facing project directory management
//!
//! Manages the workspace directory where projects, backups, models, and packages are stored.
//! Default path: ~/Documentos/PlumAi (configurable by user)

pub mod config;
pub mod project_fs;
pub mod backup;
pub mod images;
pub mod sync;
pub mod migration;

use std::sync::Mutex;

/// Workspace state managed by Tauri
pub struct WorkspaceState(pub Mutex<Option<String>>);
