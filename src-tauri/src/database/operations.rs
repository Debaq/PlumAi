//! CRUD operations for all entities

use super::models::*;
use rusqlite::{params, Connection, Result};

// ============================================================================
// Projects
// ============================================================================

pub fn create_project(conn: &Connection, project: &Project) -> Result<()> {
    conn.execute(
        r#"INSERT INTO projects (id, title, author, description, genre, is_rpg_mode_enabled, rpg_system, active_identity_package, origin_package_id, project_type, banners, api_keys, creatures, world_rules)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)"#,
        params![
            project.id,
            project.title,
            project.author,
            project.description,
            project.genre,
            project.is_rpg_mode_enabled,
            project.rpg_system,
            project.active_identity_package,
            project.origin_package_id,
            project.project_type,
            project.banners.as_ref().map(|v| v.to_string()),
            project.api_keys.as_ref().map(|v| v.to_string()),
            project.creatures.as_ref().map(|v| v.to_string()),
            project.world_rules.as_ref().map(|v| v.to_string()),
        ],
    )?;
    Ok(())
}

pub fn get_project(conn: &Connection, id: &str) -> Result<Option<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, author, description, genre, is_rpg_mode_enabled, rpg_system, active_identity_package, origin_package_id, project_type, banners, api_keys, creatures, world_rules FROM projects WHERE id = ?1"
    )?;

    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Project {
            id: row.get(0)?,
            title: row.get(1)?,
            author: row.get(2)?,
            description: row.get(3)?,
            genre: row.get(4)?,
            is_rpg_mode_enabled: row.get::<_, i32>(5)? != 0,
            rpg_system: row.get(6)?,
            active_identity_package: row.get(7)?,
            origin_package_id: row.get(8)?,
            project_type: row.get(9)?,
            banners: row
                .get::<_, Option<String>>(10)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            api_keys: row
                .get::<_, Option<String>>(11)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            creatures: row
                .get::<_, Option<String>>(12)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            world_rules: row
                .get::<_, Option<String>>(13)?
                .and_then(|s| serde_json::from_str(&s).ok()),
        }))
    } else {
        Ok(None)
    }
}

pub fn get_all_projects(conn: &Connection) -> Result<Vec<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, author, description, genre, is_rpg_mode_enabled, rpg_system, active_identity_package, origin_package_id, project_type, banners, api_keys, creatures, world_rules FROM projects ORDER BY updated_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            title: row.get(1)?,
            author: row.get(2)?,
            description: row.get(3)?,
            genre: row.get(4)?,
            is_rpg_mode_enabled: row.get::<_, i32>(5)? != 0,
            rpg_system: row.get(6)?,
            active_identity_package: row.get(7)?,
            origin_package_id: row.get(8)?,
            project_type: row.get(9)?,
            banners: row
                .get::<_, Option<String>>(10)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            api_keys: row
                .get::<_, Option<String>>(11)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            creatures: row
                .get::<_, Option<String>>(12)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            world_rules: row
                .get::<_, Option<String>>(13)?
                .and_then(|s| serde_json::from_str(&s).ok()),
        })
    })?;

    rows.collect()
}

pub fn update_project(conn: &Connection, project: &Project) -> Result<()> {
    conn.execute(
        r#"UPDATE projects SET title = ?2, author = ?3, description = ?4, genre = ?5,
           is_rpg_mode_enabled = ?6, rpg_system = ?7, active_identity_package = ?8, origin_package_id = ?9,
           project_type = ?10, banners = ?11, api_keys = ?12, creatures = ?13, world_rules = ?14, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            project.id,
            project.title,
            project.author,
            project.description,
            project.genre,
            project.is_rpg_mode_enabled,
            project.rpg_system,
            project.active_identity_package,
            project.origin_package_id,
            project.project_type,
            project.banners.as_ref().map(|v| v.to_string()),
            project.api_keys.as_ref().map(|v| v.to_string()),
            project.creatures.as_ref().map(|v| v.to_string()),
            project.world_rules.as_ref().map(|v| v.to_string()),
        ],
    )?;
    Ok(())
}

