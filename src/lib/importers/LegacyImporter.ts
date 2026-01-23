import type { Project, Relationship } from '@/types/domain';

export const LegacyImporter = {
  importLegacyProject(json: any): Project {
    // 1. Project Info
    const project: Project = {
      id: json.projectInfo?.id || crypto.randomUUID(),
      title: json.projectInfo?.title || 'Untitled Project',
      chapters: [],
      characters: [],
      locations: [],
      loreItems: [],
      timelineEvents: []
    };

    // 2. Characters
    if (Array.isArray(json.characters)) {
      project.characters = json.characters.map((c: any) => ({
        id: c.id,
        name: c.name,
        role: mapRole(c.role),
        avatarUrl: c.avatar?.url || undefined,
        physicalDescription: c.description,
        personality: c.personality,
        history: c.background,
        notes: c.notes,
        relationships: mapRelationships(c.id, c.relationships)
      }));
    }

    // 3. Locations
    if (Array.isArray(json.locations)) {
      project.locations = json.locations.map((l: any) => ({
        id: l.id,
        name: l.name,
        imageUrl: l.image,
        type: l.type || 'other',
        description: l.description,
        significance: l.significance,
        notes: l.notes
      }));
    }

    // 4. Lore
    const loreList = json.loreEntries || json.lore || [];
    if (Array.isArray(loreList)) {
      project.loreItems = loreList.map((l: any) => ({
        id: l.id,
        name: l.title,
        category: l.category || 'general',
        content: l.content || '',
        summary: l.summary,
        relatedEntityIds: l.relatedEntities
      }));
    }

    // 5. Timeline
    if (Array.isArray(json.timeline)) {
        project.timelineEvents = json.timeline.map((t: any) => ({
            id: t.id,
            title: t.event || t.title || 'Untitled Event',
            description: t.description,
            dateMode: t.dateMode || 'absolute',
            absoluteDate: t.date,
            era: t.era,
            participants: t.participants || [],
            locationId: t.location,
            importance: t.importance || 'medium',
            tags: t.tags || [],
            chapterId: t.chapterId || (t.chapterIds && t.chapterIds.length > 0 ? t.chapterIds[0] : undefined),
            sceneId: t.sceneId || (t.sceneIds && t.sceneIds.length > 0 ? t.sceneIds[0] : undefined)
        }));
    }

    // 6. Chapters and Scenes
    if (Array.isArray(json.chapters)) {
      project.chapters = json.chapters.map((c: any) => {
        // Find scenes for this chapter
        let scenes: any[] = [];
        if (c.scenes && Array.isArray(c.scenes) && c.scenes.length > 0 && typeof c.scenes[0] === 'string') {
            // If c.scenes contains IDs
             scenes = (json.scenes || []).filter((s: any) => c.scenes.includes(s.id));
        } else {
             scenes = (json.scenes || []).filter((s: any) => s.chapterId === c.id);
        }

        // Sort by timelinePosition if available
        scenes.sort((a: any, b: any) => (a.timelinePosition || 0) - (b.timelinePosition || 0));

        return {
          id: c.id,
          title: c.title,
          content: c.content || '',
          status: c.status || 'draft',
          wordCount: c.wordCount || 0,
          summary: c.summary,
          scenes: scenes.map((s: any) => ({
            id: s.id,
            title: s.title,
            chapterId: c.id,
            characterIds: s.characters || [],
            locationId: s.location,
            timelinePosition: s.timelinePosition || 0,
            description: s.description,
            notes: s.notes
          }))
        };
      });
    }

    return project;
  }
};

function mapRole(role: string): any {
  const roles = ['protagonist', 'antagonist', 'secondary', 'supporting'];
  if (roles.includes(role)) return role;
  return 'secondary';
}

function mapRelationships(selfId: string, rels: any[]): Relationship[] {
  if (!Array.isArray(rels)) return [];
  return rels.map(r => ({
    id: r.id || crypto.randomUUID(),
    characterId1: selfId,
    characterId2: r.characterId,
    type: mapRelType(r.type || r.currentType),
    description: r.description || r.currentDescription
  }));
}

function mapRelType(type: string): any {
    const map: Record<string, string> = {
        'amigo': 'friend',
        'friend': 'friend',
        'enemigo': 'enemy',
        'enemy': 'enemy',
        'familia': 'family',
        'family': 'family',
        'pareja': 'romantic',
        'romantic': 'romantic',
        'love': 'romantic',
        'colega': 'professional',
        'professional': 'professional',
        'colleague': 'professional'
    };
    return map[type] || 'neutral';
}
