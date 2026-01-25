// src/types/domain.ts

export interface Project {
  id: string;
  title: string;
  author?: string;
  description?: string;
  genre?: string;
  isRpgModeEnabled?: boolean; // RPG Mode Toggle
  rpgSystem?: string; // e.g., 'dnd5e', 'cthulhu', 'custom'
  banners?: Record<string, string>; // Context -> Image URL (custom banners)
  chapters: Chapter[];
  characters: Character[];
  locations: Location[];
  loreItems: LoreItem[];
  timelineEvents: TimelineEvent[];
  scenes: Scene[];
  apiKeys?: ProjectApiKeys;
}

export interface ProjectApiKeys {
  text: Record<string, ApiKeyEntry[]>;
  image: Record<string, ApiKeyEntry[]>;
}

export interface ApiKeyEntry {
  id: string;
  name: string;
  key: string;
  isDefault: boolean;
  lastUsed?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string; // Rich text content
  scenes: Scene[];
  status: 'draft' | 'in_review' | 'final';
  wordCount: number;
  summary?: string;
  number?: number;
  image?: string; // URL or base64
  imageType?: 'upload' | 'url' | 'ai';
}

export interface Scene {
  id: string;
  title: string;
  chapterId: string;
  characterIds: string[];
  locationId?: string;
  timelinePosition: number;
  description?: string;
  notes?: string;
  image?: string; // URL or base64
  imageType?: 'upload' | 'url' | 'ai';
}

export interface VitalStatusEntry {
  id: string;
  status: string;
  description?: string;
  timestamp: string;
  associatedEventId?: string;
  notes?: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'secondary' | 'supporting';
  avatarUrl?: string;
  physicalDescription?: string;
  personality?: string;
  history?: string;
  notes?: string;
  attributes?: Record<string, any>; // Flexible RPG stats
  attributeHistory?: { timestamp: string; attributes: Record<string, any> }[];
  relationships: Relationship[];
  vitalStatusHistory: VitalStatusEntry[];
  currentVitalStatus: string;
  visualPosition?: { x: number; y: number };
}

export interface Relationship {
  id: string;
  characterId: string; // The ID of the OTHER character
  currentType: string; // 'friend', 'love', 'enemy', etc.
  currentStatus: string; // 'active', 'strained', 'ended', etc.
  currentDescription?: string;
  isSecret?: boolean;
  history: RelationshipHistoryEntry[];
}

export interface RelationshipHistoryEntry {
  id: string;
  type: string;
  status: string;
  description: string;
  timestamp: string;
  eventId?: string;
  notes?: string;
  isSecret?: boolean;
}

export interface Location {
  id: string;
  name: string;
  imageUrl?: string;
  type: string; // flexible string
  description?: string; // Rich text content
  significance?: string;
  notes?: string; // Rich text content
  gallery?: LocationImage[];
  plans?: LocationImage[];
  connections?: LocationConnection[];
  visualPosition?: { x: number; y: number };
}

export interface LocationImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

export interface LocationConnection {
  id: string;
  targetLocationId: string;
  distance: string; // e.g., "5km", "2 days", "Next door"
  travelType: string; // e.g., "walking", "sailing", "teleport"
  description?: string;
}

export interface LoreItem {
  id: string;
  title: string; // Legacy used 'title', new used 'name'. Let's support title.
  name?: string; // optional alias for compatibility
  category: string;
  content: string; // Rich text content
  summary?: string;
  relatedEntityIds?: string[];
}

export interface TimelineEvent {
    id: string;
    title: string; // Legacy used 'event' sometimes
    event?: string; // Alias
    description?: string;
    dateMode: 'absolute' | 'relative' | 'era';
    date?: string; // Absolute date string
    era?: string;
    participants: string[]; // Character IDs
    locationId?: string;
    importance: 'low' | 'medium' | 'high';
    tags?: string[];
    sceneId?: string;
    chapterId?: string;
}