pub fn delete_project(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Chapters
// ============================================================================

pub fn create_chapter(conn: &Connection, chapter: &Chapter) -> Result<()> {
    conn.execute(
        r#"INSERT INTO chapters (id, project_id, title, content, status, word_count, summary, number, image, image_type)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"#,
        params![
            chapter.id,
            chapter.project_id,
            chapter.title,
            chapter.content,
            chapter.status,
            chapter.word_count,
            chapter.summary,
            chapter.number,
            chapter.image,
            chapter.image_type,
        ],
    )?;
    Ok(())
}

pub fn get_chapters_by_project(conn: &Connection, project_id: &str) -> Result<Vec<Chapter>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, title, content, status, word_count, summary, number, image, image_type
         FROM chapters WHERE project_id = ?1 ORDER BY number, created_at"
    )?;

    let rows = stmt.query_map(params![project_id], |row| {
        Ok(Chapter {
            id: row.get(0)?,
            project_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            status: row.get(4)?,
            word_count: row.get(5)?,
            summary: row.get(6)?,
            number: row.get(7)?,
            image: row.get(8)?,
            image_type: row.get(9)?,
        })
    })?;

    rows.collect()
}

pub fn update_chapter(conn: &Connection, chapter: &Chapter) -> Result<()> {
    conn.execute(
        r#"UPDATE chapters SET title = ?2, content = ?3, status = ?4, word_count = ?5,
           summary = ?6, number = ?7, image = ?8, image_type = ?9, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            chapter.id,
            chapter.title,
            chapter.content,
            chapter.status,
            chapter.word_count,
            chapter.summary,
            chapter.number,
            chapter.image,
            chapter.image_type,
        ],
    )?;
    Ok(())
}

pub fn delete_chapter(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM chapters WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Scenes
// ============================================================================

pub fn create_scene(conn: &Connection, scene: &Scene) -> Result<()> {
    conn.execute(
        r#"INSERT INTO scenes (id, chapter_id, title, character_ids, location_id, timeline_position, description, notes, image, image_type)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"#,
        params![
            scene.id,
            scene.chapter_id,
            scene.title,
            serde_json::to_string(&scene.character_ids).unwrap_or_default(),
            scene.location_id,
            scene.timeline_position,
            scene.description,
            scene.notes,
            scene.image,
            scene.image_type,
        ],
    )?;
    Ok(())
}

pub fn get_scenes_by_chapter(conn: &Connection, chapter_id: &str) -> Result<Vec<Scene>> {
    let mut stmt = conn.prepare(
        "SELECT id, chapter_id, title, character_ids, location_id, timeline_position, description, notes, image, image_type
         FROM scenes WHERE chapter_id = ?1 ORDER BY timeline_position"
    )?;

    let rows = stmt.query_map(params![chapter_id], |row| {
        let character_ids_json: String = row.get(3)?;
        Ok(Scene {
            id: row.get(0)?,
            chapter_id: row.get(1)?,
            title: row.get(2)?,
            character_ids: serde_json::from_str(&character_ids_json).unwrap_or_default(),
            location_id: row.get(4)?,
            timeline_position: row.get(5)?,
            description: row.get(6)?,
            notes: row.get(7)?,
            image: row.get(8)?,
            image_type: row.get(9)?,
        })
    })?;

    rows.collect()
}

pub fn update_scene(conn: &Connection, scene: &Scene) -> Result<()> {
    conn.execute(
        r#"UPDATE scenes SET title = ?2, character_ids = ?3, location_id = ?4, timeline_position = ?5,
           description = ?6, notes = ?7, image = ?8, image_type = ?9, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            scene.id,
            scene.title,
            serde_json::to_string(&scene.character_ids).unwrap_or_default(),
            scene.location_id,
            scene.timeline_position,
            scene.description,
            scene.notes,
            scene.image,
            scene.image_type,
        ],
    )?;
    Ok(())
}

