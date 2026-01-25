//! Database schema initialization

use rusqlite::{Connection, Result};

/// Initialize the database with all required tables
pub fn init_database(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        -- Projects table
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT,
            description TEXT,
            genre TEXT,
            is_rpg_mode_enabled INTEGER DEFAULT 0,
            rpg_system TEXT,
            banners TEXT, -- JSON
            api_keys TEXT, -- JSON (encrypted)
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        -- Chapters table
        CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            status TEXT DEFAULT 'draft',
            word_count INTEGER DEFAULT 0,
            summary TEXT,
            number INTEGER,
            image TEXT,
            image_type TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        -- Scenes table
        CREATE TABLE IF NOT EXISTS scenes (
            id TEXT PRIMARY KEY,
            chapter_id TEXT NOT NULL,
            title TEXT NOT NULL,
            character_ids TEXT, -- JSON array
            location_id TEXT,
            timeline_position INTEGER DEFAULT 0,
            description TEXT,
            notes TEXT,
            image TEXT,
            image_type TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );

        -- Characters table
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'secondary',
            avatar_url TEXT,
            physical_description TEXT,
            personality TEXT,
            history TEXT,
            notes TEXT,
            attributes TEXT, -- JSON
            attribute_history TEXT, -- JSON array
            vital_status_history TEXT, -- JSON array
            current_vital_status TEXT,
            visual_position TEXT, -- JSON {x, y}
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        -- Relationships table
        CREATE TABLE IF NOT EXISTS relationships (
            id TEXT PRIMARY KEY,
            character_id TEXT NOT NULL,
            target_character_id TEXT NOT NULL,
            current_type TEXT,
            current_status TEXT,
            current_description TEXT,
            is_secret INTEGER DEFAULT 0,
            history TEXT, -- JSON array
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
            FOREIGN KEY (target_character_id) REFERENCES characters(id) ON DELETE CASCADE
        );

        -- Locations table
        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT,
            type TEXT,
            description TEXT,
            significance TEXT,
            notes TEXT,
            gallery TEXT, -- JSON array
            plans TEXT, -- JSON array
            connections TEXT, -- JSON array
            visual_position TEXT, -- JSON {x, y}
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        -- Lore items table
        CREATE TABLE IF NOT EXISTS lore_items (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT,
            content TEXT,
            summary TEXT,
            related_entity_ids TEXT, -- JSON array
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        -- Timeline events table
        CREATE TABLE IF NOT EXISTS timeline_events (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            date_mode TEXT DEFAULT 'absolute',
            date TEXT,
            era TEXT,
            participants TEXT, -- JSON array of character IDs
            location_id TEXT,
            importance TEXT DEFAULT 'medium',
            tags TEXT, -- JSON array
            scene_id TEXT,
            chapter_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        -- Create indexes for common queries
        CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id);
        CREATE INDEX IF NOT EXISTS idx_scenes_chapter ON scenes(chapter_id);
        CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);
        CREATE INDEX IF NOT EXISTS idx_relationships_character ON relationships(character_id);
        CREATE INDEX IF NOT EXISTS idx_locations_project ON locations(project_id);
        CREATE INDEX IF NOT EXISTS idx_lore_items_project ON lore_items(project_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_events_project ON timeline_events(project_id);
        "#,
    )?;

    log::info!("Database schema initialized successfully");
    Ok(())
}
