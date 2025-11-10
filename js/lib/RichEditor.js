/**
 * RichEditor - Librería de editor de texto enriquecido
 * Soporta menciones (@), comandos (/), búsqueda con Lunr.js
 *
 * @version 1.0.0
 * @author PlumaAI
 */

class RichEditor {
    constructor(options = {}) {
        // Configuración
        this.element = options.element;
        this.placeholder = options.placeholder || 'Escribe aquí...';
        this.readOnly = options.readOnly || false;

        // Callbacks
        this.onContentChange = options.onContentChange || null;
        this.onSave = options.onSave || null;
        this.searchFunction = options.searchFunction || null;
        this.searchLocations = options.searchLocations || null;
        this.searchLore = options.searchLore || null;
        this.onLorePreview = options.onLorePreview || null;

        // Datos
        this.mentionData = options.mentionData || [];
        this.commandData = options.commandData || this.getDefaultCommands();

        // Estado interno
        this.content = options.initialContent || '';
        this.showMentionMenu = false;
        this.showCommandMenu = false;
        this.mentionFilter = '';
        this.commandFilter = '';
        this.selectedIndex = 0;
        this.triggerPosition = 0;
        this.currentTrigger = null;

        // Elementos del DOM
        this.editor = null;
        this.mentionMenu = null;
        this.commandMenu = null;

        // Inicializar
        if (this.element) {
            this.init();
        }
    }

    /**
     * Inicializar el editor
     */
    init() {
        if (!this.element) {
            console.error('RichEditor: No se proporcionó un elemento');
            return;
        }

        // Crear el editor
        this.createEditor();

        // Establecer contenido inicial
        if (this.content) {
            this.setContent(this.content);
        }

        // Bind eventos
        this.bindEvents();
    }

    /**
     * Crear elemento del editor
     */
    createEditor() {
        this.editor = document.createElement('div');
        this.editor.className = 'rich-editor-content';
        this.editor.contentEditable = !this.readOnly;
        this.editor.setAttribute('data-placeholder', this.placeholder);

        // Estilos inline básicos
        this.editor.style.cssText = `
            min-height: 200px;
            padding: 16px;
            outline: none;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.6;
        `;

        this.element.appendChild(this.editor);
    }

