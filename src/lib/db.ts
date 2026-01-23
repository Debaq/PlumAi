// src/lib/db.ts
import Dexie, { type Table } from 'dexie';
import type {
  Project,
  Chapter,
  Scene,
  Character,
  Location,
  LoreItem,
  TimelineEvent,
  Relationship,
} from '@/types/domain';

export class PlumaDatabase extends Dexie {
  projects!: Table<Project>;
  chapters!: Table<Chapter>;
  scenes!: Table<Scene>;
  characters!: Table<Character>;
  locations!: Table<Location>;
  loreItems!: Table<LoreItem>;
  timelineEvents!: Table<TimelineEvent>;
  relationships!: Table<Relationship>;

  constructor() {
    super('PlumaDatabase');
    this.version(1).stores({
      projects: '++id',
      chapters: '++id, projectId',
      scenes: '++id, chapterId',
      characters: '++id, projectId',
      locations: '++id, projectId',
      loreItems: '++id, projectId',
      timelineEvents: '++id, projectId',
      relationships: '++id, characterId1, characterId2',
    });
  }
}

export const db = new PlumaDatabase();
