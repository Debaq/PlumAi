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

        // Caché para optimizar JSON.stringify
        _lastModifiedTimestamp: null,
        _cachedCurrentState: null,
        _cachedOldState: null,

        // Inicialización
        async init() {
            // Cargar datos primero
            await this.loadCommits();
            await this.loadStats();

            // NO crear datos de prueba automáticamente
            // El usuario debe elegir explícitamente "Solo mirar" desde el welcome modal

            // CLAVE: Obtener el estado del ÚLTIMO COMMIT como referencia
            // NO del estado actual del proyecto
            await this.loadLastCommitState();

            // Detectar cambios inmediatamente
            await this.detectChanges();

            // Usar event-driven en lugar de polling - solo detectar cuando HAY cambios
            // Escuchar evento personalizado cuando el proyecto se modifica
            window.addEventListener('project:modified', async () => {
                await this.detectChanges();
            });

            // También watchear arrays que pueden cambiar sin actualizar modified
            this.$watch('$store.project.chapters.length', async () => {
                await this.detectChanges();
            });
            this.$watch('$store.project.characters.length', async () => {
                await this.detectChanges();
            });
            this.$watch('$store.project.scenes.length', async () => {
                await this.detectChanges();
            });
            this.$watch('$store.project.locations.length', async () => {
                await this.detectChanges();
            });
            this.$watch('$store.project.loreEntries.length', async () => {
                await this.detectChanges();
            });
        },

        // Cargar el estado del último commit como referencia (Sistema v2.0)
        async loadLastCommitState() {
            try {
                if (this.commits.length > 0) {
                    // Obtener el último commit
                    const lastCommit = this.commits[0];

                    // Obtener el proyecto en ese estado usando el nuevo sistema v2.0
                    const projectAtCommit = window.versionControl.getProjectAtCommit(lastCommit.id);

                    if (projectAtCommit) {
                        this.lastProjectState = JSON.stringify(projectAtCommit);
                    } else {
                        // Si falla, usar el estado actual
                        this.lastProjectState = JSON.stringify(Alpine.store('project').exportProject());
                    }
                } else {
                    // No hay commits, usar un proyecto vacío como baseline
                    // Esto permite detectar cualquier cambio que se haga
                    const emptyProject = {
                        projectInfo: Alpine.store('project').projectInfo,
                        forkInfo: Alpine.store('project').forkInfo,
                        apiKeys: Alpine.store('project').apiKeys,
                        characters: [],
                        locations: [],
                        chapters: [],
                        scenes: [],
                        timeline: [],
                        notes: [],
                        loreEntries: []
                    };
                    this.lastProjectState = JSON.stringify(emptyProject);
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

        // Detectar cambios pendientes - Optimizado con caché
        async detectChanges() {
            if (!this.lastProjectState) {
                return;
            }

            // Verificar si el proyecto fue modificado desde la última verificación
            const currentModified = Alpine.store('project').projectInfo?.modified;

            // Si no hay cambios en el timestamp, usar caché
            if (currentModified === this._lastModifiedTimestamp && this._cachedCurrentState) {
                return; // No hay cambios, salir temprano
            }

            // Actualizar timestamp
            this._lastModifiedTimestamp = currentModified;

            // Normalizar ambos estados antes de comparar
            const oldState = this._cachedOldState || this.normalizeState(JSON.parse(this.lastProjectState));
            if (!this._cachedOldState) {
                this._cachedOldState = oldState; // Cachear para próximas veces
            }

            const newState = this.normalizeState(Alpine.store('project').exportProject());

            const currentState = JSON.stringify(newState);
            const lastState = this._cachedCurrentState || JSON.stringify(oldState);

            // Actualizar caché solo si cambió
            if (currentState !== this._cachedCurrentState) {
                this._cachedCurrentState = currentState;
            }

            const hasChanges = currentState !== lastState;

            // Solo actualizar si realmente cambió
            if (hasChanges !== this.hasUncommittedChanges) {
                this.hasUncommittedChanges = hasChanges;
            }

            if (this.hasUncommittedChanges) {
                // Analizar qué cambió específicamente usando estados normalizados
                const files = [];

                // Comparar diferentes secciones (ya normalizadas arriba)
                if (JSON.stringify(oldState.projectInfo) !== JSON.stringify(newState.projectInfo)) {
                    files.push({ path: 'project-info', status: 'modified' });
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
            } else {
                this.changedFiles = [];
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

                // Detectar modificaciones - Optimizado de O(n²) a O(n)
                const oldIds = new Set(oldArr.map(item => item.id));
                const newIds = new Set(newArr.map(item => item.id));
                // Crear Map para búsqueda O(1) en lugar de find() O(n)
                const oldItemsMap = new Map(oldArr.map(item => [item.id, item]));

                const added = newArr.filter(item => !oldIds.has(item.id));
                const removed = oldArr.filter(item => !newIds.has(item.id));
                const modified = newArr.filter(item => {
                    if (!oldIds.has(item.id)) return false;
                    const oldItem = oldItemsMap.get(item.id); // O(1) en lugar de find() O(n)
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
            try {
                const project = Alpine.store('project');

                // Crear datos de prueba (un solo commit al final con todo)
                // Agregar eventos de timeline
                const eventBirth = window.uuid.generateUUID();
                const eventMeeting = window.uuid.generateUUID();
                const eventBetrayal = window.uuid.generateUUID();
                const eventBattle = window.uuid.generateUUID();
                const eventTransformation = window.uuid.generateUUID();

                project.timeline.push({
                    id: eventBirth,
                    position: 0,
                    event: 'Nacimiento de Elena',
                    description: 'Elena nace en un pequeño pueblo costero',
                    dateMode: 'absolute',
                    date: '1990-03-15',
                    era: '',
                    chapter: '',
                    linkedCharacters: [],
                    linkedLocations: [],
                    tags: ['origen'],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                project.timeline.push({
                    id: eventMeeting,
                    position: 1,
                    event: 'Elena conoce a Marco',
                    description: 'Primer encuentro entre Elena y Marco en la universidad',
                    dateMode: 'absolute',
                    date: '2010-09-01',
                    era: '',
                    chapter: '',
                    linkedCharacters: [],
                    linkedLocations: [],
                    tags: ['encuentro'],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                project.timeline.push({
                    id: eventBetrayal,
                    position: 2,
                    event: 'La traición',
                    description: 'Marco traiciona a Elena revelando sus secretos',
                    dateMode: 'absolute',
                    date: '2015-06-20',
                    era: '',
                    chapter: '',
                    linkedCharacters: [],
                    linkedLocations: [],
                    tags: ['conflicto'],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                project.timeline.push({
                    id: eventBattle,
                    position: 3,
                    event: 'La batalla final',
                    description: 'Confrontación decisiva donde Marco muere',
                    dateMode: 'absolute',
                    date: '2018-12-31',
                    era: '',
                    chapter: '',
                    linkedCharacters: [],
                    linkedLocations: [],
                    tags: ['climax', 'muerte'],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                project.timeline.push({
                    id: eventTransformation,
                    position: 4,
                    event: 'Transformación de Sofia',
                    description: 'Sofia es transformada por una maldición antigua',
                    dateMode: 'absolute',
                    date: '2016-10-31',
                    era: '',
                    chapter: '',
                    linkedCharacters: [],
                    linkedLocations: [],
                    tags: ['magia', 'transformación'],
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Agregar personajes con estados vitales variados
                const elenaId = window.uuid.generateUUID();
                const marcoId = window.uuid.generateUUID();
                const sofiaId = window.uuid.generateUUID();
                const alexId = window.uuid.generateUUID();

                // Elena - protagonista viva pero herida
                project.characters.push({
                    id: elenaId,
                    name: 'Elena Martínez',
                    role: 'protagonist',
                    description: 'Una joven valiente con un pasado misterioso',
                    personality: 'Determinada, compasiva pero cautelosa',
                    background: 'Creció en un pueblo costero sin conocer a sus padres',
                    relationships: [],
                    notes: 'Personaje principal de la historia',
                    avatar: null,
                    vitalStatusHistory: [
                        {
                            status: 'alive',
                            eventId: eventBirth,
                            description: 'Nace en el pueblo',
                            timestamp: new Date('1990-03-15').toISOString()
                        },
                        {
                            status: 'injured',
                            eventId: eventBattle,
                            description: 'Gravemente herida en la batalla final',
                            notes: 'Logró sobrevivir pero necesita tiempo para recuperarse',
                            timestamp: new Date('2018-12-31').toISOString()
                        }
                    ],
                    currentVitalStatus: 'injured',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Marco - antagonista muerto
                project.characters.push({
                    id: marcoId,
                    name: 'Marco Delgado',
                    role: 'antagonist',
                    description: 'Ex-aliado convertido en enemigo',
                    personality: 'Carismático pero manipulador',
                    background: 'Estudió junto a Elena pero siempre tuvo ambiciones oscuras',
                    relationships: [],
                    notes: 'Antagonista principal',
                    avatar: null,
                    vitalStatusHistory: [
                        {
                            status: 'alive',
                            eventId: eventMeeting,
                            description: 'Conoce a Elena en la universidad',
                            timestamp: new Date('2010-09-01').toISOString()
                        },
                        {
                            status: 'killed',
                            eventId: eventBattle,
                            description: 'Muere en la batalla final',
                            notes: 'Sacrificó todo por poder y perdió',
                            timestamp: new Date('2018-12-31').toISOString()
                        }
                    ],
                    currentVitalStatus: 'killed',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Sofia - personaje transformado
                project.characters.push({
                    id: sofiaId,
                    name: 'Sofia Chen',
                    role: 'supporting',
                    description: 'Mejor amiga de Elena, ahora transformada',
                    personality: 'Leal, inteligente y resiliente',
                    background: 'Compañera de Elena desde la infancia',
                    relationships: [],
                    notes: 'Personaje de apoyo importante',
                    avatar: null,
                    vitalStatusHistory: [
                        {
                            status: 'alive',
                            eventId: null,
                            description: 'Personaje creado',
                            timestamp: new Date('2008-01-01').toISOString()
                        },
                        {
                            status: 'transformed',
                            eventId: eventTransformation,
                            description: 'Transformada por maldición antigua',
                            notes: 'Ya no es completamente humana, tiene habilidades especiales',
                            timestamp: new Date('2016-10-31').toISOString()
                        }
                    ],
                    currentVitalStatus: 'transformed',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Alex - personaje desaparecido
                project.characters.push({
                    id: alexId,
                    name: 'Alex Rivera',
                    role: 'secondary',
                    description: 'Mentor misterioso que desapareció',
                    personality: 'Sabio, enigmático',
                    background: 'Antiguo guardián con conocimientos ancestrales',
                    relationships: [],
                    notes: 'Su paradero es desconocido',
                    avatar: null,
                    vitalStatusHistory: [
                        {
                            status: 'alive',
                            eventId: null,
                            description: 'Personaje creado',
                            timestamp: new Date('2005-01-01').toISOString()
                        },
                        {
                            status: 'missing',
                            eventId: eventBetrayal,
                            description: 'Desapareció tras la traición',
                            notes: 'No se sabe si está vivo o muerto',
                            timestamp: new Date('2015-06-20').toISOString()
                        }
                    ],
                    currentVitalStatus: 'missing',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // await window.gitService.saveProjectState(project);
                // await window.gitService.commit('Agregar personajes con estados vitales', { name: 'Demo User', email: 'demo@pluma.local' });

                // Cuarto commit: Agregar relaciones con historial temporal
                // Relación Elena -> Marco (evoluciona de amigos a enemigos)
                const elenaChar = project.characters.find(c => c.id === elenaId);
                elenaChar.relationships.push({
                    id: window.uuid.generateUUID(),
                    characterId: marcoId,
                    history: [
                        {
                            eventId: eventMeeting,
                            type: 'friend',
                            status: 'active',
                            description: 'Se conocen en la universidad',
                            notes: 'Conexión inmediata, estudian juntos',
                            timestamp: new Date('2010-09-01').toISOString()
                        },
                        {
                            eventId: null,
                            type: 'romantic',
                            status: 'active',
                            description: 'Comienzan una relación romántica',
                            notes: 'Relación apasionada pero complicada',
                            timestamp: new Date('2012-02-14').toISOString()
                        },
                        {
                            eventId: eventBetrayal,
                            type: 'enemy',
                            status: 'active',
                            description: 'Marco la traiciona',
                            notes: 'Elena descubre que Marco la estuvo usando',
                            timestamp: new Date('2015-06-20').toISOString()
                        },
                        {
                            eventId: eventBattle,
                            type: 'enemy',
                            status: 'ended',
                            description: 'Marco muere en la batalla',
                            notes: 'Fin trágico de una relación compleja',
                            timestamp: new Date('2018-12-31').toISOString()
                        }
                    ],
                    currentType: 'enemy',
                    currentStatus: 'ended',
                    currentDescription: 'Marco muere en la batalla',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Relación Marco -> Elena (simétrica)
                const marcoChar = project.characters.find(c => c.id === marcoId);
                marcoChar.relationships.push({
                    id: window.uuid.generateUUID(),
                    characterId: elenaId,
                    history: [
                        {
                            eventId: eventMeeting,
                            type: 'friend',
                            status: 'active',
                            description: 'Se conocen en la universidad',
                            notes: 'Ve en Elena una oportunidad',
                            timestamp: new Date('2010-09-01').toISOString()
                        },
                        {
                            eventId: null,
                            type: 'romantic',
                            status: 'active',
                            description: 'Inicia relación romántica',
                            notes: 'Usa el romance para manipularla',
                            timestamp: new Date('2012-02-14').toISOString()
                        },
                        {
                            eventId: eventBetrayal,
                            type: 'enemy',
                            status: 'active',
                            description: 'Traiciona a Elena',
                            notes: 'Revela su verdadera naturaleza',
                            timestamp: new Date('2015-06-20').toISOString()
                        },
                        {
                            eventId: eventBattle,
                            type: 'enemy',
                            status: 'ended',
                            description: 'Muere enfrentando a Elena',
                            notes: 'Último intento de destruirla fracasa',
                            timestamp: new Date('2018-12-31').toISOString()
                        }
                    ],
                    currentType: 'enemy',
                    currentStatus: 'ended',
                    currentDescription: 'Muere enfrentando a Elena',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Relación Elena -> Sofia (amistad duradera)
                elenaChar.relationships.push({
                    id: window.uuid.generateUUID(),
                    characterId: sofiaId,
                    history: [
                        {
                            eventId: null,
                            type: 'friend',
                            status: 'active',
                            description: 'Mejores amigas desde la infancia',
                            notes: 'Lazo inquebrantable',
                            timestamp: new Date('2000-01-01').toISOString()
                        },
                        {
                            eventId: eventTransformation,
                            type: 'family',
                            status: 'active',
                            description: 'Se vuelven como hermanas tras la transformación',
                            notes: 'Elena ayuda a Sofia a adaptarse a su nuevo estado',
                            timestamp: new Date('2016-10-31').toISOString()
                        }
                    ],
                    currentType: 'family',
                    currentStatus: 'active',
                    currentDescription: 'Hermanas de corazón',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Relación Elena -> Alex (mentor)
                elenaChar.relationships.push({
                    id: window.uuid.generateUUID(),
                    characterId: alexId,
                    history: [
                        {
                            eventId: null,
                            type: 'mentor',
                            status: 'active',
                            description: 'Alex se convierte en su mentor',
                            notes: 'Le enseña sobre sus verdaderos orígenes',
                            timestamp: new Date('2013-05-15').toISOString()
                        },
                        {
                            eventId: eventBetrayal,
                            type: 'mentor',
                            status: 'uncertain',
                            description: 'Alex desaparece',
                            notes: 'Elena no sabe qué le pasó a su mentor',
                            timestamp: new Date('2015-06-20').toISOString()
                        }
                    ],
                    currentType: 'mentor',
                    currentStatus: 'uncertain',
                    currentDescription: 'Paradero desconocido',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // await window.gitService.saveProjectState(project);
                // await window.gitService.commit('Agregar relaciones con historial temporal', { name: 'Demo User', email: 'demo@pluma.local' });

                // Quinto commit: Agregar capítulo inicial
                project.chapters.push({
                    id: window.uuid.generateUUID(),
                    title: 'Capítulo 1: El Despertar',
                    number: 1,
                    summary: 'Elena despierta herida tras la batalla final y reflexiona sobre todo lo perdido',
                    content: 'Elena abrió los ojos lentamente. El dolor punzante en su costado le recordó inmediatamente los eventos de la noche anterior...',
                    wordCount: 0,
                    status: 'draft',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });

                // Crear commit inicial con todos los datos de prueba usando v2.0
                const projectData = project.exportProject();
                const author = {
                    name: localStorage.getItem('userName') || 'Demo User',
                    email: localStorage.getItem('userEmail') || 'demo@pluma.local'
                };

                window.versionControl.commit(
                    projectData,
                    'Proyecto inicial con datos de prueba',
                    author
                );

                // Recargar commits
                await this.loadCommits();
                await this.loadStats();
            } catch (error) {
                console.error('Error creando datos de prueba:', error);
            }
        },

        // Cargar commits (Sistema v2.0)
        async loadCommits() {
            this.loading = true;
            try {
                // Usar el nuevo sistema de control de versiones v2.0
                const history = window.versionControl.getBranchHistory();
                this.commits = history || [];
            } catch (error) {
                console.error('Error cargando commits:', error);
                this.commits = [];
            } finally {
                this.loading = false;
            }
        },

        // Cargar estadísticas (Sistema v2.0)
        async loadStats() {
            try {
                // Usar el nuevo sistema de control de versiones v2.0
                this.stats = window.versionControl.getHistoryStats();
            } catch (error) {
                console.error('Error cargando stats:', error);
                this.stats = { totalBranches: 0, totalCommits: 0 };
            }
        },

        // Crear commit (Sistema v2.0)
        async createCommit() {
            if (!this.commitMessage.trim()) {
                Alpine.store('ui').error('Error', 'El mensaje del commit no puede estar vacío');
                return;
            }

            try {
                // Obtener estado actual del proyecto
                const projectData = Alpine.store('project').exportProject();

                // Crear commit con el nuevo sistema v2.0
                const author = this.authorName.trim() || 'user';
                const commitId = window.versionControl.commit(
                    projectData,
                    this.commitMessage.trim(),
                    author
                );

                if (commitId) {
                    Alpine.store('ui').success(
                        Alpine.store('i18n').t('notifications.success.commitCreated'),
                        `Commit ${commitId.substring(0, 7)} creado`
                    );

                    // Limpiar form
                    this.commitMessage = '';

                    // Recargar commits y stats
                    await this.loadCommits();
                    await this.loadStats();
                } else {
                    Alpine.store('ui').info('Sin cambios', 'No hay cambios para commitear');
                }

                // IMPORTANTE: Actualizar la referencia al nuevo último commit
                await this.loadLastCommitState();

                // Detectar cambios (ahora debería mostrar que no hay cambios)
                await this.detectChanges();
            } catch (error) {
                console.error('Error creando commit:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('notifications.error.commitFailed'),
                    error.message
                );
            }
        },

        // Crear rama (Sistema v2.0)
        async createBranch() {
            if (!this.newBranchName.trim()) {
                Alpine.store('ui').error('Error', 'El nombre de la rama no puede estar vacío');
                return;
            }

            try {
                const success = window.versionControl.createBranch(this.newBranchName.trim());

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

        // Seleccionar commit para ver diff (Sistema v2.0)
        async selectCommit(commit) {
            this.selectedCommit = commit;

            try {
                // Si tiene padre, mostrar información del delta
                if (commit.parent) {
                    if (commit.delta) {
                        // Mostrar el delta de forma legible
                        const deltaText = JSON.stringify(commit.delta, null, 2);
                        this.diffHtml = `<pre style="color: var(--text-primary); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 6px; overflow-x: auto;">${deltaText}</pre>`;
                    } else {
                        this.diffHtml = '<p style="color: var(--text-secondary); padding: var(--spacing-md);">Este commit no tiene cambios (snapshot base)</p>';
                    }
                } else {
                    this.diffHtml = '<p style="color: var(--text-secondary); padding: var(--spacing-md);">Este es el primer commit (snapshot base completo)</p>';
                }
            } catch (error) {
                console.error('Error generando diff:', error);
                this.diffHtml = '<p style="color: var(--error); padding: var(--spacing-md);">Error generando diff</p>';
            }
        },

        // Restaurar a un commit (Sistema v2.0)
        async restoreCommit(commit) {
            const confirm = window.confirm(
                Alpine.store('i18n').t('versionControl.checkoutConfirm') ||
                `¿Estás seguro de que quieres restaurar el proyecto al commit ${commit.id.substring(0, 7)}?`
            );

            if (!confirm) return;

            try {
                const success = window.versionControl.revertToCommit(commit.id);

                if (success) {
                    Alpine.store('ui').success(
                        Alpine.store('i18n').t('notifications.success.checkoutSuccess'),
                        `Proyecto restaurado al commit ${commit.id.substring(0, 7)}`
                    );
                } else {
                    Alpine.store('ui').error('Error', 'No se pudo restaurar el commit');
                }

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

            // Inicializar íconos
            if (typeof lucide !== 'undefined') {
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            }
        },

        loadHistoryData() {
            this.historyData = Alpine.store('ui').modalData?.history || Alpine.store('project').getCommitHistory() || [];
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
                    await window.storageManager.save(Alpine.store('project').exportProject());
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
    if (!window.searchService || !Alpine.store('project')) {
        return;
    }

    const projectStore = Alpine.store('project');
    let debounceTimer = null;
    let isFirstInit = true;

    /**
     * Función helper para actualizar el índice de búsqueda
     * Incluye debounce para evitar reconstrucciones demasiado frecuentes
     */
    const updateSearchIndex = (immediate = false) => {
        // Cancelar timer anterior si existe
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const doUpdate = () => {
            try {
                window.searchService.initialize({
                    characters: projectStore.characters,
                    scenes: projectStore.scenes,
                    locations: projectStore.locations,
                    timeline: projectStore.timeline,
                    chapters: projectStore.chapters,
                    loreEntries: projectStore.loreEntries
                });

                isFirstInit = false;
            } catch (error) {
                console.error('Error actualizando índice de búsqueda:', error);
            }
        };

        if (immediate) {
            // Actualizar inmediatamente (para inicialización)
            doUpdate();
        } else {
            // Debounce de 500ms para actualizaciones posteriores
            debounceTimer = setTimeout(doUpdate, 500);
        }
    };

    // Inicializar una vez inmediatamente
    updateSearchIndex(true);

    // Configurar watchers automáticos para actualización reactiva
    Alpine.effect(() => {
        // Acceder a los arrays para que Alpine detecte cambios
        // Usamos .length para detectar adiciones/eliminaciones
        const charsLen = projectStore.characters.length;
        const scenesLen = projectStore.scenes.length;
        const locsLen = projectStore.locations.length;
        const timeLen = projectStore.timeline.length;
        const chapsLen = projectStore.chapters.length;
        const loreLen = projectStore.loreEntries.length;

        // Si no es la primera vez, actualizar con debounce
        if (!isFirstInit) {
            updateSearchIndex(false);
        }
    });
});

// Agregar estilos para x-cloak
const style = document.createElement('style');
style.textContent = `
    [x-cloak] {
        display: none !important;
    }
`;
document.head.appendChild(style);


