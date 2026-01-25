/**
 * Tauri Bridge - Communication layer between React frontend and Rust backend
 *
 * This module provides type-safe wrappers around Tauri's invoke API.
 * All IPC communication with the Rust backend goes through this module.
 */

import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// Types
// ============================================================================

export interface AppInfo {
  name: string;
  version: string;
  tauri_version: string;
  platform: string;
}

// Database Types (matching Rust models)
export interface DbProject {
  id: string;
  title: string;
  author?: string;
  description?: string;
  genre?: string;
  isRpgModeEnabled?: boolean;
  rpgSystem?: string;
  banners?: Record<string, string>;
  apiKeys?: unknown;
}

export interface DbChapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: 'draft' | 'in_review' | 'final';
  wordCount: number;
  summary?: string;
  number?: number;
  image?: string;
  imageType?: string;
}

export interface DbScene {
  id: string;
  chapterId: string;
  title: string;
  characterIds: string[];
  locationId?: string;
  timelinePosition: number;
  description?: string;
  notes?: string;
  image?: string;
  imageType?: string;
}

export interface DbCharacter {
  id: string;
  projectId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'secondary' | 'supporting';
  avatarUrl?: string;
  physicalDescription?: string;
  personality?: string;
  history?: string;
  notes?: string;
  attributes?: Record<string, unknown>;
  attributeHistory?: unknown[];
  vitalStatusHistory: unknown[];
  currentVitalStatus?: string;
  visualPosition?: { x: number; y: number };
  relationships: DbRelationship[];
}

export interface DbRelationship {
  id: string;
  characterId: string;
  currentType?: string;
  currentStatus?: string;
  currentDescription?: string;
  isSecret: boolean;
  history: unknown[];
}

export interface DbLocation {
  id: string;
  projectId: string;
  name: string;
  imageUrl?: string;
  type?: string;
  description?: string;
  significance?: string;
  notes?: string;
  gallery: unknown[];
  plans: unknown[];
  connections: unknown[];
  visualPosition?: { x: number; y: number };
}

export interface DbLoreItem {
  id: string;
  projectId: string;
  title: string;
  category?: string;
  content: string;
  summary?: string;
  relatedEntityIds: string[];
}

export interface DbTimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dateMode: 'absolute' | 'relative' | 'era';
  date?: string;
  era?: string;
  participants: string[];
  locationId?: string;
  importance: 'low' | 'medium' | 'high';
  tags: string[];
  sceneId?: string;
  chapterId?: string;
}

// AI Types
export type AiProvider = 'claude' | 'openai' | 'gemini';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatRequest {
  provider: AiProvider;
  apiKey: string;
  model?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AiChatResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Crypto Types
export interface EncryptedData {
  ciphertext: string;
  nonce: string;
  salt: string;
}

// Publishing Types
export interface DocumentMetadata {
  title: string;
  author?: string;
  description?: string;
}

export interface ExportChapter {
  title: string;
  number?: number;
  content: string;
}

export interface ExportDocument {
  metadata: DocumentMetadata;
  chapters: ExportChapter[];
}

export interface PdfOptions {
  pageWidthMm?: number;
  pageHeightMm?: number;
  marginMm?: number;
  fontSizePt?: number;
  lineHeight?: number;
  includeTitlePage?: boolean;
  includeToc?: boolean;
}

export interface DocxOptions {
  fontSizePt?: number;
  includeTitlePage?: boolean;
  includeToc?: boolean;
}

// Filesystem Types
export interface ProjectData {
  project: unknown;
  chapters: unknown[];
  scenes: unknown[];
  characters: unknown[];
  locations: unknown[];
  loreItems: unknown[];
  timelineEvents: unknown[];
  relationships: unknown[];
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if we're running inside a Tauri application
 */
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// ============================================================================
// App Commands
// ============================================================================

/**
 * Simple greeting command to test IPC communication
 */
export async function greet(name: string): Promise<string> {
  if (!isTauri()) {
    return `Hello, ${name}! (Browser mode - Tauri not available)`;
  }
  return invoke<string>('greet', { name });
}

/**
 * Get application information from the Rust backend
 */
export async function getAppInfo(): Promise<AppInfo> {
  if (!isTauri()) {
    return {
      name: 'PlumAi',
      version: '0.1.0',
      tauri_version: 'N/A',
      platform: 'browser',
    };
  }
  return invoke<AppInfo>('get_app_info');
}

// ============================================================================
// Database Commands - Projects
// ============================================================================

export async function dbCreateProject(project: DbProject): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_project', { project });
}

export async function dbGetProject(id: string): Promise<DbProject | null> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_project', { id });
}

