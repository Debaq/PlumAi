// src/stores/useProjectStore.ts
import { create } from 'zustand';
import { 
  dbCreateProject, dbGetProject, dbUpdateProject,
  dbCreateChapter, dbGetChaptersByProject, dbUpdateChapter, dbDeleteChapter,
  dbCreateScene, dbGetScenesByChapter, dbUpdateScene, dbDeleteScene,
  dbCreateCharacter, dbGetCharactersByProject, dbUpdateCharacter, dbDeleteCharacter,
  dbCreateRelationship, dbGetRelationshipsByCharacter, dbUpdateRelationship, dbDeleteRelationship,
  dbCreateLocation, dbGetLocationsByProject, dbUpdateLocation, dbDeleteLocation,
  dbCreateLoreItem, dbGetLoreItemsByProject, dbUpdateLoreItem, dbDeleteLoreItem,
  dbCreateTimelineEvent, dbGetTimelineEventsByProject, dbUpdateTimelineEvent, dbDeleteTimelineEvent
} from '@/lib/tauri-bridge';
import type { Project, Chapter, Character, Location, Scene, ProjectApiKeys, ApiKeyEntry, VitalStatusEntry, LoreItem, TimelineEvent, RelationshipHistoryEntry, LocationImage, LocationConnection, Creature, CreatureAbility, WorldRule, WorldRuleExample, ProjectType, Npc, NpcQuest, NpcDialogue } from '@/types/domain';

interface ProjectState {
  activeProject: Project | null;
  setActiveProject: (project: Project) => void;
  clearActiveProject: () => void;
  saveProject: () => Promise<void>;
  closeProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  
  // Chapters
  addChapter: (chapter: Omit<Chapter, 'id'>) => Promise<void>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  
  // Characters
  addCharacter: (character: Omit<Character, 'id' | 'vitalStatusHistory' | 'currentVitalStatus'>) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  updateCharacterVitalStatus: (id: string, status: string, description?: string) => Promise<void>;
  updateCharacterPosition: (id: string, position: { x: number; y: number }) => Promise<void>;

  // Relationships
  addRelationship: (ownerId: string, targetId: string, type: string, status: string, description: string, isSecret?: boolean) => Promise<void>;
  updateRelationshipHistory: (charId: string, relId: string, entry: Omit<RelationshipHistoryEntry, 'id' | 'timestamp'>) => Promise<void>;
  deleteRelationship: (charId: string, relId: string) => Promise<void>;

  // Locations
  addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  updateLocationPosition: (id: string, position: { x: number; y: number }) => Promise<void>;
  addLocationImage: (locationId: string, type: 'gallery' | 'plans', image: Omit<LocationImage, 'id'>) => Promise<void>;
  removeLocationImage: (locationId: string, type: 'gallery' | 'plans', imageId: string) => Promise<void>;
  addLocationConnection: (locationId: string, connection: Omit<LocationConnection, 'id'>) => Promise<void>;
  removeLocationConnection: (locationId: string, connectionId: string) => Promise<void>;

  // Lore
  addLoreItem: (loreItem: Omit<LoreItem, 'id'>) => Promise<void>;
  updateLoreItem: (id: string, updates: Partial<LoreItem>) => Promise<void>;
  deleteLoreItem: (id: string) => Promise<void>;

  // Timeline
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;

  // Scenes
  addScene: (scene: Omit<Scene, 'id'>) => Promise<void>;
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  
  // AI API Key Management
  addApiKey: (type: 'text' | 'image', provider: string, keyData: { name: string; key: string }) => Promise<void>;
  updateApiKey: (type: 'text' | 'image', provider: string, keyId: string, updates: Partial<ApiKeyEntry>) => Promise<void>;
  deleteApiKey: (type: 'text' | 'image', provider: string, keyId: string) => Promise<void>;
  setDefaultApiKey: (type: 'text' | 'image', provider: string, keyId: string) => Promise<void>;
  createNewProject: (projectInfo: { title: string; author?: string; genre?: string; projectType?: ProjectType }) => Promise<void>;
  
