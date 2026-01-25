// src/stores/useProjectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Chapter, Character, Location, Scene, ProjectApiKeys, ApiKeyEntry, VitalStatusEntry, LoreItem, TimelineEvent, RelationshipHistoryEntry, LocationImage, LocationConnection } from '@/types/domain';

interface ProjectState {
  activeProject: Project | null;
  setActiveProject: (project: Project) => void;
  clearActiveProject: () => void;
  
  // Chapters
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  
  // Characters
  addCharacter: (character: Omit<Character, 'id' | 'vitalStatusHistory' | 'currentVitalStatus'>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  updateCharacterVitalStatus: (id: string, status: string, description?: string) => void;
  updateCharacterPosition: (id: string, position: { x: number; y: number }) => void;

  // Relationships
  addRelationship: (ownerId: string, targetId: string, type: string, status: string, description: string, isSecret?: boolean) => void;
  updateRelationshipHistory: (charId: string, relId: string, entry: Omit<RelationshipHistoryEntry, 'id' | 'timestamp'>) => void;
  deleteRelationship: (charId: string, relId: string) => void;

  // Locations
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  updateLocationPosition: (id: string, position: { x: number; y: number }) => void;
  addLocationImage: (locationId: string, type: 'gallery' | 'plans', image: Omit<LocationImage, 'id'>) => void;
  removeLocationImage: (locationId: string, type: 'gallery' | 'plans', imageId: string) => void;
  addLocationConnection: (locationId: string, connection: Omit<LocationConnection, 'id'>) => void;
  removeLocationConnection: (locationId: string, connectionId: string) => void;

  // Lore
  addLoreItem: (loreItem: Omit<LoreItem, 'id'>) => void;
  updateLoreItem: (id: string, updates: Partial<LoreItem>) => void;
  deleteLoreItem: (id: string) => void;

  // Timeline
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;

  // Scenes
  addScene: (scene: Omit<Scene, 'id'>) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  
  // AI API Key Management
  addApiKey: (type: 'text' | 'image', provider: string, keyData: { name: string; key: string }) => void;
  updateApiKey: (type: 'text' | 'image', provider: string, keyId: string, updates: Partial<ApiKeyEntry>) => void;
  deleteApiKey: (type: 'text' | 'image', provider: string, keyId: string) => void;
  setDefaultApiKey: (type: 'text' | 'image', provider: string, keyId: string) => void;
  createNewProject: (projectInfo: { title: string; author?: string; genre?: string }) => void;
  
  // Worldbuilder Mode
  toggleRpgMode: (enabled: boolean) => void;
  setRpgSystem: (system: string) => void;
  setContextBanner: (context: string, url: string) => void;
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

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      setActiveProject: (project) => set({ 
        activeProject: {
          ...project,
          apiKeys: project.apiKeys || initialApiKeys
        } 
      }),
      clearActiveProject: () => set({ activeProject: null }),
      addChapter: (chapter) => set((state) => {
        if (!state.activeProject) return state;
        const newChapter = {
          ...chapter,
          id: crypto.randomUUID(),
        } as Chapter;
        return {
          activeProject: {
            ...state.activeProject,
            chapters: [...state.activeProject.chapters, newChapter],
          },
        };
      }),
      updateChapter: (id, updates) => set((state) => {
        if (!state.activeProject) return state;
        return {
          activeProject: {
            ...state.activeProject,
            chapters: state.activeProject.chapters.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        };
      }),
        deleteChapter: (id) => set((state) => {
          if (!state.activeProject) return state;
          return {
            activeProject: {
              ...state.activeProject,
              chapters: state.activeProject.chapters.filter((c) => c.id !== id),
            },
          };
        }),
      
        addCharacter: (character) => set((state) => {
          if (!state.activeProject) return state;
          const initialStatus: VitalStatusEntry = {
            id: crypto.randomUUID(),
            status: 'alive',
            timestamp: new Date().toISOString(),
            description: 'Initial state'
          };
          const newCharacter: Character = {
            ...character,
            id: crypto.randomUUID(),
            vitalStatusHistory: [initialStatus],
            currentVitalStatus: 'alive'
          } as Character;
          return {
            activeProject: {
              ...state.activeProject,
              characters: [...state.activeProject.characters, newCharacter],
            },
          };
        }),
        updateCharacter: (id, updates) => set((state) => {
          if (!state.activeProject) return state;
          return {
            activeProject: {
              ...state.activeProject,
              characters: state.activeProject.characters.map((c) => {
                if (c.id !== id) return c;
                
                const newCharacter = { ...c, ...updates };
                
                // If attributes changed, record in history
                if (updates.attributes && JSON.stringify(updates.attributes) !== JSON.stringify(c.attributes)) {
                  const historyEntry = {
                    timestamp: new Date().toISOString(),
                    attributes: updates.attributes
                  };
                  newCharacter.attributeHistory = [...(c.attributeHistory || []), historyEntry];
                }
                
                return newCharacter;
              }),
            },
          };
        }),
        deleteCharacter: (id) => set((state) => {
          if (!state.activeProject) return state;
          return {
            activeProject: {
              ...state.activeProject,
              characters: state.activeProject.characters.filter((c) => c.id !== id),
            },
          };
        }),
            updateCharacterVitalStatus: (id, status, description) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  characters: state.activeProject.characters.map((c) => {
                    if (c.id !== id) return c;
                    const newEntry: VitalStatusEntry = {
                      id: crypto.randomUUID(),
                      status,
                      description,
                      timestamp: new Date().toISOString()
                    };
                    return {
                      ...c,
                      currentVitalStatus: status,
                      vitalStatusHistory: [...c.vitalStatusHistory, newEntry]
                    };
                  }),
                },
              };
            }),
          
            updateCharacterPosition: (id, position) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  characters: state.activeProject.characters.map((c) =>
                    c.id === id ? { ...c, visualPosition: position } : c
                  ),
                },
              };
            }),
                        addRelationship: (ownerId, targetId, type, status, description, isSecret = false) => set((state) => {
        
                if (!state.activeProject) return state;
        
                
        
                const relId = crypto.randomUUID();
        
                const timestamp = new Date().toISOString();
        
            
        
                const historyEntry: RelationshipHistoryEntry = {
        
                  id: crypto.randomUUID(),
        
                  type,
        
                  status,
        
                  description,
        
                  timestamp,
        
                  isSecret
        
                };
        
            
        
                return {
        
                  activeProject: {
        
                    ...state.activeProject,
        
                    characters: state.activeProject.characters.map(c => {
        
                      if (c.id === ownerId) {
        
                        return {
        
                          ...c,
        
                          relationships: [...c.relationships, {
        
                            id: relId,
        
                            characterId: targetId,
        
                            currentType: type,
        
                            currentStatus: status,
        
                            currentDescription: description,
        
                            isSecret,
        
                            history: [historyEntry]
        
                          }]
        
                        };
        
                      }
        
                      return c;
        
                    })
        
                  }
        
                };
        
              }),
        
            
        
              updateRelationshipHistory: (charId, relId, entry) => set((state) => {
        
                if (!state.activeProject) return state;
        
                return {
        
                  activeProject: {
        
                    ...state.activeProject,
        
                    characters: state.activeProject.characters.map(c => {
        
                      if (c.id !== charId) return c;
        
                      return {
        
                        ...c,
        
                        relationships: c.relationships.map(r => {
        
                          if (r.id !== relId) return r;
        
                          const newEntry: RelationshipHistoryEntry = {
        
                            ...entry,
        
                            id: crypto.randomUUID(),
        
                            timestamp: new Date().toISOString()
        
                          };
        
                          return {
        
                            ...r,
        
                            currentType: entry.type,
        
                            currentStatus: entry.status,
        
                            currentDescription: entry.description,
        
                            isSecret: entry.isSecret ?? r.isSecret,
        
                            history: [...r.history, newEntry]
        
                          };
        
                        })
        
                      };
        
                    })
        
                  }
        
                };
        
              }),
        
            
        
          deleteRelationship: (charId, relId) => set((state) => {
            if (!state.activeProject) return state;
            // Note: In a true symmetric system, deleting one should delete the other.
            // For now, we delete specifically the requested one.
            return {
              activeProject: {
                ...state.activeProject,
                characters: state.activeProject.characters.map(c => {
                  if (c.id !== charId) return c;
                  return {
                    ...c,
                    relationships: c.relationships.filter(r => r.id !== relId)
                  };
                })
              }
            };
          }),
                addLocation: (location) => set((state) => {
          if (!state.activeProject) return state;
          const newLocation = {
            ...location,
            id: crypto.randomUUID(),
          } as Location;
          return {
            activeProject: {
              ...state.activeProject,
              locations: [...state.activeProject.locations, newLocation],
            },
          };
        }),
        updateLocation: (id, updates) => set((state) => {
          if (!state.activeProject) return state;
          return {
            activeProject: {
              ...state.activeProject,
              locations: state.activeProject.locations.map((l) =>
                l.id === id ? { ...l, ...updates } : l
              ),
            },
          };
        }),
            deleteLocation: (id) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  locations: state.activeProject.locations.filter((l) => l.id !== id),
                },
              };
            }),
            updateLocationPosition: (id, position) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  locations: state.activeProject.locations.map((l) =>
                    l.id === id ? { ...l, visualPosition: position } : l
                  ),
                },
              };
            }),
          
            addLocationImage: (locationId, type, image) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  locations: state.activeProject.locations.map(l => {
                    if (l.id !== locationId) return l;
                    const newList = [...(l[type] || []), { ...image, id: crypto.randomUUID() }];
                    return { ...l, [type]: newList };
                  })
                }
              };
            }),
          
            removeLocationImage: (locationId, type, imageId) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  locations: state.activeProject.locations.map(l => {
                    if (l.id !== locationId) return l;
                    const newList = (l[type] || []).filter((img: any) => img.id !== imageId);
                    return { ...l, [type]: newList };
                  })
                }
              };
            }),
          
              addLocationConnection: (locationId, connection) => set((state) => {
                if (!state.activeProject) return state;
                return {
                  activeProject: {
                    ...state.activeProject,
                    locations: state.activeProject.locations.map(l => {
                      if (l.id !== locationId) return l;
                      const newConnection: LocationConnection = {
                        ...connection,
                        id: crypto.randomUUID()
                      };
                      const newList = [...(l.connections || []), newConnection];
                      return { ...l, connections: newList };
                    })
                  }
                };
              }),
                        removeLocationConnection: (locationId, connectionId) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  locations: state.activeProject.locations.map(l => {
                    if (l.id !== locationId) return l;
                    const newList = (l.connections || []).filter(c => c.id !== connectionId);
                    return { ...l, connections: newList };
                  })
                }
              };
            }),
                    addLoreItem: (loreItem) => set((state) => {
            if (!state.activeProject) return state;
            const newLoreItem: LoreItem = {
              ...loreItem,
              id: crypto.randomUUID(),
            } as LoreItem;
            return {
              activeProject: {
                ...state.activeProject,
                loreItems: [...(state.activeProject.loreItems || []), newLoreItem],
              },
            };
          }),
          updateLoreItem: (id, updates) => set((state) => {
            if (!state.activeProject) return state;
            return {
              activeProject: {
                ...state.activeProject,
                loreItems: (state.activeProject.loreItems || []).map((l) =>
                  l.id === id ? { ...l, ...updates } : l
                ),
              },
            };
          }),
            deleteLoreItem: (id) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  loreItems: (state.activeProject.loreItems || []).filter((l) => l.id !== id),
                },
              };
            }),
          
            addTimelineEvent: (event) => set((state) => {
              if (!state.activeProject) return state;
              const newEvent: TimelineEvent = {
                ...event,
                id: crypto.randomUUID(),
              } as TimelineEvent;
              return {
                activeProject: {
                  ...state.activeProject,
                  timelineEvents: [...(state.activeProject.timelineEvents || []), newEvent],
                },
              };
            }),
            updateTimelineEvent: (id, updates) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  timelineEvents: (state.activeProject.timelineEvents || []).map((e) =>
                    e.id === id ? { ...e, ...updates } : e
                  ),
                },
              };
            }),
            deleteTimelineEvent: (id) => set((state) => {
              if (!state.activeProject) return state;
              return {
                activeProject: {
                  ...state.activeProject,
                  timelineEvents: (state.activeProject.timelineEvents || []).filter((e) => e.id !== id),
                },
              };
            }),
          
          addScene: (scene) => set((state) => {
    if (!state.activeProject) return state;
    const newScene = {
      ...scene,
      id: crypto.randomUUID(),
    } as Scene;
    return {
      activeProject: {
        ...state.activeProject,
        scenes: [...(state.activeProject.scenes || []), newScene],
      },
    };
  }),
  updateScene: (id, updates) => set((state) => {
    if (!state.activeProject) return state;
    return {
      activeProject: {
        ...state.activeProject,
        scenes: (state.activeProject.scenes || []).map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    };
  }),
  deleteScene: (id) => set((state) => {
    if (!state.activeProject) return state;
    return {
      activeProject: {
        ...state.activeProject,
        scenes: (state.activeProject.scenes || []).filter((s) => s.id !== id),
      },
    };
  }),

  addApiKey: (type, provider, keyData) => set((state) => {
    if (!state.activeProject) return state;
    const apiKeys = { ...state.activeProject.apiKeys } as ProjectApiKeys;
    if (!apiKeys[type][provider]) apiKeys[type][provider] = [];
    
    const newKey: ApiKeyEntry = {
      id: crypto.randomUUID(),
      name: keyData.name,
      key: keyData.key,
      isDefault: apiKeys[type][provider].length === 0,
    };
    
    apiKeys[type][provider] = [...apiKeys[type][provider], newKey];
    
    return {
      activeProject: { ...state.activeProject, apiKeys }
    };
  }),

  updateApiKey: (type, provider, keyId, updates) => set((state) => {
    if (!state.activeProject) return state;
    const apiKeys = { ...state.activeProject.apiKeys } as ProjectApiKeys;
    
    apiKeys[type][provider] = apiKeys[type][provider].map(k => 
      k.id === keyId ? { ...k, ...updates } : k
    );
    
    return {
      activeProject: { ...state.activeProject, apiKeys }
    };
  }),

  deleteApiKey: (type, provider, keyId) => set((state) => {
    if (!state.activeProject) return state;
    const apiKeys = { ...state.activeProject.apiKeys } as ProjectApiKeys;
    
    const wasDefault = apiKeys[type][provider].find(k => k.id === keyId)?.isDefault;
    apiKeys[type][provider] = apiKeys[type][provider].filter(k => k.id !== keyId);
    
    if (wasDefault && apiKeys[type][provider].length > 0) {
      apiKeys[type][provider][0].isDefault = true;
    }
    
    return {
      activeProject: { ...state.activeProject, apiKeys }
    };
  }),

  setDefaultApiKey: (type, provider, keyId) => set((state) => {
    if (!state.activeProject) return state;
    const apiKeys = { ...state.activeProject.apiKeys } as ProjectApiKeys;
    
    apiKeys[type][provider] = apiKeys[type][provider].map(k => ({
      ...k,
      isDefault: k.id === keyId
    }));
    
    return {
      activeProject: { ...state.activeProject, apiKeys }
    };
  }),

  createNewProject: (info) => set(() => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: info.title,
      author: info.author || '',
      genre: info.genre || '',
      chapters: [],
      characters: [],
      locations: [],
      loreItems: [],
      timelineEvents: [],
      scenes: [],
      apiKeys: initialApiKeys
    };
    return { activeProject: newProject };
  }),

  toggleRpgMode: (enabled) => set((state) => {
    if (!state.activeProject) return state;
    return {
      activeProject: {
        ...state.activeProject,
        isRpgModeEnabled: enabled,
      },
    };
  }),

  setRpgSystem: (system) => set((state) => {
    if (!state.activeProject) return state;
    return {
      activeProject: {
        ...state.activeProject,
        rpgSystem: system,
      },
    };
  }),

  setContextBanner: (context, url) => set((state) => {
    if (!state.activeProject) return state;
    return {
      activeProject: {
        ...state.activeProject,
        banners: {
          ...(state.activeProject.banners || {}),
          [context]: url
        }
      }
    };
  }),
    }),
    {
      name: 'pluma-project',
    }
  )
);
