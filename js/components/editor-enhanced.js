// Enhanced Editor Component for PlumaAI
// Sistema de comandos slash, menciones @ y comentarios

window.editorEnhancedComponent = function() {
    return {
        // Current chapter
        get currentChapter() {
            return this.$store.project.getChapter(this.$store.ui.currentEditingChapterId);
        },

        // Slash Commands System
        showCommandMenu: false,
        commandMenuPosition: { top: 0, left: 0 },
        commandFilter: '',
        selectedCommandIndex: 0,
        slashStartPosition: 0,

        // Mentions System (@)
        showMentionsMenu: false,
        mentionsMenuPosition: { top: 0, left: 0 },
        mentionFilter: '',
        selectedMentionIndex: 0,
        mentionStartPosition: 0,

        // Comments System
        showCommentPopup: false,
        commentPosition: { top: 0, left: 0 },
        currentComment: '',
        commentCursorPosition: 0,

        // Character Info Modal
        showCharacterInfo: false,
        selectedCharacter: null,

        // Slash Commands
        get commands() {
            const currentLocale = this.$store.i18n.currentLocale;
            const isEnglish = currentLocale === 'en';
            
            return [
                {
                    id: 'characters',
                    title: isEnglish ? '/characters' : '/personajes',
                    desc: isEnglish ? 'View list of characters' : 'Ver lista de personajes',
                    icon: 'users',
                    action: 'listCharacters'
                },
                {
                    id: 'comment',
                    title: isEnglish ? '/comment' : '/comentario',
                    desc: isEnglish ? 'Add comment at this position' : 'Agregar comentario en esta posición',
                    icon: 'message-square',
                    action: 'addComment'
                },
                {
                    id: 'idea',
                    title: isEnglish ? '/idea' : '/idea',
                    desc: isEnglish ? 'Mark an idea or TODO' : 'Marcar una idea o TODO',
                    icon: 'lightbulb',
                    template: '💡 IDEA: '
                },
                {
                    id: 'scene',
                    title: isEnglish ? '/scene' : '/escena',
                    desc: isEnglish ? 'Reference a scene' : 'Referencia a una escena',
                    icon: 'film',
                    action: 'selectScene'
                },
                {
                    id: 'location',
                    title: isEnglish ? '/location' : '/ubicacion',
                    desc: isEnglish ? 'Mention a location' : 'Mencionar una ubicación',
                    icon: 'map-pin',
                    action: 'selectLocation'
                },
                {
                    id: 'time',
                    title: isEnglish ? '/time' : '/tiempo',
                    desc: isEnglish ? 'Add time reference' : 'Agregar referencia de tiempo',
                    icon: 'clock',
                    action: 'selectTime'
                },
                {
                    id: 'dialogue',
                    title: isEnglish ? '/dialogue' : '/dialogo',
                    desc: isEnglish ? 'Dialogue formatting' : 'Formato de diálogo',
                    icon: 'message-circle',
                    template: '— '
                },
                {
                    id: 'ai-continue',
                    title: isEnglish ? '/ai-continue' : '/ia-continuar',
                    desc: isEnglish ? 'Ask AI to continue' : 'Pedir a la IA que continúe',
                    icon: 'wand-2',
                    action: 'aiContinue'
                },
                {
                    id: 'ai-improve',
                    title: isEnglish ? '/ai-improve' : '/ia-mejorar',
                    desc: isEnglish ? 'Suggest improvements with AI' : 'Sugerir mejoras con IA',
                    icon: 'sparkles',
                    action: 'aiImprove'
                },
                {
                    id: 'divider',
                    title: isEnglish ? '/divider' : '/separador',
                    desc: isEnglish ? 'Insert scene divider' : 'Insertar separador de escena',
                    icon: 'minus',
                    template: '\n\n***\n\n'
                }
            ];
        },

        get filteredCommands() {
            if (!this.commandFilter) return this.commands;
            const filter = this.commandFilter.toLowerCase();
            return this.commands.filter(cmd =>
                cmd.title.toLowerCase().includes(filter) ||
                cmd.desc.toLowerCase().includes(filter)
            );
        },

        // Get characters ordered by relevance
        get orderedCharacters() {
            const all = this.$store.project.characters || [];
            // TODO: Implement relevance scoring (in scene > in chapter > all)
            return all.map(char => ({
                ...char,
                badge: null // 'in-scene' | 'in-chapter' | null
            }));
        },

        get filteredMentions() {
            const chars = this.orderedCharacters;
            if (!this.mentionFilter) return chars;
            const filter = this.mentionFilter.toLowerCase();
            return chars.filter(char =>
                char.name.toLowerCase().includes(filter)
            );
        },

        init() {
            console.log('📝 Enhanced Editor initialized');
        },

        // Handle input for both / and @
        handleInput(event) {
            const textarea = event.target;
            const cursorPos = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPos);

            // Check for @ mentions
            const lastAtIndex = textBeforeCursor.lastIndexOf('@');
            if (lastAtIndex !== -1) {
                const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
                const hasSpaceAfter = textAfterAt.includes(' ') || textAfterAt.includes('\n');

                if (!hasSpaceAfter && lastAtIndex >= 0) {
                    this.mentionFilter = textAfterAt;
                    this.mentionStartPosition = lastAtIndex;
                    this.selectedMentionIndex = 0;
                    this.showMentionsMenu = true;
                    this.showCommandMenu = false;
                    this.updateMenuPosition(textarea, cursorPos, 'mentions');
                    return;
                }
            }

            // Check for / commands
            const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
            if (lastSlashIndex !== -1) {
                const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
                const hasSpaceAfter = textAfterSlash.includes(' ') || textAfterSlash.includes('\n');

                if (!hasSpaceAfter) {
                    this.commandFilter = textAfterSlash;
                    this.slashStartPosition = lastSlashIndex;
                    this.selectedCommandIndex = 0;
                    this.showCommandMenu = true;
                    this.showMentionsMenu = false;
                    this.updateMenuPosition(textarea, cursorPos, 'commands');
                    return;
                }
            }

            // Hide menus if conditions not met
            this.hideAllMenus();

            // Auto-save
            this.autoSave();
        },

        handleKeyDown(event) {
            // Handle mentions menu
            if (this.showMentionsMenu) {
                const filtered = this.filteredMentions;
                if (filtered.length === 0) return; // No items to navigate

                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    this.selectedMentionIndex = (this.selectedMentionIndex + 1) % filtered.length;
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    this.selectedMentionIndex = this.selectedMentionIndex === 0
                        ? filtered.length - 1
                        : this.selectedMentionIndex - 1;
                } else if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.insertMention(filtered[this.selectedMentionIndex]);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    this.showMentionsMenu = false;
                }
                return;
            }

            // Handle commands menu
            if (this.showCommandMenu) {
                const filtered = this.filteredCommands;
                if (filtered.length === 0) return; // No items to navigate

                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    this.selectedCommandIndex = (this.selectedCommandIndex + 1) % filtered.length;
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    this.selectedCommandIndex = this.selectedCommandIndex === 0
                        ? filtered.length - 1
                        : this.selectedCommandIndex - 1;
                } else if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.executeCommand(filtered[this.selectedCommandIndex]);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    this.showCommandMenu = false;
                }
                return;
            }
        },

        updateMenuPosition(textarea, cursorPos, type) {
            const rect = textarea.getBoundingClientRect();
            const lineHeight = 28;
            const lines = textarea.value.substring(0, cursorPos).split('\n').length;
            const scrollTop = textarea.scrollTop;

            const position = {
                top: rect.top + (lines * lineHeight) - scrollTop + 30,
                left: rect.left + 50
            };

            if (type === 'mentions') {
                this.mentionsMenuPosition = position;
            } else {
                this.commandMenuPosition = position;
            }
        },

        hideAllMenus() {
            this.showCommandMenu = false;
            this.showMentionsMenu = false;
            this.commandFilter = '';
            this.mentionFilter = '';
        },

        // Insert mention
        insertMention(character) {
            if (!character) return;

            const textarea = this.$el.querySelector('.editor-textarea');
            const content = textarea.value;
            // Use mentionStartPosition if it comes from @, otherwise use slashStartPosition to replace the command
            const startPos = this.mentionStartPosition !== undefined ? this.mentionStartPosition : this.slashStartPosition;
            const beforeMention = content.substring(0, startPos);
            const afterCursor = content.substring(textarea.selectionStart);

            const insertText = `@${character.name}`;
            const newCursorPos = startPos + insertText.length;

            this.currentChapter.content = beforeMention + insertText + afterCursor;

            this.$nextTick(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.showMentionsMenu = false;
                this.hideAllMenus();
                this.autoSave();
            });
        },

        // Execute slash command
        executeCommand(command) {
            if (!command) return;

            const textarea = this.$el.querySelector('.editor-textarea');
            const content = textarea.value;
            const beforeSlash = content.substring(0, this.slashStartPosition);
            const afterCursor = content.substring(textarea.selectionStart);

            // Handle different command actions
            if (command.action === 'listCharacters') {
                // Show character selection menu
                this.showCharacterSelectionMenu();
                this.hideAllMenus();
                return;
            } else if (command.action === 'addComment') {
                this.commentCursorPosition = this.slashStartPosition;
                this.showCommentPopup = true;
                this.hideAllMenus();
                // Remove the command text
                this.currentChapter.content = beforeSlash + afterCursor;
                return;
            } else if (command.action === 'selectScene') {
                this.showSceneSelectionMenu();
                this.hideAllMenus();
                // Remove the command text
                this.currentChapter.content = beforeSlash + afterCursor;
                return;
            } else if (command.action === 'selectLocation') {
                this.showLocationSelectionMenu();
                this.hideAllMenus();
                // Remove the command text
                this.currentChapter.content = beforeSlash + afterCursor;
                return;
            } else if (command.action === 'selectTime') {
                this.showTimeSelectionMenu();
                this.hideAllMenus();
                // Remove the command text
                this.currentChapter.content = beforeSlash + afterCursor;
                return;
            } else if (command.template) {
                const insertText = command.template;
                const newCursorPos = this.slashStartPosition + insertText.length;
                this.currentChapter.content = beforeSlash + insertText + afterCursor;

                this.$nextTick(() => {
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                    textarea.focus();
                    this.hideAllMenus();
                    this.autoSave();
                });
            } else if (command.action) {
                // For other actions, show info message
                this.$store.ui.info('Comando', `Funcionalidad "${command.title}" en desarrollo`);
                this.hideAllMenus();
            }
        },

        showCharacterSelectionMenu() {
            this.showSelectionMenu('characters');
        },

        showSceneSelectionMenu() {
            this.showSelectionMenu('scenes');
        },

        showLocationSelectionMenu() {
            this.showSelectionMenu('locations');
        },

        showTimeSelectionMenu() {
            this.showSelectionMenu('timeline');
        },

        showSelectionMenu(type) {
            let items = [];
            let title = '';
            let placeholder = '';

            switch(type) {
                case 'characters':
                    items = this.$store.project.characters;
                    title = this.$store.i18n.t('characters.title');
                    placeholder = this.$store.i18n.t('characters.form.namePlaceholder');
                    break;
                case 'scenes':
                    items = this.$store.project.scenes;
                    title = this.$store.i18n.t('scenes.title');
                    placeholder = this.$store.i18n.t('scenes.form.titlePlaceholder');
                    break;
                case 'locations':
                    items = this.$store.project.locations;
                    title = this.$store.i18n.t('locations.title');
                    placeholder = this.$store.i18n.t('locations.form.namePlaceholder');
                    break;
                case 'timeline':
                    items = this.$store.project.timeline;
                    title = this.$store.i18n.t('timeline.title');
                    placeholder = this.$store.i18n.t('timeline.form.datePlaceholder');
                    break;
            }

            // Create a custom selection modal that allows to select or create
            this.openSelectionModal(type, items, title, placeholder);
        },

        openSelectionModal(type, items, title, placeholder) {
            // Close any existing modals
            this.$store.ui.closeAllModals();
            
            // Create and show a custom selection modal
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'selection-modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="btn-close" @click="closeSelectionModal()">
                            <i data-lucide="x" width="20" height="20"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="text" id="search-input" placeholder="${this.$store.i18n.t('common.search')}" style="width: 100%; padding: 8px; margin-bottom: 12px;">
                        </div>
                        
                        <div style="max-height: 300px; overflow-y: auto;">
                            <div id="items-list">
                                ${items.map(item => `
                                    <div class="selection-item" data-id="${item.id}" style="padding: 8px; border-bottom: 1px solid var(--border); cursor: pointer;">
                                        <div style="font-weight: 500;">${item.name || item.title || item.date || item.event}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${item.description || item.event || ''}</div>
                                    </div>
                                `).join('')}
                                
                                ${items.length === 0 ? 
                                    `<div style="padding: 20px; text-align: center; color: var(--text-tertiary);">
                                        ${this.$store.i18n.t('common.noResults')}
                                    </div>` : ''}
                            </div>
                            
                            <div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="new-item-input" placeholder="${placeholder}" style="flex: 1; padding: 8px;">
                                    <button class="btn-primary" id="create-new-btn" style="padding: 8px 16px;">Crear</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // Bind events after adding to DOM
            this.bindSelectionEvents(type, items);
            
            // Focus on search input
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        },

        bindSelectionEvents(type, items) {
            // Handle item selection
            document.querySelectorAll('.selection-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const itemObj = items.find(i => i.id === id);
                    if (itemObj) {
                        this.insertSelectedItem(type, itemObj);
                    }
                });
            });

            // Handle search
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterItems(e.target.value);
                });
            }

            // Handle new item creation
            const createBtn = document.getElementById('create-new-btn');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    const input = document.getElementById('new-item-input');
                    if (input && input.value.trim()) {
                        this.createAndInsertItem(type, input.value.trim());
                    }
                });
            }

            // Handle Enter key in new item input
            const newItemInput = document.getElementById('new-item-input');
            if (newItemInput) {
                newItemInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.createAndInsertItem(type, e.target.value.trim());
                    }
                });
            }

            // Close modal
            document.addEventListener('click', (e) => {
                if (e.target.closest('#selection-modal') === null) {
                    this.closeSelectionModal();
                }
            });
        },

        filterItems(filter) {
            const items = document.querySelectorAll('.selection-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filter.toLowerCase()) ? '' : 'none';
            });
        },

        createAndInsertItem(type, name) {
            let newId;

            switch(type) {
                case 'characters':
                    this.$store.project.addCharacter({ name });
                    newId = this.$store.project.characters[this.$store.project.characters.length - 1].id;
                    break;
                case 'scenes':
                    this.$store.project.addScene({ title: name });
                    newId = this.$store.project.scenes[this.$store.project.scenes.length - 1].id;
                    break;
                case 'locations':
                    this.$store.project.addLocation({ name });
                    newId = this.$store.project.locations[this.$store.project.locations.length - 1].id;
                    break;
                case 'timeline':
                    this.$store.project.addTimelineEvent({ date: name, event: name });
                    newId = this.$store.project.timeline[this.$store.project.timeline.length - 1].id;
                    break;
            }

            // Find the created item and insert it
            const newItem = this.$store.project[type].find(item => item.id === newId);
            if (newItem) {
                this.insertSelectedItem(type, newItem);
            }

            // Close and reopen modal to refresh content
            this.closeSelectionModal();
            setTimeout(() => {
                this.showSelectionMenu(type);
            }, 100);
        },

        insertSelectedItem(type, item) {
            const textarea = this.$el.querySelector('.editor-textarea');
            if (!textarea) return;

            const content = textarea.value;
            const beforeSelection = content.substring(0, this.slashStartPosition);
            const afterCursor = content.substring(textarea.selectionStart);

            let insertText = '';
            switch(type) {
                case 'characters':
                    insertText = `@${item.name}`;
                    break;
                case 'scenes':
                    insertText = `[[${item.title}]]`;
                    break;
                case 'locations':
                    insertText = `[[${item.name}]]`;
                    break;
                case 'timeline':
                    insertText = `[[${item.date || item.event}]]`;
                    break;
            }

            const newCursorPos = this.slashStartPosition + insertText.length;

            this.currentChapter.content = beforeSelection + insertText + afterCursor;

            this.$nextTick(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.closeSelectionModal();
                this.autoSave();
            });
        },

        closeSelectionModal() {
            const modal = document.getElementById('selection-modal');
            if (modal) {
                modal.remove();
            }
            this.hideAllMenus();
        },

        insertSceneReference(scene) {
            const textarea = this.$el.querySelector('.editor-textarea');
            if (!textarea) return;

            const content = textarea.value;
            const beforeMention = content.substring(0, this.mentionStartPosition || 0);
            const afterCursor = content.substring(textarea.selectionStart || 0);

            const insertText = `[[${scene.title}]]`; // Standard notation for scene references
            const newCursorPos = (this.mentionStartPosition || 0) + insertText.length;

            this.currentChapter.content = beforeMention + insertText + afterCursor;

            this.$nextTick(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.autoSave();
            });
        },

        insertLocationReference(location) {
            const textarea = this.$el.querySelector('.editor-textarea');
            if (!textarea) return;

            const content = textarea.value;
            const beforeMention = content.substring(0, this.mentionStartPosition || 0);
            const afterCursor = content.substring(textarea.selectionStart || 0);

            const insertText = `[[${location.name}]]`; // Standard notation for location references
            const newCursorPos = (this.mentionStartPosition || 0) + insertText.length;

            this.currentChapter.content = beforeMention + insertText + afterCursor;

            this.$nextTick(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.autoSave();
            });
        },

        insertTimeReference(time) {
            const textarea = this.$el.querySelector('.editor-textarea');
            if (!textarea) return;

            const content = textarea.value;
            const beforeMention = content.substring(0, this.mentionStartPosition || 0);
            const afterCursor = content.substring(textarea.selectionStart || 0);

            const insertText = `[[${time}]]`; // Standard notation for time references
            const newCursorPos = (this.mentionStartPosition || 0) + insertText.length;

            this.currentChapter.content = beforeMention + insertText + afterCursor;

            this.$nextTick(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.autoSave();
            });
        },

        openCharacterInfo(character) {
            this.selectedCharacter = character;
            this.showCharacterInfo = true;
            this.showMentionsMenu = false;
        },

        closeCharacterInfo() {
            this.showCharacterInfo = false;
            this.selectedCharacter = null;
        },

        saveComment() {
            if (!this.currentComment.trim()) {
                this.showCommentPopup = false;
                return;
            }

            // TODO: Save comment associated with position
            console.log('Comment saved at position:', this.commentCursorPosition, this.currentComment);
            this.$store.ui.success('Comentario', 'Comentario guardado');

            this.currentComment = '';
            this.showCommentPopup = false;
        },

        cancelComment() {
            this.currentComment = '';
            this.showCommentPopup = false;
        },

        autoSave() {
            const textarea = this.$el.querySelector('.editor-textarea');
            if (textarea && this.currentChapter) {
                this.$store.ui.triggerAutoSave(() => {
                    this.$store.ui.markEditorSaving();
                    this.$store.project.updateChapter(this.currentChapter.id, {
                        content: textarea.value
                    });
                    setTimeout(() => {
                        this.$store.ui.markEditorSaved();
                    }, 300);
                });
            }
        }
    };
};
