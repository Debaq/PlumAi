// Store para gestión del proyecto
window.projectStore = {
    // Información del proyecto
    projectInfo: {
        id: null,
        title: '',
        author: '',
        genre: '',
        created: null,
        modified: null,
        isPublicPC: false
    },

    // Información del fork (si es un fork)
    forkInfo: {
        originalProjectId: null,
        forkedFrom: null,
        forkedAt: null,
        description: ''
    },

    // API Keys (guardadas con el proyecto)
    apiKeys: {
        // APIs pagadas
        claude: '',      // Anthropic Claude
        openai: '',      // OpenAI (ChatGPT)
        google: '',      // Google Gemini
        groq: '',        // Groq (FREE tier generoso)
        together: '',    // Together AI
        replicate: '',   // Replicate

        // APIs gratuitas
        huggingface: '', // HuggingFace

        // Legacy (mantener compatibilidad)
        kimi: '',
        qwen: ''
    },

    // Entidades
    characters: [],
    locations: [],
    chapters: [],
    scenes: [],
    timeline: [],
    notes: [],
    loreEntries: [], // Nuevo: elementos de lore

    // Métodos para personajes
    addCharacter(character) {
        const newCharacter = {
            id: window.uuid.generateUUID(),
            name: '',
            role: 'secondary',
            description: '',
            personality: '',
            background: '',
            relationships: [],
            notes: '',
            avatar: null,  // { style, seed, url, source }

            // Estado vital con historial temporal
            vitalStatusHistory: [
                {
                    status: 'alive',
                    eventId: null,
                    description: 'Personaje creado',
                    timestamp: new Date().toISOString()
                }
            ],
            currentVitalStatus: 'alive',

            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...character
        };

        // Generar avatar por defecto si tiene nombre y no tiene avatar
        if (newCharacter.name && !newCharacter.avatar && window.avatarService) {
            newCharacter.avatar = window.avatarService.generateCharacterAvatar(newCharacter, 'adventurer');
        }

        this.characters.push(newCharacter);
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    // Métodos para estado vital
    updateCharacterVitalStatus(characterId, statusData) {
        const character = this.getCharacter(characterId);
        if (!character) return;

        // Agregar al historial
        const newStatusEntry = {
            status: statusData.status,
            eventId: statusData.eventId || null,
            description: statusData.description || '',
            notes: statusData.notes || '',
            timestamp: new Date().toISOString()
        };

        if (!character.vitalStatusHistory) {
            character.vitalStatusHistory = [];
        }

        character.vitalStatusHistory.push(newStatusEntry);
        character.currentVitalStatus = statusData.status;
        character.modified = new Date().toISOString();

        this.updateModified();
    },

    editCharacterVitalStatusEntry(characterId, historyIndex, updatedData) {
        const character = this.getCharacter(characterId);
        if (!character || !character.vitalStatusHistory || !character.vitalStatusHistory[historyIndex]) return;

        // Actualizar la entrada específica
        character.vitalStatusHistory[historyIndex] = {
            ...character.vitalStatusHistory[historyIndex],
            status: updatedData.status,
            eventId: updatedData.eventId || null,
            description: updatedData.description || '',
            notes: updatedData.notes || ''
        };

        // Si es la última entrada, actualizar el estado actual
        if (historyIndex === character.vitalStatusHistory.length - 1) {
            character.currentVitalStatus = updatedData.status;
        }

        character.modified = new Date().toISOString();
        this.updateModified();
    },

    deleteCharacterVitalStatusEntry(characterId, historyIndex) {
        const character = this.getCharacter(characterId);
        if (!character || !character.vitalStatusHistory || !character.vitalStatusHistory[historyIndex]) return;

        // No permitir eliminar si solo hay una entrada
        if (character.vitalStatusHistory.length === 1) {
            console.error('No se puede eliminar la única entrada del historial vital');
            return;
        }

        // Eliminar la entrada
        character.vitalStatusHistory.splice(historyIndex, 1);

        // Si eliminamos la última entrada, actualizar el estado actual
        if (historyIndex === character.vitalStatusHistory.length) {
            const lastEntry = character.vitalStatusHistory[character.vitalStatusHistory.length - 1];
            character.currentVitalStatus = lastEntry.status;
        }

        character.modified = new Date().toISOString();
        this.updateModified();
    },

    // Obtener información del estado vital
    getVitalStatusInfo(status) {
        const statusInfo = {
            // Vivo/Activo
            'alive': { label: '🟢 Vivo', category: 'alive', color: '#22c55e' },
            'healthy': { label: '💚 Saludable', category: 'alive', color: '#10b981' },
            'injured': { label: '🤕 Herido', category: 'alive', color: '#f59e0b' },
            'sick': { label: '🤒 Enfermo', category: 'alive', color: '#f97316' },
            'recovering': { label: '🩹 Recuperándose', category: 'alive', color: '#84cc16' },
            'imprisoned': { label: '⛓️ Encarcelado', category: 'alive', color: '#64748b' },

            // Nacimiento/Origen
            'born': { label: '👶 Nació', category: 'birth', color: '#ec4899' },
            'created': { label: '⚡ Creado', category: 'birth', color: '#8b5cf6' },
            'appeared': { label: '✨ Apareció', category: 'birth', color: '#a855f7' },
            'awakened': { label: '🌅 Despertó', category: 'birth', color: '#d946ef' },
            'reborn': { label: '♻️ Renacido', category: 'birth', color: '#c026d3' },

            // Muerte
            'dead': { label: '💀 Muerto', category: 'death', color: '#71717a' },
            'killed': { label: '🗡️ Asesinado', category: 'death', color: '#dc2626' },
            'executed': { label: '⚰️ Ejecutado', category: 'death', color: '#991b1b' },
            'sacrificed': { label: '🕯️ Sacrificado', category: 'death', color: '#7f1d1d' },
            'died_natural': { label: '🌙 Muerte Natural', category: 'death', color: '#525252' },
            'died_battle': { label: '⚔️ Muerte en Batalla', category: 'death', color: '#b91c1c' },

            // Desaparición
            'missing': { label: '🔍 Desaparecido', category: 'disappearance', color: '#6366f1' },
            'lost': { label: '🧭 Perdido', category: 'disappearance', color: '#4f46e5' },
            'kidnapped': { label: '😱 Secuestrado', category: 'disappearance', color: '#7c2d12' },
            'exiled': { label: '🚪 Exiliado', category: 'disappearance', color: '#3730a3' },
            'vanished': { label: '👻 Desvanecido', category: 'disappearance', color: '#581c87' },
            'escaped': { label: '🏃 Escapó', category: 'disappearance', color: '#0891b2' },

            // Transformación
            'transformed': { label: '🦋 Transformado', category: 'transformation', color: '#06b6d4' },
            'cursed': { label: '😈 Maldito', category: 'transformation', color: '#7c3aed' },
            'possessed': { label: '👹 Poseído', category: 'transformation', color: '#6d28d9' },
            'corrupted': { label: '🖤 Corrompido', category: 'transformation', color: '#1e1b4b' },
            'ascended': { label: '🌟 Ascendido', category: 'transformation', color: '#fbbf24' },

            // Desconocido
            'unknown': { label: '❓ Desconocido', category: 'unknown', color: '#9ca3af' },
            'presumed_dead': { label: '💭 Presuntamente Muerto', category: 'unknown', color: '#6b7280' },
            'presumed_alive': { label: '🤷 Presuntamente Vivo', category: 'unknown', color: '#9ca3af' }
        };

        return statusInfo[status] || { label: status, category: 'unknown', color: '#9ca3af' };
    },

    // Método para agregar una nueva relación con historial
    addRelationship(characterId, relationshipData) {
        const character = this.getCharacter(characterId);
        if (!character) {
            console.error('Personaje no encontrado');
            return null;
        }

        // Crear la nueva relación con historial
        const newRelationship = {
            id: window.uuid.generateUUID(),
            characterId: relationshipData.characterId,

            // Historial temporal de la relación
            history: [
                {
                    eventId: relationshipData.startEvent || null,
                    type: relationshipData.type,
                    status: relationshipData.currentStatus || 'active',
                    description: relationshipData.description || '',
                    notes: relationshipData.notes || '',
                    timestamp: new Date().toISOString()
                }
            ],

            // Estado actual (el más reciente)
            currentType: relationshipData.type,
            currentStatus: relationshipData.currentStatus || 'active',
            currentDescription: relationshipData.description || '',

            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        // Agregar al array de relaciones
        if (!character.relationships) {
            character.relationships = [];
        }
        character.relationships.push(newRelationship);

        // Crear relación simétrica en el otro personaje
        this.createSymmetricRelationship(characterId, newRelationship);

        this.updateModified();
        return newRelationship;
    },

    // Crear relación simétrica
    createSymmetricRelationship(originCharacterId, relationship) {
        const targetCharacter = this.getCharacter(relationship.characterId);
        if (!targetCharacter) return;

        const originCharacter = this.getCharacter(originCharacterId);
        if (!originCharacter) return;

        // Verificar si ya existe una relación inversa
        const existingRelation = targetCharacter.relationships?.find(
            r => r.characterId === originCharacterId
        );

        if (existingRelation) {
            // Actualizar la relación existente
            this.updateRelationshipHistory(relationship.characterId, existingRelation.id, {
                type: this.getInverseRelationshipType(relationship.currentType),
                status: relationship.currentStatus,
                description: relationship.currentDescription || `${originCharacter.name} es ${this.getRelationshipLabelForType(relationship.currentType)}`,
                eventId: relationship.history[relationship.history.length - 1].eventId
            });
        } else {
            // Crear nueva relación inversa
            const inverseRelationship = {
                id: window.uuid.generateUUID(),
                characterId: originCharacterId,

                history: [
                    {
                        eventId: relationship.history[0].eventId,
                        type: this.getInverseRelationshipType(relationship.currentType),
                        status: relationship.currentStatus,
                        description: relationship.currentDescription || `${originCharacter.name} es ${this.getRelationshipLabelForType(relationship.currentType)}`,
                        notes: '',
                        timestamp: new Date().toISOString()
                    }
                ],

                currentType: this.getInverseRelationshipType(relationship.currentType),
                currentStatus: relationship.currentStatus,
                currentDescription: relationship.currentDescription || `${originCharacter.name} es ${this.getRelationshipLabelForType(relationship.currentType)}`,

                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };

            if (!targetCharacter.relationships) {
                targetCharacter.relationships = [];
            }
            targetCharacter.relationships.push(inverseRelationship);
        }
    },

    // Actualizar historial de una relación (agregar un nuevo cambio)
    updateRelationshipHistory(characterId, relationshipId, changeData) {
        const character = this.getCharacter(characterId);
        if (!character) return;

        const relationship = character.relationships?.find(r => r.id === relationshipId);
        if (!relationship) return;

        // Agregar nuevo entry al historial
        const newHistoryEntry = {
            eventId: changeData.eventId || null,
            type: changeData.type,
            status: changeData.status || 'active',
            description: changeData.description || '',
            notes: changeData.notes || '',
            timestamp: new Date().toISOString()
        };

        relationship.history.push(newHistoryEntry);

        // Actualizar estado actual
        relationship.currentType = changeData.type;
        relationship.currentStatus = changeData.status || 'active';
        relationship.currentDescription = changeData.description || '';
        relationship.modified = new Date().toISOString();

        // Actualizar relación simétrica
        this.updateSymmetricRelationship(characterId, relationship, changeData);

        this.updateModified();
    },

    // Editar una entrada específica del historial
    editRelationshipHistoryEntry(characterId, relationshipId, historyIndex, updatedData) {
        const character = this.getCharacter(characterId);
        if (!character) return;

        const relationship = character.relationships?.find(r => r.id === relationshipId);
        if (!relationship || !relationship.history[historyIndex]) return;

        // Actualizar la entrada específica del historial
        relationship.history[historyIndex] = {
            ...relationship.history[historyIndex],
            eventId: updatedData.eventId || null,
            type: updatedData.type,
            status: updatedData.status || 'active',
            description: updatedData.description || '',
            notes: updatedData.notes || ''
            // timestamp se mantiene el original
        };

        // Si estamos editando la última entrada (la más reciente), actualizar el estado actual
        if (historyIndex === relationship.history.length - 1) {
            relationship.currentType = updatedData.type;
            relationship.currentStatus = updatedData.status || 'active';
            relationship.currentDescription = updatedData.description || '';
        }

        relationship.modified = new Date().toISOString();

        // Actualizar relación simétrica si es la entrada más reciente
        if (historyIndex === relationship.history.length - 1) {
            this.updateSymmetricRelationship(characterId, relationship, updatedData);
        }

        this.updateModified();
    },

    // Eliminar una entrada específica del historial
    deleteRelationshipHistoryEntry(characterId, relationshipId, historyIndex) {
        const character = this.getCharacter(characterId);
        if (!character) return;

        const relationship = character.relationships?.find(r => r.id === relationshipId);
        if (!relationship || !relationship.history[historyIndex]) return;

        // No permitir eliminar si solo hay una entrada
        if (relationship.history.length === 1) {
            console.error('No se puede eliminar la última entrada del historial');
            return;
        }

        // Eliminar la entrada
        relationship.history.splice(historyIndex, 1);

        // Si eliminamos la última entrada, actualizar el estado actual con la nueva última entrada
        if (historyIndex === relationship.history.length) {
            const lastEntry = relationship.history[relationship.history.length - 1];
            relationship.currentType = lastEntry.type;
            relationship.currentStatus = lastEntry.status;
            relationship.currentDescription = lastEntry.description;

            // Actualizar relación simétrica
            this.updateSymmetricRelationship(characterId, relationship, {
                type: lastEntry.type,
                status: lastEntry.status,
                description: lastEntry.description,
                eventId: lastEntry.eventId
            });
        }

        relationship.modified = new Date().toISOString();
        this.updateModified();
    },

    // Actualizar relación simétrica cuando hay un cambio
    updateSymmetricRelationship(originCharacterId, relationship, changeData) {
        const targetCharacter = this.getCharacter(relationship.characterId);
        if (!targetCharacter) return;

        const inverseRelation = targetCharacter.relationships?.find(
            r => r.characterId === originCharacterId
        );

        if (inverseRelation) {
            const inverseType = this.getInverseRelationshipType(changeData.type);

            const newHistoryEntry = {
                eventId: changeData.eventId || null,
                type: inverseType,
                status: changeData.status || 'active',
                description: changeData.description || '',
                notes: '',
                timestamp: new Date().toISOString()
            };

            inverseRelation.history.push(newHistoryEntry);
            inverseRelation.currentType = inverseType;
            inverseRelation.currentStatus = changeData.status || 'active';
            inverseRelation.currentDescription = changeData.description || '';
            inverseRelation.modified = new Date().toISOString();
        }
    },

    // Eliminar una relación
    deleteRelationship(characterId, relationshipId) {
        const character = this.getCharacter(characterId);
        if (!character) return;

        const relationship = character.relationships?.find(r => r.id === relationshipId);
        if (!relationship) return;

        // Eliminar la relación inversa primero
        const targetCharacter = this.getCharacter(relationship.characterId);
        if (targetCharacter) {
            targetCharacter.relationships = targetCharacter.relationships?.filter(
                r => r.characterId !== characterId
            );
        }

        // Eliminar la relación
        character.relationships = character.relationships.filter(r => r.id !== relationshipId);

        this.updateModified();
    },

    // Migrar relaciones antiguas al nuevo formato con historial
    migrateRelationshipToHistory(relationship) {
        // Tipo por defecto si no está definido
        const defaultType = 'friend';

        // Si ya tiene el nuevo formato, verificar que tenga currentType
        if (relationship.history) {
            // Asegurar que currentType esté definido
            if (!relationship.currentType) {
                relationship.currentType = relationship.history[relationship.history.length - 1]?.type || defaultType;
            }
            if (!relationship.currentStatus) {
                relationship.currentStatus = relationship.history[relationship.history.length - 1]?.status || 'active';
            }
            if (!relationship.currentDescription) {
                relationship.currentDescription = relationship.history[relationship.history.length - 1]?.description || '';
            }
            return relationship;
        }

        // Migrar al nuevo formato
        const relType = relationship.type || defaultType;

        return {
            id: relationship.id || window.uuid.generateUUID(),
            characterId: relationship.characterId,

            history: [
                {
                    eventId: relationship.startEvent || null,
                    type: relType,
                    status: relationship.currentStatus || 'active',
                    description: relationship.description || '',
                    notes: relationship.notes || '',
                    timestamp: relationship.created || new Date().toISOString()
                }
            ],

            currentType: relType,
            currentStatus: relationship.currentStatus || 'active',
            currentDescription: relationship.description || '',

            created: relationship.created || new Date().toISOString(),
            modified: relationship.modified || new Date().toISOString()
        };
    },

    updateCharacter(id, updates) {
        const index = this.characters.findIndex(c => c.id === id);
        if (index !== -1) {
            // Actualizar relaciones simétricas
            if (updates.relationships) {
                this.handleSymmetricRelationships(id, updates.relationships);
            }

            this.characters[index] = {
                ...this.characters[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.updateModified();
            this.updateSearchIndex(); // Actualizar índice de búsqueda
        }
    },

    // Método para manejar relaciones simétricas
    handleSymmetricRelationships(characterId, newRelationships) {
        const character = this.getCharacter(characterId);
        if (!character) return;

        // Obtener las relaciones anteriores para comparar
        const oldRelationships = character.relationships || [];

        // Remover relaciones anteriores que ya no existen
        oldRelationships.forEach(oldRel => {
            if (!newRelationships.some(newRel => newRel.characterId === oldRel.characterId)) {
                // Remover la relación inversa
                const relatedCharacter = this.getCharacter(oldRel.characterId);
                if (relatedCharacter) {
                    relatedCharacter.relationships = relatedCharacter.relationships.filter(
                        r => r.characterId !== characterId
                    );
                }
            }
        });

        // Agregar nuevas relaciones
        newRelationships.forEach(newRel => {
            if (!oldRelationships.some(oldRel => oldRel.characterId === newRel.characterId)) {
                // Agregar la relación inversa
                const relatedCharacter = this.getCharacter(newRel.characterId);
                if (relatedCharacter) {
                    // Determinar la relación inversa (puede ser la misma o diferente según el tipo)
                    const inverseType = this.getInverseRelationshipType(newRel.type);
                    const inverseRelationship = {
                        characterId: characterId,
                        type: inverseType,
                        description: newRel.description || `${character.name} es ${this.getRelationshipLabelForType(newRel.type)} de este personaje`
                    };

                    // Asegurar que el array de relaciones existe
                    if (!relatedCharacter.relationships) {
                        relatedCharacter.relationships = [];
                    }

                    // Verificar que la relación inversa no exista ya
                    if (!relatedCharacter.relationships.some(r => r.characterId === characterId)) {
                        relatedCharacter.relationships.push(inverseRelationship);
                    }
                }
            }
        });
    },

    // Método para determinar la relación inversa
    getInverseRelationshipType(type) {
        // Para la mayoría de los tipos, la relación es simétrica
        // En el futuro se podrían tener relaciones asimétricas
        return type;
    },

    // Método para obtener la etiqueta de la relación
    getRelationshipLabelForType(type) {
        // Mapeo para mantener compatibilidad con datos antiguos
        const spanishToEnglishMap = {
            'amigo': 'friend',
            'familia': 'family',
            'amor': 'love',
            'enemigo': 'enemy',
            'mentor': 'mentor',
            'conocido': 'acquaintance',
            'colaborador': 'collaborator'
        };
        
        // Convertir si es una clave en español
        const actualType = spanishToEnglishMap[type] || type;
        
        const labels = {
            'friend': 'amigo',
            'family': 'familia',
            'love': 'pareja',
            'enemy': 'enemigo',
            'mentor': 'mentor',
            'acquaintance': 'conocido',
            'colleague': 'colega',
            'collaborator': 'colaborador',
            'ally': 'aliado',
            'rival': 'rival',
            'boss': 'jefe',
            'subordinate': 'subordinado',
            'teacher': 'profesor',
            'student': 'estudiante',
            'neighbor': 'vecino',
            'partner': 'socio',
            'guardian': 'guardian',
            'ward': 'tutelado',
            'hero': 'heroe',
            'villain': 'villano',
            'sidekick': 'companero',
            'archenemy': 'arquienemigo',
            'businessPartner': 'socio_negocios',
            'ex': 'ex',
            'crush': 'crush',
            'rivalLove': 'rival_amoroso'
        };
        return labels[actualType] || actualType;
    },

    deleteCharacter(id) {
        this.characters = this.characters.filter(c => c.id !== id);
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    getCharacter(id) {
        return this.characters.find(c => c.id === id);
    },

    // Métodos para capítulos
    addChapter(chapter) {
        const number = this.chapters.length + 1;
        this.chapters.push({
            id: window.uuid.generateUUID(),
            number,
            title: '',
            summary: '',
            content: '',
            scenes: [],
            status: 'draft',
            wordCount: 0,
            versions: [],
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...chapter
        });
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    updateChapter(id, updates) {
        const index = this.chapters.findIndex(c => c.id === id);
        if (index !== -1) {
            const chapter = this.chapters[index];

            // Si se actualiza el contenido, recalcular wordCount
            if (updates.content !== undefined) {
                updates.wordCount = this.countWords(updates.content);
            }

            this.chapters[index] = {
                ...chapter,
                ...updates,
                modified: new Date().toISOString()
            };
            this.updateModified();
            this.updateSearchIndex(); // Actualizar índice de búsqueda
        }
    },

    deleteChapter(id) {
        this.chapters = this.chapters.filter(c => c.id !== id);
        this.reorderChapters();
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    reorderChapters() {
        this.chapters.forEach((chapter, index) => {
            chapter.number = index + 1;
        });
    },

    getChapter(id) {
        return this.chapters.find(c => c.id === id);
    },

    // Versiones de capítulos
    addChapterVersion(chapterId, versionData) {
        const chapter = this.getChapter(chapterId);
        if (chapter) {
            const version = {
                id: window.uuid.generateUUID(),
                chapterId,
                versionNumber: (chapter.versions?.length || 0) + 1,
                content: chapter.content,
                changes: [],
                comment: '',
                timestamp: new Date().toISOString(),
                author: 'user',
                ...versionData
            };

            if (!chapter.versions) {
                chapter.versions = [];
            }

            chapter.versions.push(version);
            this.updateModified();
            return version;
        }
        return null;
    },

    // Métodos para escenas
    addScene(scene) {
        this.scenes.push({
            id: window.uuid.generateUUID(),
            title: '',
            chapterId: null,
            description: '',
            characters: [],
            location: null,
            timelinePosition: 0,
            notes: '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...scene
        });
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    updateScene(id, updates) {
        const index = this.scenes.findIndex(s => s.id === id);
        if (index !== -1) {
            this.scenes[index] = {
                ...this.scenes[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.updateModified();
            this.updateSearchIndex(); // Actualizar índice de búsqueda
        }
    },

    deleteScene(id) {
        this.scenes = this.scenes.filter(s => s.id !== id);
        // Remover de capítulos
        this.chapters.forEach(chapter => {
            if (chapter.scenes) {
                chapter.scenes = chapter.scenes.filter(sceneId => sceneId !== id);
            }
        });
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    getScene(id) {
        return this.scenes.find(s => s.id === id);
    },

    // Métodos para línea temporal
    addTimelineEvent(event) {
        this.timeline.push({
            id: window.uuid.generateUUID(),
            position: this.timeline.length,

            // Información básica
            event: '',
            description: '',

            // Modo de fecha
            dateMode: 'absolute', // 'absolute' | 'relative' | 'era'
            date: '', // Para modo absolute

            // Relaciones temporales (para modo relative)
            before: [], // IDs de eventos que pasan después de este
            after: [],  // IDs de eventos que pasaron antes de este

            // Agrupación
            era: '',     // Para modo era: "Era del Caos", "Edad Media"
            chapter: '', // Vinculado a capítulo específico

            // Conexiones
            participants: [], // IDs de personajes
            location: '',     // ID de ubicación
            sceneIds: [],
            chapterIds: [],

            // Impactos
            impacts: [], // { type: 'relationship', id: 'rel-uuid', change: 'friend->enemy' }

            // Metadata
            importance: 'medium', // 'low' | 'medium' | 'high'
            tags: [],
            notes: '',

            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...event
        });
        this.sortTimeline();
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    updateTimelineEvent(id, updates) {
        const index = this.timeline.findIndex(t => t.id === id);
        if (index !== -1) {
            this.timeline[index] = {
                ...this.timeline[index],
                ...updates
            };
            this.sortTimeline();
            this.updateModified();
            this.updateSearchIndex(); // Actualizar índice de búsqueda
        }
    },

    deleteTimelineEvent(id) {
        this.timeline = this.timeline.filter(t => t.id !== id);
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    sortTimeline() {
        this.timeline.sort((a, b) => a.position - b.position);
    },

    // Métodos para notas
    addNote(note) {
        this.notes.push({
            id: window.uuid.generateUUID(),
            title: '',
            content: '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...note
        });
        this.updateModified();
    },

    updateNote(id, updates) {
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notes[index] = {
                ...this.notes[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.updateModified();
        }
    },

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.updateModified();
    },

    // Métodos para ubicaciones
    addLocation(location) {
        this.locations.push({
            id: window.uuid.generateUUID(),
            name: '',
            description: '',
            type: '', // ciudad, bosque, montaña, edificio, etc.
            image: '', // URL de imagen o data URL
            imageType: 'upload', // 'upload' | 'url'
            significance: '', // importancia de la ubicación
            notes: '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...location
        });
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    updateLocation(id, updates) {
        const index = this.locations.findIndex(l => l.id === id);
        if (index !== -1) {
            this.locations[index] = {
                ...this.locations[index],
                ...updates
            };
            this.updateModified();
            this.updateSearchIndex(); // Actualizar índice de búsqueda
        }
    },

    deleteLocation(id) {
        this.locations = this.locations.filter(l => l.id !== id);
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    getLocation(id) {
        return this.locations.find(l => l.id === id);
    },

    // Métodos para elementos de lore
    addLore(lore) {
        this.loreEntries.push({
            id: window.uuid.generateUUID(),
            title: '',
            summary: '',
            content: '',
            category: 'general', // 'world', 'history', 'magic', 'culture', 'religion', 'organization', etc.
            relatedEntities: [], // IDs de personajes, ubicaciones, etc. relacionados
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...lore
        });
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    updateLore(id, updates) {
        const index = this.loreEntries.findIndex(l => l.id === id);
        if (index !== -1) {
            this.loreEntries[index] = {
                ...this.loreEntries[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.updateModified();
            this.updateSearchIndex(); // Actualizar índice de búsqueda
        }
    },

    deleteLore(id) {
        this.loreEntries = this.loreEntries.filter(l => l.id !== id);
        this.updateModified();
        this.updateSearchIndex(); // Actualizar índice de búsqueda
    },

    getLore(id) {
        return this.loreEntries.find(l => l.id === id);
    },

    // Método para contar relaciones
    getRelationsCount() {
        if (!this.characters) return 0;
        return this.characters.reduce((sum, char) => {
            return sum + (char.relationships ? char.relationships.length : 0);
        }, 0);
    },

    // Utilidades
    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    updateModified() {
        this.projectInfo.modified = new Date().toISOString();
        // Auto-guardar después de modificar
        this.autoSave();
    },

    // Auto-guardado
    autoSave() {
        if (this.isProjectInitialized() && window.storageManager) {
            // Debounce para no guardar en cada tecla
            if (this._autoSaveTimeout) {
                clearTimeout(this._autoSaveTimeout);
            }
            this._autoSaveTimeout = setTimeout(async () => {
                try {
                    await window.storageManager.save(this.exportProject());
                } catch (error) {
                    console.error('Error en auto-guardado:', error);
                }
            }, 1000);
        }
    },

    // Estadísticas
    getStats() {
        const totalWords = this.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        const totalChapters = this.chapters.length;
        const totalCharacters = this.characters.length;
        const totalScenes = this.scenes.length;

        const chaptersByStatus = {
            draft: this.chapters.filter(ch => ch.status === 'draft').length,
            review: this.chapters.filter(ch => ch.status === 'review').length,
            final: this.chapters.filter(ch => ch.status === 'final').length
        };

        return {
            totalWords,
            totalChapters,
            totalCharacters,
            totalScenes,
            chaptersByStatus
        };
    },

    // Inicializar proyecto
    initProject(data = null) {
        if (data) {
            // Cargar proyecto existente
            Object.assign(this, data);
        } else {
            // Nuevo proyecto
            this.projectInfo = {
                id: window.uuid.generateUUID(),
                title: '',
                author: '',
                genre: '',
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                isPublicPC: false
            };
            this.apiKeys = {
                claude: '',
                openai: '',
                google: '',
                groq: '',
                together: '',
                replicate: '',
                huggingface: '',
                kimi: '',
                qwen: ''
            };
            this.characters = [];
            this.locations = [];
            this.chapters = [];
            this.scenes = [];
            this.timeline = [];
            this.notes = [];
        }
    },

    // Exportar proyecto completo
    exportProject() {
        return {
            projectInfo: this.projectInfo,
            apiKeys: this.apiKeys,
            characters: this.characters,
            locations: this.locations,
            chapters: this.chapters,
            scenes: this.scenes,
            timeline: this.timeline,
            notes: this.notes
        };
    },

    // Limpiar proyecto
    resetProject() {
        this.initProject();
    },

    // Validar proyecto
    isProjectInitialized() {
        return this.projectInfo.id !== null;
    },

    // Cargar proyecto en el store
    loadProject(projectData) {
        if (projectData) {
            // Migrar datos de versiones antiguas
            this.migrateProjectData(projectData);

            Object.assign(this, projectData);
            console.log(`✅ Project loaded into store: ${this.projectInfo.title}`);
            return true;
        }
        return false;
    },

    // Migrar datos de formatos antiguos a nuevos
    migrateProjectData(projectData) {
        // Migración: lore -> loreEntries
        if (projectData.lore && !projectData.loreEntries) {
            console.log('🔄 Migrando lore a loreEntries');
            projectData.loreEntries = projectData.lore;
            delete projectData.lore;
        }

        // Asegurar que loreEntries existe
        if (!projectData.loreEntries) {
            projectData.loreEntries = [];
        }

        // Migración: Asegurar que todos los arrays existan
        if (!projectData.characters) projectData.characters = [];
        if (!projectData.locations) projectData.locations = [];
        if (!projectData.chapters) projectData.chapters = [];
        if (!projectData.scenes) projectData.scenes = [];
        if (!projectData.timeline) projectData.timeline = [];
        if (!projectData.notes) projectData.notes = [];

        // Migración: Relaciones al nuevo formato con historial
        if (projectData.characters && projectData.characters.length > 0) {
            let migrationNeeded = false;

            projectData.characters.forEach(character => {
                // Migrar relaciones
                if (character.relationships && character.relationships.length > 0) {
                    character.relationships = character.relationships.map(rel => {
                        const migratedRel = this.migrateRelationshipToHistory(rel);
                        if (!rel.history || !rel.currentType) {
                            migrationNeeded = true;
                        }
                        return migratedRel;
                    });
                }

                // Migración: Agregar estado vital si no existe
                if (!character.vitalStatusHistory) {
                    character.vitalStatusHistory = [
                        {
                            status: 'alive',
                            eventId: null,
                            description: 'Personaje creado',
                            timestamp: character.created || new Date().toISOString()
                        }
                    ];
                    character.currentVitalStatus = 'alive';
                    migrationNeeded = true;
                }
            });

            if (migrationNeeded) {
                console.log('🔄 Migración de datos completada - relaciones y estados vitales actualizados');
            }
        }

        return projectData;
    },

    // Guardar proyecto actual manualmente
    async saveProject() {
        if (!window.storageManager) {
            console.error('Storage manager not available');
            return false;
        }

        if (!this.isProjectInitialized()) {
            console.error('No project to save');
            return false;
        }

        const results = await window.storageManager.save(this.exportProject());
        return results.local || results.file || results.indexedDB || results.cloud;
    },

    // Crear nuevo proyecto
    createNewProject(projectInfo) {
        this.resetProject();
        this.projectInfo = {
            id: window.uuid.generateUUID(),
            title: projectInfo.title || '',
            author: projectInfo.author || '',
            genre: projectInfo.genre || '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            isPublicPC: projectInfo.isPublicPC || false
        };
        this.forkInfo = {
            originalProjectId: null,
            forkedFrom: null,
            forkedAt: null,
            description: ''
        };
        this.apiKeys = {
            kimi: '',
            claude: '',
            replicate: '',
            qwen: ''
        };
        this.autoSave();
        return this.projectInfo.id;
    },

    // Crear un fork del proyecto actual
    createFork(forkName, description = '') {
        if (!this.isProjectInitialized()) {
            console.error('❌ No hay proyecto para hacer fork');
            return null;
        }

        // Usar el sistema de control de versiones para crear el fork
        const forkProjectData = window.versionControl.createFork(
            this.projectInfo.id,  // El fork se crea desde el proyecto actual
            forkName,
            description
        );

        // Registrar el fork en el sistema de control de versiones bajo el proyecto original
        const forkInfo = {
            forkProjectId: forkProjectData.projectInfo.id,
            forkName: forkProjectData.projectInfo.title,
            forkedAt: new Date().toISOString(),
            description: description,
            // Mantener referencia al proyecto desde el cual se hizo el fork
            forkedFromProjectId: this.projectInfo.id
        };
        
        // Registrar el fork bajo el proyecto actual (no el original)
        window.versionControl.registerFork(this.projectInfo.id, forkInfo);

        // Inicializar el nuevo proyecto (fork) en el store
        this.loadProject(forkProjectData);

        console.log(`⑂ Fork creado: ${forkProjectData.projectInfo.title} del proyecto ${this.projectInfo.id}`);
        return this.projectInfo.id;
    },

    // Crear un commit del proyecto actual
    createCommit(message = 'Auto-commit', author = 'user') {
        if (!this.isProjectInitialized()) {
            console.error('❌ No hay proyecto para hacer commit');
            return null;
        }

        const projectData = this.exportProject();
        const commitId = window.versionControl.commit(projectData, message, author);
        
        console.log(`✅ Commit creado: ${commitId}`);
        return commitId;
    },

    // Obtener historial de commits
    getCommitHistory() {
        return window.versionControl.getBranchHistory();
    },

    // Cambiar a un estado específico del proyecto desde un commit
    checkoutCommit(commitId) {
        const projectData = window.versionControl.getProjectAtCommit(commitId);
        if (projectData) {
            this.loadProject(projectData);
            console.log(`🔄 Proyecto actualizado al estado del commit: ${commitId}`);
            return true;
        }
        return false;
    },

    // Obtener estadísticas del control de versiones
    getVersionStats() {
        return window.versionControl.getHistoryStats();
    },

    // Actualizar índice de búsqueda de Lunr.js
    updateSearchIndex() {
        if (window.searchService && window.searchService.isInitialized) {
            window.searchService.update({
                characters: this.characters,
                scenes: this.scenes,
                locations: this.locations,
                timeline: this.timeline,
                chapters: this.chapters,
                loreEntries: this.loreEntries
            });
        }
    },


};
