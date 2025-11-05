// Store para gestión del proyecto
export default {
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

    // Métodos para personajes
    addCharacter(character) {
        this.characters.push({
            id: crypto.randomUUID(),
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
            this.characters[index] = {
                ...this.characters[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.updateModified();
        }
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
            id: crypto.randomUUID(),
            number,
            title: '',
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
                id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
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

    // Utilidades
    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    updateModified() {
        this.projectInfo.modified = new Date().toISOString();
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
                id: crypto.randomUUID(),
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
    }
};