pub fn delete_scene(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM scenes WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Characters
// ============================================================================

pub fn create_character(conn: &Connection, character: &Character) -> Result<()> {
    conn.execute(
        r#"INSERT INTO characters (id, project_id, origin_package_id, name, role, avatar_url, physical_description, personality, history, notes, attributes, attribute_history, vital_status_history, current_vital_status, visual_position)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)"#,
        params![
            character.id,
            character.project_id,
            character.origin_package_id,
            character.name,
            character.role,
            character.avatar_url,
            character.physical_description,
            character.personality,
            character.history,
            character.notes,
            character.attributes.as_ref().map(|v| v.to_string()),
            character.attribute_history.as_ref().map(|v| v.to_string()),
            serde_json::to_string(&character.vital_status_history).unwrap_or_default(),
            character.current_vital_status,
            character.visual_position.as_ref().map(|v| v.to_string()),
        ],
    )?;
    Ok(())
}

pub fn get_characters_by_project(conn: &Connection, project_id: &str) -> Result<Vec<Character>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, origin_package_id, name, role, avatar_url, physical_description, personality, history, notes, attributes, attribute_history, vital_status_history, current_vital_status, visual_position
         FROM characters WHERE project_id = ?1 ORDER BY name"
    )?;

    let rows = stmt.query_map(params![project_id], |row| {
        Ok(Character {
            id: row.get(0)?,
            project_id: row.get(1)?,
            origin_package_id: row.get(2)?,
            name: row.get(3)?,
            role: row.get(4)?,
            avatar_url: row.get(5)?,
            physical_description: row.get(6)?,
            personality: row.get(7)?,
            history: row.get(8)?,
            notes: row.get(9)?,
            attributes: row
                .get::<_, Option<String>>(10)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            attribute_history: row
                .get::<_, Option<String>>(11)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            vital_status_history: row
                .get::<_, Option<String>>(12)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
            current_vital_status: row.get(13)?,
            visual_position: row
                .get::<_, Option<String>>(14)?
                .and_then(|s| serde_json::from_str(&s).ok()),
            relationships: vec![], // Loaded separately
        })
    })?;

    rows.collect()
}

pub fn update_character(conn: &Connection, character: &Character) -> Result<()> {
    conn.execute(
        r#"UPDATE characters SET name = ?2, role = ?3, avatar_url = ?4, physical_description = ?5,
           personality = ?6, history = ?7, notes = ?8, attributes = ?9, attribute_history = ?10,
           vital_status_history = ?11, current_vital_status = ?12, visual_position = ?13, origin_package_id = ?14, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            character.id,
            character.name,
            character.role,
            character.avatar_url,
            character.physical_description,
            character.personality,
            character.history,
            character.notes,
            character.attributes.as_ref().map(|v| v.to_string()),
            character.attribute_history.as_ref().map(|v| v.to_string()),
            serde_json::to_string(&character.vital_status_history).unwrap_or_default(),
            character.current_vital_status,
            character.visual_position.as_ref().map(|v| v.to_string()),
            character.origin_package_id,
        ],
    )?;
    Ok(())
}

