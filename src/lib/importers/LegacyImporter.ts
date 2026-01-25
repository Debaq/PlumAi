import type { Project, Relationship } from '@/types/domain';

export const LegacyImporter = {
  importLegacyProject(json: any): Project {
    // 1. Project Info
    const project: Project = {
      id: json.projectInfo?.id || crypto.randomUUID(),
      title: json.projectInfo?.title || 'Untitled Project',
      author: json.projectInfo?.author || '',
      description: json.projectInfo?.synopsis || json.projectInfo?.description || '',
      genre: json.projectInfo?.genre || '',
      chapters: [],
      characters: [],
      locations: [],
      loreItems: [],
      timelineEvents: [],
      scenes: []
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
        relationships: mapRelationships(c.relationships),
        vitalStatusHistory: Array.isArray(c.vitalStatusHistory) ? c.vitalStatusHistory : [{
          id: crypto.randomUUID(),
          status: c.currentVitalStatus || c.vitalStatus || 'alive',
          timestamp: new Date().toISOString(),
          description: 'Imported from legacy'
        }],
        currentVitalStatus: c.currentVitalStatus || c.vitalStatus || 'alive'
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
        title: l.title || l.name,
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
            date: t.date,
            era: t.era,
            participants: t.participants || [],
            locationId: t.location,
            importance: t.importance || 'medium',
            tags: t.tags || [],
            chapterId: t.chapterId || (t.chapterIds && t.chapterIds.length > 0 ? t.chapterIds[0] : undefined),
            sceneId: t.sceneId || (t.sceneIds && t.sceneIds.length > 0 ? t.sceneIds[0] : undefined)
        }));
    }

    // 6. Scenes (Legacy Top-level)
    if (Array.isArray(json.scenes)) {
      project.scenes = json.scenes.map((s: any) => ({
        id: s.id,
        title: s.title,
        chapterId: s.chapterId,
        characterIds: s.characters || [],
        locationId: s.location,
        timelinePosition: s.timelinePosition || 0,
        description: s.description,
        notes: s.notes,
        image: s.image,
        imageType: s.imageType
      }));
    }

    // 7. Chapters and Scenes
    if (Array.isArray(json.chapters)) {
      project.chapters = json.chapters.map((c: any) => {
        // Find scenes for this chapter
        let chapterScenes: any[] = [];
        if (c.scenes && Array.isArray(c.scenes) && c.scenes.length > 0 && typeof c.scenes[0] === 'string') {
            // If c.scenes contains IDs
             chapterScenes = (json.scenes || []).filter((s: any) => c.scenes.includes(s.id));
        } else {
             chapterScenes = (json.scenes || []).filter((s: any) => s.chapterId === c.id);
        }

        // Sort by timelinePosition if available
        chapterScenes.sort((a: any, b: any) => (a.timelinePosition || 0) - (b.timelinePosition || 0));

        return {
          id: c.id,
          title: c.title,
          content: c.content || '',
          status: c.status || 'draft',
          wordCount: c.wordCount || 0,
          summary: c.summary,
          scenes: chapterScenes.map((s: any) => ({
            id: s.id,
            title: s.title,
            chapterId: c.id,
            characterIds: s.characters || [],
            locationId: s.location,
            timelinePosition: s.timelinePosition || 0,
            description: s.description,
            notes: s.notes,
            image: s.image,
            imageType: s.imageType
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

function mapRelationships(rels: any[]): Relationship[] {
  if (!Array.isArray(rels)) return [];
  return rels.map(r => {
    const type = mapRelType(r.currentType || r.type);
    const status = r.currentStatus || 'active';
    const description = r.currentDescription || r.description || '';
    
    // If it already has history, preserve it
    const history = Array.isArray(r.history) ? r.history : [{
      id: crypto.randomUUID(),
      type,
      status,
      description,
      timestamp: new Date().toISOString()
    }];

    return {
      id: r.id || crypto.randomUUID(),
      characterId: r.characterId,
      currentType: type,
      currentStatus: status,
      currentDescription: description,
      history
    };
  });
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