    /**
     * Bind eventos del editor
     */
    bindEvents() {
        // Input event
        this.editor.addEventListener('input', (e) => {
            this.handleInput(e);
            if (this.onContentChange) {
                this.onContentChange(this.getContent());
            }
        });

        // Keydown event
        this.editor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
            this.handleKeyboardShortcuts(e);
        });

        // Blur event
        this.editor.addEventListener('blur', () => {
            // Cerrar menús después de un delay para permitir clicks
            setTimeout(() => {
                this.hideAllMenus();
            }, 200);
        });
    }

    /**
     * Obtener texto seleccionado
     */
    getSelectedText() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return '';
        return sel.toString();
    }

    /**
     * Guardar el rango de selección actual
     */
    saveSelection() {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            this.savedRange = sel.getRangeAt(0).cloneRange();
            this.savedSelection = sel.toString();
        }
    }

    /**
     * Restaurar la selección guardada
     */
    restoreSelection() {
        if (this.savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this.savedRange);
        }
    }

    /**
     * Manejar input del editor
     */
    handleInput(event) {
        const textBeforeCursor = this.getTextBeforeCursor();
        const selectedText = this.getSelectedText();

        // Guardar selección si existe
        if (selectedText) {
            this.saveSelection();
        }

        // Si hay texto seleccionado y se presiona /, mostrar menú contextual
        if (this.savedSelection && textBeforeCursor.endsWith('/')) {
            this.selectedTextForCommand = this.savedSelection;
            this.commandFilter = '';
            this.selectedIndex = 0;
            this.showCommandMenu = true;
            this.showMentionMenu = false;
            this.updateCommandMenu();
            return;
        }

        // Detectar @@ para @ literal (escapar mención)
        if (textBeforeCursor.endsWith('@@')) {
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                // Eliminar los dos @@
                range.setStart(range.startContainer, range.startOffset - 2);
                range.deleteContents();
                // Insertar un @ simple
                document.execCommand('insertText', false, '@');
            }
            this.hideAllMenus();
            return;
        }

        // Detectar @ para menciones de personajes
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            const hasSpaceAfter = textAfterAt.includes(' ') || textAfterAt.includes('\n');

            if (!hasSpaceAfter) {
                this.mentionFilter = textAfterAt;
                this.triggerPosition = lastAtIndex;
                this.currentTrigger = '@';
                this.selectedIndex = 0;
                this.showMentionMenu = true;
                this.showCommandMenu = false;
                this.updateMentionMenu();
                return;
            }
        }

        // Detectar ## para # literal (escapar mención de ubicación)
        if (textBeforeCursor.endsWith('##')) {
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                // Eliminar los dos ##
                range.setStart(range.startContainer, range.startOffset - 2);
                range.deleteContents();
                // Insertar un # simple
                document.execCommand('insertText', false, '#');
            }
            this.hideAllMenus();
            return;
        }

        // Detectar # para menciones de ubicaciones
        const lastHashIndex = textBeforeCursor.lastIndexOf('#');
        if (lastHashIndex !== -1) {
            const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1);
            const hasSpaceAfter = textAfterHash.includes(' ') || textAfterHash.includes('\n');

            if (!hasSpaceAfter) {
                this.mentionFilter = textAfterHash;
                this.triggerPosition = lastHashIndex;
                this.currentTrigger = '#';
                this.selectedIndex = 0;
                this.showMentionMenu = true;
                this.showCommandMenu = false;
                this.updateMentionMenu();
                return;
            }
        }

        // Detectar ! para lookup de lore
        const lastExclamIndex = textBeforeCursor.lastIndexOf('!');
        if (lastExclamIndex !== -1) {
            const textAfterExclam = textBeforeCursor.substring(lastExclamIndex + 1);
            const hasSpaceAfter = textAfterExclam.includes(' ') || textAfterExclam.includes('\n');

            if (!hasSpaceAfter) {
                this.mentionFilter = textAfterExclam;
                this.triggerPosition = lastExclamIndex;
                this.currentTrigger = '!';
                this.selectedIndex = 0;
                this.showMentionMenu = true;
                this.showCommandMenu = false;
                this.updateMentionMenu();
                return;
            }
        }

        // Detectar / para comandos
        const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
            const hasSpaceAfter = textAfterSlash.includes(' ') || textAfterSlash.includes('\n');

            if (!hasSpaceAfter) {
                this.commandFilter = textAfterSlash;
                this.triggerPosition = lastSlashIndex;
                this.currentTrigger = '/';
                this.selectedIndex = 0;
                this.showCommandMenu = true;
                this.showMentionMenu = false;
                this.updateCommandMenu();
                return;
            }
        }

        // Si no hay triggers, ocultar menús
        this.hideAllMenus();
    }

    /**
     * Manejar atajos de teclado
     */
    handleKeyboardShortcuts(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

        // Ctrl/Cmd + Z - Deshacer
        if (ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            this.undo();
            return;
        }

        // Ctrl/Cmd + Shift + Z o Ctrl/Cmd + Y - Rehacer
        if ((ctrlKey && event.key === 'z' && event.shiftKey) || (ctrlKey && event.key === 'y')) {
            event.preventDefault();
            this.redo();
            return;
        }

        // Ctrl/Cmd + B - Negrita
        if (ctrlKey && event.key === 'b') {
            event.preventDefault();
            this.toggleBold();
            return;
        }

        // Ctrl/Cmd + I - Cursiva
        if (ctrlKey && event.key === 'i') {
            event.preventDefault();
            this.toggleItalic();
            return;
        }

        // Ctrl/Cmd + U - Subrayado
        if (ctrlKey && event.key === 'u') {
            event.preventDefault();
            this.toggleUnderline();
            return;
        }

        // Ctrl/Cmd + S - Guardar
        if (ctrlKey && event.key === 's') {
            event.preventDefault();
            if (this.onSave) {
                this.onSave(this.getContent());
            }
            return;
        }
    }

    /**
     * Manejar teclas especiales
     */
    handleKeyDown(event) {
        // Manejar menú de menciones
        if (this.showMentionMenu) {
            const filtered = this.getFilteredMentions();

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, filtered.length - 1);
                this.updateMentionMenu();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateMentionMenu();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (filtered[this.selectedIndex]) {
                    this.insertMention(filtered[this.selectedIndex]);
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                this.hideAllMenus();
            }
            return;
        }

        // Manejar menú de comandos
        if (this.showCommandMenu) {
            const filtered = this.getFilteredCommands();

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, filtered.length - 1);
                this.updateCommandMenu();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateCommandMenu();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (filtered[this.selectedIndex]) {
                    this.executeCommand(filtered[this.selectedIndex]);
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                this.hideAllMenus();
            }
            return;
        }
    }

    /**
     * Obtener texto antes del cursor
     */
    getTextBeforeCursor() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return '';

        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(this.editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return preCaretRange.toString();
    }

    /**
     * Obtener posición del cursor
     */
    getCaretPosition() {
        return this.getTextBeforeCursor().length;
    }

    /**
     * Obtener menciones filtradas
     */
    getFilteredMentions() {
        // Usar diferente función de búsqueda según el trigger
        let searchFn = null;
        let defaultData = [];

        if (this.currentTrigger === '@') {
            // Personajes
            searchFn = this.searchFunction;
            defaultData = this.mentionData;
        } else if (this.currentTrigger === '#') {
            // Ubicaciones
            searchFn = this.searchLocations;
            defaultData = [];
        } else if (this.currentTrigger === '!') {
            // Lore
            searchFn = this.searchLore;
            defaultData = [];
        }

        if (!this.mentionFilter) {
            return defaultData.slice(0, 5);
        }

        // Si hay función de búsqueda de Lunr.js, usarla
        if (searchFn) {
            const results = searchFn(this.mentionFilter);
            return results.slice(0, 5);
        }

        // Búsqueda simple (fallback)
        const filter = this.mentionFilter.toLowerCase();
        return defaultData
            .filter(item =>
                (item.label || item.name || '').toLowerCase().includes(filter) ||
                (item.content || item.description || '').toLowerCase().includes(filter)
            )
            .slice(0, 5);
    }

    /**
     * Obtener comandos filtrados
     */
    getFilteredCommands() {
        let commands = this.commandData;

        // Si hay texto seleccionado, mostrar solo comandos contextuales
        if (this.selectedTextForCommand) {
            const contextualCommandIds = ['ai-continue', 'comment'];
            commands = commands.filter(cmd => contextualCommandIds.includes(cmd.id));
        }

        // Aplicar filtro de búsqueda
        if (!this.commandFilter) {
            return commands;
        }

        const filter = this.commandFilter.toLowerCase();
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(filter) ||
            cmd.description.toLowerCase().includes(filter)
        );
    }

    /**
     * Actualizar menú de menciones
     */
    updateMentionMenu() {
        const filtered = this.getFilteredMentions();

        if (filtered.length === 0) {
            this.hideMentionMenu();
            return;
        }

        // Crear menú si no existe
        if (!this.mentionMenu) {
            this.mentionMenu = this.createMenu();
            document.body.appendChild(this.mentionMenu);
        }

        // Actualizar contenido
        this.mentionMenu.innerHTML = '';
        filtered.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = `rich-editor-menu-item ${index === this.selectedIndex ? 'selected' : ''}`;
            menuItem.innerHTML = `
                <div class="menu-item-label">${item.label || item.name}</div>
                <div class="menu-item-desc">${(item.content || item.description || '').substring(0, 80)}${(item.content || item.description || '').length > 80 ? '...' : ''}</div>
            `;

            menuItem.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.insertMention(item);
            });

            this.mentionMenu.appendChild(menuItem);
        });

        // Posicionar menú
        this.positionMenu(this.mentionMenu);
    }

    /**
     * Actualizar menú de comandos
     */
    updateCommandMenu() {
        const filtered = this.getFilteredCommands();

        if (filtered.length === 0) {
            this.hideCommandMenu();
            return;
        }

        // Crear menú si no existe
        if (!this.commandMenu) {
            this.commandMenu = this.createMenu();
            document.body.appendChild(this.commandMenu);
        }

        // Actualizar contenido
        this.commandMenu.innerHTML = '';
        filtered.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = `rich-editor-menu-item ${index === this.selectedIndex ? 'selected' : ''}`;
            menuItem.innerHTML = `
                <div class="menu-item-label">${item.icon || ''} ${item.label}</div>
                <div class="menu-item-desc">${item.description}</div>
            `;

            menuItem.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.executeCommand(item);
            });

            this.commandMenu.appendChild(menuItem);
        });

        // Posicionar menú
        this.positionMenu(this.commandMenu);
    }

    /**
     * Crear elemento de menú
     */
    createMenu() {
        const menu = document.createElement('div');
        menu.className = 'rich-editor-menu';
        menu.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            min-width: 300px;
            max-height: 300px;
            overflow-y: auto;
        `;
        return menu;
    }

    /**
     * Posicionar menú cerca del cursor
     */
    positionMenu(menu) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        menu.style.left = `${window.scrollX + rect.left}px`;
        menu.style.top = `${window.scrollY + rect.bottom + 5}px`;
    }

    /**
     * Insertar mención
     */
    insertMention(item) {
        // Para lore (!), mostrar preview en lugar de insertar
        if (this.currentTrigger === '!' && this.onLorePreview) {
            // Remover el trigger del texto
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                range.setStart(range.startContainer, range.startOffset - 1); // Remover el !
                range.deleteContents();
            }

            // Llamar callback de preview
            this.hideMentionMenu();
            this.editor.focus();
            this.onLorePreview(item);
            return;
        }

        // Para @ y #, insertar como span con estilo
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);

        // Eliminar el trigger y lo que se haya escrito
        const textBeforeCursor = this.getTextBeforeCursor();
        const triggerIndex = this.currentTrigger === '@' ? textBeforeCursor.lastIndexOf('@') : textBeforeCursor.lastIndexOf('#');
        const charsToDelete = textBeforeCursor.length - triggerIndex;

        for (let i = 0; i < charsToDelete; i++) {
            range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
        }
        range.deleteContents();

        // Crear span para la mención
        const mentionSpan = document.createElement('span');
        mentionSpan.className = 'rich-editor-mention';
        mentionSpan.setAttribute('data-mention-type', this.currentTrigger);
        mentionSpan.setAttribute('data-mention-id', item.id || '');
        mentionSpan.contentEditable = 'false'; // No editable
        mentionSpan.textContent = `${this.currentTrigger}${item.label || item.name}`;

        // Agregar tooltip
        mentionSpan.title = `Mención de ${this.currentTrigger === '@' ? 'personaje' : 'ubicación'}: ${item.label || item.name} (metadata, no aparece en el libro)`;

        // Insertar el span
        range.insertNode(mentionSpan);

        // Agregar espacio después
        const space = document.createTextNode(' ');
        range.setStartAfter(mentionSpan);
        range.insertNode(space);

        // Mover cursor después del espacio
        range.setStartAfter(space);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        this.hideMentionMenu();
        this.editor.focus();

        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    /**
     * Ejecutar comando
     */
    executeCommand(command) {
        // Si hay texto seleccionado, pasar el contexto del texto seleccionado
        if (this.selectedTextForCommand) {
            const selectedText = this.selectedTextForCommand;

            // Restaurar la selección original
            this.restoreSelection();

            // Ejecutar el comando con el texto seleccionado
            if (command.action && typeof command.action === 'function') {
                command.action(selectedText);
            }

            // Limpiar estado
            this.selectedTextForCommand = null;
            this.savedSelection = null;
            this.savedRange = null;

            this.hideCommandMenu();
            this.editor.focus();

            if (this.onContentChange) {
                this.onContentChange(this.getContent());
            }
            return;
        }

        // Comportamiento normal sin texto seleccionado
        const currentText = this.editor.innerText;
        const beforeTrigger = currentText.substring(0, this.triggerPosition);
        const afterCursor = currentText.substring(this.getCaretPosition());

        // Si el comando tiene un template, insertarlo
        if (command.template) {
            const newText = beforeTrigger + command.template + afterCursor;
            this.editor.innerText = newText;

            const newCursorPos = beforeTrigger.length + command.template.length;
            this.setCursorPosition(newCursorPos);
        }
        // Si el comando tiene una acción, ejecutarla
        else if (command.action) {
            // Remover el comando del texto
            this.editor.innerText = beforeTrigger + afterCursor;
            this.setCursorPosition(beforeTrigger.length);

            // Ejecutar callback si existe
            if (typeof command.action === 'function') {
                command.action();
            }
        }

        this.hideCommandMenu();
        this.editor.focus();

        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    /**
     * Establecer posición del cursor
     */
    setCursorPosition(position) {
        const textNode = this.editor.childNodes[0];
        if (!textNode) return;

        const range = document.createRange();
        const sel = window.getSelection();

        const pos = Math.min(position, textNode.length);
        range.setStart(textNode, pos);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    /**
     * Ocultar menú de menciones
     */
    hideMentionMenu() {
        if (this.mentionMenu) {
            this.mentionMenu.remove();
            this.mentionMenu = null;
        }
        this.showMentionMenu = false;
    }

    /**
     * Ocultar menú de comandos
     */
    hideCommandMenu() {
        if (this.commandMenu) {
            this.commandMenu.remove();
            this.commandMenu = null;
        }
        this.showCommandMenu = false;
    }

    /**
     * Ocultar todos los menús
     */
    hideAllMenus() {
        this.hideMentionMenu();
        this.hideCommandMenu();
        this.selectedTextForCommand = null;
    }

    /**
     * Obtener comandos por defecto
     */
    getDefaultCommands() {
        return [
            {
                id: 'idea',
                label: '/idea',
                description: 'Marcar una idea o TODO',
                icon: '💡',
                template: '💡 IDEA: '
            },
            {
                id: 'dialogue',
                label: '/dialogo',
                description: 'Formato de diálogo',
                icon: '💬',
                template: '— '
            },
            {
                id: 'divider',
                label: '/separador',
                description: 'Insertar separador de escena',
                icon: '—',
                template: '\n\n***\n\n'
            },
            {
                id: 'comment',
                label: '/comentario',
                description: 'Agregar comentario',
                icon: '📝',
                action: () => {
                    console.log('Abrir modal de comentario');
                }
            }
        ];
    }

    /**
     * Métodos públicos
     */

    getContent() {
        return this.editor ? this.editor.innerText : '';
    }

    getHTML() {
        return this.editor ? this.editor.innerHTML : '';
    }

    setContent(content) {
        if (this.editor) {
            this.editor.innerText = content;
        }
    }

    setHTML(html) {
        if (this.editor) {
            this.editor.innerHTML = html;
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    setMentionData(data) {
        this.mentionData = data;
    }

    setCommandData(data) {
        this.commandData = data;
    }

    /**
     * Métodos de formato de texto
     */
    undo() {
        document.execCommand('undo', false, null);
        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    redo() {
        document.execCommand('redo', false, null);
        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    toggleBold() {
        document.execCommand('bold', false, null);
        this.editor.focus();
        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    toggleItalic() {
        document.execCommand('italic', false, null);
        this.editor.focus();
        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    toggleUnderline() {
        document.execCommand('underline', false, null);
        this.editor.focus();
        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    formatText(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
        if (this.onContentChange) {
            this.onContentChange(this.getContent());
        }
    }

    destroy() {
        this.hideAllMenus();
        if (this.editor) {
            this.editor.remove();
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.RichEditor = RichEditor;
}

// Soporte para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RichEditor;
}