pub fn delete_character(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM characters WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Relationships
// ============================================================================

pub fn create_relationship(conn: &Connection, char_id: &str, rel: &Relationship) -> Result<()> {
    conn.execute(
        r#"INSERT INTO relationships (id, character_id, target_character_id, current_type, current_status, current_description, is_secret, history)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"#,
        params![
            rel.id,
            char_id,
            rel.character_id,
            rel.current_type,
            rel.current_status,
            rel.current_description,
            rel.is_secret,
            serde_json::to_string(&rel.history).unwrap_or_default(),
        ],
    )?;
    Ok(())
}

pub fn get_relationships_by_character(
    conn: &Connection,
    character_id: &str,
) -> Result<Vec<Relationship>> {
    let mut stmt = conn.prepare(
        "SELECT id, target_character_id, current_type, current_status, current_description, is_secret, history
         FROM relationships WHERE character_id = ?1"
    )?;

    let rows = stmt.query_map(params![character_id], |row| {
        Ok(Relationship {
            id: row.get(0)?,
            character_id: row.get(1)?,
            current_type: row.get(2)?,
            current_status: row.get(3)?,
            current_description: row.get(4)?,
            is_secret: row.get::<_, i32>(5)? != 0,
            history: row
                .get::<_, Option<String>>(6)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
        })
    })?;

    rows.collect()
}

pub fn update_relationship(conn: &Connection, char_id: &str, rel: &Relationship) -> Result<()> {
    conn.execute(
        r#"UPDATE relationships SET current_type = ?3, current_status = ?4, current_description = ?5,
           is_secret = ?6, history = ?7, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1 AND character_id = ?2"#,
        params![
            rel.id,
            char_id,
            rel.current_type,
            rel.current_status,
            rel.current_description,
            rel.is_secret,
            serde_json::to_string(&rel.history).unwrap_or_default(),
        ],
    )?;
    Ok(())
}

pub fn delete_relationship(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM relationships WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Locations
// ============================================================================

pub fn create_location(conn: &Connection, location: &Location) -> Result<()> {
    conn.execute(
        r#"INSERT INTO locations (id, project_id, name, image_url, type, description, significance, notes, gallery, plans, connections, visual_position)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)"#,
        params![
            location.id,
            location.project_id,
            location.name,
            location.image_url,
            location.r#type,
            location.description,
            location.significance,
            location.notes,
            serde_json::to_string(&location.gallery).unwrap_or_default(),
            serde_json::to_string(&location.plans).unwrap_or_default(),
            serde_json::to_string(&location.connections).unwrap_or_default(),
            location.visual_position.as_ref().map(|v| v.to_string()),
        ],
    )?;
    Ok(())
}

pub fn get_locations_by_project(conn: &Connection, project_id: &str) -> Result<Vec<Location>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, name, image_url, type, description, significance, notes, gallery, plans, connections, visual_position
         FROM locations WHERE project_id = ?1 ORDER BY name"
    )?;

    let rows = stmt.query_map(params![project_id], |row| {
        Ok(Location {
            id: row.get(0)?,
            project_id: row.get(1)?,
            name: row.get(2)?,
            image_url: row.get(3)?,
            r#type: row.get(4)?,
            description: row.get(5)?,
            significance: row.get(6)?,
            notes: row.get(7)?,
            gallery: row
                .get::<_, Option<String>>(8)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
            plans: row
                .get::<_, Option<String>>(9)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
            connections: row
                .get::<_, Option<String>>(10)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
            visual_position: row
                .get::<_, Option<String>>(11)?
                .and_then(|s| serde_json::from_str(&s).ok()),
        })
    })?;

    rows.collect()
}

pub fn update_location(conn: &Connection, location: &Location) -> Result<()> {
    conn.execute(
        r#"UPDATE locations SET name = ?2, image_url = ?3, type = ?4, description = ?5,
           significance = ?6, notes = ?7, gallery = ?8, plans = ?9, connections = ?10, visual_position = ?11, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            location.id,
            location.name,
            location.image_url,
            location.r#type,
            location.description,
            location.significance,
            location.notes,
            serde_json::to_string(&location.gallery).unwrap_or_default(),
            serde_json::to_string(&location.plans).unwrap_or_default(),
            serde_json::to_string(&location.connections).unwrap_or_default(),
            location.visual_position.as_ref().map(|v| v.to_string()),
        ],
    )?;
    Ok(())
}

pub fn delete_location(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM locations WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Lore Items
// ============================================================================

pub fn create_lore_item(conn: &Connection, item: &LoreItem) -> Result<()> {
    conn.execute(
        r#"INSERT INTO lore_items (id, project_id, origin_package_id, title, category, content, summary, related_entity_ids)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"#,
        params![
            item.id,
            item.project_id,
            item.origin_package_id,
            item.title,
            item.category,
            item.content,
            item.summary,
            serde_json::to_string(&item.related_entity_ids).unwrap_or_default(),
        ],
    )?;
    Ok(())
}

pub fn get_lore_items_by_project(conn: &Connection, project_id: &str) -> Result<Vec<LoreItem>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, origin_package_id, title, category, content, summary, related_entity_ids
         FROM lore_items WHERE project_id = ?1 ORDER BY category, title"
    )?;

    let rows = stmt.query_map(params![project_id], |row| {
        Ok(LoreItem {
            id: row.get(0)?,
            project_id: row.get(1)?,
            origin_package_id: row.get(2)?,
            title: row.get(3)?,
            category: row.get(4)?,
            content: row.get(5)?,
            summary: row.get(6)?,
            related_entity_ids: row
                .get::<_, Option<String>>(7)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
        })
    })?;

    rows.collect()
}

