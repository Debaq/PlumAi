// src/types/domain.ts

// Project Type
export type ProjectType = 'novel' | 'rpg' | 'worldbuilding';

// Creature Types for Bestiary
export interface CreatureAbility {
  id: string;
  name: string;
  description: string;
  cooldown?: string;
  damage?: string;
  range?: string;
}

export type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
export type DangerLevel = 'trivial' | 'low' | 'medium' | 'high' | 'deadly' | 'legendary';

export interface Creature {
  id: string;
  name: string;
  type: string;
  size: CreatureSize;
  description?: string;
  physicalDescription?: string;
  behavior?: string;
  habitat?: string[];
  dangerLevel: DangerLevel;
  challengeRating?: string;
  stats: Record<string, number | string>;
  abilities: CreatureAbility[];
  weaknesses?: string[];
  resistances?: string[];
  immunities?: string[];
  loot?: string[];
  imageUrl?: string;
  relatedLocationIds?: string[];
  notes?: string;
}

// World Rules Types
export type WorldRuleCategory =
  | 'magic'
  | 'physics'
  | 'social'
  | 'combat'
  | 'economy'
  | 'religion'
  | 'nature'
  | 'technology'
  | 'temporal'
  | 'metaphysical'
  | 'custom';

export type WorldRuleImportance = 'fundamental' | 'major' | 'minor';

export interface WorldRuleExample {
  id: string;
  title: string;
  description: string;
}

export interface WorldRule {
  id: string;
  title: string;
  category: WorldRuleCategory;
  customCategory?: string;
  content: string;
  summary?: string;
  importance: WorldRuleImportance;
  exceptions?: string[];
  examples?: WorldRuleExample[];
  relatedRuleIds?: string[];
  relatedEntityIds?: string[];
  imageUrl?: string;
  isSecret?: boolean;
}

// NPC Types
export type NpcDisposition = 'friendly' | 'neutral' | 'hostile' | 'unknown';
export type NpcImportance = 'key' | 'major' | 'minor' | 'secondary';

export interface NpcQuest {
  id: string;
  name: string;
  description?: string;
  status: 'available' | 'active' | 'completed' | 'failed';
}

export interface NpcDialogue {
  id: string;
  context: string;
  dialogue: string;
}

export interface NpcRelationship {
  id: string;
  targetNpcId: string;
  type: string;
  description?: string;
}

export interface Npc {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  personality?: string;
  role?: string;
  faction?: string;
  disposition: NpcDisposition;
  importance: NpcImportance;
  stats: Record<string, number | string>;
  inventory?: string[];
  quests?: NpcQuest[];
  dialogues?: NpcDialogue[];
  secrets?: string[];
  relationships?: NpcRelationship[];
  schedule?: string;
  relatedLocationIds?: string[];
  linkedCharacterId?: string;
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  author?: string;
  description?: string;
  genre?: string;
  projectType?: ProjectType; // Project type (novel, rpg, worldbuilding)
  isRpgModeEnabled?: boolean; // RPG Mode Toggle
  rpgSystem?: string; // e.g., 'dnd5e', 'cthulhu', 'custom'
  activeIdentityPackage?: string; // ID of the currently active identity package
  originPackageId?: string; // ID of the package this project was created from
  banners?: Record<string, string>; // Context -> Image URL (custom banners)
  chapters: Chapter[];
  characters: Character[];
  locations: Location[];
  loreItems: LoreItem[];
  timelineEvents: TimelineEvent[];
  scenes: Scene[];
  creatures?: Creature[]; // Bestiary
  worldRules?: WorldRule[]; // World Rules
  npcs?: Npc[]; // NPCs
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
  content: string;
  summary?: string;
  wordCount?: number;
  status: 'draft' | 'in_review' | 'final';
  lastModified: number;
  order: number;
  number?: number; // Alias for order, kept for legacy compatibility
  image?: string;
  imageType?: 'upload' | 'url' | 'ai';
  headerImage?: string;
  scenes?: string[]; // Scene IDs associated with this chapter
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
