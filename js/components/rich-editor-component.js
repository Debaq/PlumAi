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
                    this.injectAIButton();
                }
            });
        },

        /**
         * Inyectar botón fijo de IA en la esquina del editor
         */
        injectAIButton() {
            const container = this.$refs.editorContainer;
            if (!container) return;

            // Crear wrapper para botón y menú
            const aiWrapper = document.createElement('div');
            aiWrapper.className = 'ai-button-wrapper';
            aiWrapper.style.cssText = `
                position: absolute;
                bottom: 12px;
                right: 12px;
                z-index: 100;
            `;

            // Crear botón flotante fijo
            const aiButton = document.createElement('button');
            aiButton.className = 'ai-fixed-button';
            aiButton.innerHTML = `<i data-lucide="sparkles" width="20" height="20"></i>`;
            aiButton.title = 'Asistente IA';
            aiButton.style.cssText = `
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 2px solid var(--border-color);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.2s ease;
            `;

            // Hover effect
            aiButton.onmouseenter = () => {
                aiButton.style.transform = 'scale(1.1)';
                aiButton.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
            };
            aiButton.onmouseleave = () => {
                aiButton.style.transform = 'scale(1)';
                aiButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            };

            // Crear menú flotante
            const aiMenu = document.createElement('div');
            aiMenu.className = 'ai-floating-menu';
            aiMenu.style.cssText = `
                display: none;
                position: absolute;
                bottom: 60px;
                right: 0;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                padding: 8px;
                min-width: 220px;
                z-index: 1000;
            `;

            aiMenu.innerHTML = `
                <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 4px;">
                    <strong style="font-size: 13px; color: var(--text-primary);">✨ Asistente IA</strong>
                </div>
                <button class="ai-menu-item" data-mode="continue" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-size: 13px;">
                    <span>✍️</span>
                    <span>Continuar escribiendo</span>
                </button>
                <button class="ai-menu-item" data-mode="improve" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-size: 13px;">
                    <span>✨</span>
                    <span>Mejorar texto</span>
                </button>
                <button class="ai-menu-item" data-mode="dialogue" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-size: 13px;">
                    <span>💬</span>
                    <span>Mejorar diálogos</span>
                </button>
                <button class="ai-menu-item" data-mode="analyze" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-size: 13px;">
                    <span>🔍</span>
                    <span>Analizar texto</span>
                </button>
            `;

            // Hover effect para items del menú
            const menuItems = aiMenu.querySelectorAll('.ai-menu-item');
            menuItems.forEach(item => {
                item.onmouseenter = () => {
                    item.style.background = 'var(--bg-tertiary)';
                };
                item.onmouseleave = () => {
                    item.style.background = 'transparent';
                };
                item.onclick = (e) => {
                    const mode = e.currentTarget.dataset.mode;
                    this.executeAIAction(mode);
                    this.showAIMenu = false;
                    aiMenu.style.display = 'none';
                };
            });

            // Click handler del botón
            aiButton.onclick = (e) => {
                e.preventDefault();
                this.showAIMenu = !this.showAIMenu;
                aiMenu.style.display = this.showAIMenu ? 'block' : 'none';
            };

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!aiWrapper.contains(e.target)) {
                    this.showAIMenu = false;
                    aiMenu.style.display = 'none';
                }
            });

            // Ensamblar
            aiWrapper.appendChild(aiButton);
            aiWrapper.appendChild(aiMenu);

            // Asegurar que el container sea relativo
            container.style.position = 'relative';

            // Insertar wrapper
            container.appendChild(aiWrapper);

            // Inicializar iconos
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 100);
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
         * Toggle del menú de IA
         */
        toggleAIMenu() {
            this.showAIMenu = !this.showAIMenu;
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