export async function dbGetAllProjects(): Promise<DbProject[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_all_projects');
}

export async function dbUpdateProject(project: DbProject): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_project', { project });
}

export async function dbDeleteProject(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_project', { id });
}

// ============================================================================
// Database Commands - Chapters
// ============================================================================

export async function dbCreateChapter(chapter: DbChapter): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_chapter', { chapter });
}

export async function dbGetChaptersByProject(projectId: string): Promise<DbChapter[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_chapters_by_project', { projectId });
}

export async function dbUpdateChapter(chapter: DbChapter): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_chapter', { chapter });
}

export async function dbDeleteChapter(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_chapter', { id });
}

// ============================================================================
// Database Commands - Scenes
// ============================================================================

export async function dbCreateScene(scene: DbScene): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_scene', { scene });
}

export async function dbGetScenesByChapter(chapterId: string): Promise<DbScene[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_scenes_by_chapter', { chapterId });
}

export async function dbUpdateScene(scene: DbScene): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_scene', { scene });
}

export async function dbDeleteScene(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_scene', { id });
}

// ============================================================================
// Database Commands - Characters
// ============================================================================

export async function dbCreateCharacter(character: DbCharacter): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_character', { character });
}

export async function dbGetCharactersByProject(projectId: string): Promise<DbCharacter[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_characters_by_project', { projectId });
}

export async function dbUpdateCharacter(character: DbCharacter): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_character', { character });
}

export async function dbDeleteCharacter(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_character', { id });
}

// ============================================================================
// Database Commands - Relationships
// ============================================================================

export async function dbCreateRelationship(
  characterId: string,
  relationship: DbRelationship
): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_relationship', { characterId, relationship });
}

export async function dbGetRelationshipsByCharacter(
  characterId: string
): Promise<DbRelationship[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_relationships_by_character', { characterId });
}

export async function dbUpdateRelationship(
  characterId: string,
  relationship: DbRelationship
): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_relationship', { characterId, relationship });
}

export async function dbDeleteRelationship(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_relationship', { id });
}

// ============================================================================
// Database Commands - Locations
// ============================================================================

export async function dbCreateLocation(location: DbLocation): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_location', { location });
}

export async function dbGetLocationsByProject(projectId: string): Promise<DbLocation[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_locations_by_project', { projectId });
}

export async function dbUpdateLocation(location: DbLocation): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_location', { location });
}

export async function dbDeleteLocation(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_location', { id });
}

// ============================================================================
// Database Commands - Lore Items
// ============================================================================

export async function dbCreateLoreItem(item: DbLoreItem): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_lore_item', { item });
}

export async function dbGetLoreItemsByProject(projectId: string): Promise<DbLoreItem[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_lore_items_by_project', { projectId });
}

export async function dbUpdateLoreItem(item: DbLoreItem): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_lore_item', { item });
}

export async function dbDeleteLoreItem(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_lore_item', { id });
}

// ============================================================================
// Database Commands - Timeline Events
// ============================================================================

export async function dbCreateTimelineEvent(event: DbTimelineEvent): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_create_timeline_event', { event });
}

export async function dbGetTimelineEventsByProject(projectId: string): Promise<DbTimelineEvent[]> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_get_timeline_events_by_project', { projectId });
}

export async function dbUpdateTimelineEvent(event: DbTimelineEvent): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_update_timeline_event', { event });
}

