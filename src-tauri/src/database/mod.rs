//! Database module for SQLite persistence
//!
//! Provides CRUD operations for all domain entities.

mod schema;
mod models;
mod operations;

pub use schema::init_database;
pub use models::*;
pub use operations::*;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::State;

/// Database state managed by Tauri
pub struct DbState(pub Mutex<Connection>);

/// Type alias for database state in commands
pub type DbConn<'a> = State<'a, DbState>;
