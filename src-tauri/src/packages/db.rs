use super::models::InstalledPackageInfo;
use rusqlite::{params, Connection, Result};

pub fn create_installed_package(conn: &Connection, pkg: &InstalledPackageInfo) -> Result<()> {
    conn.execute(
        r#"INSERT OR REPLACE INTO installed_packages
           (id, version, author, category, registry_id, metadata, checksum, size_bytes, install_path, updated_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP)"#,
        params![
            pkg.id,
            pkg.version,
            pkg.author,
            pkg.category,
            pkg.registry_id,
            pkg.metadata,
            pkg.checksum,
            pkg.size_bytes,
            pkg.install_path,
        ],
    )?;
    Ok(())
}

pub fn get_installed_package(conn: &Connection, id: &str) -> Result<Option<InstalledPackageInfo>> {
    let mut stmt = conn.prepare(
        "SELECT id, version, author, category, registry_id, metadata, checksum, size_bytes, install_path, installed_at, updated_at
         FROM installed_packages WHERE id = ?1",
    )?;

    let mut rows = stmt.query(params![id])?;

    if let Some(row) = rows.next()? {
        Ok(Some(InstalledPackageInfo {
            id: row.get(0)?,
            version: row.get(1)?,
            author: row.get(2)?,
            category: row.get(3)?,
            registry_id: row.get(4)?,
            metadata: row.get(5)?,
            checksum: row.get(6)?,
            size_bytes: row.get(7)?,
            install_path: row.get(8)?,
            installed_at: row.get(9)?,
            updated_at: row.get(10)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn get_all_installed_packages(conn: &Connection) -> Result<Vec<InstalledPackageInfo>> {
    let mut stmt = conn.prepare(
        "SELECT id, version, author, category, registry_id, metadata, checksum, size_bytes, install_path, installed_at, updated_at
         FROM installed_packages ORDER BY id",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(InstalledPackageInfo {
            id: row.get(0)?,
            version: row.get(1)?,
            author: row.get(2)?,
            category: row.get(3)?,
            registry_id: row.get(4)?,
            metadata: row.get(5)?,
            checksum: row.get(6)?,
            size_bytes: row.get(7)?,
            install_path: row.get(8)?,
            installed_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    rows.collect()
}

pub fn delete_installed_package(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM installed_packages WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn update_installed_package(conn: &Connection, pkg: &InstalledPackageInfo) -> Result<()> {
    conn.execute(
        r#"UPDATE installed_packages
           SET version = ?2, author = ?3, category = ?4, registry_id = ?5,
               metadata = ?6, checksum = ?7, size_bytes = ?8, install_path = ?9,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?1"#,
        params![
            pkg.id,
            pkg.version,
            pkg.author,
            pkg.category,
            pkg.registry_id,
            pkg.metadata,
            pkg.checksum,
            pkg.size_bytes,
            pkg.install_path,
        ],
    )?;
    Ok(())
}