export async function dbDeleteTimelineEvent(id: string): Promise<void> {
  if (!isTauri()) throw new Error('Tauri not available');
  return invoke('db_delete_timeline_event', { id });
}

// ============================================================================
// AI Commands
// ============================================================================

/**
 * Send a chat request to an AI provider
 */
export async function aiChat(request: AiChatRequest): Promise<AiChatResponse> {
  if (!isTauri()) {
    throw new Error('AI chat requires Tauri - not available in browser mode');
  }
  return invoke<AiChatResponse>('ai_chat', { request });
}

// ============================================================================
// Crypto Commands
// ============================================================================

/**
 * Encrypt data using AES-256-GCM
 */
export async function cryptoEncrypt(plaintext: string, password: string): Promise<EncryptedData> {
  if (!isTauri()) {
    throw new Error('Encryption requires Tauri - not available in browser mode');
  }
  return invoke<EncryptedData>('crypto_encrypt', { plaintext, password });
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function cryptoDecrypt(encrypted: EncryptedData, password: string): Promise<string> {
  if (!isTauri()) {
    throw new Error('Decryption requires Tauri - not available in browser mode');
  }
  return invoke<string>('crypto_decrypt', { encrypted, password });
}

// ============================================================================
// Publishing Commands
// ============================================================================

/**
 * Generate PDF and save to file
 */
export async function publishPdf(
  document: ExportDocument,
  options: PdfOptions,
  outputPath: string
): Promise<void> {
  if (!isTauri()) {
    throw new Error('PDF generation requires Tauri');
  }
  return invoke('publish_pdf', { document, options, outputPath });
}

/**
 * Generate PDF and return as bytes
 */
export async function publishPdfBytes(
  document: ExportDocument,
  options: PdfOptions
): Promise<Uint8Array> {
  if (!isTauri()) {
    throw new Error('PDF generation requires Tauri');
  }
  const bytes = await invoke<number[]>('publish_pdf_bytes', { document, options });
  return new Uint8Array(bytes);
}

/**
 * Generate DOCX and save to file
 */
export async function publishDocx(
  document: ExportDocument,
  options: DocxOptions,
  outputPath: string
): Promise<void> {
  if (!isTauri()) {
    throw new Error('DOCX generation requires Tauri');
  }
  return invoke('publish_docx', { document, options, outputPath });
}

/**
 * Generate DOCX and return as bytes
 */
export async function publishDocxBytes(
  document: ExportDocument,
  options: DocxOptions
): Promise<Uint8Array> {
  if (!isTauri()) {
    throw new Error('DOCX generation requires Tauri');
  }
  const bytes = await invoke<number[]>('publish_docx_bytes', { document, options });
  return new Uint8Array(bytes);
}

// ============================================================================
// Filesystem Commands
// ============================================================================

/**
 * Save project to .pluma file
 */
export async function fsSaveProject(data: ProjectData, outputPath: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('File saving requires Tauri');
  }
  return invoke('fs_save_project', { data, outputPath });
}

/**
 * Load project from .pluma file
 */
export async function fsLoadProject(inputPath: string): Promise<ProjectData> {
  if (!isTauri()) {
    throw new Error('File loading requires Tauri');
  }
  return invoke<ProjectData>('fs_load_project', { inputPath });
}

/**
 * Convert project to JSON bytes
 */
export async function fsProjectToJson(data: ProjectData): Promise<Uint8Array> {
  if (!isTauri()) {
    throw new Error('JSON conversion requires Tauri');
  }
  const bytes = await invoke<number[]>('fs_project_to_json', { data });
  return new Uint8Array(bytes);
}

/**
 * Parse project from JSON bytes
 */
export async function fsProjectFromJson(bytes: Uint8Array): Promise<ProjectData> {
  if (!isTauri()) {
    throw new Error('JSON parsing requires Tauri');
  }
  return invoke<ProjectData>('fs_project_from_json', { bytes: Array.from(bytes) });
}
