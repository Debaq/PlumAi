// PlumaAI - Main Application
// Inicialización de Alpine.js y Stores

// Asumimos que los stores y storageManager están disponibles globalmente (cargados en index.html)

document.addEventListener('alpine:init', () => {
    console.log('🚀 Inicializando PlumaAI...');

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

    console.log('📋 Stores registrados como Proxy');

    // Inicializar stores que lo requieran
    Alpine.store('i18n').init();
    Alpine.store('ui').init();
    Alpine.store('ai').init();
    Alpine.store('versionControl').init();

    // Inicializar Storage Manager
    window.storageManager.init();
    console.log('✅ Storage Manager inicializado');
    
    // Inicializar Version Control
    window.versionControl.init();
    console.log('✅ Version Control inicializado');

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

    console.log('✅ Stores inicializados');
    console.log('🎯 Estado inicial:', Alpine.store('ui').currentView);

    // Registrar componentes
    Alpine.data('headerComponent', window.headerComponent);
    Alpine.data('sidebarComponent', window.sidebarComponent);
    Alpine.data('mainContentComponent', window.mainContentComponent);
    Alpine.data('versionControlComponent', window.versionControlComponent);
    
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
            console.log('📱 App component initialized');
            console.log('Idioma actual:', this.$store.i18n.currentLocale);

            // Forzar reactividad observando cambios en el store
            this.$watch('$store.ui.currentView', (value) => {
                console.log('👁️ Watch detectó cambio de vista:', value);
            });
        }
    }));

    console.log('✅ PlumaAI listo');
});

// Agregar estilos para x-cloak
const style = document.createElement('style');
style.textContent = `
    [x-cloak] {
        display: none !important;
    }
`;
document.head.appendChild(style);


