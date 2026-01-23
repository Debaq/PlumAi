// Project Store - Global state for project data
import { StorageService } from '../services/storage.js';
import { v4 as uuidv4 } from 'https://cdn.jsdelivr.net/npm/uuid@9/+esm';

const storage = new StorageService();

export const projectStore = {
    // Project Info
    id: null,
    title: 'Sin título',
    author: '',
    genre: '',
    created: null,
    modified: null,
    isPublicPC: false,
    lastSaved: 'Nunca guardado',

    // API Keys
    apiKeys: {
        claude: '',
        kimi: '',
        replicate: '',
        qwen: ''
    },

    // Content
    characters: [],
    scenes: [],
    chapters: [],
    timeline: [],
    notes: [],
    locations: [],

    // Stats
    wordCount: 0,

    // Methods
    init() {
        this.id = uuidv4();
        this.created = new Date().toISOString();
        this.modified = new Date().toISOString();
    },

    loadFromStorage() {
        const savedProject = storage.loadProject();
        if (savedProject) {
            Object.assign(this, savedProject);
            this.updateLastSaved();
            return true;
        }
        return false;
    },

    async save() {
        this.modified = new Date().toISOString();
        
        if (!this.isPublicPC) {
            await storage.saveProject(this.toJSON());
            this.updateLastSaved();
        }
    },

    async export() {
        const data = this.toJSON();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.title || 'proyecto'}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    async import(file) {
        const text = await file.text();
        const data = JSON.parse(text);
        Object.assign(this, data);
        await this.save();
    },

    toJSON() {
        return {
            projectInfo: {
                id: this.id,
                title: this.title,
                author: this.author,
                genre: this.genre,
                created: this.created,
                modified: this.modified,
                isPublicPC: this.isPublicPC
            },
            apiKeys: this.apiKeys,
            characters: this.characters,
            scenes: this.scenes,
            chapters: this.chapters,
            timeline: this.timeline,
            notes: this.notes,
            locations: this.locations
        };
    },

    // Characters
    addCharacter(character) {
        character.id = uuidv4();
        character.created = new Date().toISOString();
        character.modified = new Date().toISOString();
        this.characters.push(character);
        this.save();
    },

    updateCharacter(id, updates) {
        const index = this.characters.findIndex(c => c.id === id);
        if (index !== -1) {
            this.characters[index] = {
                ...this.characters[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.save();
        }
    },

    deleteCharacter(id) {
        this.characters = this.characters.filter(c => c.id !== id);
        this.save();
    },

    // Scenes
    addScene(scene) {
        scene.id = uuidv4();
        scene.created = new Date().toISOString();
        scene.modified = new Date().toISOString();
        this.scenes.push(scene);
        this.save();
    },

    updateScene(id, updates) {
        const index = this.scenes.findIndex(s => s.id === id);
        if (index !== -1) {
            this.scenes[index] = {
                ...this.scenes[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.save();
        }
    },

    deleteScene(id) {
        this.scenes = this.scenes.filter(s => s.id !== id);
        this.save();
    },

    // Chapters
    addChapter(chapter) {
        chapter.id = uuidv4();
        chapter.number = this.chapters.length + 1;
        chapter.created = new Date().toISOString();
        chapter.modified = new Date().toISOString();
        chapter.versions = [];
        chapter.wordCount = 0;
        chapter.status = 'draft';
        this.chapters.push(chapter);
        this.save();
    },

    updateChapter(id, updates) {
        const index = this.chapters.findIndex(c => c.id === id);
        if (index !== -1) {
            this.chapters[index] = {
                ...this.chapters[index],
                ...updates,
                modified: new Date().toISOString()
            };
            this.calculateWordCount();
            this.save();
        }
    },

    deleteChapter(id) {
        this.chapters = this.chapters.filter(c => c.id !== id);
        this.renumberChapters();
        this.save();
    },

    renumberChapters() {
        this.chapters.forEach((chapter, index) => {
            chapter.number = index + 1;
        });
    },

    // Utilities
    calculateWordCount() {
        this.wordCount = this.chapters.reduce((total, chapter) => {
            return total + (chapter.wordCount || 0);
        }, 0);
    },

    updateLastSaved() {
        if (this.modified) {
            const date = new Date(this.modified);
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) {
                this.lastSaved = 'Guardado hace un momento';
            } else if (minutes < 60) {
                this.lastSaved = `Guardado hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
            } else {
                this.lastSaved = `Guardado ${date.toLocaleString()}`;
            }
        }
    }
};