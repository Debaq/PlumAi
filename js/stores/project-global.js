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

    // API Keys (guardadas con el proyecto)
    apiKeys: {
        kimi: '',
        claude: '',
        replicate: '',
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
        this.characters.push({
            id: window.uuid.generateUUID(),
            name: '',
            role: 'secondary',
            description: '',
            personality: '',
            background: '',
            relationships: [],
            notes: '',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            ...character
        });
        this.updateModified();
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
        const labels = {
            'amigo': 'amigo',
            'familia': 'familiar',
            'amor': 'pareja',
            'enemigo': 'enemigo',
            'mentor': 'mentor',
            'conocido': 'conocido',
            'colaborador': 'colaborador'
        };
        return labels[type] || type;
    },

    deleteCharacter(id) {
        this.characters = this.characters.filter(c => c.id !== id);
        this.updateModified();
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
        }
    },

    deleteChapter(id) {
        this.chapters = this.chapters.filter(c => c.id !== id);
        this.reorderChapters();
        this.updateModified();
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
    },

    getScene(id) {
        return this.scenes.find(s => s.id === id);
    },

    // Métodos para línea temporal
    addTimelineEvent(event) {
        this.timeline.push({
            id: window.uuid.generateUUID(),
            position: this.timeline.length,
            date: '',
            event: '',
            description: '',
            sceneIds: [],
            chapterIds: [],
            notes: '',
            ...event
        });
        this.sortTimeline();
        this.updateModified();
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
        }
    },

    deleteTimelineEvent(id) {
        this.timeline = this.timeline.filter(t => t.id !== id);
        this.updateModified();
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
            ...location
        });
        this.updateModified();
    },

    updateLocation(id, updates) {
        const index = this.locations.findIndex(l => l.id === id);
        if (index !== -1) {
            this.locations[index] = {
                ...this.locations[index],
                ...updates
            };
            this.updateModified();
        }
    },

    deleteLocation(id) {
        this.locations = this.locations.filter(l => l.id !== id);
        this.updateModified();
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
        }
    },

    deleteLore(id) {
        this.loreEntries = this.loreEntries.filter(l => l.id !== id);
        this.updateModified();
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
                kimi: '',
                claude: '',
                replicate: '',
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
            Object.assign(this, projectData);
            console.log(`✅ Project loaded into store: ${this.projectInfo.title}`);
            return true;
        }
        return false;
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
        this.apiKeys = {
            kimi: '',
            claude: '',
            replicate: '',
            qwen: ''
        };
        this.autoSave();
        return this.projectInfo.id;
    },


};
