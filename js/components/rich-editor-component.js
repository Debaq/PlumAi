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
                    this.injectAIResponseModal();
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

            // Crear botón flotante fijo (estilo marca de agua, discreto)
            const aiButton = document.createElement('button');
            aiButton.className = 'ai-fixed-button';
            aiButton.innerHTML = `<i data-lucide="sparkles" width="14" height="14"></i>`;
            aiButton.title = 'Asistente IA';
            aiButton.style.cssText = `
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(102, 126, 234, 0.08);
                border: 1px solid rgba(102, 126, 234, 0.15);
                color: rgba(102, 126, 234, 0.5);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: none;
                transition: all 0.2s ease;
                opacity: 0.4;
            `;

            // Hover effect sutil
            aiButton.onmouseenter = () => {
                aiButton.style.opacity = '1';
                aiButton.style.background = 'rgba(102, 126, 234, 0.12)';
                aiButton.style.color = 'rgba(102, 126, 234, 0.8)';
                aiButton.style.borderColor = 'rgba(102, 126, 234, 0.25)';
            };
            aiButton.onmouseleave = () => {
                aiButton.style.opacity = '0.4';
                aiButton.style.background = 'rgba(102, 126, 234, 0.08)';
                aiButton.style.color = 'rgba(102, 126, 234, 0.5)';
                aiButton.style.borderColor = 'rgba(102, 126, 234, 0.15)';
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
         * Inyectar modal de respuesta de IA
         * Usa un modal global compartido por todas las instancias
         */
        injectAIResponseModal() {
            console.log('🔧 Inicializando modal de respuesta de IA...');

            // Verificar si ya existe un modal global
            let modalOverlay = document.querySelector('.ai-response-modal-overlay');

            if (modalOverlay) {
                console.log('♻️ Modal global ya existe, reutilizando y configurando watchers');
                // Ya existe, solo configurar watchers para esta instancia
                this.setupAIModalWatchers();
                return;
            }

            console.log('🆕 Creando nuevo modal global de respuesta de IA');
            // Crear overlay del modal (solo una vez globalmente)
            modalOverlay = document.createElement('div');
            modalOverlay.className = 'ai-response-modal-overlay';
            modalOverlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 9999;
                backdrop-filter: blur(4px);
            `;

            // Crear modal
            const modal = document.createElement('div');
            modal.className = 'ai-response-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                box-shadow: 0 16px 48px rgba(0,0,0,0.3);
                width: 90%;
                max-width: 700px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                z-index: 10000;
            `;

            modal.innerHTML = `
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                        <i data-lucide="sparkles" width="20" height="20" style="color: var(--accent);"></i>
                        Respuesta de IA
                    </h3>
                    <button class="ai-modal-close-btn" style="width: 32px; height: 32px; border-radius: 50%; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.2s;" title="Cerrar">
                        <i data-lucide="x" width="20" height="20"></i>
                    </button>
                </div>

                <div class="ai-response-content" style="flex: 1; overflow-y: auto; padding: 24px;">
                    <div class="ai-response-metadata" style="margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; font-size: 12px; color: var(--text-secondary);">
                        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            <span><strong>Proveedor:</strong> <span class="ai-provider"></span></span>
                            <span><strong>Modelo:</strong> <span class="ai-model"></span></span>
                            <span><strong>Tipo:</strong> <span class="ai-type"></span></span>
                        </div>
                    </div>
                    <div class="ai-response-text" style="white-space: pre-wrap; line-height: 1.6; color: var(--text-primary); font-size: 14px; padding: 16px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color);"></div>
                </div>

                <div style="padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; gap: 12px; justify-content: flex-end; background: var(--bg-tertiary);">
                    <button class="ai-modal-copy-btn" style="padding: 10px 20px; border-radius: 8px; background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                        <i data-lucide="copy" width="16" height="16"></i>
                        Copiar
                    </button>
                    <button class="ai-modal-insert-btn" style="padding: 10px 20px; border-radius: 8px; background: var(--primary-color); border: none; color: white; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                        <i data-lucide="file-plus" width="16" height="16"></i>
                        Insertar en editor
                    </button>
                </div>
            `;

            // Event handlers
            const closeBtn = modal.querySelector('.ai-modal-close-btn');
            const copyBtn = modal.querySelector('.ai-modal-copy-btn');
            const insertBtn = modal.querySelector('.ai-modal-insert-btn');

            // Hover effects
            closeBtn.onmouseenter = () => {
                closeBtn.style.background = 'var(--bg-tertiary)';
                closeBtn.style.color = 'var(--text-primary)';
            };
            closeBtn.onmouseleave = () => {
                closeBtn.style.background = 'transparent';
                closeBtn.style.color = 'var(--text-secondary)';
            };

            copyBtn.onmouseenter = () => {
                copyBtn.style.background = 'var(--bg-secondary)';
                copyBtn.style.borderColor = 'var(--primary-color)';
            };
            copyBtn.onmouseleave = () => {
                copyBtn.style.background = 'transparent';
                copyBtn.style.borderColor = 'var(--border-color)';
            };

            insertBtn.onmouseenter = () => {
                insertBtn.style.opacity = '0.9';
                insertBtn.style.transform = 'scale(1.02)';
            };
            insertBtn.onmouseleave = () => {
                insertBtn.style.opacity = '1';
                insertBtn.style.transform = 'scale(1)';
            };

            // Ensamblar
            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);
            console.log('✅ Modal de respuesta de IA agregado al DOM');

            // Configurar listeners globales del modal (solo una vez)
            this.setupGlobalAIModalHandlers(modalOverlay);

            // Configurar watchers para esta instancia
            this.setupAIModalWatchers();
            console.log('🎉 Modal de respuesta de IA completamente inicializado');
        },

        /**
         * Configurar event handlers globales del modal (solo una vez)
         */
        setupGlobalAIModalHandlers(modalOverlay) {
            const modal = modalOverlay.querySelector('.ai-response-modal');
            const closeBtn = modal.querySelector('.ai-modal-close-btn');
            const copyBtn = modal.querySelector('.ai-modal-copy-btn');
            const insertBtn = modal.querySelector('.ai-modal-insert-btn');

            // Guardar referencia a la instancia activa en el modal
            if (!window.activeAIEditorInstance) {
                window.activeAIEditorInstance = null;
            }

            // Hover effects
            closeBtn.onmouseenter = () => {
                closeBtn.style.background = 'var(--bg-tertiary)';
                closeBtn.style.color = 'var(--text-primary)';
            };
            closeBtn.onmouseleave = () => {
                closeBtn.style.background = 'transparent';
                closeBtn.style.color = 'var(--text-secondary)';
            };

            copyBtn.onmouseenter = () => {
                copyBtn.style.background = 'var(--bg-secondary)';
                copyBtn.style.borderColor = 'var(--primary-color)';
            };
            copyBtn.onmouseleave = () => {
                copyBtn.style.background = 'transparent';
                copyBtn.style.borderColor = 'var(--border-color)';
            };

            insertBtn.onmouseenter = () => {
                insertBtn.style.opacity = '0.9';
                insertBtn.style.transform = 'scale(1.02)';
            };
            insertBtn.onmouseleave = () => {
                insertBtn.style.opacity = '1';
                insertBtn.style.transform = 'scale(1)';
            };

            // Close handlers - usan la instancia activa
            closeBtn.onclick = () => {
                if (window.activeAIEditorInstance) {
                    window.activeAIEditorInstance.closeAIResponse();
                }
            };
            modalOverlay.onclick = (e) => {
                if (e.target === modalOverlay && window.activeAIEditorInstance) {
                    window.activeAIEditorInstance.closeAIResponse();
                }
            };

            // Action handlers - usan la instancia activa
            copyBtn.onclick = () => {
                if (window.activeAIEditorInstance) {
                    window.activeAIEditorInstance.copyAIResponse();
                }
            };
            insertBtn.onclick = () => {
                if (window.activeAIEditorInstance) {
                    window.activeAIEditorInstance.insertAIResponse();
                }
            };

            // ESC key para cerrar (solo un listener global)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && window.activeAIEditorInstance && window.activeAIEditorInstance.showAIResponse) {
                    window.activeAIEditorInstance.closeAIResponse();
                }
            });
        },

        /**
         * Configurar watchers para mostrar/ocultar el modal de esta instancia
         */
        setupAIModalWatchers() {
            console.log('⚙️ Configurando watchers del modal de IA para esta instancia');
            const modalOverlay = document.querySelector('.ai-response-modal-overlay');

            if (!modalOverlay) {
                console.error('❌ ERROR: No se encontró el modal overlay al configurar watchers');
                return;
            }

            const modal = modalOverlay.querySelector('.ai-response-modal');

            if (!modal) {
                console.error('❌ ERROR: No se encontró el modal al configurar watchers');
                return;
            }

            console.log('✅ Modal encontrado, configurando watcher de showAIResponse');

            // Watch para mostrar/ocultar el modal
            this.$watch('showAIResponse', (value) => {
                if (value && this.aiResponse) {
                    console.log('👁️ Mostrando modal de respuesta de IA');
                    // Establecer esta instancia como la activa
                    window.activeAIEditorInstance = this;

                    // Actualizar contenido del modal
                    const textEl = modal.querySelector('.ai-response-text');
                    const providerEl = modal.querySelector('.ai-provider');
                    const modelEl = modal.querySelector('.ai-model');
                    const typeEl = modal.querySelector('.ai-type');

                    textEl.textContent = this.aiResponse.content || this.aiResponse.prompt || '';
                    providerEl.textContent = this.aiResponse.provider || 'N/A';
                    modelEl.textContent = this.aiResponse.model || 'N/A';
                    typeEl.textContent = this.aiResponse.type || 'N/A';

                    // Mostrar modal
                    modalOverlay.style.display = 'block';
                    console.log('✨ Modal de respuesta de IA visible en pantalla');

                    // Reinicializar iconos de Lucide
                    setTimeout(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 10);
                } else {
                    // Solo ocultar si esta es la instancia activa
                    if (window.activeAIEditorInstance === this) {
                        console.log('🙈 Ocultando modal de respuesta de IA');
                        modalOverlay.style.display = 'none';
                        window.activeAIEditorInstance = null;
                    }
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
            console.log(`🎬 Ejecutando acción de IA: ${mode}`);

            if (!window.aiService) {
                alert('❌ El servicio de IA no está disponible');
                return;
            }

            const selectedText = this.getSelectedText();
            const fullContent = this.getContent();
            console.log(`📄 Contenido del editor (${fullContent.length} caracteres):`, fullContent.substring(0, 100) + '...');

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

            // Limpiar respuesta anterior al iniciar nueva acción
            this.aiResponse = null;
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
                console.log('✅ Modal de respuesta de IA activado (showAIResponse = true)');

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

            // Cerrar y limpiar después de insertar (ya que se aplicó)
            this.showAIResponse = false;
            this.aiResponse = null;
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
         * NOTA: NO limpia this.aiResponse para preservar el contenido
         * El contenido solo se limpia cuando se ejecuta una nueva acción de IA
         */
        closeAIResponse() {
            console.log('🔒 Cerrando modal de respuesta de IA (contenido preservado)');
            this.showAIResponse = false;
            // NO limpiar this.aiResponse aquí - preservar contenido para reabrir
        }
    };
};
