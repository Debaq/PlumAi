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
         * Mostrar popup de lista genérico con detección de bordes
         */
        showListPopup(items, options = {}) {
            // Cerrar popup existente si hay
            this.closeListPopup();

            // Crear el popup
            const popup = document.createElement('div');
            popup.className = 'editor-list-popup';
            popup.style.cssText = `
                position: fixed;
                background: var(--bg-secondary, #2d2d2d);
                border: 1px solid var(--border, #444);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                min-width: 220px;
                max-width: 300px;
                max-height: 250px;
                overflow-y: auto;
                padding: 4px;
            `;

            // Agregar items
            items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'editor-list-popup-item';
                itemEl.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.15s;
                    font-size: 13px;
                `;
                itemEl.innerHTML = `
                    <div style="font-weight: 500; color: var(--text-primary, #e0e0e0); margin-bottom: 2px;">
                        ${item.icon || ''} ${item.label}
                    </div>
                    ${item.description ? `<div style="font-size: 11px; color: var(--text-secondary, #999); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.description}</div>` : ''}
                `;

                itemEl.addEventListener('mouseenter', () => {
                    itemEl.style.background = 'var(--bg-tertiary, #3a3a3a)';
                });
                itemEl.addEventListener('mouseleave', () => {
                    itemEl.style.background = 'transparent';
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
                newItemEl.className = 'editor-list-popup-item';
                newItemEl.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.15s;
                    font-size: 13px;
                    color: var(--accent, #4a90e2);
                    font-weight: 500;
                `;
                newItemEl.innerHTML = `➕ ${options.addNewLabel || 'Agregar nuevo'}`;

                newItemEl.addEventListener('mouseenter', () => {
                    newItemEl.style.background = 'var(--bg-tertiary, #3a3a3a)';
                });
                newItemEl.addEventListener('mouseleave', () => {
                    newItemEl.style.background = 'transparent';
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

            // Posicionar cerca del cursor con detección de bordes
            this.positionPopupNearCursor(popup);

            // Cerrar al hacer click fuera
            setTimeout(() => {
                const closeOnClickOutside = (e) => {
                    if (!popup.contains(e.target)) {
                        this.closeListPopup();
                        document.removeEventListener('click', closeOnClickOutside);
                    }
                };
                document.addEventListener('click', closeOnClickOutside);
            }, 100);
        },

        /**
         * Posicionar popup cerca del cursor con detección de bordes
         */
        positionPopupNearCursor(popup) {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;

            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calcular posición inicial (debajo del cursor)
            let left = rect.left;
            let top = rect.bottom + 5;

            // Obtener dimensiones del popup y la ventana
            const popupRect = popup.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Ajustar horizontalmente si se sale por la derecha
            if (left + popupRect.width > viewportWidth - 10) {
                left = viewportWidth - popupRect.width - 10;
            }

            // Ajustar horizontalmente si se sale por la izquierda
            if (left < 10) {
                left = 10;
            }

            // Ajustar verticalmente si se sale por abajo - mostrar arriba del cursor
            if (top + popupRect.height > viewportHeight - 10) {
                top = rect.top - popupRect.height - 5;
            }

            // Si tampoco cabe arriba, ajustar al espacio disponible
            if (top < 10) {
                top = 10;
                popup.style.maxHeight = (viewportHeight - 20) + 'px';
            }

            popup.style.left = `${left}px`;
            popup.style.top = `${top}px`;
        },

        /**
         * Cerrar popup de lista
         */
        closeListPopup() {
            if (this.currentPopup) {
                this.currentPopup.remove();
                this.currentPopup = null;
            }
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

            // Cerrar popup si está abierto
            this.closeListPopup();

            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }

            this.editorReady = false;
        }
    };
};
