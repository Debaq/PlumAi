// Store para estado de IA
window.aiStore = {
    // Configuración
    activeModel: 'claude', // 'claude' | 'kimi' | 'replicate' | 'qwen'
    temperature: 0.7,
    maxTokens: 4096,

    // Modo de trabajo
    mode: 'write', // 'write' (IA escribe) | 'assist' (IA asiste)

    // Estado
    isActive: false,
    isProcessing: false,
    currentChapterId: null,

    // Historial de conversación (por capítulo)
    history: [],

    // Contexto para la IA
    context: {
        characters: [],
        scenes: [],
        timeline: [],
        previousChapters: []
    },

    // Modelos disponibles
    availableModels: [
        { id: 'claude', name: 'Claude (Anthropic)', enabled: false },
        { id: 'kimi', name: 'Kimi (Moonshot)', enabled: false },
        { id: 'replicate', name: 'Replicate', enabled: false },
        { id: 'qwen', name: 'Qwen (Alibaba)', enabled: false }
    ],

    // Métodos para API Keys
    hasApiKey(provider = null) {
        // Obtener las keys del store project
        const projectStore = Alpine.store('project');
        if (!projectStore || !projectStore.apiKeys) return false;

        if (provider) {
            return projectStore.apiKeys[provider] && projectStore.apiKeys[provider].length > 0;
        }

        // Verificar si al menos una key está configurada
        return Object.values(projectStore.apiKeys).some(key => key && key.length > 0);
    },

    updateApiKeysStatus() {
        // Actualizar estado de modelos disponibles
        this.availableModels.forEach(model => {
            model.enabled = this.hasApiKey(model.id);
        });

        // Verificar si el modelo activo tiene key
        this.checkActiveStatus();
    },

    // Métodos para modelo activo
    setActiveModel(model) {
        if (this.hasApiKey(model)) {
            this.activeModel = model;
            this.checkActiveStatus();
        }
    },

    checkActiveStatus() {
        this.isActive = this.hasApiKey(this.activeModel);
    },

    getActiveModelName() {
        const model = this.availableModels.find(m => m.id === this.activeModel);
        return model ? model.name : this.activeModel;
    },

    // Métodos para modo
    setMode(mode) {
        this.mode = mode;
    },

    isWriteMode() {
        return this.mode === 'write';
    },

    isAssistMode() {
        return this.mode === 'assist';
    },

    // Métodos para historial
    addMessage(role, content, metadata = {}) {
        this.history.push({
            id: window.uuid.generateUUID(),
            role, // 'user' | 'assistant'
            content,
            timestamp: new Date().toISOString(),
            chapterId: this.currentChapterId,
            metadata
        });
    },

    clearHistory() {
        this.history = [];
    },

    getHistory(chapterId = null) {
        if (chapterId) {
            return this.history.filter(msg => msg.chapterId === chapterId);
        }
        return this.history;
    },

    getRecentHistory(limit = 10) {
        return this.history.slice(-limit);
    },

    // Métodos para contexto
    updateContext(projectStore, chapterId = null) {
        // Obtener personajes
        this.context.characters = projectStore.characters.map(char => ({
            name: char.name,
            role: char.role,
            description: char.description,
            personality: char.personality
        }));

        // Obtener escenas relevantes
        if (chapterId) {
            const chapter = projectStore.getChapter(chapterId);
            if (chapter && chapter.scenes) {
                this.context.scenes = chapter.scenes.map(sceneId => {
                    const scene = projectStore.getScene(sceneId);
                    return scene ? {
                        title: scene.title,
                        description: scene.description,
                        characters: scene.characters
                    } : null;
                }).filter(s => s !== null);
            }
        } else {
            this.context.scenes = [];
        }

        // Obtener línea temporal
        this.context.timeline = projectStore.timeline.slice(0, 10).map(event => ({
            date: event.date,
            event: event.event
        }));

        // Obtener capítulos anteriores (resumen)
        if (chapterId) {
            const chapter = projectStore.getChapter(chapterId);
            if (chapter) {
                const chapterNumber = chapter.number;
                this.context.previousChapters = projectStore.chapters
                    .filter(ch => ch.number < chapterNumber)
                    .slice(-3) // Solo últimos 3 capítulos
                    .map(ch => ({
                        number: ch.number,
                        title: ch.title,
                        summary: ch.content ? ch.content.substring(0, 500) + '...' : ''
                    }));
            }
        } else {
            this.context.previousChapters = [];
        }

        this.currentChapterId = chapterId;
    },

    // Generar prompt con contexto
    buildContextPrompt(projectStore, userPrompt) {
        let prompt = '';

        // Información del proyecto
        prompt += `CONTEXTO DEL PROYECTO:\n`;
        prompt += `Título: ${projectStore.projectInfo.title || 'Sin título'}\n`;
        if (projectStore.projectInfo.genre) {
            prompt += `Género: ${projectStore.projectInfo.genre}\n`;
        }
        prompt += `\n`;

        // Personajes
        if (this.context.characters.length > 0) {
            prompt += `PERSONAJES:\n`;
            this.context.characters.forEach(char => {
                prompt += `- ${char.name} (${char.role})`;
                if (char.description) {
                    prompt += `: ${char.description}`;
                }
                prompt += `\n`;
                if (char.personality) {
                    prompt += `  Personalidad: ${char.personality}\n`;
                }
            });
            prompt += `\n`;
        }

        // Escenas relevantes
        if (this.context.scenes.length > 0) {
            prompt += `ESCENAS DEL CAPÍTULO:\n`;
            this.context.scenes.forEach(scene => {
                prompt += `- ${scene.title}`;
                if (scene.description) {
                    prompt += `: ${scene.description}`;
                }
                prompt += `\n`;
            });
            prompt += `\n`;
        }

        // Línea temporal
        if (this.context.timeline.length > 0) {
            prompt += `LÍNEA TEMPORAL:\n`;
            this.context.timeline.forEach(event => {
                prompt += `- ${event.date}: ${event.event}\n`;
            });
            prompt += `\n`;
        }

        // Capítulos anteriores
        if (this.context.previousChapters.length > 0) {
            prompt += `CAPÍTULOS ANTERIORES:\n`;
            this.context.previousChapters.forEach(ch => {
                prompt += `Capítulo ${ch.number}: ${ch.title}\n`;
                if (ch.summary) {
                    prompt += `${ch.summary}\n`;
                }
                prompt += `\n`;
            });
        }

        // Capítulo actual
        if (this.currentChapterId) {
            const chapter = projectStore.getChapter(this.currentChapterId);
            if (chapter) {
                prompt += `CAPÍTULO ACTUAL:\n`;
                prompt += `Capítulo ${chapter.number}`;
                if (chapter.title) {
                    prompt += `: ${chapter.title}`;
                }
                prompt += `\n\n`;
            }
        }

        // Instrucción del usuario
        prompt += `INSTRUCCIÓN:\n${userPrompt}`;

        return prompt;
    },

    // Métodos para procesamiento
    startProcessing() {
        this.isProcessing = true;
    },

    stopProcessing() {
        this.isProcessing = false;
    },

    // Configuración
    updateSettings(settings) {
        if (settings.temperature !== undefined) {
            this.temperature = settings.temperature;
        }
        if (settings.maxTokens !== undefined) {
            this.maxTokens = settings.maxTokens;
        }
        if (settings.activeModel !== undefined) {
            this.setActiveModel(settings.activeModel);
        }
    },

    getSettings() {
        return {
            activeModel: this.activeModel,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            mode: this.mode
        };
    },

    // Reset
    reset() {
        this.isProcessing = false;
        this.currentChapterId = null;
        this.history = [];
        this.context = {
            characters: [],
            scenes: [],
            timeline: [],
            previousChapters: []
        };
    },

    // Inicialización
    init() {
        // Cargar configuración guardada
        const savedSettings = localStorage.getItem('pluma_ai_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.updateSettings(settings);
            } catch (e) {
                console.error('Error loading AI settings:', e);
            }
        }
    },

    // Guardar configuración
    saveSettings() {
        const settings = this.getSettings();
        localStorage.setItem('pluma_ai_settings', JSON.stringify(settings));
    }
};
