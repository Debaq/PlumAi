/**
 * RichEditor Component para Alpine.js
 * Componente reutilizable que integra RichEditor con Alpine
 *
 * Uso:
 * <div x-data="richEditorComponent({
 *     initialContent: 'texto inicial',
 *     onSave: (content) => { ... }
 * })">
 *     <div x-ref="editorContainer"></div>
 * </div>
 */

window.richEditorComponent = function(config = {}) {
    return {
        // Estado
        content: config.initialContent || '',
        wordCount: 0,
        editor: null,

        // Configuración
        placeholder: config.placeholder || 'Escribe aquí...',
        readOnly: config.readOnly || false,
        enableMentions: config.enableMentions !== false, // Default true
        enableCommands: config.enableCommands !== false, // Default true
        onSave: config.onSave || null,
        onChange: config.onChange || null,

        /**
         * Inicializar el editor
         */
        init() {
            this.$nextTick(() => {
                this.createEditor();
            });
        },

        /**
         * Crear instancia del RichEditor
         */
        createEditor() {
            const container = this.$refs.editorContainer;
            if (!container || !window.RichEditor) {
                console.error('RichEditor: Container o librería no disponible');
                return;
            }

            // Preparar datos para menciones (personajes)
            const mentionData = this.enableMentions ? this.getMentionData() : [];

            // Preparar comandos
            const commandData = this.enableCommands ? this.getCommandData() : [];

            // Crear editor
            this.editor = new RichEditor({
                element: container,
                placeholder: this.placeholder,
                readOnly: this.readOnly,
                initialContent: this.content,
                mentionData: mentionData,
                commandData: commandData,

                // @ para personajes
                searchFunction: this.enableMentions ? this.searchCharacters.bind(this) : null,

                // # para ubicaciones
                searchLocations: this.enableMentions ? this.searchLocations.bind(this) : null,

                // ! para lore
                searchLore: this.enableMentions ? this.searchLore.bind(this) : null,

                // Callback para preview de lore
                onLorePreview: this.enableMentions ? this.handleLorePreview.bind(this) : null,

                onContentChange: (content) => {
                    this.content = content;
                    this.wordCount = this.countWords(content);

                    // Callback externo
                    if (this.onChange) {
                        this.onChange(content);
                    }
                },
                onSave: (content) => {
                    if (this.onSave) {
                        this.onSave(content);
                    }
                }
            });
        },

        /**
         * Obtener datos para menciones desde el store
         */
        getMentionData() {
            if (!this.$store || !this.$store.project) {
                return [];
            }

            // Convertir personajes al formato del editor
            return this.$store.project.characters.map(char => ({
                id: char.id,
                label: char.name,
                name: char.name,
                description: char.role ? this.$store.i18n.t(`characters.form.roles.${char.role}`) : '',
                content: `${char.name} ${char.description || ''} ${char.personality || ''}`
            }));
        },

        /**
         * Obtener comandos personalizados
         */
        getCommandData() {
            const commands = [];

            // Comando para insertar escena
            if (this.$store && this.$store.project && this.$store.project.scenes.length > 0) {
                commands.push({
                    id: 'insert-scene',
                    label: '/escena',
                    description: this.$store.i18n.t('scenes.title') || 'Insertar escena',
                    icon: '🎬',
                    action: () => {
                        // Aquí podrías abrir un modal para seleccionar escena
                        console.log('Seleccionar escena...');
                    }
                });
            }

            // Comando para insertar ubicación
            if (this.$store && this.$store.project && this.$store.project.locations.length > 0) {
                commands.push({
                    id: 'insert-location',
                    label: '/ubicacion',
                    description: this.$store.i18n.t('locations.title') || 'Insertar ubicación',
                    icon: '📍',
                    action: () => {
                        console.log('Seleccionar ubicación...');
                    }
                });
            }

            return commands;
        },

        /**
         * Buscar personajes usando SearchService
         */
        searchCharacters(query) {
            if (!window.searchService || !window.searchService.isReady()) {
                // Fallback si no hay SearchService
                return this.getMentionData().slice(0, 5);
            }

            try {
                const results = window.searchService.searchCharacters(query, 5);
                return results.map(item => ({
                    id: item.data.id,
                    label: item.data.name,
                    name: item.data.name,
                    description: item.data.role ? this.$store.i18n.t(`characters.form.roles.${item.data.role}`) : item.data.description,
                    icon: item.icon
                }));
            } catch (e) {
                console.error('Error buscando personajes:', e);
                return this.getMentionData().slice(0, 5);
            }
        },

        /**
         * Buscar ubicaciones usando SearchService
         */
        searchLocations(query) {
            if (!window.searchService || !window.searchService.isReady()) {
                return [];
            }

            try {
                const results = window.searchService.searchLocations(query, 5);
                return results.map(item => ({
                    id: item.data.id,
                    label: item.data.name,
                    name: item.data.name,
                    description: item.data.description || '',
                    icon: item.icon
                }));
            } catch (e) {
                console.error('Error buscando ubicaciones:', e);
                return [];
            }
        },

        /**
         * Buscar lore usando SearchService
         */
        searchLore(query) {
            if (!window.searchService || !window.searchService.isReady()) {
                return [];
            }

            try {
                const results = window.searchService.searchLore(query, 5);
                return results.map(item => ({
                    id: item.data.id,
                    label: item.data.title,
                    title: item.data.title,
                    description: item.data.summary || '',
                    category: item.data.category,
                    content: item.data.content,
                    icon: item.icon,
                    data: item.data
                }));
            } catch (e) {
                console.error('Error buscando lore:', e);
                return [];
            }
        },

        /**
         * Manejar preview de lore (!)
         */
        handleLorePreview(item) {
            if (!this.$store || !this.$store.ui) {
                console.warn('Store UI no disponible');
                return;
            }

            // Abrir modal con información de lore
            this.$store.ui.openModal('lorePreview', {
                id: item.id || item.data?.id,
                title: item.label || item.title,
                summary: item.description,
                content: item.content || item.data?.content,
                category: item.category || item.data?.category
            });
        },

        /**
         * Contar palabras
         */
        countWords(text) {
            if (!text || text.trim() === '') return 0;
            return text.trim().split(/\s+/).length;
        },

        /**
         * Métodos públicos para controlar el editor
         */
        getContent() {
            return this.editor ? this.editor.getContent() : this.content;
        },

        setContent(content) {
            this.content = content;
            if (this.editor) {
                this.editor.setContent(content);
            }
        },

        focus() {
            if (this.editor) {
                this.editor.focus();
            }
        },

        /**
         * Actualizar datos de menciones (cuando se agregan personajes)
         */
        updateMentionData() {
            if (this.editor && this.enableMentions) {
                const mentionData = this.getMentionData();
                this.editor.setMentionData(mentionData);
            }
        },

        /**
         * Destruir editor al desmontar componente
         */
        destroy() {
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }
        }
    };
};
