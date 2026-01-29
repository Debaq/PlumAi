use super::models::{CatalogPackage, InstalledPackageInfo, RegistryIndex, RegistryPackageEntry};

/// Build a catalog by merging registry entries with local installation state.
pub fn build_catalog(
    registries: &[(String, RegistryIndex)],
    installed: &[InstalledPackageInfo],
) -> Vec<CatalogPackage> {
    let mut catalog = Vec::new();

    for (registry_id, index) in registries {
        for entry in &index.packages {
            let installed_info = installed.iter().find(|i| i.id == entry.id);
            let is_installed = installed_info.is_some();
            let installed_version = installed_info.map(|i| i.version.clone());
            let has_update = installed_info
                .map(|i| i.version != entry.version)
                .unwrap_or(false);

            catalog.push(build_catalog_entry(
                entry,
                registry_id,
                is_installed,
                installed_version,
                has_update,
            ));
        }
    }

    // Deduplicate: if a package appears in multiple registries, keep the first one
    catalog.dedup_by(|a, b| a.id == b.id);

    catalog
}

fn build_catalog_entry(
    entry: &RegistryPackageEntry,
    registry_id: &str,
    is_installed: bool,
    installed_version: Option<String>,
    has_update: bool,
) -> CatalogPackage {
    CatalogPackage {
        id: entry.id.clone(),
        version: entry.version.clone(),
        author: entry.author.clone(),
        category: entry.category.clone(),
        min_app_version: entry.min_app_version.clone(),
        metadata: entry.metadata.clone(),
        download_url: entry.download_url.clone(),
        size_bytes: entry.size_bytes,
        checksum_sha256: entry.checksum_sha256.clone(),
        tags: entry.tags.clone(),
        registry_id: registry_id.to_string(),
        is_installed,
        installed_version,
        has_update,
    }
}

/// Check for updates by comparing installed packages against registry entries.
pub fn check_updates(
    registries: &[(String, RegistryIndex)],
    installed: &[InstalledPackageInfo],
) -> Vec<super::models::PackageUpdateInfo> {
    let mut updates = Vec::new();

    for inst in installed {
        for (registry_id, index) in registries {
            if let Some(entry) = index.packages.iter().find(|p| p.id == inst.id) {
                if entry.version != inst.version {
                    updates.push(super::models::PackageUpdateInfo {
                        id: inst.id.clone(),
                        current_version: inst.version.clone(),
                        available_version: entry.version.clone(),
                        registry_id: registry_id.clone(),
                    });
                }
                break;
            }
        }
    }

    updates
}