  // Worldbuilder Mode
  toggleRpgMode: (enabled: boolean) => Promise<void>;
  setRpgSystem: (system: string) => Promise<void>;
  setContextBanner: (context: string, url: string) => Promise<void>;
  setProjectType: (type: ProjectType) => Promise<void>;

  // Creatures (Bestiary)
  addCreature: (creature: Omit<Creature, 'id'>) => void;
  updateCreature: (id: string, updates: Partial<Creature>) => void;
  deleteCreature: (id: string) => void;
  addCreatureAbility: (creatureId: string, ability: Omit<CreatureAbility, 'id'>) => void;
  removeCreatureAbility: (creatureId: string, abilityId: string) => void;

  // World Rules
  addWorldRule: (rule: Omit<WorldRule, 'id'>) => void;
  updateWorldRule: (id: string, updates: Partial<WorldRule>) => void;
  deleteWorldRule: (id: string) => void;
  addWorldRuleExample: (ruleId: string, example: Omit<WorldRuleExample, 'id'>) => void;
  removeWorldRuleExample: (ruleId: string, exampleId: string) => void;

  // NPCs
  addNpc: (npc: Omit<Npc, 'id'>) => void;
  updateNpc: (id: string, updates: Partial<Npc>) => void;
  deleteNpc: (id: string) => void;
  addNpcQuest: (npcId: string, quest: Omit<NpcQuest, 'id'>) => void;
  removeNpcQuest: (npcId: string, questId: string) => void;
  addNpcDialogue: (npcId: string, dialogue: Omit<NpcDialogue, 'id'>) => void;
  removeNpcDialogue: (npcId: string, dialogueId: string) => void;

  // Packages
  applyPackageIdentity: (packageId: string | null) => Promise<void>;
}

const initialApiKeys: ProjectApiKeys = {
  text: {
    anthropic: [],
    openai: [],
    google: [],
    groq: [],
    together: [],
    huggingface: [],
  },
  image: {
    googleImagen: [],
    dalle: [],
    stabilityai: [],
    replicate: [],
  }
};

