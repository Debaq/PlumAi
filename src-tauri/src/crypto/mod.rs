//! Cryptography module for secure data encryption
//!
//! Provides AES-256-GCM encryption with Argon2 key derivation.

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Encryption failed: {0}")]
    EncryptionFailed(String),
    #[error("Decryption failed: {0}")]
    DecryptionFailed(String),
    #[error("Key derivation failed: {0}")]
    KeyDerivationFailed(String),
    #[error("Invalid data format")]
    InvalidFormat,
}

/// Encrypted data structure
#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedData {
    /// Base64 encoded ciphertext
    pub ciphertext: String,
    /// Base64 encoded nonce (12 bytes for AES-GCM)
    pub nonce: String,
    /// Base64 encoded salt for key derivation
    pub salt: String,
}

/// Derive a 256-bit key from a password using Argon2
fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], CryptoError> {
    let argon2 = Argon2::default();

    // Use the salt to derive the key
    let salt_string = SaltString::encode_b64(salt)
        .map_err(|e| CryptoError::KeyDerivationFailed(e.to_string()))?;

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt_string)
        .map_err(|e| CryptoError::KeyDerivationFailed(e.to_string()))?;

    // Extract 32 bytes from the hash output
    let hash = password_hash.hash.ok_or(CryptoError::KeyDerivationFailed(
        "No hash output".to_string(),
    ))?;

    let hash_bytes = hash.as_bytes();
    let mut key = [0u8; 32];
    key.copy_from_slice(&hash_bytes[..32]);

    Ok(key)
}

/// Encrypt data using AES-256-GCM
pub fn encrypt(plaintext: &str, password: &str) -> Result<EncryptedData, CryptoError> {
    // Generate random salt (16 bytes)
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);

    // Derive key from password
    let key = derive_key(password, &salt)?;

    // Create cipher
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;

    // Generate random nonce (12 bytes for AES-GCM)
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Encrypt
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;

    Ok(EncryptedData {
        ciphertext: BASE64.encode(&ciphertext),
        nonce: BASE64.encode(&nonce_bytes),
        salt: BASE64.encode(&salt),
    })
}

/// Decrypt data using AES-256-GCM
pub fn decrypt(encrypted: &EncryptedData, password: &str) -> Result<String, CryptoError> {
    // Decode base64 values
    let ciphertext = BASE64
        .decode(&encrypted.ciphertext)
        .map_err(|_| CryptoError::InvalidFormat)?;

    let nonce_bytes = BASE64
        .decode(&encrypted.nonce)
        .map_err(|_| CryptoError::InvalidFormat)?;

    let salt = BASE64
        .decode(&encrypted.salt)
        .map_err(|_| CryptoError::InvalidFormat)?;

    // Derive key from password
    let key = derive_key(password, &salt)?;

    // Create cipher
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;

    // Decrypt
    let nonce = Nonce::from_slice(&nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;

    String::from_utf8(plaintext).map_err(|_| CryptoError::InvalidFormat)
}

/// Encrypt JSON data
#[allow(dead_code)]
pub fn encrypt_json<T: Serialize>(data: &T, password: &str) -> Result<EncryptedData, CryptoError> {
    let json = serde_json::to_string(data)
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    encrypt(&json, password)
}

/// Decrypt to JSON data
#[allow(dead_code)]
pub fn decrypt_json<T: for<'de> Deserialize<'de>>(
    encrypted: &EncryptedData,
    password: &str,
) -> Result<T, CryptoError> {
    let json = decrypt(encrypted, password)?;
    serde_json::from_str(&json).map_err(|e| CryptoError::DecryptionFailed(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let plaintext = "Hello, World! This is a secret message.";
        let password = "my_secure_password";

        let encrypted = encrypt(plaintext, password).unwrap();
        let decrypted = decrypt(&encrypted, password).unwrap();

        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_wrong_password() {
        let plaintext = "Secret data";
        let password = "correct_password";
        let wrong_password = "wrong_password";

        let encrypted = encrypt(plaintext, password).unwrap();
        let result = decrypt(&encrypted, wrong_password);

        assert!(result.is_err());
    }

    #[test]
    fn test_encrypt_decrypt_json() {
        #[derive(Serialize, Deserialize, PartialEq, Debug)]
        struct TestData {
            name: String,
            value: i32,
        }

        let data = TestData {
            name: "test".to_string(),
            value: 42,
        };
        let password = "json_password";

        let encrypted = encrypt_json(&data, password).unwrap();
        let decrypted: TestData = decrypt_json(&encrypted, password).unwrap();

        assert_eq!(data, decrypted);
    }
}
