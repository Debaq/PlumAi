// src/types/domain.ts

export interface Project {
  id: string;
  title: string;
  chapters: Chapter[];
  characters: Character[];
  locations: Location[];
  loreItems: LoreItem[];
  timelineEvents: TimelineEvent[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string; // Rich text content
  scenes: Scene[];
  status: 'draft' | 'in_review' | 'final';
  wordCount: number;
  summary?: string;
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
  relationships: Relationship[];
}

export interface Relationship {
  id: string;
  characterId1: string;
  characterId2: string;
  type: 'friend' | 'enemy' | 'family' | 'romantic' | 'professional' | 'neutral';
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'city' | 'forest' | 'mountain' | 'building' | 'other';
  description?: string; // Rich text content
  significance?: string;
  notes?: string; // Rich text content
}

export interface LoreItem {
  id: string;
  name: string;
  category: 'world' | 'history' | 'magic' | 'culture' | 'general';
  content: string; // Rich text content
  summary?: string;
  relatedEntityIds?: string[];
}

export interface TimelineEvent {
    id: string;
    title: string;
    description?: string;
    dateMode: 'absolute' | 'relative' | 'era';
    absoluteDate?: string;
    relativePosition?: {
        targetEventId: string;
        direction: 'before' | 'after';
    };
    era?: string;
    participants: string[]; // Character IDs
    locationId?: string;
    importance: 'low' | 'medium' | 'high';
    tags?: string[];
    sceneId?: string;
    chapterId?: string;
}
