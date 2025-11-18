// AI Assistant View Component
window.aiAssistantView = function() {
    return {
        // State
        selectedProvider: null,
        selectedModel: null,
        selectedMode: 'continue',
        userInput: '',
        messages: [],
        isProcessing: false,
        showContext: false,
        providersStatus: [],

        // Computed
        get isConfigured() {
            const provider = window.aiService.providers[this.selectedProvider];
            if (!provider) return false;
            if (provider.type === 'manual' || !provider.requiresApiKey) return true;
            return !!window.aiService.getApiKey(this.selectedProvider);
        },

        get availableModels() {
            const provider = window.aiService.providers[this.selectedProvider];
            return provider ? provider.models : [];
        },

        get assistantModes() {
            return Object.values(window.aiService.assistantModes);
        },

        get currentModeDescription() {
            const mode = window.aiService.assistantModes[this.selectedMode];
            return mode ? mode.systemPrompt : '';
        },

        get currentProviderInfo() {
            return this.providersStatus.find(p => p.id === this.selectedProvider);
        },

        get contextInfo() {
            const project = this.$store.project;
            return {
                projectTitle: project.projectInfo.title || 'Sin título',
                genre: project.projectInfo.genre,
                charactersCount: project.characters.length,
                locationsCount: project.locations.length,
                scenesCount: project.scenes.length,
                loreCount: project.loreEntries.length,
                chaptersCount: project.chapters.length,
                totalWords: project.getStats().totalWords
            };
        },

        // Lifecycle
        init() {
            console.log('🤖 AI Assistant View initialized');
            this.loadProvidersStatus();
            this.loadSavedSettings();
            this.loadMessages();
        },

        // Methods
        loadProvidersStatus() {
            this.providersStatus = window.aiService.getProvidersStatus();
            console.log('📊 Providers status:', this.providersStatus);
        },

        loadSavedSettings() {
            const savedProvider = localStorage.getItem('pluma_ai_provider') || 'manual';
            const savedModel = localStorage.getItem('pluma_ai_model');

            this.selectedProvider = savedProvider;

            if (window.aiService.providers[savedProvider]) {
                window.aiService.setProvider(savedProvider, savedModel);
                this.selectedModel = window.aiService.currentModel;
            }
        },

        onProviderChange() {
            window.aiService.setProvider(this.selectedProvider);
            this.selectedModel = window.aiService.currentModel;
            this.loadProvidersStatus();
        },

        async sendMessage() {
            if (!this.userInput.trim() || this.isProcessing) return;

            const userMessage = this.userInput.trim();
            this.userInput = '';

            // Add user message
            this.addMessage('user', userMessage, {
                mode: this.selectedMode
            });

            // Start processing
            this.isProcessing = true;

            try {
                // Get current chapter ID if available
                const chapterId = this.$store.project.activeChapterId;

                // Verificar si el modo agéntico está activado
                const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
                const useAgenticMode = settings.useAgenticContext !== false; // Por defecto activado

                let response;

                if (useAgenticMode && window.agenticContextService) {
                    // MODO AGÉNTICO CONVERSACIONAL: Envía todo el historial
                    console.log('🤖 Usando modo agéntico conversacional con historial de', this.messages.length, 'mensajes');

                    response = await window.aiService.sendAgenticConversation(
                        this.selectedMode,
                        this.messages, // ✅ Envía todo el historial
                        chapterId
                    );
                } else {
                    // MODO TRADICIONAL: Solo último mensaje
                    console.log('📦 Usando modo tradicional (sin historial)');

                    response = await window.aiService.sendRequest(
                        this.selectedMode,
                        userMessage,
                        chapterId,
                        null
                    );
                }

                console.log('📥 AI Response:', response);

                // Handle manual mode
                if (response.type === 'manual') {
                    this.addMessage('assistant', `**Prompt generado:**\n\n${response.prompt}\n\n${response.instructions}`, {
                        provider: 'manual',
                        model: 'copy-paste'
                    });
                } else {
                    // Handle API response
                    this.addMessage('assistant', response.content, {
                        provider: response.provider,
                        model: response.model
                    });
                }

            } catch (error) {
                console.error('❌ AI Error:', error);
                this.addMessage('assistant', `**Error:** ${error.message}\n\nPor favor verifica tu configuración de API key en Ajustes.`, {
                    provider: 'error',
                    model: 'error'
                });
            } finally {
                this.isProcessing = false;
                this.scrollToBottom();
            }
        },

        addMessage(role, content, metadata = {}) {
            const message = {
                id: window.uuid.generateUUID(),
                role,
                content,
                timestamp: new Date().toISOString(),
                metadata
            };

            this.messages.push(message);
            this.saveMessages();

            this.$nextTick(() => {
                this.scrollToBottom();
                lucide.createIcons();
            });
        },

        quickAction(mode) {
            this.selectedMode = mode;

            const prompts = {
                'suggest': '¿Qué ideas tienes para desarrollar la trama desde este punto? Dame varias opciones creativas.',
                'analyze': 'Analiza la estructura narrativa de mi historia hasta ahora. ¿Qué funciona bien y qué podría mejorar?',
                'worldbuild': '¿Qué aspectos del worldbuilding debería expandir o profundizar? Dame sugerencias específicas.',
                'characterize': 'Ayúdame a desarrollar más profundidad en mis personajes. ¿Qué motivaciones o conflictos internos podría explorar?',
                'dialogue': 'Dame consejos sobre cómo mejorar los diálogos en mi historia. ¿Qué técnicas puedo usar?',
                'continue': 'Basándote en lo que he escrito, ¿qué escenas o momentos clave deberían venir a continuación?'
            };

            this.userInput = prompts[mode] || '';
        },

        clearChat() {
            if (confirm('¿Estás seguro de que quieres limpiar el chat? Esta acción no se puede deshacer.')) {
                this.messages = [];
                this.saveMessages();
            }
        },

        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Respuesta copiada al portapapeles');
            });
        },

        insertIntoEditor(text) {
            const chapterId = this.$store.project.activeChapterId;
            if (!chapterId) {
                alert('⚠️ Por favor abre un capítulo primero');
                return;
            }

            const chapter = this.$store.project.getChapter(chapterId);
            if (chapter) {
                chapter.content += '\n\n' + text;
                this.$store.project.updateChapter(chapterId, chapter);
                alert('✅ Texto insertado en el capítulo actual');
            }
        },

        formatMarkdown(text) {
            // Simple markdown formatting
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        },

        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        },

        getModeIcon(mode) {
            const modeObj = window.aiService.assistantModes[mode];
            return modeObj ? modeObj.icon : '🤖';
        },

        getModeName(mode) {
            const modeObj = window.aiService.assistantModes[mode];
            return modeObj ? modeObj.name : mode;
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },

        // Persistence
        saveMessages() {
            localStorage.setItem('pluma_ai_messages', JSON.stringify(this.messages));
        },

        loadMessages() {
            try {
                const saved = localStorage.getItem('pluma_ai_messages');
                if (saved) {
                    this.messages = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Error loading messages:', e);
            }
        }
    };
};
