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
        enableAI: config.enableAI !== false, // Default true
        onSave: config.onSave || null,
        onChange: config.onChange || null,

        // Estado de IA
        showAIMenu: false,
        isAIProcessing: false,
        aiResponse: null,
        showAIResponse: false,

        /**
         * Inicializar el editor
         */
        init() {
            this.$nextTick(() => {
                this.createEditor();
                if (this.enableAI) {
                    this.injectAIToolbar();
                }
            });
        },

        /**
         * Crear instancia del RichEditor
         */
        createEditor() {
            const container = this.$refs.editorContainer;
            if (!container || !window.RichEditor) {
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
                        // Aquí podrías abrir un modal para seleccionar ubicación
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
        },

        // ============================================
        // MÉTODOS DE IA
        // ============================================

        /**
         * Inyectar toolbar de IA en el editor
         */
        async injectAIToolbar() {
            const container = this.$refs.editorContainer;
            if (!container) return;

            try {
                // Cargar template de AI toolbar
                const response = await fetch('templates/components/ai-toolbar.html?v=' + Date.now());
                const html = await response.text();

                // Crear wrapper relativo para posicionar el botón
                const wrapper = container.querySelector('.rich-editor-content');
                if (wrapper) {
                    wrapper.style.position = 'relative';
                }

                // Crear contenedor para el toolbar
                const toolbarContainer = document.createElement('div');
                toolbarContainer.innerHTML = html;

                // Insertar en el container
                container.appendChild(toolbarContainer);

                // Reinitializar Alpine para el nuevo contenido
                if (window.Alpine) {
                    window.Alpine.initTree(toolbarContainer);
                }

                // Reinitializar iconos
                setTimeout(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 100);

            } catch (error) {
                console.error('Error inyectando AI toolbar:', error);
            }
        },

        /**
         * Obtener texto seleccionado del editor
         */
        getSelectedText() {
            if (!this.editor || !this.editor.editor) return '';

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                return selection.toString();
            }
            return '';
        },

        /**
         * Insertar texto en el cursor
         */
        insertTextAtCursor(text) {
            if (!this.editor || !this.editor.editor) return;

            this.editor.insertText(text);
        },

        /**
         * Reemplazar texto seleccionado
         */
        replaceSelectedText(text) {
            if (!this.editor || !this.editor.editor) return;

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));

                // Actualizar contenido
                if (this.onChange) {
                    this.onChange(this.getContent());
                }
            }
        },

        /**
         * Ejecutar acción de IA
         */
        async executeAIAction(mode, customPrompt = null) {
            if (!window.aiService) {
                alert('❌ El servicio de IA no está disponible');
                return;
            }

            const selectedText = this.getSelectedText();
            const fullContent = this.getContent();

            // Construir prompt según el modo
            let userPrompt = customPrompt;
            if (!customPrompt) {
                const prompts = {
                    'continue': selectedText
                        ? `Continúa este texto:\n\n${selectedText}`
                        : 'Continúa el texto desde donde terminé',
                    'improve': selectedText
                        ? `Mejora este texto:\n\n${selectedText}`
                        : 'Mejora el texto completo',
                    'dialogue': selectedText
                        ? `Mejora este diálogo:\n\n${selectedText}`
                        : 'Mejora los diálogos en este texto',
                    'suggest': '¿Qué ideas tienes para continuar desde aquí?',
                    'analyze': selectedText
                        ? `Analiza este texto:\n\n${selectedText}`
                        : 'Analiza el texto completo'
                };

                userPrompt = prompts[mode] || prompts['continue'];
            }

            this.isAIProcessing = true;
            this.showAIMenu = false;

            try {
                // Obtener capítulo activo si existe
                const chapterId = this.$store.project?.activeChapterId || null;

                // Verificar si el modo agéntico está activado
                const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
                const useAgenticMode = settings.useAgenticContext !== false; // Por defecto activado

                // Enviar request a IA (agéntico o tradicional)
                let response;
                if (useAgenticMode && window.agenticContextService) {
                    console.log('🤖 Usando modo agéntico: IA decide qué contexto necesita');
                    response = await window.aiService.sendAgenticRequest(
                        mode,
                        userPrompt,
                        chapterId,
                        selectedText
                    );
                } else {
                    console.log('📦 Usando modo tradicional: Enviando todo el contexto');
                    response = await window.aiService.sendRequest(
                        mode,
                        userPrompt,
                        chapterId,
                        selectedText
                    );
                }

                console.log('📥 AI Response:', response);

                // Guardar respuesta
                this.aiResponse = response;
                this.showAIResponse = true;

            } catch (error) {
                console.error('❌ AI Error:', error);
                alert(`Error de IA: ${error.message}`);
            } finally {
                this.isAIProcessing = false;
            }
        },

        /**
         * Insertar respuesta de IA en el editor
         */
        insertAIResponse() {
            if (!this.aiResponse) return;

            const text = this.aiResponse.content || this.aiResponse.prompt;

            // Si hay texto seleccionado, reemplazarlo
            if (this.getSelectedText()) {
                this.replaceSelectedText('\n\n' + text);
            } else {
                // Sino, insertar al final
                this.setContent(this.getContent() + '\n\n' + text);
            }

            this.closeAIResponse();
        },

        /**
         * Copiar respuesta al portapapeles
         */
        copyAIResponse() {
            if (!this.aiResponse) return;

            const text = this.aiResponse.content || this.aiResponse.prompt;
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Respuesta copiada al portapapeles');
            });
        },

        /**
         * Cerrar modal de respuesta de IA
         */
        closeAIResponse() {
            this.showAIResponse = false;
            this.aiResponse = null;
        }
    };
};
