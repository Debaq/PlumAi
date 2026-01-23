/**
 * Track Changes UI Component
 * Componente Alpine.js para controlar el modo de track changes
 */

window.trackChangesUI = function() {
    return {
        // Estado
        editMode: false,
        showColors: true,
        pendingCount: 0,
        updateInterval: null,

        /**
         * Inicializar componente
         */
        init() {
            // Cargar estado inicial del servicio
            if (window.trackChangesService) {
                this.editMode = window.trackChangesService.isEditMode();
                this.showColors = window.trackChangesService.showColors;
            }

            // Aplicar modo readonly con un pequeño delay para asegurar que el editor esté inicializado
            this.applyReadonlyMode();

            // Actualizar contador cada segundo
            this.updatePendingCount();
            this.updateInterval = setInterval(() => {
                this.updatePendingCount();
            }, 1000);
        },

        /**
         * Aplicar modo readonly al editor (con reintentos)
         */
        applyReadonlyMode() {
            let attempts = 0;
            const maxAttempts = 10;

            const tryApply = () => {
                const editorElement = document.querySelector('.rich-editor-content');

                if (editorElement) {
                    // Aplicar readonly si el servicio está en modo no-edición
                    if (!this.editMode) {
                        editorElement.contentEditable = false;
                        editorElement.classList.add('readonly-mode');
                        editorElement.classList.remove('edit-mode-active');
                        console.log('✅ Track Changes UI: Modo readonly aplicado');
                    }
                } else {
                    // Si no existe aún, reintentar
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(tryApply, 200);
                    } else {
                        console.warn('⚠️ Track Changes UI: No se encontró el editor después de múltiples intentos');
                    }
                }
            };

            // Primer intento inmediato
            tryApply();
        },

        /**
         * Destruir componente
         */
        destroy() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        },

        /**
         * Actualizar contador de cambios pendientes
         */
        updatePendingCount() {
            if (!window.trackChangesService) return;

            // Buscar el editor en el DOM
            const editorElement = document.querySelector('.rich-editor-content');
            if (editorElement) {
                this.pendingCount = window.trackChangesService.countPendingChanges(editorElement);
            }
        },

        /**
         * Toggle del modo edición
         */
        toggleEditMode() {
            if (!window.trackChangesService) {
                console.warn('⚠️ Track Changes Service not available');
                return;
            }

            const editorElement = document.querySelector('.rich-editor-content');
            this.editMode = window.trackChangesService.toggleEditMode(editorElement);

            // Notificar al usuario
            if (this.$store && this.$store.ui) {
                if (this.editMode) {
                    this.$store.ui.success(
                        'Modo Edición',
                        'Ahora puedes editar el texto. Tus cambios se marcarán en azul.'
                    );
                } else {
                    this.$store.ui.info(
                        'Modo Readonly',
                        'El editor está bloqueado. Activa el modo edición para modificar el texto.'
                    );
                }
            }

            // Reinicializar iconos de Lucide
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        },

        /**
         * Toggle para mostrar/ocultar colores
         */
        toggleColors() {
            if (!window.trackChangesService) {
                console.warn('⚠️ Track Changes Service not available');
                return;
            }

            const editorElement = document.querySelector('.rich-editor-content');
            this.showColors = window.trackChangesService.toggleShowColors(editorElement);

            // Notificar al usuario
            if (this.$store && this.$store.ui) {
                if (this.showColors) {
                    this.$store.ui.info(
                        'Colores Activados',
                        'Los cambios vuelven a ser visibles con colores'
                    );
                } else {
                    this.$store.ui.info(
                        'Colores Ocultos',
                        'Los colores están ocultos temporalmente. No se guardará esta preferencia.'
                    );
                }
            }

            // Reinicializar iconos de Lucide
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        },

        /**
         * Aceptar todos los cambios Y hacer commit automático
         */
        async acceptAllAndCommit() {
            if (!window.trackChangesService) return;

            const editorElement = document.querySelector('.rich-editor-content');
            if (!editorElement) return;

            // Confirmar con el usuario
            const confirmed = confirm(
                `¿Aceptar todos los ${this.pendingCount} cambios y crear un commit?\n\n` +
                'Esto:\n' +
                '1. Normalizará todos los colores del texto\n' +
                '2. Guardará el capítulo\n' +
                '3. Creará un commit automático en Git'
            );

            if (!confirmed) return;

            // Aceptar cambios
            const count = window.trackChangesService.acceptAllChanges(editorElement);

            // Trigger content change para guardar
            const editorInstance = this.getEditorInstance();
            if (editorInstance && editorInstance.editor && editorInstance.editor.onContentChange) {
                editorInstance.editor.onContentChange(editorInstance.editor.getContent());
            }

            // Esperar un momento para que se guarde
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Crear commit automático
            await this.createAutoCommit(count);

            // Actualizar contador
            this.updatePendingCount();

            // Notificar
            if (this.$store && this.$store.ui) {
                this.$store.ui.success(
                    'Cambios Aceptados y Commiteados',
                    `Se aceptaron ${count} cambios y se creó un commit automático.`
                );
            }
        },

        /**
         * Crear commit automático usando isomorphic-git
         * NOTA: Usa isomorphic-git que es un sistema Git en el navegador.
         * Para integrar con Git real del sistema, configurar git-integration-service.js con un backend.
         */
        async createAutoCommit(changeCount) {
            try {
                // Obtener información del capítulo
                const chapterTitle = this.$store?.ui?.currentEditingChapterId
                    ? this.$store.project.getChapter(this.$store.ui.currentEditingChapterId)?.title
                    : 'Capítulo';

                // Mensaje de commit
                const commitMessage = `Aceptar ${changeCount} cambios en "${chapterTitle}"

Cambios aceptados y normalizados automáticamente.
Fecha: ${new Date().toISOString()}`;

                console.log('🔄 Creando commit en Git (isomorphic-git)...');

                // Verificar si gitService está disponible
                if (!window.gitService) {
                    console.warn('⚠️ gitService no disponible. Usando sistema de version control interno...');
                    if (this.$store && this.$store.versionControl) {
                        await this.$store.versionControl.createCommit(commitMessage);
                        console.log('✅ Commit creado en sistema de version control interno');
                    }
                    return;
                }

                // Guardar el proyecto antes de hacer commit
                if (this.$store && this.$store.project && this.$store.project.autoSave) {
                    await this.$store.project.autoSave();
                    // Esperar un momento para que se complete el guardado
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // Obtener el estado actual del proyecto
                const projectData = this.$store.project.exportProject();

                // Guardar el estado del proyecto en isomorphic-git
                await window.gitService.saveProjectState(projectData, commitMessage);

                // Crear el commit
                const sha = await window.gitService.commit(commitMessage, {
                    name: 'Track Changes',
                    email: 'track-changes@mdnote.local'
                });

                console.log('✅ Commit creado en isomorphic-git:', sha);

                // También crear en el sistema de version control interno para mantener compatibilidad
                if (this.$store && this.$store.versionControl) {
                    await this.$store.versionControl.createCommit(commitMessage);
                }

                // Notificar éxito
                if (this.$store && this.$store.ui) {
                    this.$store.ui.success(
                        'Commit Creado',
                        `Commit ${sha.substring(0, 7)} creado exitosamente en Git.`
                    );
                }

                // Si git-integration-service está disponible Y configurado, también hacer commit en Git real
                if (window.gitIntegrationService && window.gitIntegrationService.isGitAvailable) {
                    try {
                        console.log('🔄 También creando commit en Git real del sistema...');
                        await window.gitIntegrationService.commitAll(commitMessage);
                        console.log('✅ Commit también creado en Git real del sistema');
                    } catch (gitError) {
                        console.warn('⚠️ No se pudo crear commit en Git real:', gitError.message);
                        // No es crítico, ya tenemos el commit en isomorphic-git
                    }
                }

            } catch (error) {
                console.error('❌ Error creando commit automático:', error);
                if (this.$store && this.$store.ui) {
                    this.$store.ui.error(
                        'Error en Commit',
                        `No se pudo crear el commit: ${error.message || error}`
                    );
                }
            }
        },

        /**
         * Rechazar todos los cambios
         */
        rejectAllChanges() {
            if (!window.trackChangesService) return;

            const editorElement = document.querySelector('.rich-editor-content');
            if (!editorElement) return;

            // Confirmar con el usuario
            if (this.$store && this.$store.ui) {
                const confirmed = confirm(
                    `¿Estás seguro de que quieres rechazar todos los ${this.pendingCount} cambios?\n\n` +
                    'Esto eliminará todo el texto generado por la IA y restaurará el texto original.'
                );

                if (!confirmed) return;
            }

            // Rechazar cambios
            const count = window.trackChangesService.rejectAllChanges(editorElement);

            // Trigger content change para guardar
            const editorInstance = this.getEditorInstance();
            if (editorInstance && editorInstance.editor && editorInstance.editor.onContentChange) {
                editorInstance.editor.onContentChange(editorInstance.editor.getContent());
            }

            // Actualizar contador
            this.updatePendingCount();

            // Notificar
            if (this.$store && this.$store.ui) {
                this.$store.ui.success(
                    'Cambios Rechazados',
                    `Se rechazaron ${count} cambios. El texto ha sido restaurado.`
                );
            }
        },

        /**
         * Obtener instancia del editor activo
         */
        getEditorInstance() {
            // Intentar obtener la instancia del editor del contexto global
            if (window.activeChapterEditorInstance) {
                return window.activeChapterEditorInstance;
            }

            // Fallback: buscar en el componente Alpine más cercano
            const editorComponent = document.querySelector('[x-data*="editorAlpineComponent"]');
            if (editorComponent && editorComponent.__x) {
                return editorComponent.__x.$data;
            }

            return null;
        },

        /**
         * Ver estadísticas de cambios
         */
        viewStats() {
            if (!window.trackChangesService) return;

            const editorElement = document.querySelector('.rich-editor-content');
            const stats = window.trackChangesService.getStats(editorElement);

            if (this.$store && this.$store.ui) {
                this.$store.ui.info(
                    'Estadísticas de Cambios',
                    `Pendientes: ${stats.pending}\n` +
                    `Aceptados: ${stats.accepted}\n` +
                    `Rechazados: ${stats.rejected}\n` +
                    `Total: ${stats.total}`
                );
            } else {
                alert(
                    `📊 Estadísticas de Cambios:\n\n` +
                    `Pendientes: ${stats.pending}\n` +
                    `Aceptados: ${stats.accepted}\n` +
                    `Rechazados: ${stats.rejected}\n` +
                    `Total: ${stats.total}`
                );
            }
        },

        /**
         * Limpiar historial de cambios
         */
        clearHistory() {
            if (!window.trackChangesService) return;

            const confirmed = confirm(
                '¿Estás seguro de que quieres limpiar el historial de cambios?\n\n' +
                'Esto no afectará el contenido del editor, solo el registro interno.'
            );

            if (!confirmed) return;

            window.trackChangesService.clearChanges();

            if (this.$store && this.$store.ui) {
                this.$store.ui.success(
                    'Historial Limpiado',
                    'El historial de cambios ha sido eliminado'
                );
            }
        },

        /**
         * Exportar historial de cambios
         */
        exportHistory() {
            if (!window.trackChangesService) return;

            const json = window.trackChangesService.exportChanges();

            // Crear blob y descargar
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `track-changes-history-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (this.$store && this.$store.ui) {
                this.$store.ui.success(
                    'Historial Exportado',
                    'El historial de cambios ha sido descargado como JSON'
                );
            }
        }
    };
};
