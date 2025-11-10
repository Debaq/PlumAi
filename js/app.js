// PlumaAI - Main Application
// Inicialización de Alpine.js y Stores

// Asumimos que los stores y storageManager están disponibles globalmente (cargados en index.html)

document.addEventListener('alpine:init', () => {
    // Hacer los objetos profundamente reactivos primero
    const reactiveI18n = Alpine.reactive(window.i18nStore);
    const reactiveProject = Alpine.reactive(window.projectStore);
    const reactiveUi = Alpine.reactive(window.uiStore);
    const reactiveAi = Alpine.reactive(window.aiStore);
    const reactiveVersionControl = Alpine.reactive(window.versionControlStore);

    // Registrar stores reactivos
    Alpine.store('i18n', reactiveI18n);
    Alpine.store('project', reactiveProject);
    Alpine.store('ui', reactiveUi);
    Alpine.store('ai', reactiveAi);
    Alpine.store('versionControl', reactiveVersionControl);

    // Inicializar sistemas de servicios primero (antes de los stores)
    // Inicializar Version Control primero
    window.versionControl.init();

    // Inicializar Storage Manager
    window.storageManager.init();

    // Inicializar stores que lo requieran (después de los servicios)
    Alpine.store('i18n').init();
    Alpine.store('ui').init();
    Alpine.store('ai').init();
    Alpine.store('versionControl').init();

    // Cargar último proyecto al inicio
    window.storageManager.getProjectsList().then(projects => {
        if (projects.length > 0) {
            // Cargar el proyecto más reciente
            const lastProject = projects[0];
            window.storageManager.load(lastProject.id).then(projectData => {
                if (projectData) {
                    Alpine.store('project').loadProject(projectData);
                    Alpine.store('ui').success(
                        Alpine.store('i18n').t('notifications.success.projectLoaded'),
                        Alpine.store('i18n').t('notifications.success.projectLoadedDesc', { projectName: projectData.projectInfo.title })
                    );
                    // Proyecto cargado exitosamente - no abrir modal de bienvenida
                    // Cerrar el modal de bienvenida si está abierto
                    Alpine.store('ui').closeModal('welcome');
                } else {
                    // Si no hay proyecto cargado, mostrar modal de bienvenida o nuevo proyecto
                    const hasVisited = localStorage.getItem('pluma_has_visited');
                    if (!hasVisited) {
                        Alpine.store('ui').openModal('welcome');
                    } else {
                        Alpine.store('ui').openModal('newProject');
                    }
                }
            }).catch(error => {
                console.error('Error al cargar el proyecto inicial:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('notifications.error.projectLoad'),
                    error.message
                );
                // Mostrar modal de nuevo proyecto si falla la carga
                Alpine.store('ui').openModal('newProject');
            });
        } else {
            // Si no hay proyectos guardados, mostrar modal de bienvenida o nuevo proyecto
            const hasVisited = localStorage.getItem('pluma_has_visited');
            if (!hasVisited) {
                Alpine.store('ui').openModal('welcome');
            } else {
                Alpine.store('ui').openModal('newProject');
            }
        }
    }).catch(error => {
        console.error('Error al obtener la lista de proyectos:', error);
        Alpine.store('ui').error(
            Alpine.store('i18n').t('notifications.error.projectList'),
            error.message
        );
        // Mostrar modal de nuevo proyecto si falla la carga
        Alpine.store('ui').openModal('newProject');
    });

    // Registrar componentes
    Alpine.data('headerComponent', window.headerComponent);
    Alpine.data('sidebarComponent', window.sidebarComponent);
    Alpine.data('mainContentComponent', window.mainContentComponent);
    Alpine.data('versionControlComponent', window.versionControlComponent);
    Alpine.data('publishingComponent', window.publishingComponent);
    Alpine.data('characterInfoModalComponent', window.characterInfoModalComponent);
    Alpine.data('editorAlpineComponent', window.editorAlpineComponent);
    Alpine.data('richEditorComponent', window.richEditorComponent);

    // Registrar componente de vista de control de versiones
    Alpine.data('versionControlView', () => ({
        // Estado
        commits: [],
        stats: {
            totalCommits: 0,
            currentBranch: 'main',
            totalBranches: 0
        },
        loading: false,
        commitMessage: '',
        authorName: '',
        selectedCommit: null,
        diffHtml: '',

        // Nuevos estados
        showCommitModal: false,
        showBranchModal: false,
        newBranchName: '',
        changedFiles: [],
        selectedFile: null,
        selectedFileDiff: '',
        lastProjectState: null,
        hasUncommittedChanges: false,

        // Inicialización
        async init() {
            // Cargar datos primero
            await this.loadCommits();
            await this.loadStats();

            // Crear datos de prueba si no hay commits
            if (this.commits.length === 0) {
                await this.createDemoData();
                // Recargar commits después de crear datos de prueba
                await this.loadCommits();
            }

            // CLAVE: Obtener el estado del ÚLTIMO COMMIT como referencia
            // NO del estado actual del proyecto
            await this.loadLastCommitState();

            // Detectar cambios inmediatamente
            await this.detectChanges();

            // Verificar cambios cada 2 segundos (más confiable que $watch)
            if (!this.changeDetectionInterval) {
                this.changeDetectionInterval = setInterval(async () => {
                    await this.detectChanges();
                }, 2000);
            }
        },

        // Cargar el estado del último commit como referencia
        async loadLastCommitState() {
            try {
                if (this.commits.length > 0) {
                    // Obtener el último commit
                    const lastCommit = this.commits[0];
                    console.log('📌 Usando último commit como referencia:', lastCommit.oid.substring(0, 7));

                    // Obtener el proyecto en ese estado
                    const projectAtCommit = await window.gitService.getFileAtCommit(lastCommit.oid, 'project.json');

                    if (projectAtCommit) {
                        this.lastProjectState = projectAtCommit;
                        console.log('📸 Estado del último commit cargado');
                    } else {
                        // Si falla, usar el estado actual
                        this.lastProjectState = JSON.stringify(Alpine.store('project').exportProject());
                        console.log('⚠️ No se pudo cargar commit, usando estado actual');
                    }
                } else {
                    // No hay commits, usar el estado actual
                    this.lastProjectState = JSON.stringify(Alpine.store('project').exportProject());
                    console.log('📸 Sin commits previos, usando estado actual');
                }
            } catch (error) {
                console.error('Error cargando estado del último commit:', error);
                this.lastProjectState = JSON.stringify(Alpine.store('project').exportProject());
            }
        },

        // Normalizar estado para comparación (quitar campos que cambian automáticamente)
        normalizeState(state) {
            const normalized = JSON.parse(JSON.stringify(state));

            // Eliminar campos que no importan para la detección de cambios
            if (normalized.projectInfo) {
                delete normalized.projectInfo.modified; // Este campo cambia automáticamente
            }

            return normalized;
        },

        // Detectar cambios pendientes
        async detectChanges() {
            if (!this.lastProjectState) {
                console.warn('⚠️ No hay estado de referencia para comparar');
                return;
            }

            // Normalizar ambos estados antes de comparar
            const oldState = this.normalizeState(JSON.parse(this.lastProjectState));
            const newState = this.normalizeState(Alpine.store('project').exportProject());

            const currentState = JSON.stringify(newState);
            const lastState = JSON.stringify(oldState);
            const hasChanges = currentState !== lastState;

            // Solo actualizar si realmente cambió
            if (hasChanges !== this.hasUncommittedChanges) {
                this.hasUncommittedChanges = hasChanges;
                console.log('🔄 Cambios detectados:', hasChanges);

                if (hasChanges) {
                    // Log para debug
                    console.log('📊 Comparando estados:');
                    console.log('  Capítulos:', oldState.chapters?.length, '→', newState.chapters?.length);
                    console.log('  Personajes:', oldState.characters?.length, '→', newState.characters?.length);
                    console.log('  Escenas:', oldState.scenes?.length, '→', newState.scenes?.length);
                }
            }

            if (this.hasUncommittedChanges) {
                // Analizar qué cambió específicamente usando estados normalizados
                const files = [];

                // Comparar diferentes secciones (ya normalizadas arriba)
                if (JSON.stringify(oldState.projectInfo) !== JSON.stringify(newState.projectInfo)) {
                    files.push({ path: 'project-info', status: 'modified' });
                    // Log detallado para debugging
                    console.log('🔍 project-info cambió:');
                    console.log('  Anterior:', oldState.projectInfo);
                    console.log('  Actual:', newState.projectInfo);
                }
                if (JSON.stringify(oldState.chapters) !== JSON.stringify(newState.chapters)) {
                    files.push({ path: 'chapters', status: 'modified' });
                }
                if (JSON.stringify(oldState.characters) !== JSON.stringify(newState.characters)) {
                    files.push({ path: 'characters', status: 'modified' });
                }
                if (JSON.stringify(oldState.scenes) !== JSON.stringify(newState.scenes)) {
                    files.push({ path: 'scenes', status: 'modified' });
                }
                if (JSON.stringify(oldState.locations) !== JSON.stringify(newState.locations)) {
                    files.push({ path: 'locations', status: 'modified' });
                }
                if (JSON.stringify(oldState.lore) !== JSON.stringify(newState.lore)) {
                    files.push({ path: 'lore', status: 'modified' });
                }
                if (JSON.stringify(oldState.timeline) !== JSON.stringify(newState.timeline)) {
                    files.push({ path: 'timeline', status: 'modified' });
                }

                this.changedFiles = files.length > 0 ? files : [{ path: 'project.json', status: 'modified' }];
                console.log('📝 Archivos modificados:', files.map(f => f.path).join(', '));
            } else {
                this.changedFiles = [];
                console.log('✅ Sin cambios pendientes');
            }
        },

        // Seleccionar archivo para ver preview de cambios
        async selectFileForDiff(file) {
            this.selectedFile = file;

            // Generar preview detallado de cambios usando estados normalizados
            const oldStateRaw = this.lastProjectState ? JSON.parse(this.lastProjectState) : {};
            const newStateRaw = Alpine.store('project').exportProject();

            const oldState = this.normalizeState(oldStateRaw);
            const newState = this.normalizeState(newStateRaw);

            const changes = [];

            // Función helper para comparar arrays
            const compareArrays = (oldArr = [], newArr = [], type) => {
                const oldLen = oldArr.length;
                const newLen = newArr.length;

                if (oldLen !== newLen) {
                    const diff = newLen - oldLen;
                    const sign = diff > 0 ? '+' : '';
                    changes.push(`${type}: ${oldLen} → ${newLen} (${sign}${diff})`);
                }

                // Detectar modificaciones
                const oldIds = new Set(oldArr.map(item => item.id));
                const newIds = new Set(newArr.map(item => item.id));

                const added = newArr.filter(item => !oldIds.has(item.id));
                const removed = oldArr.filter(item => !newIds.has(item.id));
                const modified = newArr.filter(item => {
                    if (!oldIds.has(item.id)) return false;
                    const oldItem = oldArr.find(o => o.id === item.id);
                    return JSON.stringify(oldItem) !== JSON.stringify(item);
                });

                if (added.length > 0) {
                    added.forEach(item => {
                        changes.push(`  + Agregado: ${item.title || item.name || item.id}`);
                    });
                }
                if (removed.length > 0) {
                    removed.forEach(item => {
                        changes.push(`  - Eliminado: ${item.title || item.name || item.id}`);
                    });
                }
                if (modified.length > 0) {
                    modified.forEach(item => {
                        changes.push(`  ✏️ Modificado: ${item.title || item.name || item.id}`);
                    });
                }
            };

            // Comparar según el archivo seleccionado
            switch(file.path) {
                case 'chapters':
                    compareArrays(oldState.chapters, newState.chapters, 'Capítulos');
                    break;
                case 'characters':
                    compareArrays(oldState.characters, newState.characters, 'Personajes');
                    break;
                case 'scenes':
                    compareArrays(oldState.scenes, newState.scenes, 'Escenas');
                    break;
                case 'locations':
                    compareArrays(oldState.locations, newState.locations, 'Ubicaciones');
                    break;
                case 'lore':
                    compareArrays(oldState.lore, newState.lore, 'Lore');
                    break;
                case 'timeline':
                    compareArrays(oldState.timeline, newState.timeline, 'Timeline');
                    break;
                case 'project-info':
                    if (oldState.projectInfo?.title !== newState.projectInfo?.title) {
                        changes.push(`Título: "${oldState.projectInfo?.title}" → "${newState.projectInfo?.title}"`);
                    }
                    if (oldState.projectInfo?.description !== newState.projectInfo?.description) {
                        changes.push(`Descripción modificada`);
                    }
                    break;
                default:
                    // Para project.json general, mostrar todo
                    compareArrays(oldState.chapters, newState.chapters, 'Capítulos');
                    compareArrays(oldState.characters, newState.characters, 'Personajes');
                    compareArrays(oldState.scenes, newState.scenes, 'Escenas');
                    compareArrays(oldState.locations, newState.locations, 'Ubicaciones');
                    compareArrays(oldState.lore, newState.lore, 'Lore');
                    compareArrays(oldState.timeline, newState.timeline, 'Timeline');
            }

            this.selectedFileDiff = changes.length > 0 ?
                changes.join('\n') :
                'Sin cambios detectados en esta sección';
        },

        // Crear datos de prueba
        async createDemoData() {
            console.log('📝 Creando datos de prueba...');

            try {
                // Primer commit: Inicio del proyecto
                await window.gitService.saveProjectState(Alpine.store('project'));
                await window.gitService.commit('Inicio del proyecto', { name: 'Demo User', email: 'demo@pluma.local' });

                // Segundo commit: Agregar personajes
                Alpine.store('project').characters.push({
                    id: 'demo-char-1',
                    name: 'Juan Pérez',
                    role: 'protagonist',
                    description: 'Protagonista de la historia'
                });
                await window.gitService.saveProjectState(Alpine.store('project'));
                await window.gitService.commit('Agregar personaje principal', { name: 'Demo User', email: 'demo@pluma.local' });

                // Tercer commit: Agregar capítulo
                Alpine.store('project').chapters.push({
                    id: 'demo-chapter-1',
                    title: 'Capítulo 1',
                    number: 1,
                    content: 'Contenido del primer capítulo...'
                });
                await window.gitService.saveProjectState(Alpine.store('project'));
                await window.gitService.commit('Agregar primer capítulo', { name: 'Demo User', email: 'demo@pluma.local' });

                // Recargar commits
                await this.loadCommits();
                await this.loadStats();
                this.lastProjectState = JSON.stringify(Alpine.store('project').exportProject());

                console.log('✅ Datos de prueba creados');
            } catch (error) {
                console.error('Error creando datos de prueba:', error);
            }
        },

        // Cargar commits
        async loadCommits() {
            this.loading = true;
            try {
                this.commits = await window.gitService.getCommitHistory();
                console.log('📜 Commits cargados:', this.commits.length);
            } catch (error) {
                console.error('Error cargando commits:', error);
                Alpine.store('ui').error('Error', 'No se pudieron cargar los commits');
            } finally {
                this.loading = false;
            }
        },

        // Cargar estadísticas
        async loadStats() {
            try {
                this.stats = await window.gitService.getStats();
            } catch (error) {
                console.error('Error cargando stats:', error);
            }
        },

        // Crear commit
        async createCommit() {
            if (!this.commitMessage.trim()) {
                Alpine.store('ui').error('Error', 'El mensaje del commit no puede estar vacío');
                return;
            }

            try {
                // Guardar estado actual del proyecto
                await window.gitService.saveProjectState(Alpine.store('project'));

                // Crear commit
                const author = this.authorName.trim() ? {
                    name: this.authorName.trim(),
                    email: 'user@pluma.local'
                } : null;

                const sha = await window.gitService.commit(this.commitMessage, author);

                Alpine.store('ui').success(
                    Alpine.store('i18n').t('notifications.success.commitCreated'),
                    `Commit ${sha.substring(0, 7)} creado`
                );

                // Limpiar form
                this.commitMessage = '';

                // Recargar commits y stats
                await this.loadCommits();
                await this.loadStats();

                // IMPORTANTE: Actualizar la referencia al nuevo último commit
                await this.loadLastCommitState();

                // Detectar cambios (ahora debería mostrar que no hay cambios)
                await this.detectChanges();

                console.log('✅ Commit creado y estado actualizado');
            } catch (error) {
                console.error('Error creando commit:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('notifications.error.commitFailed'),
                    error.message
                );
            }
        },

        // Crear rama
        async createBranch() {
            if (!this.newBranchName.trim()) {
                Alpine.store('ui').error('Error', 'El nombre de la rama no puede estar vacío');
                return;
            }

            try {
                const success = await window.gitService.createBranch(this.newBranchName.trim());

                if (success) {
                    Alpine.store('ui').success(
                        'Rama creada',
                        `Rama "${this.newBranchName}" creada exitosamente`
                    );

                    // Limpiar form
                    this.newBranchName = '';

                    // Recargar stats
                    await this.loadStats();
                } else {
                    Alpine.store('ui').error('Error', 'No se pudo crear la rama');
                }
            } catch (error) {
                console.error('Error creando rama:', error);
                Alpine.store('ui').error('Error', error.message);
            }
        },

        // Seleccionar commit para ver diff
        async selectCommit(commit) {
            this.selectedCommit = commit;

            try {
                // Si tiene padre, mostrar diff
                if (commit.parent && commit.parent.length > 0) {
                    const diffText = await window.gitService.getDiff(commit.parent[0], commit.oid);

                    if (diffText && typeof Diff2Html !== 'undefined') {
                        // Usar diff2html para renderizar
                        const diffHtml = Diff2Html.html(diffText, {
                            drawFileList: false,
                            matching: 'lines',
                            outputFormat: 'side-by-side'
                        });
                        this.diffHtml = diffHtml;
                    }
                } else {
                    this.diffHtml = '<p style="color: var(--text-secondary); padding: var(--spacing-md);">Este es el primer commit (no hay cambios previos para comparar)</p>';
                }
            } catch (error) {
                console.error('Error generando diff:', error);
                this.diffHtml = '<p style="color: var(--error); padding: var(--spacing-md);">Error generando diff</p>';
            }
        },

        // Restaurar a un commit
        async restoreCommit(commit) {
            const confirm = window.confirm(
                Alpine.store('i18n').t('versionControl.checkoutConfirm') ||
                `¿Estás seguro de que quieres restaurar el proyecto al commit ${commit.oid.substring(0, 7)}?`
            );

            if (!confirm) return;

            try {
                const projectData = await window.gitService.checkout(commit.oid);

                // Actualizar el store del proyecto con los datos restaurados
                Alpine.store('project').loadProject(projectData);

                Alpine.store('ui').success(
                    Alpine.store('i18n').t('notifications.success.checkoutSuccess'),
                    `Proyecto restaurado al commit ${commit.oid.substring(0, 7)}`
                );

                // Recargar commits para actualizar la lista
                await this.loadCommits();

                // IMPORTANTE: Actualizar la referencia al commit restaurado
                await this.loadLastCommitState();

                // Detectar cambios
                await this.detectChanges();
            } catch (error) {
                console.error('Error restaurando commit:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('notifications.error.checkoutFailed'),
                    error.message
                );
            }
        },

        // Formatear fecha
        formatDate(date) {
            const now = new Date();
            const diff = now - date;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 7) {
                return date.toLocaleDateString();
            } else if (days > 0) {
                return `hace ${days} día${days > 1 ? 's' : ''}`;
            } else if (hours > 0) {
                return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
            } else if (minutes > 0) {
                return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
            } else {
                return 'hace un momento';
            }
        }
    }));
    
    // Registrar el componente de historial de versiones
    Alpine.data('versionHistoryComponent', () => ({
        historyData: [],
        
        init() {
            // Obtener datos del modal
            this.historyData = Alpine.store('ui').modalData?.history || Alpine.store('project').getCommitHistory() || [];
            console.log('Historial de commits cargado:', this.historyData);
            
            // Inicializar íconos
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
        },
        
        loadHistoryData() {
            this.historyData = Alpine.store('ui').modalData?.history || Alpine.store('project').getCommitHistory() || [];
            console.log('Historial de commits actualizado:', this.historyData);
        },
        
        checkoutCommit(commitId) {
            if (confirm(Alpine.store('i18n').t('versionControl.checkoutConfirm') || '¿Estás seguro de que quieres cambiar al estado de este commit?')) {
                try {
                    const success = Alpine.store('project').checkoutCommit(commitId);
                    if (success) {
                        Alpine.store('ui').success(
                            Alpine.store('i18n').t('notifications.success.checkoutSuccess') || 'Checkout exitoso',
                            Alpine.store('i18n').t('notifications.success.checkoutSuccessDesc', { commitId: commitId.substring(0, 8) })
                        );
                        Alpine.store('ui').closeModal('versionHistory');
                        // Actualizar la interfaz
                        Alpine.store('ui').refreshView();
                    } else {
                        Alpine.store('ui').error(
                            Alpine.store('i18n').t('notifications.error.checkoutFailed') || 'Error en checkout',
                            Alpine.store('i18n').t('notifications.error.checkoutFailedDesc') || 'No se pudo cambiar al estado del commit'
                        );
                    }
                } catch (error) {
                    console.error('Error en checkout:', error);
                    Alpine.store('ui').error(
                        Alpine.store('i18n').t('notifications.error.checkoutFailed') || 'Error en checkout',
                        error.message
                    );
                }
            }
        }
    }));
    
    // Registrar el componente de vista de forks
    Alpine.data('forksViewComponent', () => ({
        activeTab: 'forks',
        forksList: [],
        commitHistory: [],
        fromCommit: '',
        toCommit: '',
        diffResult: null,
        
        init() {
            // Cargar forks y commits
            this.loadForksAndCommits();
            
            // Verificar si este proyecto es un fork
            const forkInfo = Alpine.store('project').forkInfo;
            if (forkInfo && forkInfo.originalProjectId) {
                console.log('Este proyecto es un fork del proyecto:', forkInfo.originalProjectId);
            }
            
            // Inicializar íconos
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
        },
        
        loadForksAndCommits() {
            this.forksList = Alpine.store('versionControl').getProjectForks();
            this.commitHistory = Alpine.store('project').getCommitHistory() || [];
            console.log('Forks cargados:', this.forksList);
            console.log('Historial de commits:', this.commitHistory);
        },
        
        openFork(forkProjectId) {
            // En una implementación completa, esto cargaría el fork en una nueva pestaña o sesión
            Alpine.store('ui').info(
                'Funcionalidad futura',
                'En una implementación completa, aquí se abriría el fork seleccionado'
            );
        },
        
        compareWithFork(forkProjectId) {
            Alpine.store('ui').info(
                'Funcionalidad futura',
                'En una implementación completa, aquí se compararía este proyecto con el fork seleccionado'
            );
        },
        
        compareVersions() {
            if (this.fromCommit && this.toCommit) {
                const diff = window.versionControl.compareCommits(this.fromCommit, this.toCommit);
                if (diff) {
                    // En una implementación completa, mostraríamos las diferencias reales
                    this.diffResult = `<p>Comparando commit ${this.fromCommit.substring(0, 8)} con ${this.toCommit.substring(0, 8)}</p>
                                      <p>Características de diferencias implementadas:</p>
                                      <ul>
                                        <li>Proyectos: ${diff.from.projectInfo.title} → ${diff.to.projectInfo.title}</li>
                                        <li>Capítulos: ${diff.from.chapters.length} → ${diff.to.chapters.length}</li>
                                        <li>Personajes: ${diff.from.characters.length} → ${diff.to.characters.length}</li>
                                      </ul>`;
                } else {
                    this.diffResult = '<p>No se pudieron comparar los commits seleccionados</p>';
                }
            }
        }
    }));
    
    // Registrar el componente de creación de commit
    Alpine.data('createCommitModalComponent', () => ({
        message: '',
        author: '',
        totalWords: 0,
        totalChapters: 0,
        totalCharacters: 0,
        totalScenes: 0,
        
        init() {
            // Inicializar Lucide icons si están disponibles
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
            
            // Observar cambios en modalData y actualizar las propiedades locales
            this.$watch('$store.ui.modalData', (newData) => {
                if (newData) {
                    this.message = newData.message || '';
                    this.author = newData.author || 'User';
                    if (newData.projectStats) {
                        this.totalWords = newData.projectStats.totalWords || 0;
                        this.totalChapters = newData.projectStats.totalChapters || 0;
                        this.totalCharacters = newData.projectStats.totalCharacters || 0;
                        this.totalScenes = newData.projectStats.totalScenes || 0;
                    }
                } else {
                    // Valores por defecto cuando modalData es null
                    this.message = '';
                    this.author = 'User';
                    this.totalWords = 0;
                    this.totalChapters = 0;
                    this.totalCharacters = 0;
                    this.totalScenes = 0;
                }
            });
        },
        
        async createCommitWithModalData() {
            const store = Alpine.store('project');
            const i18n = Alpine.store('i18n');
            
            if (!this.message.trim()) {
                Alpine.store('ui').warning(
                    i18n.t('notifications.warning.emptyMessage') || 'Mensaje vacío',
                    i18n.t('notifications.warning.emptyMessageDesc') || 'Por favor, escribe un mensaje para el commit'
                );
                return;
            }

            try {
                const commitId = store.createCommit(
                    this.message, 
                    this.author || 'User'
                );
                
                if (commitId) {
                    Alpine.store('ui').success(
                        i18n.t('notifications.success.commitCreated') || 'Commit creado exitosamente',
                        i18n.t('notifications.success.commitCreatedDesc', { commitId: commitId.substring(0, 8) })
                    );
                    Alpine.store('ui').closeModal('createCommit');
                } else {
                    Alpine.store('ui').error(
                        i18n.t('notifications.error.commitFailed') || 'Error creando commit',
                        i18n.t('notifications.error.commitFailedDesc') || 'No se pudo crear el commit'
                    );
                }
            } catch (error) {
                console.error('Error creando commit:', error);
                Alpine.store('ui').error(
                    i18n.t('notifications.error.commitFailed') || 'Error creando commit',
                    error.message
                );
            }
        }
    }));
    
    // Registrar el componente de creación de fork
    Alpine.data('createForkModalComponent', () => ({
        name: '',
        description: '',
        totalWords: 0,
        totalChapters: 0,
        totalCharacters: 0,
        totalScenes: 0,
        
        init() {
            // Inicializar Lucide icons si están disponibles
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
            
            // Observar cambios en modalData y actualizar las propiedades locales
            this.$watch('$store.ui.modalData', (newData) => {
                if (newData) {
                    this.name = newData.name || '';
                    this.description = newData.description || '';
                    if (newData.projectStats) {
                        this.totalWords = newData.projectStats.totalWords || 0;
                        this.totalChapters = newData.projectStats.totalChapters || 0;
                        this.totalCharacters = newData.projectStats.totalCharacters || 0;
                        this.totalScenes = newData.projectStats.totalScenes || 0;
                    }
                } else {
                    // Valores por defecto cuando modalData es null
                    this.name = '';
                    this.description = '';
                    this.totalWords = 0;
                    this.totalChapters = 0;
                    this.totalCharacters = 0;
                    this.totalScenes = 0;
                }
            });
        },
        
        async createForkWithModalData() {
            const store = Alpine.store('project');
            const i18n = Alpine.store('i18n');
            
            if (!this.name.trim()) {
                Alpine.store('ui').warning(
                    i18n.t('notifications.warning.emptyName') || 'Nombre vacío',
                    i18n.t('notifications.warning.emptyNameDesc') || 'Por favor, escribe un nombre para el fork'
                );
                return;
            }

            try {
                const forkId = store.createFork(
                    this.name, 
                    this.description
                );
                
                if (forkId) {
                    Alpine.store('ui').success(
                        i18n.t('notifications.success.forkCreated') || 'Fork creado exitosamente',
                        i18n.t('notifications.success.forkCreatedDesc', { forkName: this.name })
                    );
                    Alpine.store('ui').closeModal('createFork');
                    
                    // Guardar inmediatamente el fork
                    const saveResult = await window.storageManager.save(Alpine.store('project').exportProject());
                    console.log('Fork guardado:', saveResult);
                } else {
                    Alpine.store('ui').error(
                        i18n.t('notifications.error.forkFailed') || 'Error creando fork',
                        i18n.t('notifications.error.forkFailedDesc') || 'No se pudo crear el fork'
                    );
                }
            } catch (error) {
                console.error('Error creando fork:', error);
                Alpine.store('ui').error(
                    i18n.t('notifications.error.forkFailed') || 'Error creando fork',
                    error.message
                );
            }
        }
    }));

    // Registrar el componente de creación de árbol
    Alpine.data('createTreeModalComponent', () => ({
        name: '',
        type: 'chapter',
        description: '',
        createFromCurrent: false,
        
        init() {
            // Inicializar Lucide icons si están disponibles
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
            
            // Observar cambios en modalData y actualizar las propiedades locales
            this.$watch('$store.ui.modalData', (newData) => {
                if (newData) {
                    this.name = newData.name || '';
                    this.type = newData.type || 'chapter';
                    this.description = newData.description || '';
                    this.createFromCurrent = newData.createFromCurrent || false;
                } else {
                    // Valores por defecto cuando modalData es null
                    this.name = '';
                    this.type = 'chapter';
                    this.description = '';
                    this.createFromCurrent = false;
                }
            });
        },
        
        async createTreeWithModalData() {
            const store = Alpine.store('project');
            const i18n = Alpine.store('i18n');
            
            if (!this.name.trim()) {
                Alpine.store('ui').warning(
                    i18n.t('notifications.warning.emptyName') || 'Nombre vacío',
                    i18n.t('notifications.warning.emptyNameDesc') || 'Por favor, escribe un nombre para la estructura'
                );
                return;
            }

            try {
                // Lógica para crear la estructura de árbol
                // En esta implementación, simplemente se crea un proyecto base con la estructura
                const treeStructure = {
                    name: this.name,
                    type: this.type,
                    description: this.description,
                    created: new Date().toISOString(),
                    items: []
                };
                
                // Si se selecciona crear desde el proyecto actual, copiamos la estructura
                if (this.createFromCurrent) {
                    switch(this.type) {
                        case 'chapter':
                            treeStructure.items = Alpine.store('project').chapters.map(ch => ({
                                id: ch.id,
                                title: ch.title,
                                number: ch.number
                            }));
                            break;
                        case 'scene':
                            treeStructure.items = Alpine.store('project').scenes.map(s => ({
                                id: s.id,
                                title: s.title,
                                chapterId: s.chapterId
                            }));
                            break;
                        default:
                            treeStructure.items = [];
                    }
                }
                
                console.log('Estructura de árbol creada:', treeStructure);
                
                Alpine.store('ui').success(
                    i18n.t('notifications.success.treeCreated') || 'Estructura creada exitosamente',
                    i18n.t('notifications.success.treeCreatedDesc', { treeName: this.name })
                );
                Alpine.store('ui').closeModal('createTree');
                
                // Aquí se podría implementar la lógica para aplicar la estructura al proyecto
            } catch (error) {
                console.error('Error creando estructura:', error);
                Alpine.store('ui').error(
                    i18n.t('notifications.error.treeFailed') || 'Error creando estructura',
                    error.message
                );
            }
        }
    }));

    // App component principal
    Alpine.data('app', () => ({
        init() {
            // Forzar reactividad observando cambios en el store
            this.$watch('$store.ui.currentView', (value) => {
                // Vista cambiada
            });
        }
    }));
});

// Inicializar SearchService después de que Alpine esté listo
document.addEventListener('alpine:initialized', () => {
    // Inicializar SearchService con los datos actuales
    if (window.searchService && Alpine.store('project')) {
        window.searchService.initialize({
            characters: Alpine.store('project').characters,
            scenes: Alpine.store('project').scenes,
            locations: Alpine.store('project').locations,
            timeline: Alpine.store('project').timeline,
            chapters: Alpine.store('project').chapters
        });
    }
});

// Agregar estilos para x-cloak
const style = document.createElement('style');
style.textContent = `
    [x-cloak] {
        display: none !important;
    }
`;
document.head.appendChild(style);