pub fn update_lore_item(conn: &Connection, item: &LoreItem) -> Result<()> {
    conn.execute(
        r#"UPDATE lore_items SET title = ?2, category = ?3, content = ?4, summary = ?5,
           related_entity_ids = ?6, origin_package_id = ?7, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            item.id,
            item.title,
            item.category,
            item.content,
            item.summary,
            serde_json::to_string(&item.related_entity_ids).unwrap_or_default(),
            item.origin_package_id,
        ],
    )?;
    Ok(())
}

pub fn delete_lore_item(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM lore_items WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// Timeline Events
// ============================================================================

pub fn create_timeline_event(conn: &Connection, event: &TimelineEvent) -> Result<()> {
    conn.execute(
        r#"INSERT INTO timeline_events (id, project_id, title, description, date_mode, date, era, participants, location_id, importance, tags, scene_id, chapter_id)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)"#,
        params![
            event.id,
            event.project_id,
            event.title,
            event.description,
            event.date_mode,
            event.date,
            event.era,
            serde_json::to_string(&event.participants).unwrap_or_default(),
            event.location_id,
            event.importance,
            serde_json::to_string(&event.tags).unwrap_or_default(),
            event.scene_id,
            event.chapter_id,
        ],
    )?;
    Ok(())
}

pub fn get_timeline_events_by_project(
    conn: &Connection,
    project_id: &str,
) -> Result<Vec<TimelineEvent>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, title, description, date_mode, date, era, participants, location_id, importance, tags, scene_id, chapter_id
         FROM timeline_events WHERE project_id = ?1 ORDER BY date, created_at"
    )?;

    let rows = stmt.query_map(params![project_id], |row| {
        Ok(TimelineEvent {
            id: row.get(0)?,
            project_id: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            date_mode: row.get(4)?,
            date: row.get(5)?,
            era: row.get(6)?,
            participants: row
                .get::<_, Option<String>>(7)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
            location_id: row.get(8)?,
            importance: row.get(9)?,
            tags: row
                .get::<_, Option<String>>(10)?
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default(),
            scene_id: row.get(11)?,
            chapter_id: row.get(12)?,
        })
    })?;

    rows.collect()
}

pub fn update_timeline_event(conn: &Connection, event: &TimelineEvent) -> Result<()> {
    conn.execute(
        r#"UPDATE timeline_events SET title = ?2, description = ?3, date_mode = ?4, date = ?5,
           era = ?6, participants = ?7, location_id = ?8, importance = ?9, tags = ?10,
           scene_id = ?11, chapter_id = ?12, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            event.id,
            event.title,
            event.description,
            event.date_mode,
            event.date,
            event.era,
            serde_json::to_string(&event.participants).unwrap_or_default(),
            event.location_id,
            event.importance,
            serde_json::to_string(&event.tags).unwrap_or_default(),
            event.scene_id,
            event.chapter_id,
        ],
    )?;
    Ok(())
}

pub fn delete_timeline_event(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM timeline_events WHERE id = ?1", params![id])?;
    Ok(())
}

// ============================================================================
// System
// ============================================================================

pub fn clear_database(conn: &Connection) -> Result<()> {
    // Disable foreign key constraints temporarily to avoid ordering issues
    conn.execute("PRAGMA foreign_keys = OFF", [])?;

    let tables = [
        "timeline_events",
        "lore_items",
        "relationships",
        "scenes",
        "chapters",
        "locations",
        "characters",
        "projects",
        "app_settings",
    ];

    for table in tables {
        conn.execute(&format!("DELETE FROM {}", table), [])?;
    }

    conn.execute("PRAGMA foreign_keys = ON", [])?;
    conn.execute("VACUUM", [])?;
    Ok(())
}

pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT value FROM app_settings WHERE key = ?1")?;
    let mut rows = stmt.query(params![key])?;

    if let Some(row) = rows.next()? {
        Ok(Some(row.get(0)?))
    } else {
        Ok(None)
    }
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?1, ?2)",
        params![key, value],
    )?;
    Ok(())
}
