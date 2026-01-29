//! Database module for SQLite persistence
//!
//! Provides CRUD operations for all domain entities.

mod models;
mod operations;
mod schema;

pub use models::*;
pub use operations::*;
pub use schema::init_database;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::State;

/// Database state managed by Tauri
pub struct DbState(pub Mutex<Connection>);

/// Type alias for database state in commands
pub type DbConn<'a> = State<'a, DbState>;
