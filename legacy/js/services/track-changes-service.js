/**
 * Track Changes Service
 * Servicio para gestionar el seguimiento de cambios en el editor
 * Permite marcar texto generado por IA, tachar reemplazos, y gestionar modos de edición
 */

window.trackChangesService = {
    // ============================================
    // ESTADO
    // ============================================

    editMode: false, // Modo edición activo/inactivo (false = readonly)
    showColors: true, // Mostrar colores temporalmente (no se guarda)
    changesByChapter: {}, // Registro de cambios POR CAPÍTULO: { 'chapterId': [...] }
    currentChapterId: null, // ID del capítulo actualmente editándose
    changeIdCounter: 0,

    /**
     * Inicializar el servicio
     */
    init() {
        console.log('🔍 Track Changes Service initialized');

        // Por defecto, modo NO edición (readonly)
        this.editMode = false;

        // Mostrar colores por defecto
        this.showColors = true;

        // Cargar cambios guardados por capítulo
        const savedChanges = localStorage.getItem('track_changes_by_chapter');
        if (savedChanges) {
            try {
                this.changesByChapter = JSON.parse(savedChanges);
                // Encontrar el changeId más alto entre todos los capítulos
                let maxId = 0;
                Object.values(this.changesByChapter).forEach(chapterChanges => {
                    const chapterMaxId = Math.max(...chapterChanges.map(c => c.id), 0);
                    if (chapterMaxId > maxId) maxId = chapterMaxId;
                });
                this.changeIdCounter = maxId + 1;
            } catch (e) {
                console.error('Error loading saved changes:', e);
                this.changesByChapter = {};
            }
        }

        // Migrar cambios antiguos del formato legacy si existen
        this.migrateLegacyChanges();

        // Escuchar cambios del usuario cuando está en modo edición
        this.setupUserInputTracking();
    },

    /**
     * Migrar cambios del formato antiguo (array global) al nuevo (por capítulo)
     */
    migrateLegacyChanges() {
        const legacyChanges = localStorage.getItem('track_changes_list');
        if (legacyChanges) {
            try {
                const changes = JSON.parse(legacyChanges);
                if (Array.isArray(changes) && changes.length > 0) {
                    console.log('🔄 Migrando cambios del formato legacy...');
                    // Asignar todos los cambios legacy a un capítulo "unknown"
                    // o intentar inferir el capítulo si tienen metadata
                    const unknownChapterId = 'legacy-unknown';
                    this.changesByChapter[unknownChapterId] = changes;
                    this.saveChanges();
                    // Eliminar el formato antiguo
                    localStorage.removeItem('track_changes_list');
                    console.log('✅ Cambios migrados al nuevo formato');
                }
            } catch (e) {
                console.error('Error migrando cambios legacy:', e);
            }
        }
    },

    /**
     * Establecer el capítulo actualmente en edición
     */
    setCurrentChapter(chapterId) {
        this.currentChapterId = chapterId;
        console.log(`📖 Capítulo actual establecido: ${chapterId}`);
        // Asegurar que existe el array de cambios para este capítulo
        if (!this.changesByChapter[chapterId]) {
            this.changesByChapter[chapterId] = [];
        }
    },

    /**
     * Obtener cambios del capítulo actual
     */
    getCurrentChapterChanges() {
        if (!this.currentChapterId) return [];
        return this.changesByChapter[this.currentChapterId] || [];
    },

    /**
     * Guardar cambios en localStorage
     */
    saveChanges() {
        try {
            localStorage.setItem('track_changes_by_chapter', JSON.stringify(this.changesByChapter));
        } catch (e) {
            console.error('Error guardando cambios:', e);
        }
    },

    /**
     * Toggle del modo edición
     */
    toggleEditMode(editorElement) {
        this.editMode = !this.editMode;

        // Actualizar contenteditable del editor
        if (editorElement) {
            editorElement.contentEditable = this.editMode;

            if (this.editMode) {
                editorElement.classList.add('edit-mode-active');
                editorElement.classList.remove('readonly-mode');
            } else {
                editorElement.classList.remove('edit-mode-active');
                editorElement.classList.add('readonly-mode');
            }
        }

        console.log(`✏️ Modo Edición: ${this.editMode ? 'ACTIVO' : 'READONLY'}`);
        return this.editMode;
    },

    /**
     * Verificar si está en modo edición
     */
    isEditMode() {
        return this.editMode;
    },

    /**
     * Toggle para mostrar/ocultar colores temporalmente
     */
    toggleShowColors(editorElement) {
        this.showColors = !this.showColors;

        if (editorElement) {
            if (this.showColors) {
                editorElement.classList.remove('hide-track-colors');
            } else {
                editorElement.classList.add('hide-track-colors');
            }
        }

        console.log(`🎨 Mostrar colores: ${this.showColors ? 'SÍ' : 'NO (temporal)'}`);
        return this.showColors;
    },

    // ============================================
    // RASTREAR CAMBIOS DEL USUARIO
    // ============================================

    /**
     * Configurar rastreo de input del usuario
     */
    setupUserInputTracking() {
        // Variable para guardar el último texto antes de editar
        let beforeText = '';

        // Escuchar evento beforeinput para interceptar cambios del usuario
        document.addEventListener('beforeinput', (e) => {
            // Solo trackear si está en modo edición
            if (!this.editMode) return;

            const target = e.target;
            // Verificar que sea el editor
            if (!target || !target.classList.contains('rich-editor-content')) return;

            const inputType = e.inputType;

            // INSERCIÓN DE TEXTO: permitir inserción y envolver después
            if (inputType === 'insertText' || inputType === 'insertFromPaste') {
                // Guardar posición del cursor antes
                const sel = window.getSelection();
                if (sel.rangeCount) {
                    this.lastCursorPosition = sel.getRangeAt(0).cloneRange();
                }

                // Permitir que el texto se inserte normalmente
                // Luego envolverlo en el evento 'input'
            }
            // ELIMINACIÓN DE TEXTO: convertir a tachado
            else if (inputType.startsWith('delete')) {
                e.preventDefault(); // Prevenir eliminación normal
                this.handleUserDeletion(target);
            }
        });

        // Escuchar evento input para envolver texto insertado
        document.addEventListener('input', (e) => {
            // Solo trackear si está en modo edición
            if (!this.editMode) return;

            const target = e.target;
            // Verificar que sea el editor
            if (!target || !target.classList.contains('rich-editor-content')) return;

            // Solo procesar si es inserción de texto
            if (e.inputType === 'insertText' || e.inputType === 'insertFromPaste') {
                // Pequeño delay para asegurar que el texto esté en el DOM
                setTimeout(() => {
                    this.wrapLastInsertedText(target, e.data);
                }, 0);
            }
        });

        console.log('📝 User input tracking configurado');
    },

    /**
     * Envolver el último texto insertado por el usuario
     */
    wrapLastInsertedText(editorElement, insertedData) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const cursorNode = range.startContainer;

        // Si el cursor está dentro de un text node
        if (cursorNode.nodeType === Node.TEXT_NODE) {
            const parentNode = cursorNode.parentNode;

            // Si el parent ya es un span marcado de usuario o IA, permitir escritura pero no re-marcar
            if (parentNode.classList &&
                (parentNode.classList.contains('user-edited-text') ||
                 parentNode.classList.contains('ai-generated-text'))) {
                // Ya está marcado, no hacer nada
                return;
            }

            // Si el parent es el editor o un elemento no marcado
            const cursorOffset = range.startOffset;
            const fullText = cursorNode.textContent;

            // Solo envolver si hay texto insertado
            if (!insertedData || !fullText) return;

            // Dividir el text node en tres partes: antes, nuevo, después
            const beforeText = fullText.substring(0, cursorOffset - insertedData.length);
            const newText = insertedData;
            const afterText = fullText.substring(cursorOffset);

            // Limpiar el nodo original
            const fragment = document.createDocumentFragment();

            // Parte 1: texto antes (si existe)
            if (beforeText) {
                fragment.appendChild(document.createTextNode(beforeText));
            }

            // Parte 2: nuevo texto en verde
            const span = document.createElement('span');
            span.className = 'user-edited-text just-inserted';
            span.textContent = newText;
            span.dataset.userEdited = 'true';
            span.dataset.timestamp = new Date().toISOString();
            fragment.appendChild(span);

            // Parte 3: texto después (si existe)
            let afterNode = null;
            if (afterText) {
                afterNode = document.createTextNode(afterText);
                fragment.appendChild(afterNode);
            }

            // Reemplazar el text node original con el fragmento
            parentNode.replaceChild(fragment, cursorNode);

            // Restaurar cursor después del span verde
            const newRange = document.createRange();
            if (afterNode) {
                newRange.setStart(afterNode, 0);
            } else {
                newRange.setStartAfter(span);
            }
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);

            // Registrar cambio
            this.registerChange({
                type: 'user-insert',
                text: newText,
                timestamp: new Date().toISOString()
            });

            // Remover animación
            setTimeout(() => {
                span.classList.remove('just-inserted');
            }, 1500);

            console.log('✅ User text wrapped in green:', newText);
        }
    },

    /**
     * Fusionar spans tachados consecutivos en el editor
     */
    mergeConsecutiveDeletedSpans(editorElement) {
        if (!editorElement) return;

        const deletedSpans = editorElement.querySelectorAll('.ai-deleted-text');

        deletedSpans.forEach(span => {
            // Buscar el siguiente sibling que sea también un span tachado
            let nextSibling = span.nextSibling;

            // Saltar text nodes vacíos o con solo espacios
            while (nextSibling &&
                   nextSibling.nodeType === Node.TEXT_NODE &&
                   !nextSibling.textContent.trim()) {
                nextSibling = nextSibling.nextSibling;
            }

            // Si el siguiente es también un span tachado, fusionarlos
            if (nextSibling &&
                nextSibling.nodeType === Node.ELEMENT_NODE &&
                nextSibling.classList?.contains('ai-deleted-text')) {

                // Fusionar el contenido
                span.textContent += nextSibling.textContent;

                // Mantener la animación si alguno la tiene
                if (nextSibling.classList.contains('just-deleted')) {
                    span.classList.add('just-deleted');
                }

                // Eliminar el siguiente span
                nextSibling.remove();

                console.log('🔗 Fusionados spans tachados consecutivos');
            }
        });
    },

    /**
     * Manejar eliminación del usuario: convertir texto a tachado
     */
    handleUserDeletion(editorElement) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        let range = sel.getRangeAt(0).cloneRange();

        // Si hay selección, tachar el texto seleccionado
        if (!range.collapsed) {
            const selectedText = range.toString();
            if (!selectedText) return;

            // Crear span tachado
            const deletedSpan = document.createElement('span');
            deletedSpan.className = 'ai-deleted-text just-deleted';
            deletedSpan.textContent = selectedText;
            deletedSpan.dataset.deleted = 'true';
            deletedSpan.dataset.deletedBy = 'user';
            deletedSpan.dataset.timestamp = new Date().toISOString();

            // Reemplazar selección con span tachado
            range.deleteContents();
            range.insertNode(deletedSpan);

            // Mover cursor ANTES del span (para poder seguir borrando)
            range.setStartBefore(deletedSpan);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            // Registrar cambio
            this.registerChange({
                type: 'user-delete',
                text: selectedText,
                timestamp: new Date().toISOString()
            });

            // Remover animación
            setTimeout(() => {
                deletedSpan.classList.remove('just-deleted');
            }, 1500);

            // Fusionar spans consecutivos
            this.mergeConsecutiveDeletedSpans(editorElement);

            console.log('✅ User deletion marked as strikethrough:', selectedText.substring(0, 20));
            return;
        }

        // Si no hay selección, eliminar un carácter
        const isBackspace = window.event?.inputType === 'deleteContentBackward';

        // Intentar expandir el range para seleccionar un carácter
        try {
            if (isBackspace) {
                // Backspace: extender hacia atrás
                sel.modify('extend', 'backward', 'character');
            } else {
                // Delete: extender hacia adelante
                sel.modify('extend', 'forward', 'character');
            }

            // Obtener el nuevo range después de extender
            if (sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
                const charToDelete = range.toString();

                if (!charToDelete) {
                    console.log('⚠️ No hay texto para eliminar');
                    return;
                }

                // Buscar span tachado adyacente de forma más robusta
                let existingDeletedSpan = null;
                const cursorNode = range.startContainer;

                if (isBackspace) {
                    // Backspace: buscar span tachado justo antes del cursor
                    // Primero intentar con previousSibling directo
                    let node = cursorNode.previousSibling;

                    // Si cursorNode es un text node, buscar en el parent
                    if (!node && cursorNode.nodeType === Node.TEXT_NODE) {
                        const parent = cursorNode.parentNode;
                        if (parent) {
                            node = parent.previousSibling;
                        }
                    }

                    // Verificar si el nodo encontrado es un span tachado
                    if (node &&
                        node.nodeType === Node.ELEMENT_NODE &&
                        node.classList?.contains('ai-deleted-text')) {
                        existingDeletedSpan = node;
                    }
                } else {
                    // Delete: buscar span tachado justo después del cursor
                    let node = cursorNode.nextSibling;

                    // Si cursorNode es un text node, buscar en el parent
                    if (!node && cursorNode.nodeType === Node.TEXT_NODE) {
                        const parent = cursorNode.parentNode;
                        if (parent) {
                            node = parent.nextSibling;
                        }
                    }

                    // Verificar si el nodo encontrado es un span tachado
                    if (node &&
                        node.nodeType === Node.ELEMENT_NODE &&
                        node.classList?.contains('ai-deleted-text')) {
                        existingDeletedSpan = node;
                    }
                }

                // Si hay un span tachado adyacente, agregar a ese span
                if (existingDeletedSpan) {
                    range.deleteContents();

                    if (isBackspace) {
                        // Agregar al final del span existente
                        existingDeletedSpan.textContent += charToDelete;
                    } else {
                        // Agregar al inicio del span existente
                        existingDeletedSpan.textContent = charToDelete + existingDeletedSpan.textContent;
                    }

                    // Agregar animación temporal
                    existingDeletedSpan.classList.add('just-deleted');
                    setTimeout(() => {
                        existingDeletedSpan.classList.remove('just-deleted');
                    }, 1500);

                    // Mover cursor ANTES del span
                    const newRange = document.createRange();
                    newRange.setStartBefore(existingDeletedSpan);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);

                    console.log('✅ Character added to existing strikethrough span:', charToDelete);
                } else {
                    // No hay span adyacente, crear uno nuevo
                    const deletedSpan = document.createElement('span');
                    deletedSpan.className = 'ai-deleted-text just-deleted';
                    deletedSpan.textContent = charToDelete;
                    deletedSpan.dataset.deleted = 'true';
                    deletedSpan.dataset.deletedBy = 'user';
                    deletedSpan.dataset.timestamp = new Date().toISOString();

                    // Reemplazar con span tachado
                    range.deleteContents();
                    range.insertNode(deletedSpan);

                    // Mover cursor ANTES del span (para poder seguir borrando)
                    const newRange = document.createRange();
                    newRange.setStartBefore(deletedSpan);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);

                    // Remover animación
                    setTimeout(() => {
                        deletedSpan.classList.remove('just-deleted');
                    }, 1500);

                    console.log('✅ Character marked as strikethrough:', charToDelete);
                }

                // Registrar cambio
                this.registerChange({
                    type: 'user-delete-char',
                    text: charToDelete,
                    timestamp: new Date().toISOString()
                });

                // Fusionar spans consecutivos después de eliminar
                setTimeout(() => {
                    this.mergeConsecutiveDeletedSpans(editorElement);
                }, 10);
            }
        } catch (error) {
            console.error('❌ Error en handleUserDeletion:', error);
        }
    },

    /**
     * Envolver texto del usuario con markup especial
     */
    wrapUserText(text, metadata = {}) {
        const span = document.createElement('span');
        span.className = 'user-edited-text just-inserted';
        span.textContent = text;

        // Agregar metadata
        span.dataset.userEdited = 'true';
        span.dataset.timestamp = new Date().toISOString();

        // Registrar cambio
        const changeId = this.registerChange({
            type: 'user-edit',
            text: text,
            metadata: metadata,
            timestamp: new Date().toISOString()
        });
        span.dataset.changeId = changeId;

        // Remover animación
        setTimeout(() => {
            span.classList.remove('just-inserted');
        }, 1500);

        return span;
    },

    // ============================================
    // MARCAR TEXTO GENERADO POR IA
    // ============================================

    /**
     * Envuelve el texto generado por IA con markup especial
     * @param {string} text - Texto generado por la IA
     * @param {Object} metadata - Información adicional (proveedor, modelo, etc)
     * @returns {HTMLElement} - Elemento span con el texto marcado
     */
    wrapAIGeneratedText(text, metadata = {}) {
        const span = document.createElement('span');
        span.className = 'ai-generated-text just-inserted';
        span.textContent = text;

        // Agregar metadata como atributos data-*
        span.dataset.aiGenerated = 'true';
        span.dataset.timestamp = new Date().toISOString();

        if (metadata.provider) {
            span.dataset.provider = metadata.provider;
        }
        if (metadata.model) {
            span.dataset.model = metadata.model;
        }
        if (metadata.mode) {
            span.dataset.mode = metadata.mode;
        }

        // Registrar cambio
        const changeId = this.registerChange({
            type: 'insert',
            text: text,
            metadata: metadata,
            timestamp: new Date().toISOString()
        });
        span.dataset.changeId = changeId;

        // Remover clase de animación después de la animación
        setTimeout(() => {
            span.classList.remove('just-inserted');
        }, 1500);

        return span;
    },

    /**
     * Inserta texto generado por IA en el editor (en la posición del cursor)
     * @param {HTMLElement} editorElement - Elemento del editor
     * @param {string} text - Texto a insertar
     * @param {Object} metadata - Metadata del texto
     */
    insertAIText(editorElement, text, metadata = {}) {
        if (!editorElement) return;

        // Focus en el editor
        editorElement.focus();

        // Obtener selección
        const sel = window.getSelection();
        let range;

        // Verificar si hay una selección dentro del editor
        if (sel.rangeCount > 0) {
            range = sel.getRangeAt(0);
            // Verificar que el range esté dentro del editor
            if (!editorElement.contains(range.commonAncestorContainer)) {
                // Si no, crear range al final
                range = document.createRange();
                range.selectNodeContents(editorElement);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            // No hay selección, crear al final
            range = document.createRange();
            range.selectNodeContents(editorElement);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        // Crear el elemento marcado
        const aiTextElement = this.wrapAIGeneratedText(text, metadata);

        // Agregar saltos de línea antes del texto
        const lineBreakBefore = document.createTextNode('\n\n');
        range.insertNode(lineBreakBefore);
        range.setStartAfter(lineBreakBefore);

        // Insertar el elemento de IA
        range.insertNode(aiTextElement);
        range.setStartAfter(aiTextElement);

        // Agregar salto de línea después
        const lineBreakAfter = document.createTextNode('\n');
        range.insertNode(lineBreakAfter);
        range.setStartAfter(lineBreakAfter);

        // Mover cursor al final del texto insertado
        sel.removeAllRanges();
        sel.addRange(range);

        // Hacer scroll al elemento insertado
        aiTextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        console.log('✅ AI Text inserted with tracking');
    },

    // ============================================
    // REEMPLAZAR TEXTO (TACHAR Y MOSTRAR NUEVO)
    // ============================================

    /**
     * Reemplaza texto seleccionado con nuevo texto, manteniendo el original tachado
     * @param {HTMLElement} editorElement - Elemento del editor
     * @param {string} newText - Nuevo texto que reemplaza al anterior
     * @param {Object} metadata - Metadata del cambio
     * @returns {boolean} - True si se realizó el reemplazo
     */
    replaceSelectedText(editorElement, newText, metadata = {}) {
        if (!editorElement) return false;

        const sel = window.getSelection();
        if (!sel.rangeCount || sel.isCollapsed) {
            console.warn('⚠️ No hay texto seleccionado para reemplazar');
            return false;
        }

        const range = sel.getRangeAt(0);
        const selectedText = range.toString();

        // Crear grupo de cambio
        const changeGroup = document.createElement('span');
        changeGroup.className = 'ai-change-group';

        // Texto eliminado (tachado)
        const deletedSpan = document.createElement('span');
        deletedSpan.className = 'ai-deleted-text';
        deletedSpan.textContent = selectedText;
        deletedSpan.dataset.deleted = 'true';
        deletedSpan.dataset.timestamp = new Date().toISOString();

        // Texto insertado (nuevo)
        const insertedSpan = document.createElement('span');
        insertedSpan.className = 'ai-inserted-text just-inserted';
        insertedSpan.textContent = newText;
        insertedSpan.dataset.inserted = 'true';
        insertedSpan.dataset.timestamp = new Date().toISOString();

        if (metadata.provider) {
            insertedSpan.dataset.provider = metadata.provider;
        }
        if (metadata.model) {
            insertedSpan.dataset.model = metadata.model;
        }

        // Registrar cambio
        const changeId = this.registerChange({
            type: 'replace',
            oldText: selectedText,
            newText: newText,
            metadata: metadata,
            timestamp: new Date().toISOString()
        });
        changeGroup.dataset.changeId = changeId;

        // Agregar info tooltip (opcional)
        const infoTooltip = document.createElement('span');
        infoTooltip.className = 'ai-change-info';
        infoTooltip.textContent = `IA: "${selectedText}" → "${newText}"`;
        changeGroup.appendChild(infoTooltip);

        // Agregar botones de acción
        const actions = this.createChangeActions(changeId, changeGroup);

        // Ensamblar grupo
        changeGroup.appendChild(deletedSpan);
        changeGroup.appendChild(document.createTextNode(' '));
        changeGroup.appendChild(insertedSpan);
        changeGroup.appendChild(actions);

        // Reemplazar el texto seleccionado con el grupo
        range.deleteContents();
        range.insertNode(changeGroup);

        // Mover cursor al final
        range.setStartAfter(changeGroup);
        range.setEndAfter(changeGroup);
        sel.removeAllRanges();
        sel.addRange(range);

        // Remover clase de animación
        setTimeout(() => {
            insertedSpan.classList.remove('just-inserted');
        }, 1500);

        console.log('✅ Text replaced with tracking');
        return true;
    },

    /**
     * Crear botones de acción para un cambio (aceptar/rechazar)
     */
    createChangeActions(changeId, changeGroup) {
        const actionsContainer = document.createElement('span');
        actionsContainer.className = 'ai-change-actions';

        // Botón aceptar
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'ai-change-action-btn ai-change-action-accept';
        acceptBtn.innerHTML = '✓';
        acceptBtn.title = 'Aceptar cambio';
        acceptBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.acceptChange(changeId, changeGroup);
        };

        // Botón rechazar
        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'ai-change-action-btn ai-change-action-reject';
        rejectBtn.innerHTML = '✕';
        rejectBtn.title = 'Rechazar cambio';
        rejectBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.rejectChange(changeId, changeGroup);
        };

        actionsContainer.appendChild(acceptBtn);
        actionsContainer.appendChild(rejectBtn);

        return actionsContainer;
    },

    /**
     * Aceptar un cambio individual
     */
    acceptChange(changeId, changeGroup) {
        if (!changeGroup) return;

        // Obtener texto insertado
        const insertedSpan = changeGroup.querySelector('.ai-inserted-text');
        if (!insertedSpan) return;

        const text = insertedSpan.textContent;

        // Reemplazar el grupo completo con solo el texto nuevo
        const textNode = document.createTextNode(text);
        changeGroup.parentNode.replaceChild(textNode, changeGroup);

        // Marcar como aceptado en el registro
        const changes = this.getCurrentChapterChanges();
        const change = changes.find(c => c.id === parseInt(changeId));
        if (change) {
            change.accepted = true;
            change.acceptedAt = new Date().toISOString();
            this.saveChanges();
        }

        console.log('✅ Change accepted:', changeId);
    },

    /**
     * Rechazar un cambio individual
     */
    rejectChange(changeId, changeGroup) {
        if (!changeGroup) return;

        // Obtener texto original (eliminado)
        const deletedSpan = changeGroup.querySelector('.ai-deleted-text');
        if (!deletedSpan) return;

        const text = deletedSpan.textContent;

        // Reemplazar el grupo completo con el texto original
        const textNode = document.createTextNode(text);
        changeGroup.parentNode.replaceChild(textNode, changeGroup);

        // Marcar como rechazado en el registro
        const changes = this.getCurrentChapterChanges();
        const change = changes.find(c => c.id === parseInt(changeId));
        if (change) {
            change.rejected = true;
            change.rejectedAt = new Date().toISOString();
            this.saveChanges();
        }

        console.log('❌ Change rejected:', changeId);
    },

    // ============================================
    // GESTIÓN DE CAMBIOS GLOBALES
    // ============================================

    /**
     * Registrar un cambio en el historial
     */
    registerChange(change) {
        if (!this.currentChapterId) {
            console.warn('⚠️ No hay capítulo actual establecido, no se puede registrar cambio');
            return;
        }
        const id = this.changeIdCounter++;
        if (!this.changesByChapter[this.currentChapterId]) {
            this.changesByChapter[this.currentChapterId] = [];
        }
        this.changesByChapter[this.currentChapterId].push({
            id: id,
            chapterId: this.currentChapterId, // Guardar referencia al capítulo
            ...change,
            accepted: false,
            rejected: false
        });

        // Guardar en localStorage
        this.saveChanges();

        return id;
    },

    /**
     * Obtener todos los cambios pendientes del capítulo actual
     */
    getPendingChanges() {
        const changes = this.getCurrentChapterChanges();
        return changes.filter(c => !c.accepted && !c.rejected);
    },

    /**
     * Contar cambios pendientes
     */
    countPendingChanges(editorElement) {
        if (!editorElement) return 0;

        const userTexts = editorElement.querySelectorAll('.user-edited-text:not([data-accepted])');
        const aiTexts = editorElement.querySelectorAll('.ai-generated-text:not([data-accepted])');
        const deletedTexts = editorElement.querySelectorAll('.ai-deleted-text:not(.ai-change-group .ai-deleted-text):not([data-accepted])');
        const changeGroups = editorElement.querySelectorAll('.ai-change-group:not([data-accepted])');

        return userTexts.length + aiTexts.length + deletedTexts.length + changeGroups.length;
    },

    /**
     * Aceptar todos los cambios en el editor
     */
    acceptAllChanges(editorElement) {
        if (!editorElement) return;

        let count = 0;

        // Aceptar todos los textos del usuario (remover markup, dejar texto)
        const userTexts = editorElement.querySelectorAll('.user-edited-text');
        userTexts.forEach(span => {
            const text = span.textContent;
            const textNode = document.createTextNode(text);
            span.parentNode.replaceChild(textNode, span);
            count++;
        });

        // Aceptar todos los textos generados por IA (remover markup, dejar texto)
        const aiTexts = editorElement.querySelectorAll('.ai-generated-text');
        aiTexts.forEach(span => {
            const text = span.textContent;
            const textNode = document.createTextNode(text);
            span.parentNode.replaceChild(textNode, span);
            count++;
        });

        // Aceptar todos los textos eliminados (removerlos completamente)
        const deletedTexts = editorElement.querySelectorAll('.ai-deleted-text:not(.ai-change-group .ai-deleted-text)');
        deletedTexts.forEach(span => {
            span.remove(); // Eliminar completamente el texto tachado
            count++;
        });

        // Aceptar todos los reemplazos (mantener solo texto nuevo, eliminar tachado)
        const changeGroups = editorElement.querySelectorAll('.ai-change-group');
        changeGroups.forEach(group => {
            const insertedSpan = group.querySelector('.ai-inserted-text');
            if (insertedSpan) {
                const text = insertedSpan.textContent;
                const textNode = document.createTextNode(text);
                group.parentNode.replaceChild(textNode, group);
                count++;
            }
        });

        // Marcar todos como aceptados en el capítulo actual
        const changes = this.getCurrentChapterChanges();
        changes.forEach(change => {
            if (!change.accepted && !change.rejected) {
                change.accepted = true;
                change.acceptedAt = new Date().toISOString();
            }
        });

        this.saveChanges();

        console.log(`✅ Accepted ${count} changes`);
        return count;
    },

    /**
     * Rechazar todos los cambios en el editor
     */
    rejectAllChanges(editorElement) {
        if (!editorElement) return;

        let count = 0;

        // Rechazar todos los textos del usuario (eliminarlos)
        const userTexts = editorElement.querySelectorAll('.user-edited-text');
        userTexts.forEach(span => {
            span.remove();
            count++;
        });

        // Rechazar todos los textos generados por IA (eliminarlos)
        const aiTexts = editorElement.querySelectorAll('.ai-generated-text');
        aiTexts.forEach(span => {
            span.remove();
            count++;
        });

        // Rechazar todas las eliminaciones (restaurar texto tachado)
        const deletedTexts = editorElement.querySelectorAll('.ai-deleted-text:not(.ai-change-group .ai-deleted-text)');
        deletedTexts.forEach(span => {
            const text = span.textContent;
            const textNode = document.createTextNode(text);
            span.parentNode.replaceChild(textNode, span);
            count++;
        });

        // Rechazar todos los reemplazos (mantener solo texto original)
        const changeGroups = editorElement.querySelectorAll('.ai-change-group');
        changeGroups.forEach(group => {
            const deletedSpan = group.querySelector('.ai-deleted-text');
            if (deletedSpan) {
                const text = deletedSpan.textContent;
                const textNode = document.createTextNode(text);
                group.parentNode.replaceChild(textNode, group);
                count++;
            }
        });

        // Marcar todos como rechazados en el capítulo actual
        const changes = this.getCurrentChapterChanges();
        changes.forEach(change => {
            if (!change.accepted && !change.rejected) {
                change.rejected = true;
                change.rejectedAt = new Date().toISOString();
            }
        });

        this.saveChanges();

        console.log(`❌ Rejected ${count} changes`);
        return count;
    },

    /**
     * Limpiar el historial de cambios del capítulo actual
     */
    clearChanges() {
        if (this.currentChapterId) {
            this.changesByChapter[this.currentChapterId] = [];
            this.saveChanges();
            console.log(`🗑️ Changes history cleared for chapter ${this.currentChapterId}`);
        }
    },

    /**
     * Limpiar el historial de cambios de TODOS los capítulos (usar con cuidado)
     */
    clearAllChanges() {
        this.changesByChapter = {};
        this.changeIdCounter = 0;
        this.saveChanges();
        console.log('🗑️ All changes history cleared');
    },

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Obtener estadísticas de cambios del capítulo actual
     */
    getStats(editorElement) {
        const pending = this.countPendingChanges(editorElement);
        const changes = this.getCurrentChapterChanges();
        const accepted = changes.filter(c => c.accepted).length;
        const rejected = changes.filter(c => c.rejected).length;
        const total = changes.length;

        return {
            pending,
            accepted,
            rejected,
            total
        };
    },

    /**
     * Obtener estadísticas globales de todos los capítulos
     */
    getGlobalStats() {
        let totalAccepted = 0;
        let totalRejected = 0;
        let totalPending = 0;
        let totalChanges = 0;

        Object.values(this.changesByChapter).forEach(chapterChanges => {
            chapterChanges.forEach(change => {
                totalChanges++;
                if (change.accepted) totalAccepted++;
                else if (change.rejected) totalRejected++;
                else totalPending++;
            });
        });

        return {
            pending: totalPending,
            accepted: totalAccepted,
            rejected: totalRejected,
            total: totalChanges,
            chapters: Object.keys(this.changesByChapter).length
        };
    },

    /**
     * Exportar cambios del capítulo actual como JSON
     */
    exportChanges() {
        const changes = this.getCurrentChapterChanges();
        return JSON.stringify(changes, null, 2);
    },

    /**
     * Exportar cambios de todos los capítulos como JSON
     */
    exportAllChanges() {
        return JSON.stringify(this.changesByChapter, null, 2);
    },

    /**
     * Importar cambios desde JSON (para el capítulo actual)
     */
    importChanges(jsonString) {
        try {
            const changes = JSON.parse(jsonString);
            if (!this.currentChapterId) {
                console.warn('⚠️ No hay capítulo actual establecido');
                return false;
            }
            this.changesByChapter[this.currentChapterId] = changes;
            this.saveChanges();
            return true;
        } catch (e) {
            console.error('Error importing changes:', e);
            return false;
        }
    }
};

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.trackChangesService.init();
}
