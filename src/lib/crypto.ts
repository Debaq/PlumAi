import { Project, ProjectApiKeys } from '@/types/domain';

/**
 * CryptoService
 * Uses Web Crypto API for secure encryption of sensitive data (AES-GCM).
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

export interface EncryptedData {
  _encrypted: true;
  _data: string;
  _version?: string;
}

export class CryptoService {
  /**
   * Derives an encryption key from a password
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using a password
   */
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

      const key = await this.deriveKey(password, salt);

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: ALGORITHM,
          iv: iv,
        },
        key,
        dataBuffer
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);
      const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(encryptedArray, salt.length + iv.length);

      return this.arrayBufferToBase64(result);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts data using a password
   */
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      const encryptedArray = new Uint8Array(encryptedBuffer);

      const salt = encryptedArray.slice(0, SALT_LENGTH);
      const iv = encryptedArray.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const data = encryptedArray.slice(SALT_LENGTH + IV_LENGTH);

      const key = await this.deriveKey(password, salt);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: ALGORITHM,
          iv: iv,
        },
        key,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Incorrect password or corrupted data');
    }
  }

  /**
   * Encrypts API keys of a project
   */
  static async encryptApiKeys(apiKeys: ProjectApiKeys, password: string): Promise<EncryptedData> {
    const apiKeysJson = JSON.stringify(apiKeys);
    const encryptedData = await this.encrypt(apiKeysJson, password);
    return {
      _encrypted: true,
      _data: encryptedData
    };
  }

  /**
   * Decrypts API keys of a project
   */
  static async decryptApiKeys(encryptedApiKeys: EncryptedData, password: string): Promise<ProjectApiKeys> {
    const decryptedJson = await this.decrypt(encryptedApiKeys._data, password);
    return JSON.parse(decryptedJson);
  }

  /**
   * Encrypts the entire project
   */
  static async encryptProject(project: Project, password: string): Promise<EncryptedData & { projectInfo: any }> {
    const projectJson = JSON.stringify(project);
    const encryptedData = await this.encrypt(projectJson, password);
    
    return {
      _encrypted: true,
      _version: '2.0',
      _data: encryptedData,
      projectInfo: {
        id: project.id,
        title: project.title,
        author: project.author
      }
    };
  }

  /**
   * Decrypts the entire project
   */
  static async decryptProject(encryptedProject: EncryptedData, password: string): Promise<Project> {
    const decryptedJson = await this.decrypt(encryptedProject._data, password);
    return JSON.parse(decryptedJson);
  }

  /**
   * Hash a password for verification (non-reversible)
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  // Utilities for format conversion
  private static arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
