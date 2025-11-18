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
        // NOTA: saveStatus ahora se maneja en $store.ui.editorSaveStatus

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

            // Escuchar evento de guardado manual desde el header
            this.saveManuallyHandler = () => this.saveManually();
            window.addEventListener('editor:save-manually', this.saveManuallyHandler);

            // Atajo de teclado Ctrl+S / Cmd+S para guardar
            this.keyboardHandler = (e) => {
                // Ctrl+S (Windows/Linux) o Cmd+S (Mac)
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault(); // Prevenir el diálogo de guardar del navegador
                    this.saveManually();
                }
            };
            document.addEventListener('keydown', this.keyboardHandler);

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
            this.$store.ui.editorSaveStatus = 'unsaved';

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

            // Esperar 3 segundos antes de guardar (reducir carga del searchService)
            this.saveTimeout = setTimeout(() => {
                this.save();
            }, 3000);
        },

        /**
         * Guardar contenido
         */
        async save() {
            if (!this.editor || !this.currentChapter) return;

            this.$store.ui.editorSaveStatus = 'saving';

            const content = this.editor.getContent();

            // Guardar en el store
            this.$store.project.updateChapter(this.currentChapter.id, {
                content: content,
                wordCount: this.wordCount
            });

            // updateChapter llama a updateModified() que llama a autoSave()
            // Esperar a que se complete el guardado automático
            setTimeout(() => {
                this.$store.ui.editorSaveStatus = 'saved';
            }, 500);
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
         * Mostrar popup de lista genérico con detección de bordes y navegación por teclado
         */
        showListPopup(items, options = {}) {
            // Cerrar popup existente si hay
            this.closeListPopup();

            // Guardar referencia para navegación por teclado
            this.popupItems = items;
            this.popupOptions = options;
            this.selectedPopupIndex = 0;

            // Crear el popup
            const popup = document.createElement('div');
            popup.className = 'editor-list-popup';
            popup.style.cssText = `
                position: fixed;
                background: var(--bg-secondary, #2d2d2d);
                border: 1px solid var(--border, #444);
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                z-index: 1000;
                min-width: 180px;
                max-width: 250px;
                max-height: 200px;
                overflow-y: auto;
                padding: 2px;
            `;

            // Agregar items
            items.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'editor-list-popup-item';
                itemEl.dataset.index = index;
                itemEl.style.cssText = `
                    padding: 6px 10px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.1s;
                    font-size: 12px;
                    font-weight: 400;
                `;
                itemEl.innerHTML = `${item.icon || ''} ${item.label}`;

                // Seleccionar el primer item por defecto
                if (index === 0) {
                    itemEl.style.background = 'var(--accent, #4a90e2)';
                    itemEl.style.color = '#fff';
                }

                itemEl.addEventListener('mouseenter', () => {
                    this.selectedPopupIndex = index;
                    this.updatePopupSelection();
                });
                itemEl.addEventListener('click', () => {
                    if (item.onClick) item.onClick();
                    this.closeListPopup();
                });

                popup.appendChild(itemEl);
            });

            // Agregar botón "Nuevo" si se proporciona
            if (options.onAddNew) {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    height: 1px;
                    background: var(--border, #444);
                    margin: 4px 0;
                `;
                popup.appendChild(separator);

                const newItemEl = document.createElement('div');
                newItemEl.className = 'editor-list-popup-item-new';
                newItemEl.dataset.index = items.length;
                newItemEl.style.cssText = `
                    padding: 6px 10px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.1s;
                    font-size: 12px;
                    color: var(--accent, #4a90e2);
                    font-weight: 500;
                `;
                newItemEl.innerHTML = `➕ ${options.addNewLabel || 'Agregar nuevo'}`;

                newItemEl.addEventListener('mouseenter', () => {
                    this.selectedPopupIndex = items.length;
                    this.updatePopupSelection();
                });
                newItemEl.addEventListener('click', () => {
                    options.onAddNew();
                    this.closeListPopup();
                });

                popup.appendChild(newItemEl);
            }

            // Agregar al body
            document.body.appendChild(popup);
            this.currentPopup = popup;

            // Crear elemento de referencia virtual en la posición del cursor
            const sel = window.getSelection();

            if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Crear elemento de referencia virtual
                const virtualReference = {
                    getBoundingClientRect: () => rect
                };

                // Usar Floating UI para posicionar el popup
                if (window.FloatingUIDOM) {
                    window.FloatingUIDOM.computePosition(virtualReference, popup, {
                        placement: 'bottom-start',
                        middleware: [
                            window.FloatingUIDOM.offset(5),
                            window.FloatingUIDOM.flip(),
                            window.FloatingUIDOM.shift({ padding: 10 })
                        ]
                    }).then(({ x, y }) => {
                        popup.style.left = `${x}px`;
                        popup.style.top = `${y}px`;
                    }).catch(err => {
                        console.error('❌ [Popup] Floating UI error:', err);
                    });
                } else {
                    console.warn('⚠️ [Popup] Floating UI not loaded, using fallback');
                    // Fallback simple si no carga Floating UI
                    popup.style.left = `${rect.left}px`;
                    popup.style.top = `${rect.bottom + 5}px`;
                }
            }

            // Event listener para navegación por teclado
            // Usar un pequeño delay para evitar que el Enter del comando anterior se ejecute
            setTimeout(() => {
                this.popupKeyHandler = (e) => {
                    if (!this.currentPopup) return;

                    const totalItems = items.length + (options.onAddNew ? 1 : 0);

                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectedPopupIndex = Math.min(this.selectedPopupIndex + 1, totalItems - 1);
                        this.updatePopupSelection();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectedPopupIndex = Math.max(this.selectedPopupIndex - 1, 0);
                        this.updatePopupSelection();
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        this.executeCurrentPopupItem();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        this.closeListPopup();
                    }
                };
                document.addEventListener('keydown', this.popupKeyHandler);
            }, 10);

            // Cerrar al hacer click fuera
            const closeOnClickOutside = (e) => {
                if (!popup.contains(e.target)) {
                    this.closeListPopup();
                    document.removeEventListener('click', closeOnClickOutside);
                }
            };
            // Usar setTimeout muy corto para evitar que el click que abre el popup lo cierre inmediatamente
            setTimeout(() => {
                document.addEventListener('click', closeOnClickOutside);
            }, 10);
        },

        /**
         * Actualizar selección visual del popup
         */
        updatePopupSelection() {
            if (!this.currentPopup) return;

            const allItems = this.currentPopup.querySelectorAll('.editor-list-popup-item, .editor-list-popup-item-new');
            allItems.forEach((item, index) => {
                if (index === this.selectedPopupIndex) {
                    item.style.background = 'var(--accent, #4a90e2)';
                    item.style.color = '#fff';
                    // Hacer scroll al item si es necesario
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.style.background = 'transparent';
                    item.style.color = item.classList.contains('editor-list-popup-item-new') ?
                        'var(--accent, #4a90e2)' :
                        'var(--text-primary, #e0e0e0)';
                }
            });
        },

        /**
         * Ejecutar item actualmente seleccionado del popup
         */
        executeCurrentPopupItem() {
            if (this.selectedPopupIndex < this.popupItems.length) {
                // Es un item de la lista
                const item = this.popupItems[this.selectedPopupIndex];
                if (item.onClick) item.onClick();
            } else {
                // Es el botón "Agregar nuevo"
                if (this.popupOptions.onAddNew) {
                    this.popupOptions.onAddNew();
                }
            }
            this.closeListPopup();
        },

        /**
         * Cerrar popup de lista
         */
        closeListPopup() {
            if (this.currentPopup) {
                this.currentPopup.remove();
                this.currentPopup = null;
            }
            // Limpiar event listener de teclado
            if (this.popupKeyHandler) {
                document.removeEventListener('keydown', this.popupKeyHandler);
                this.popupKeyHandler = null;
            }
            // Limpiar referencias
            this.popupItems = null;
            this.popupOptions = null;
            this.selectedPopupIndex = 0;
        },

        /**
         * Abrir selector de personajes
         */
        openCharacterSelector() {
            const characters = this.$store.project.characters || [];

            const items = characters.map(char => ({
                label: char.name,
                description: char.role || char.description || '',
                icon: '👤',
                onClick: () => this.$store.ui.openModal('editCharacter', char)
            }));

            this.showListPopup(items, {
                onAddNew: () => this.$store.ui.openModal('newCharacter'),
                addNewLabel: this.$store.i18n.t('characters.new') || 'Nuevo personaje'
            });
        },

        /**
         * Abrir selector de escenas
         */
        openSceneSelector() {
            const scenes = this.$store.project.scenes || [];
            const items = scenes.map(scene => ({
                label: scene.title,
                description: scene.description || '',
                icon: '🎬',
                onClick: () => this.$store.ui.openModal('editScene', scene)
            }));

            this.showListPopup(items, {
                onAddNew: () => this.$store.ui.openModal('newScene'),
                addNewLabel: this.$store.i18n.t('scenes.new') || 'Nueva escena'
            });
        },

        /**
         * Abrir selector de ubicaciones
         */
        openLocationSelector() {
            const locations = this.$store.project.locations || [];
            const items = locations.map(loc => ({
                label: loc.name,
                description: loc.description || '',
                icon: '📍',
                onClick: () => this.$store.ui.openModal('editLocation', loc)
            }));

            this.showListPopup(items, {
                onAddNew: () => this.$store.ui.openModal('newLocation'),
                addNewLabel: this.$store.i18n.t('locations.new') || 'Nueva ubicación'
            });
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
        async aiContinue(selectedText) {
            if (!window.aiService) {
                this.$store.ui.error(
                    this.$store.i18n.t('ai.error') || 'Error de IA',
                    'El servicio de IA no está disponible'
                );
                return;
            }

            try {
                // Mostrar indicador de procesamiento
                this.$store.ui.info(
                    this.$store.i18n.t('ai.processing') || 'Procesando...',
                    'La IA está generando una respuesta...'
                );

                // Obtener texto seleccionado o contenido completo
                const textToUse = selectedText || this.editor.getSelectedText();
                const fullContent = this.editor.getContent();

                // Construir prompt
                const userPrompt = textToUse
                    ? `Continúa este texto:\n\n${textToUse}`
                    : 'Continúa el texto desde donde terminé';

                // Obtener capítulo activo
                const chapterId = this.$store.ui.currentEditingChapterId;

                // Verificar si el modo agéntico está activado
                const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
                const useAgenticMode = settings.useAgenticContext !== false;

                // Enviar request a IA
                let response;
                if (useAgenticMode && window.agenticContextService) {
                    response = await window.aiService.sendAgenticRequest(
                        'continue',
                        userPrompt,
                        chapterId,
                        textToUse
                    );
                } else {
                    response = await window.aiService.sendRequest(
                        'continue',
                        userPrompt,
                        chapterId,
                        textToUse
                    );
                }

                // Verificar si existe el modal global de IA
                const modalOverlay = document.querySelector('.ai-response-modal-overlay');
                if (modalOverlay) {
                    // Usar el modal global existente
                    this.showAIResponseInModal(response);
                } else {
                    // Insertar directamente la respuesta
                    this.insertAITextAtCursor(response.content || response.prompt);
                    this.$store.ui.success(
                        this.$store.i18n.t('ai.success') || 'IA',
                        'Respuesta de IA insertada en el editor'
                    );
                }

            } catch (error) {
                console.error('❌ AI Error:', error);
                this.$store.ui.error(
                    this.$store.i18n.t('ai.error') || 'Error de IA',
                    error.message || 'Ocurrió un error al procesar la solicitud'
                );
            }
        },

        /**
         * Mostrar respuesta de IA en el modal global
         */
        showAIResponseInModal(response) {
            const modalOverlay = document.querySelector('.ai-response-modal-overlay');
            const modal = modalOverlay.querySelector('.ai-response-modal');

            if (!modal) return;

            // Actualizar contenido del modal
            const textEl = modal.querySelector('.ai-response-text');
            const providerEl = modal.querySelector('.ai-provider');
            const modelEl = modal.querySelector('.ai-model');
            const typeEl = modal.querySelector('.ai-type');

            if (textEl) textEl.textContent = response.content || response.prompt || '';
            if (providerEl) providerEl.textContent = response.provider || 'N/A';
            if (modelEl) modelEl.textContent = response.model || 'N/A';
            if (typeEl) typeEl.textContent = response.type || 'N/A';

            // Guardar referencia al editor para el botón de insertar
            window.activeChapterEditorInstance = this;

            // Configurar el botón de insertar para este editor
            const insertBtn = modal.querySelector('.ai-modal-insert-btn');
            if (insertBtn) {
                // Remover listeners anteriores creando un nuevo botón
                const newInsertBtn = insertBtn.cloneNode(true);
                insertBtn.parentNode.replaceChild(newInsertBtn, insertBtn);

                newInsertBtn.onclick = () => {
                    if (window.activeChapterEditorInstance) {
                        const text = modal.querySelector('.ai-response-text').textContent;
                        window.activeChapterEditorInstance.insertAITextAtCursor(text);
                        modalOverlay.style.display = 'none';
                        window.activeChapterEditorInstance.$store.ui.success(
                            'IA',
                            'Respuesta insertada en el editor'
                        );
                    }
                };
            }

            // Mostrar modal
            modalOverlay.style.display = 'block';

            // Reinicializar iconos de Lucide
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 10);
        },

        /**
         * Insertar texto de IA en la posición del cursor
         */
        insertAITextAtCursor(text) {
            if (!this.editor || !text) return;

            // Obtener selección actual
            const sel = window.getSelection();
            if (!sel.rangeCount) {
                // Si no hay selección, agregar al final
                this.editor.editor.focus();
                const range = document.createRange();
                range.selectNodeContents(this.editor.editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }

            const range = sel.getRangeAt(0);

            // Si hay texto seleccionado, eliminarlo
            if (!sel.isCollapsed) {
                range.deleteContents();
            }

            // Insertar texto de IA
            const textNode = document.createTextNode('\n\n' + text);
            range.insertNode(textNode);

            // Mover cursor al final del texto insertado
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            sel.removeAllRanges();
            sel.addRange(range);

            // Trigger content change para que se guarde
            if (this.editor.onContentChange) {
                this.editor.onContentChange(this.editor.getContent());
            }

            // Focus en el editor
            this.editor.editor.focus();
        },

        /**
         * Destruir el editor
         */
        destroy() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            // Cerrar popup si está abierto
            this.closeListPopup();

            // Remover event listener de guardado manual
            if (this.saveManuallyHandler) {
                window.removeEventListener('editor:save-manually', this.saveManuallyHandler);
            }

            // Remover event listener de atajo de teclado
            if (this.keyboardHandler) {
                document.removeEventListener('keydown', this.keyboardHandler);
            }

            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }

            this.editorReady = false;
        }
    };
};
