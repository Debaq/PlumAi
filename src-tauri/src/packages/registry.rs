use super::models::{RegistryIndex, RegistrySource};

/// Official PlumAi registry (hardcoded)
pub fn official_registry() -> RegistrySource {
    RegistrySource {
        id: "plumai-official".to_string(),
        url: "https://github.com/studio33-lab/plumai-store".to_string(),
        name: "PlumAi Official Packages".to_string(),
        enabled: true,
        is_official: true,
    }
}

/// Build a raw.githubusercontent.com URL from a GitHub repo URL and a file path.
pub fn github_raw_url(repo_url: &str, path: &str) -> Result<String, String> {
    // Accept formats:
    //   https://github.com/{owner}/{repo}
    //   https://github.com/{owner}/{repo}.git
    let url = repo_url
        .trim_end_matches('/')
        .trim_end_matches(".git");

    let parts: Vec<&str> = url.split('/').collect();
    if parts.len() < 2 {
        return Err(format!("Invalid GitHub repo URL: {}", repo_url));
    }

    let owner = parts[parts.len() - 2];
    let repo = parts[parts.len() - 1];

    if owner.is_empty() || repo.is_empty() {
        return Err(format!("Could not parse owner/repo from URL: {}", repo_url));
    }

    let path = path.trim_start_matches('/');
    Ok(format!(
        "https://raw.githubusercontent.com/{}/{}/main/{}",
        owner, repo, path
    ))
}

/// Fetch and parse the registry.json from a registry source.
pub async fn fetch_registry(source: &RegistrySource) -> Result<RegistryIndex, String> {
    let registry_url = github_raw_url(&source.url, "registry.json")?;

    let response = reqwest::get(&registry_url)
        .await
        .map_err(|e| format!("Failed to fetch registry from {}: {}", registry_url, e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Registry returned status {} for {}",
            response.status(),
            registry_url
        ));
    }

    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read registry response: {}", e))?;

    let index: RegistryIndex =
        serde_json::from_str(&body).map_err(|e| format!("Failed to parse registry JSON: {}", e))?;

    Ok(index)
}

/// Fetch all enabled registries in parallel.
pub async fn fetch_all_registries(
    sources: &[RegistrySource],
) -> Vec<(String, Result<RegistryIndex, String>)> {
    let mut handles = Vec::new();

    for source in sources {
        if !source.enabled {
            continue;
        }
        let source_clone = source.clone();
        let handle = tokio::spawn(async move {
            let result = fetch_registry(&source_clone).await;
            (source_clone.id, result)
        });
        handles.push(handle);
    }

    let mut results = Vec::new();
    for handle in handles {
        match handle.await {
            Ok(result) => results.push(result),
            Err(e) => {
                log::error!("Registry fetch task panicked: {}", e);
            }
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_github_raw_url() {
        let url = github_raw_url(
            "https://github.com/Debaq/PlumAi-Packages",
            "registry.json",
        )
        .unwrap();
        assert_eq!(
            url,
            "https://raw.githubusercontent.com/Debaq/PlumAi-Packages/main/registry.json"
        );
    }

    #[test]
    fn test_github_raw_url_with_trailing_slash() {
        let url = github_raw_url(
            "https://github.com/Debaq/PlumAi-Packages/",
            "packages/test.plumapkg",
        )
        .unwrap();
        assert_eq!(
            url,
            "https://raw.githubusercontent.com/Debaq/PlumAi-Packages/main/packages/test.plumapkg"
        );
    }

    #[test]
    fn test_github_raw_url_with_git_suffix() {
        let url = github_raw_url(
            "https://github.com/Debaq/PlumAi-Packages.git",
            "registry.json",
        )
        .unwrap();
        assert_eq!(
            url,
            "https://raw.githubusercontent.com/Debaq/PlumAi-Packages/main/registry.json"
        );
    }
}
