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
