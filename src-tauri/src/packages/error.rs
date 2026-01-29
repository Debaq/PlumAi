use thiserror::Error;

#[derive(Debug, Error)]
pub enum PackageError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Zip error: {0}")]
    Zip(#[from] zip::result::ZipError),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("Checksum mismatch: expected {expected}, got {actual}")]
    ChecksumMismatch { expected: String, actual: String },

    #[error("Package not found: {0}")]
    NotFound(String),

    #[error("Invalid registry URL: {0}")]
    InvalidRegistryUrl(String),

    #[error("Package already installed: {0}")]
    AlreadyInstalled(String),

    #[error("Incompatible app version: requires {required}, current {current}")]
    IncompatibleVersion { required: String, current: String },
}

impl From<PackageError> for String {
    fn from(e: PackageError) -> String {
        e.to_string()
    }
}
