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
        commands: [
            {
                id: 'personajes',
                title: '/personajes',
                desc: 'Ver lista de personajes',
                icon: 'users',
                action: 'listCharacters'
            },
            {
                id: 'comment',
                title: '/comentario',
                desc: 'Agregar comentario en esta posición',
                icon: 'message-square',
                action: 'addComment'
            },
            {
                id: 'idea',
                title: '/idea',
                desc: 'Marcar una idea o TODO',
                icon: 'lightbulb',
                template: '💡 IDEA: '
            },
            {
                id: 'scene',
                title: '/escena',
                desc: 'Referencia a una escena',
                icon: 'film',
                action: 'selectScene'
            },
            {
                id: 'location',
                title: '/ubicacion',
                desc: 'Mencionar una ubicación',
                icon: 'map-pin',
                action: 'selectLocation'
            },
            {
                id: 'dialogue',
                title: '/dialogo',
                desc: 'Formato de diálogo',
                icon: 'message-circle',
                template: '— '
            },
            {
                id: 'ai-continue',
                title: '/ia-continuar',
                desc: 'Pedir a la IA que continúe',
                icon: 'wand-2',
                action: 'aiContinue'
            },
            {
                id: 'ai-improve',
                title: '/ia-mejorar',
                desc: 'Sugerir mejoras con IA',
                icon: 'sparkles',
                action: 'aiImprove'
            },
            {
                id: 'divider',
                title: '/separador',
                desc: 'Insertar separador de escena',
                icon: 'minus',
                template: '\n\n***\n\n'
            }
        ],

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
            const beforeMention = content.substring(0, this.mentionStartPosition);
            const afterCursor = content.substring(textarea.selectionStart);

            const insertText = `@${character.name}`;
            const newCursorPos = this.mentionStartPosition + insertText.length;

            this.currentChapter.content = beforeMention + insertText + afterCursor;

            this.$nextTick(() => {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
                this.showMentionsMenu = false;
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
                // Remove the /comentario text
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
            // This would show a list of characters to select from
            const chars = this.$store.project.characters;
            if (chars.length === 0) {
                this.$store.ui.info('Personajes', 'No hay personajes creados aún');
                return;
            }

            // For now, show character info modal
            this.selectedCharacter = chars[0];
            this.showCharacterInfo = true;
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
