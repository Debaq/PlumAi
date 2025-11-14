/**
 * Editor Component para Alpine.js con RichEditor y SearchService
 * Integración completa con búsqueda unificada
 */

window.editorAlpineComponent = function() {
    return {
        // Estado del editor
        editor: null,
        editorReady: false,
        wordCount: 0,
        charCount: 0,
        saveStatus: 'saved', // 'saved' | 'saving' | 'unsaved'

        // Obtener capítulo actual
        get currentChapter() {
            const chapterId = this.$store.ui.currentEditingChapterId;
            return this.$store.project.getChapter(chapterId);
        },

        /**
         * Inicializar el editor
         */
        init() {
            // Esperar a que el elemento esté en el DOM
            this.$nextTick(() => {
                this.initializeEditor();
            });

            // Nota: La inicialización y actualización del SearchService
            // ahora se maneja globalmente en app.js con Alpine.effect()
            // para evitar duplicación y mejorar el rendimiento
        },

        /**
         * Inicializar RichEditor
         */
        initializeEditor() {
            const editorElement = this.$el.querySelector('.rich-editor-wrapper');

            if (!editorElement) {
                return;
            }

            if (!window.RichEditor) {
                return;
            }

            // Crear el editor con integración completa
            this.editor = new window.RichEditor({
                element: editorElement,
                placeholder: this.$store.i18n.t('editor.placeholder') || 'Escribe tu historia... Usa @ para mencionar personajes, # para ubicaciones, ! para lore, o / para comandos',
                initialContent: this.currentChapter?.content || '',

                // @ Usar SearchService para personajes
                searchFunction: (query) => {
                    if (!window.searchService || !window.searchService.isReady()) {
                        return [];
                    }
                    const results = window.searchService.searchCharacters(query, 10);
                    return results.map(item => ({
                        id: item.data.id,
                        label: item.data.name,
                        name: item.data.name,
                        description: item.data.role || item.data.description,
                        icon: item.icon
                    }));
                },

                // # Búsqueda de ubicaciones
                searchLocations: (query) => {
                    if (!window.searchService || !window.searchService.isReady()) {
                        return [];
                    }
                    const results = window.searchService.searchLocations(query, 10);
                    return results.map(item => ({
                        id: item.data.id,
                        label: item.data.name,
                        name: item.data.name,
                        description: item.data.description || '',
                        icon: item.icon
                    }));
                },

                // ! Búsqueda de lore
                searchLore: (query) => {
                    if (!window.searchService || !window.searchService.isReady()) {
                        return [];
                    }
                    const results = window.searchService.searchLore(query, 10);
                    return results.map(item => ({
                        id: item.data.id,
                        label: item.data.title,
                        title: item.data.title,
                        description: item.data.summary || '',
                        content: item.data.content,
                        category: item.data.category,
                        icon: item.icon,
                        data: item.data
                    }));
                },

                // Callback para preview de lore (!)
                onLorePreview: (item) => {
                    this.$store.ui.openModal('lorePreview', {
                        id: item.id || item.data?.id,
                        title: item.label || item.title,
                        summary: item.description,
                        content: item.content || item.data?.content,
                        category: item.category || item.data?.category
                    });
                },

                // Datos de menciones (fallback si no hay SearchService)
                mentionData: this.getAllMentionData(),

                // Comandos personalizados
                commandData: this.getCommands(),

                // Callback cuando cambia el contenido
                onContentChange: (content) => {
                    this.handleContentChange(content);
                }
            });

            this.editorReady = true;
        },

        /**
         * Obtener todos los datos para menciones (fallback)
         */
        getAllMentionData() {
            const data = [];

            // Personajes
            this.$store.project.characters.forEach(char => {
                data.push({
                    id: `char-${char.id}`,
                    type: 'character',
                    label: char.name,
                    description: char.role || char.description || '',
                    icon: '👤'
                });
            });

            // Escenas
            this.$store.project.scenes.forEach(scene => {
                data.push({
                    id: `scene-${scene.id}`,
                    type: 'scene',
                    label: scene.title,
                    description: scene.description || '',
                    icon: '🎬'
                });
            });

            // Ubicaciones
            this.$store.project.locations.forEach(loc => {
                data.push({
                    id: `loc-${loc.id}`,
                    type: 'location',
                    label: loc.name,
                    description: loc.description || '',
                    icon: '📍'
                });
            });

            return data;
        },

        /**
         * Obtener comandos del editor
         */
        getCommands() {
            const isEnglish = this.$store.i18n.currentLocale === 'en';

            return [
                {
                    id: 'characters',
                    label: isEnglish ? '/characters' : '/personajes',
                    description: isEnglish ? 'View characters' : 'Ver personajes',
                    icon: '👥',
                    action: () => this.openCharacterSelector()
                },
                {
                    id: 'scenes',
                    label: isEnglish ? '/scenes' : '/escenas',
                    description: isEnglish ? 'View scenes' : 'Ver escenas',
                    icon: '🎬',
                    action: () => this.openSceneSelector()
                },
                {
                    id: 'locations',
                    label: isEnglish ? '/locations' : '/ubicaciones',
                    description: isEnglish ? 'View locations' : 'Ver ubicaciones',
                    icon: '📍',
                    action: () => this.openLocationSelector()
                },
                {
                    id: 'idea',
                    label: isEnglish ? '/idea' : '/idea',
                    description: isEnglish ? 'Mark an idea' : 'Marcar una idea',
                    icon: '💡',
                    template: '💡 IDEA: '
                },
                {
                    id: 'dialogue',
                    label: isEnglish ? '/dialogue' : '/dialogo',
                    description: isEnglish ? 'Dialogue format' : 'Formato de diálogo',
                    icon: '💬',
                    template: '— '
                },
                {
                    id: 'divider',
                    label: isEnglish ? '/divider' : '/separador',
                    description: isEnglish ? 'Scene divider' : 'Separador de escena',
                    icon: '—',
                    template: '\n\n***\n\n'
                },
                {
                    id: 'comment',
                    label: isEnglish ? '/comment' : '/comentario',
                    description: isEnglish ? 'Add comment' : 'Agregar comentario',
                    icon: '📝',
                    action: () => this.openCommentDialog()
                },
                {
                    id: 'ai-continue',
                    label: isEnglish ? '/ai-continue' : '/ia-continuar',
                    description: isEnglish ? 'Continue with AI' : 'Continuar con IA',
                    icon: '✨',
                    action: () => this.aiContinue()
                }
            ];
        },

        /**
         * Manejar cambio de contenido
         */
        handleContentChange(content) {
            // Actualizar stats
            this.charCount = content.length;
            this.wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

            // Marcar como no guardado
            this.saveStatus = 'unsaved';

            // Auto-guardar con debounce
            this.autoSave();
        },

        /**
         * Auto-guardar con debounce
         */
        autoSave() {
            // Cancelar timeout anterior
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            // Esperar 1 segundo antes de guardar
            this.saveTimeout = setTimeout(() => {
                this.save();
            }, 1000);
        },

        /**
         * Guardar contenido
         */
        save() {
            if (!this.editor || !this.currentChapter) return;

            this.saveStatus = 'saving';

            const content = this.editor.getContent();

            // Guardar en el store
            this.$store.project.updateChapter(this.currentChapter.id, {
                content: content,
                wordCount: this.wordCount
            });

            // Simular guardado (en el futuro será localStorage/IndexedDB)
            setTimeout(() => {
                this.saveStatus = 'saved';
            }, 300);
        },

        /**
         * Guardar manualmente
         */
        saveManually() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            this.save();
        },

        /**
         * Abrir selector de personajes
         */
        openCharacterSelector() {
            // Buscar personajes con SearchService
            const results = window.searchService?.searchCharacters('') || this.$store.project.characters;

            this.$store.ui.info(
                this.$store.i18n.t('characters.title'),
                `${results.length} personajes disponibles`
            );
        },

        /**
         * Abrir selector de escenas
         */
        openSceneSelector() {
            const results = window.searchService?.searchScenes('') || this.$store.project.scenes;
            this.$store.ui.info(
                this.$store.i18n.t('scenes.title'),
                `${results.length} escenas disponibles`
            );
        },

        /**
         * Abrir selector de ubicaciones
         */
        openLocationSelector() {
            const results = window.searchService?.searchLocations('') || this.$store.project.locations;
            this.$store.ui.info(
                this.$store.i18n.t('locations.title'),
                `${results.length} ubicaciones disponibles`
            );
        },

        /**
         * Abrir diálogo de comentarios
         */
        openCommentDialog(selectedText) {
            if (selectedText) {
                this.$store.ui.info(
                    this.$store.i18n.t('editor.comment') || 'Comentario',
                    `Agregar comentario a: "${selectedText.substring(0, 50)}..."`
                );
            } else {
                this.$store.ui.info(
                    this.$store.i18n.t('editor.comment') || 'Comentario',
                    'Funcionalidad en desarrollo'
                );
            }
        },

        /**
         * Continuar con IA
         */
        aiContinue(selectedText) {
            if (selectedText) {
                this.$store.ui.info(
                    this.$store.i18n.t('ai.continue') || 'IA',
                    `Procesando texto seleccionado: "${selectedText.substring(0, 50)}..." - Funcionalidad en desarrollo`
                );
            } else {
                this.$store.ui.info(
                    this.$store.i18n.t('ai.continue') || 'Continuar con IA',
                    'Funcionalidad en desarrollo'
                );
            }
        },

        /**
         * Destruir el editor
         */
        destroy() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }

            this.editorReady = false;
        }
    };
};