export const useProjectStore = create<ProjectState>((set, get) => ({
      activeProject: null,
      
      setActiveProject: (project) => set({
        activeProject: {
          ...project,
          projectType: project.projectType || 'novel',
          creatures: project.creatures || [],
          worldRules: project.worldRules || [],
          npcs: project.npcs || [],
          apiKeys: project.apiKeys || initialApiKeys
        }
      }),
      
      clearActiveProject: () => set({ activeProject: null }),

      saveProject: async () => {
        // No-op or trigger explicit save if needed, but we save atomically now.
        // Maybe sync to cloud or export backup?
      },

      closeProject: async () => {
        set({ activeProject: null });
      },

      loadProject: async (id: string) => {
        try {
          const dbProject = await dbGetProject(id);
          if (!dbProject) return;

          // Fetch all related data in parallel
          const [chapters, characters, locations, loreItems, timelineEvents] = await Promise.all([
            dbGetChaptersByProject(id),
            dbGetCharactersByProject(id),
            dbGetLocationsByProject(id),
            dbGetLoreItemsByProject(id),
            dbGetTimelineEventsByProject(id)
          ]);

          // Fetch scenes for each chapter (could be optimized with a join or bulk query, but loop for now)
          const fullChapters = await Promise.all(chapters.map(async (c) => {
            const scenes = await dbGetScenesByChapter(c.id);
            // TODO: Map DB types to Domain types if needed (e.g., date strings to Date objects)
            // Assuming direct mapping for now
            return { ...c, scenes }; 
          }));

          // Fetch relationships for each character
          const fullCharacters = await Promise.all(characters.map(async (c) => {
             const relationships = await dbGetRelationshipsByCharacter(c.id);
             return { ...c, relationships };
          }));

          // Construct full Project object
          // Note: Some fields like creatures/worldRules are not in SQLite yet (from schema check)
          // We will use defaults for them or they might be stored in JSON fields if we add them later.
          // For now, they are empty arrays in the store init, so we keep them empty.
          
          const fullProject: Project = {
            id: dbProject.id,
            title: dbProject.title,
            author: dbProject.author || '',
            description: dbProject.description || '',
            genre: dbProject.genre || '',
            isRpgModeEnabled: dbProject.isRpgModeEnabled || false,
            rpgSystem: dbProject.rpgSystem || 'generic',
            activeIdentityPackage: dbProject.activeIdentityPackage || undefined,
            originPackageId: dbProject.originPackageId || undefined,
            banners: dbProject.banners as any || {},
            chapters: fullChapters as any[],
            characters: fullCharacters as any[],
            locations: locations as any[],
            loreItems: loreItems as any[],
            timelineEvents: timelineEvents as any[],
            scenes: [],
            creatures: Array.isArray(dbProject.creatures) ? dbProject.creatures : [],
            worldRules: Array.isArray(dbProject.worldRules) ? dbProject.worldRules : [],
            npcs: Array.isArray((dbProject as any).npcs) ? (dbProject as any).npcs : [],
            apiKeys: (dbProject.apiKeys as any) || initialApiKeys,
            projectType: (dbProject.projectType as ProjectType) || 'novel'
          };
          
          // Flatten scenes for the project object
          fullProject.scenes = fullChapters.flatMap(c => c.scenes) as any[];

          set({ activeProject: fullProject });

        } catch (error) {
          console.error("Failed to load project:", error);
        }
      },

      updateProject: async (updates) => {
        const { activeProject } = get();
        if (!activeProject) return;

        const updatedProject = { ...activeProject, ...updates };

        await dbUpdateProject(updatedProject as any);

        set({ activeProject: updatedProject });
      },

      createNewProject: async (info) => {
        const projectType = info.projectType || 'novel';
        const newProject: Project = {
          id: crypto.randomUUID(),
          title: info.title,
          author: info.author || '',
          description: '',
          genre: info.genre || '',
          projectType,
          isRpgModeEnabled: projectType === 'rpg' || projectType === 'worldbuilding',
          chapters: [],
          characters: [],
          locations: [],
          loreItems: [],
          timelineEvents: [],
          scenes: [],
          creatures: [],
          worldRules: [],
          npcs: [],
          apiKeys: initialApiKeys
        };

        // Rust model uses Option<serde_json::Value> for banners/apiKeys/creatures/worldRules.
        // Send objects directly — Tauri serializes them as JSON values for serde.
        const projectPayload = {
            id: newProject.id,
            title: newProject.title,
            author: newProject.author || null,
            description: newProject.description || null,
            genre: newProject.genre || null,
            isRpgModeEnabled: newProject.isRpgModeEnabled,
            rpgSystem: newProject.rpgSystem || null,
            activeIdentityPackage: newProject.activeIdentityPackage || null,
            originPackageId: newProject.originPackageId || null,
            projectType: newProject.projectType || 'novel',
            banners: newProject.banners || null,
            apiKeys: newProject.apiKeys || null,
            creatures: newProject.creatures || null,
            worldRules: newProject.worldRules || null,
            npcs: newProject.npcs || null,
        };

        console.log('[createNewProject] payload:', JSON.stringify(projectPayload, null, 2));

        try {
          await dbCreateProject(projectPayload as any);
          console.log('[createNewProject] dbCreateProject OK');
        } catch (dbErr) {
          console.error('[createNewProject] dbCreateProject FAILED:', dbErr);
          throw dbErr;
        }

        set({ activeProject: newProject });
        console.log('[createNewProject] activeProject set OK');
      },

      addChapter: async (chapter) => {
        const { activeProject } = get();
        if (!activeProject) return;
        
        const newChapter = {
          ...chapter,
          id: crypto.randomUUID(),
          projectId: activeProject.id, // Ensure projectId is set
          status: 'draft',
          wordCount: 0,
          number: activeProject.chapters.length + 1
        } as Chapter;

        // Bridge call
        await dbCreateChapter(newChapter as any);

        set((state) => ({
          activeProject: state.activeProject ? {
            ...state.activeProject,
            chapters: [...state.activeProject.chapters, newChapter],
          } : null,
        }));
      },

      updateChapter: async (id, updates) => {
        const { activeProject } = get();
        if (!activeProject) return;

        const currentChapter = activeProject.chapters.find(c => c.id === id);
        if (!currentChapter) return;

        const updatedChapter = { ...currentChapter, ...updates };
        
        // Bridge call
        await dbUpdateChapter(updatedChapter as any);

        set((state) => ({
          activeProject: state.activeProject ? {
            ...state.activeProject,
            chapters: state.activeProject.chapters.map((c) =>
              c.id === id ? updatedChapter : c
            ),
          } : null,
        }));
      },

      deleteChapter: async (id) => {
        const { activeProject } = get();
        if (!activeProject) return;

        // Bridge call
        await dbDeleteChapter(id);

        set((state) => ({
          activeProject: state.activeProject ? {
            ...state.activeProject,
            chapters: state.activeProject.chapters.filter((c) => c.id !== id),
          } : null,
        }));
      },
      
      addCharacter: async (character) => {
        const { activeProject } = get();
        if (!activeProject) return;
        
        const initialStatus: VitalStatusEntry = {
          id: crypto.randomUUID(),
          status: 'alive',
          timestamp: new Date().toISOString(),
          description: 'Initial state'
        };
        
        const newCharacter = {
          ...character,
          id: crypto.randomUUID(),
          projectId: activeProject.id,
          vitalStatusHistory: [initialStatus],
          currentVitalStatus: 'alive',
          attributes: character.attributes || {},
          attributeHistory: []
        } as Character;
        
        await dbCreateCharacter(newCharacter as any);

        set((state) => ({
          activeProject: state.activeProject ? {
            ...state.activeProject,
            characters: [...state.activeProject.characters, newCharacter],
          } : null,
        }));
      },
      
      updateCharacter: async (id, updates) => {
        const { activeProject } = get();
        if (!activeProject) return;

        const current = activeProject.characters.find(c => c.id === id);
        if (!current) return;

        // Logic for history
        let newAttributeHistory = current.attributeHistory || [];
        if (updates.attributes && JSON.stringify(updates.attributes) !== JSON.stringify(current.attributes)) {
             newAttributeHistory = [...newAttributeHistory, {
                timestamp: new Date().toISOString(),
                attributes: updates.attributes
             }];
        }

        const updatedCharacter = {
            ...current,
            ...updates,
            attributeHistory: newAttributeHistory
        };

        await dbUpdateCharacter(updatedCharacter as any);

        set((state) => ({
          activeProject: state.activeProject ? {
            ...state.activeProject,
            characters: state.activeProject.characters.map((c) => c.id === id ? updatedCharacter : c),
          } : null,
        }));
      },

      deleteCharacter: async (id) => {
        const { activeProject } = get();
        if (!activeProject) return;

        await dbDeleteCharacter(id);

        set((state) => ({
          activeProject: state.activeProject ? {
            ...state.activeProject,
            characters: state.activeProject.characters.filter((c) => c.id !== id),
          } : null,
        }));
      },

            updateCharacterVitalStatus: async (id, status, description) => {
              const { activeProject } = get();
              if (!activeProject) return;
              
              const current = activeProject.characters.find(c => c.id === id);
              if (!current) return;

              const newEntry: VitalStatusEntry = {
                id: crypto.randomUUID(),
                status,
                description,
                timestamp: new Date().toISOString()
              };
              
              const updatedCharacter = {
                  ...current,
                  currentVitalStatus: status,
                  vitalStatusHistory: [...current.vitalStatusHistory, newEntry]
              };

              await dbUpdateCharacter(updatedCharacter as any);

              set((state) => ({
                activeProject: state.activeProject ? {
                  ...state.activeProject,
                  characters: state.activeProject.characters.map((c) =>
                    c.id === id ? updatedCharacter : c
                  ),
                } : null,
              }));
            },
          
            updateCharacterPosition: async (id, position) => {
              const { activeProject } = get();
              if (!activeProject) return;

              const current = activeProject.characters.find(c => c.id === id);
              if (!current) return;
              
              const updatedCharacter = { ...current, visualPosition: position };

              await dbUpdateCharacter(updatedCharacter as any);

              set((state) => ({
                activeProject: state.activeProject ? {
                  ...state.activeProject,
                  characters: state.activeProject.characters.map((c) =>
                    c.id === id ? updatedCharacter : c
                  ),
                } : null,
              }));
            },
                        addRelationship: async (ownerId, targetId, type, status, description, isSecret = false) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const newRel = {
                    id: crypto.randomUUID(),
                    characterId: targetId,
                    currentType: type,
                    currentStatus: status,
                    currentDescription: description,
                    isSecret,
                    history: []
                };

                await dbCreateRelationship(ownerId, newRel as any);

                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        characters: state.activeProject.characters.map(c => {
                            if (c.id === ownerId) {
                                return { ...c, relationships: [...c.relationships, newRel] };
                            }
                            return c;
                        })
                    } : null
                }));
            },
            
            updateRelationshipHistory: async (charId, relId, entry) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 const char = activeProject.characters.find(c => c.id === charId);
                 if (!char) return;
                 
                 const rel = char.relationships.find(r => r.id === relId);
                 if (!rel) return;
                 
                 const fullEntry = { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
                 const updatedRel = { ...rel, history: [...rel.history, fullEntry] };

                 await dbUpdateRelationship(charId, updatedRel as any);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        characters: state.activeProject.characters.map(c => {
                            if (c.id === charId) {
                                return { 
                                    ...c, 
                                    relationships: c.relationships.map(r => r.id === relId ? updatedRel : r)
                                };
                            }
                            return c;
                        })
                    } : null
                }));
            },

            deleteRelationship: async (charId, relId) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 await dbDeleteRelationship(relId);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        characters: state.activeProject.characters.map(c => {
                            if (c.id === charId) {
                                return { 
                                    ...c, 
                                    relationships: c.relationships.filter(r => r.id !== relId)
                                };
                            }
                            return c;
                        })
                    } : null
                }));
            },

            addLocation: async (location) => {
                 const { activeProject } = get();
                 if (!activeProject) return;

                 const newLocation = {
                     ...location,
                     id: crypto.randomUUID(),
                     projectId: activeProject.id,
                     gallery: [],
                     plans: [],
                     connections: []
                 } as Location;

                 await dbCreateLocation(newLocation as any);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: [...state.activeProject.locations, newLocation]
                    } : null
                }));
            },
            
            updateLocation: async (id, updates) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 const current = activeProject.locations.find(l => l.id === id);
                 if (!current) return;
                 
                 const updated = { ...current, ...updates };

                 await dbUpdateLocation(updated as any);

                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: state.activeProject.locations.map(l => l.id === id ? updated : l)
                    } : null
                }));
            },

            deleteLocation: async (id) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 await dbDeleteLocation(id);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: state.activeProject.locations.filter(l => l.id !== id)
                    } : null
                }));
            },
            
            updateLocationPosition: async (id, position) => {
                const { updateLocation } = get();
                await updateLocation(id, { visualPosition: position });
            },

            addLocationImage: async (locationId, type, image) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 const loc = activeProject.locations.find(l => l.id === locationId);
                 if (!loc) return;
                 
                 const newImage = { ...image, id: crypto.randomUUID() };
                 const updates: any = {};

                 // Safe array access
                 const currentList = type === 'gallery' ? (loc.gallery || []) : (loc.plans || []);
                 if (type === 'gallery') updates.gallery = [...currentList, newImage];
                 else updates.plans = [...currentList, newImage];

                 const updated = { ...loc, ...updates };

                 await dbUpdateLocation(updated as any);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: state.activeProject.locations.map(l => l.id === locationId ? updated : l)
                    } : null
                }));
            },
            
            removeLocationImage: async (locationId, type, imageId) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 const loc = activeProject.locations.find(l => l.id === locationId);
                 if (!loc) return;
                 
                 const updates: any = {};
                 if (type === 'gallery') updates.gallery = (loc.gallery || []).filter(i => i.id !== imageId);
                 else updates.plans = (loc.plans || []).filter(i => i.id !== imageId);

                 const updated = { ...loc, ...updates };

                 await dbUpdateLocation(updated as any);

                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: state.activeProject.locations.map(l => l.id === locationId ? updated : l)
                    } : null
                }));
            },

            addLocationConnection: async (locationId, connection) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 const loc = activeProject.locations.find(l => l.id === locationId);
                 if (!loc) return;
                 
                 const newConn = { ...connection, id: crypto.randomUUID() };
                 const updated = { ...loc, connections: [...(loc.connections || []), newConn] };

                 await dbUpdateLocation(updated as any);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: state.activeProject.locations.map(l => l.id === locationId ? updated : l)
                    } : null
                }));
            },
            
            removeLocationConnection: async (locationId, connectionId) => {
                 const { activeProject } = get();
                 if (!activeProject) return;
                 
                 const loc = activeProject.locations.find(l => l.id === locationId);
                 if (!loc) return;
                 
                 const updated = { ...loc, connections: (loc.connections || []).filter(c => c.id !== connectionId) };

                 await dbUpdateLocation(updated as any);
                 
                 set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        locations: state.activeProject.locations.map(l => l.id === locationId ? updated : l)
                    } : null
                }));
            },
            addLoreItem: async (loreItem) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const newLoreItem = {
                    ...loreItem,
                    id: crypto.randomUUID(),
                    projectId: activeProject.id,
                    relatedEntityIds: []
                } as LoreItem;

                await dbCreateLoreItem(newLoreItem as any);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        loreItems: [...(state.activeProject.loreItems || []), newLoreItem],
                    } : null
                }));
            },
            
            updateLoreItem: async (id, updates) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const current = (activeProject.loreItems || []).find(l => l.id === id);
                if (!current) return;
                
                const updated = { ...current, ...updates };

                await dbUpdateLoreItem(updated as any);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        loreItems: (state.activeProject.loreItems || []).map((l) =>
                            l.id === id ? updated : l
                        ),
                    } : null
                }));
            },
            
            deleteLoreItem: async (id) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                await dbDeleteLoreItem(id);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        loreItems: (state.activeProject.loreItems || []).filter((l) => l.id !== id),
                    } : null
                }));
            },
          
            addTimelineEvent: async (event) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const newEvent = {
                    ...event,
                    id: crypto.randomUUID(),
                    projectId: activeProject.id,
                    participants: event.participants || [],
                    tags: event.tags || []
                } as TimelineEvent;

                await dbCreateTimelineEvent(newEvent as any);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        timelineEvents: [...(state.activeProject.timelineEvents || []), newEvent],
                    } : null
                }));
            },
            
            updateTimelineEvent: async (id, updates) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const current = (activeProject.timelineEvents || []).find(e => e.id === id);
                if (!current) return;
                
                const updated = { ...current, ...updates };

                await dbUpdateTimelineEvent(updated as any);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        timelineEvents: (state.activeProject.timelineEvents || []).map((e) =>
                            e.id === id ? updated : e
                        ),
                    } : null
                }));
            },
            
            deleteTimelineEvent: async (id) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                await dbDeleteTimelineEvent(id);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        timelineEvents: (state.activeProject.timelineEvents || []).filter((e) => e.id !== id),
                    } : null
                }));
            },
          
          addScene: async (scene) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const newScene = {
                    ...scene,
                    id: crypto.randomUUID(),
                    characterIds: scene.characterIds || []
                } as Scene;

                await dbCreateScene(newScene as any);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        scenes: [...(state.activeProject.scenes || []), newScene],
                    } : null
                }));
            },
            
            updateScene: async (id, updates) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                const current = (activeProject.scenes || []).find(s => s.id === id);
                if (!current) return;
                
                const updated = { ...current, ...updates };

                await dbUpdateScene(updated as any);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        scenes: (state.activeProject.scenes || []).map((s) =>
                            s.id === id ? updated : s
                        ),
                    } : null
                }));
            },
            
            deleteScene: async (id) => {
                const { activeProject } = get();
                if (!activeProject) return;
                
                await dbDeleteScene(id);
                
                set((state) => ({
                    activeProject: state.activeProject ? {
                        ...state.activeProject,
                        scenes: (state.activeProject.scenes || []).filter((s) => s.id !== id),
                    } : null
                }));
            },

  addApiKey: async (type, provider, keyData) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const apiKeys = { ...activeProject.apiKeys } as ProjectApiKeys;
    if (!apiKeys[type]) apiKeys[type] = {} as any; // Ensure type exists
    if (!apiKeys[type][provider]) apiKeys[type][provider] = [];
    
    const newKey: ApiKeyEntry = {
      id: crypto.randomUUID(),
      name: keyData.name,
      key: keyData.key,
      isDefault: apiKeys[type][provider].length === 0,
    };
    
    apiKeys[type][provider] = [...apiKeys[type][provider], newKey];
    
    const updatedProject = { ...activeProject, apiKeys };
    
    // Persist to DB
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  updateApiKey: async (type, provider, keyId, updates) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const apiKeys = { ...activeProject.apiKeys } as ProjectApiKeys;
    
    apiKeys[type][provider] = apiKeys[type][provider].map(k => 
      k.id === keyId ? { ...k, ...updates } : k
    );
    
    const updatedProject = { ...activeProject, apiKeys };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  deleteApiKey: async (type, provider, keyId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const apiKeys = { ...activeProject.apiKeys } as ProjectApiKeys;
    
    const wasDefault = apiKeys[type][provider].find(k => k.id === keyId)?.isDefault;
    apiKeys[type][provider] = apiKeys[type][provider].filter(k => k.id !== keyId);
    
    if (wasDefault && apiKeys[type][provider].length > 0) {
      apiKeys[type][provider][0].isDefault = true;
    }
    
    const updatedProject = { ...activeProject, apiKeys };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  setDefaultApiKey: async (type, provider, keyId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const apiKeys = { ...activeProject.apiKeys } as ProjectApiKeys;
    
    apiKeys[type][provider] = apiKeys[type][provider].map(k => ({
      ...k,
      isDefault: k.id === keyId
    }));
    
    const updatedProject = { ...activeProject, apiKeys };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  toggleRpgMode: async (enabled) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      isRpgModeEnabled: enabled,
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  setRpgSystem: async (system) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      rpgSystem: system,
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  setContextBanner: async (context, url) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      banners: {
        ...(activeProject.banners || {}),
        [context]: url
      }
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  setProjectType: async (type) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      projectType: type,
      isRpgModeEnabled: type === 'rpg' || type === 'worldbuilding' || activeProject.isRpgModeEnabled,
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  // Creatures (Bestiary)
  addCreature: async (creature) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const newCreature: Creature = {
      ...creature,
      id: crypto.randomUUID(),
      abilities: creature.abilities || [],
      stats: creature.stats || {},
    };
    
    const updatedProject = {
      ...activeProject,
      creatures: [...(activeProject.creatures || []), newCreature],
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  updateCreature: async (id, updates) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      creatures: (activeProject.creatures || []).map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  deleteCreature: async (id) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      creatures: (activeProject.creatures || []).filter((c) => c.id !== id),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  addCreatureAbility: async (creatureId, ability) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      creatures: (activeProject.creatures || []).map((c) => {
        if (c.id !== creatureId) return c;
        const newAbility: CreatureAbility = {
          ...ability,
          id: crypto.randomUUID(),
        };
        return {
          ...c,
          abilities: [...(c.abilities || []), newAbility],
        };
      }),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  removeCreatureAbility: async (creatureId, abilityId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      creatures: (activeProject.creatures || []).map((c) => {
        if (c.id !== creatureId) return c;
        return {
          ...c,
          abilities: (c.abilities || []).filter((a) => a.id !== abilityId),
        };
      }),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  // World Rules
  addWorldRule: async (rule) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const newRule: WorldRule = {
      ...rule,
      id: crypto.randomUUID(),
      examples: rule.examples || [],
    };
    
    const updatedProject = {
      ...activeProject,
      worldRules: [...(activeProject.worldRules || []), newRule],
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  updateWorldRule: async (id, updates) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      worldRules: (activeProject.worldRules || []).map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  deleteWorldRule: async (id) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      worldRules: (activeProject.worldRules || []).filter((r) => r.id !== id),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  addWorldRuleExample: async (ruleId, example) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      worldRules: (activeProject.worldRules || []).map((r) => {
        if (r.id !== ruleId) return r;
        const newExample: WorldRuleExample = {
          ...example,
          id: crypto.randomUUID(),
        };
        return {
          ...r,
          examples: [...(r.examples || []), newExample],
        };
      }),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  removeWorldRuleExample: async (ruleId, exampleId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    
    const updatedProject = {
      ...activeProject,
      worldRules: (activeProject.worldRules || []).map((r) => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          examples: (r.examples || []).filter((e) => e.id !== exampleId),
        };
      }),
    };
    
    await dbUpdateProject(updatedProject as any);
    
    set({ activeProject: updatedProject });
  },

  // NPCs
  addNpc: async (npc) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const newNpc: Npc = {
      ...npc,
      id: crypto.randomUUID(),
      stats: npc.stats || {},
      quests: npc.quests || [],
      dialogues: npc.dialogues || [],
    };
    const updatedProject = {
      ...activeProject,
      npcs: [...(activeProject.npcs || []), newNpc],
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  updateNpc: async (id, updates) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      npcs: (activeProject.npcs || []).map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  deleteNpc: async (id) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      npcs: (activeProject.npcs || []).filter((n) => n.id !== id),
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  addNpcQuest: async (npcId, quest) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      npcs: (activeProject.npcs || []).map((n) => {
        if (n.id !== npcId) return n;
        const newQuest: NpcQuest = { ...quest, id: crypto.randomUUID() };
        return { ...n, quests: [...(n.quests || []), newQuest] };
      }),
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  removeNpcQuest: async (npcId, questId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      npcs: (activeProject.npcs || []).map((n) => {
        if (n.id !== npcId) return n;
        return { ...n, quests: (n.quests || []).filter((q) => q.id !== questId) };
      }),
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  addNpcDialogue: async (npcId, dialogue) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      npcs: (activeProject.npcs || []).map((n) => {
        if (n.id !== npcId) return n;
        const newDialogue: NpcDialogue = { ...dialogue, id: crypto.randomUUID() };
        return { ...n, dialogues: [...(n.dialogues || []), newDialogue] };
      }),
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  removeNpcDialogue: async (npcId, dialogueId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      npcs: (activeProject.npcs || []).map((n) => {
        if (n.id !== npcId) return n;
        return { ...n, dialogues: (n.dialogues || []).filter((d) => d.id !== dialogueId) };
      }),
    };
    await dbUpdateProject(updatedProject as any);
    set({ activeProject: updatedProject });
  },

  // Packages
  applyPackageIdentity: async (packageId) => {
    const { activeProject } = get();
    if (!activeProject) return;

    const updatedProject = {
      ...activeProject,
      activeIdentityPackage: packageId || undefined
    };
    
    await dbUpdateProject(updatedProject as any);

    set({ activeProject: updatedProject });
  },
}));
