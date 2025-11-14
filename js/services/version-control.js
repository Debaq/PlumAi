// Sistema de control de versiones tipo Git para PlumaAI v2.0
// Implementa commits con deltas, ramas, y forks optimizados
// Usa jsondiffpatch para almacenar solo cambios en lugar de snapshots completos

window.versionControl = {
    // Versión del formato de datos
    FORMAT_VERSION: '2.0',

    // Estructura optimizada:
    // {
    //   version: '2.0',
    //   branches: {
    //     main: {
    //       baseSnapshot: { /* snapshot completo inicial */ },
    //       head: 'commit-id',
    //       commits: {
    //         'commit-id': {
    //           id: 'commit-id',
    //           parent: 'parent-id' | null,
    //           delta: { /* solo cambios */ },
    //           message: 'commit message',
    //           author: 'user',
    //           timestamp: '2024-...',
    //           branch: 'main'
    //         }
    //       }
    //     }
    //   },
    //   forks: { ... }
    // }

    branches: {},
    currentBranch: 'main',
    forks: {},

    // Inicializar el sistema de control de versiones
    init() {
        console.log('🔄 Inicializando sistema de control de versiones v2.0');

        // Inicializar estructuras
        if (!this.forks) this.forks = {};
        if (!this.branches) this.branches = {};
        if (!this.currentBranch) this.currentBranch = 'main';

        // Recuperar historial de commits del almacenamiento si existe
        this.loadHistory();

        // Si no hay rama main, crearla
        if (!this.branches.main) {
            this.branches.main = {
                baseSnapshot: null,
                head: null,
                commits: {}
            };
        }
    },

    // Crear un nuevo commit (ahora con deltas)
    commit(projectData, message = 'Auto-commit', author = 'user') {
        const commitId = window.uuid.generateUUID();
        const branch = this.branches[this.currentBranch];

        if (!branch) {
            console.error(`❌ Rama ${this.currentBranch} no existe`);
            return null;
        }

        // Obtener el estado anterior (reconstruir desde base + deltas)
        const previousState = this.getCurrentProjectState();

        let delta = null;

        // Si es el primer commit de la rama, guardar snapshot completo
        if (!branch.baseSnapshot) {
            console.log('📸 Primer commit - creando snapshot base');
            branch.baseSnapshot = jsondiffpatch.clone(projectData);
            delta = null; // No hay delta para el primer commit
        } else {
            // Calcular delta (solo cambios)
            console.log('🔍 Calculando delta...');
            delta = jsondiffpatch.diff(previousState, projectData);

            if (delta === null) {
                console.log('⚠️ No hay cambios para commitear');
                return null;
            }

            // Calcular tamaño del delta vs snapshot completo
            const deltaSize = JSON.stringify(delta).length;
            const fullSize = JSON.stringify(projectData).length;
            const savings = ((1 - deltaSize / fullSize) * 100).toFixed(1);
            console.log(`💾 Delta size: ${deltaSize} bytes vs Full: ${fullSize} bytes (${savings}% ahorro)`);
        }

        // Crear el objeto commit
        const commit = {
            id: commitId,
            parent: branch.head,
            delta: delta,
            message: message,
            author: author,
            timestamp: new Date().toISOString(),
            branch: this.currentBranch
        };

        // Registrar el commit
        branch.commits[commitId] = commit;

        // Actualizar el head de la rama
        branch.head = commitId;

        // Guardar en almacenamiento
        this.saveHistory();

        console.log(`✅ Commit creado: ${commitId} en rama ${this.currentBranch}`);
        return commitId;
    },

    // Crear una nueva rama basada en el commit actual
    createBranch(branchName, fromCommitId = null) {
        if (!branchName) {
            console.error('❌ Nombre de rama requerido');
            return false;
        }

        if (this.branches[branchName]) {
            console.error(`❌ Rama ${branchName} ya existe`);
            return false;
        }

        // Obtener el estado actual como snapshot base
        const currentState = this.getCurrentProjectState();

        // Crear la nueva rama con snapshot del estado actual
        this.branches[branchName] = {
            baseSnapshot: jsondiffpatch.clone(currentState),
            head: null,
            commits: {}
        };

        console.log(`🌿 Rama ${branchName} creada desde estado actual`);
        this.saveHistory();
        return true;
    },

    // Cambiar a una rama específica
    checkoutBranch(branchName) {
        if (!this.branches[branchName]) {
            console.error(`❌ Rama ${branchName} no existe`);
            return false;
        }

        this.currentBranch = branchName;
        console.log(`🔀 Cambiado a rama ${branchName}`);
        this.saveHistory();
        return true;
    },

    // Fusionar una rama en la rama actual
    mergeBranch(sourceBranch, targetBranch = null) {
        if (!targetBranch) {
            targetBranch = this.currentBranch;
        }

        if (!this.branches[sourceBranch] || !this.branches[targetBranch]) {
            console.error(`❌ Una de las ramas no existe: ${sourceBranch}, ${targetBranch}`);
            return false;
        }

        // Obtener el estado final de ambas ramas
        const sourceState = this.getProjectStateAtBranch(sourceBranch);
        const targetState = this.getCurrentProjectState();

        // Crear un commit de merge en la rama target
        this.currentBranch = targetBranch;
        const mergeCommitId = this.commit(
            sourceState,
            `Merge branch '${sourceBranch}' into '${targetBranch}'`,
            'user'
        );

        console.log(`🔗 Rama ${sourceBranch} fusionada en ${targetBranch}`);
        this.saveHistory();
        return true;
    },

    // Crear un fork del proyecto completo
    createFork(projectId, forkName, description = '') {
        const currentProjectData = Alpine.store('project').exportProject();

        // Crear nuevo ID para el fork
        const newProjectId = window.uuid.generateUUID();

        // Modificar el proyecto para el fork
        const forkProjectData = jsondiffpatch.clone(currentProjectData);
        forkProjectData.projectInfo.id = newProjectId;
        forkProjectData.projectInfo.title = forkName || `${currentProjectData.projectInfo.title} (Fork)`;
        forkProjectData.projectInfo.created = new Date().toISOString();
        forkProjectData.projectInfo.modified = new Date().toISOString();

        // Añadir metadatos del fork
        forkProjectData.forkInfo = {
            originalProjectId: projectId,
            forkedFrom: this.getCurrentCommitId(this.currentBranch),
            forkedAt: new Date().toISOString(),
            description: description
        };

        console.log(`⑂ Fork creado: ${forkProjectData.projectInfo.title} desde proyecto ${projectId}`);
        return forkProjectData;
    },

    // Registrar un fork
    registerFork(originalProjectId, forkInfo) {
        if (!this.forks) {
            this.forks = {};
        }

        if (!this.forks[originalProjectId]) {
            this.forks[originalProjectId] = [];
        }

        this.forks[originalProjectId].push(forkInfo);
        this.saveHistory();

        console.log(`📌 Fork registrado: ${forkInfo.forkProjectId} del proyecto ${originalProjectId}`);
        return true;
    },

    // Obtener forks de un proyecto
    getForks(projectId) {
        return this.forks?.[projectId] || [];
    },

    // Obtener un commit específico
    getCommit(commitId) {
        // Buscar en todas las ramas
        for (const branchName in this.branches) {
            const branch = this.branches[branchName];
            if (branch.commits[commitId]) {
                return branch.commits[commitId];
            }
        }
        return null;
    },

    // Obtener la historia completa de commits para una rama
    getBranchHistory(branchName = null) {
        if (!branchName) {
            branchName = this.currentBranch;
        }

        const branch = this.branches[branchName];
        if (!branch) {
            return [];
        }

        // Reconstruir la historia desde el head siguiendo parents
        const history = [];
        let currentId = branch.head;

        while (currentId) {
            const commit = branch.commits[currentId];
            if (!commit) break;

            history.push(commit);
            currentId = commit.parent;
        }

        return history;
    },

    // Obtener el último commit de una rama
    getCurrentCommitId(branchName = null) {
        if (!branchName) {
            branchName = this.currentBranch;
        }

        const branch = this.branches[branchName];
        if (!branch) {
            return null;
        }

        return branch.head;
    },

    // Reconstruir el estado del proyecto en un commit específico
    getProjectAtCommit(commitId) {
        // Buscar el commit en todas las ramas
        let targetBranch = null;
        let targetCommit = null;

        for (const branchName in this.branches) {
            const branch = this.branches[branchName];
            if (branch.commits[commitId]) {
                targetBranch = branch;
                targetCommit = branch.commits[commitId];
                break;
            }
        }

        if (!targetBranch || !targetCommit) {
            console.error('❌ Commit no encontrado');
            return null;
        }

        // Reconstruir el estado aplicando deltas desde la base
        return this._reconstructState(targetBranch, commitId);
    },

    // Método interno para reconstruir estado
    _reconstructState(branch, targetCommitId) {
        // Comenzar con el snapshot base
        let state = jsondiffpatch.clone(branch.baseSnapshot);

        // Si no hay commits o el target es el snapshot base, retornar base
        if (!targetCommitId) {
            return state;
        }

        // Obtener la cadena de commits hasta el target
        const commitChain = [];
        let currentId = targetCommitId;

        while (currentId) {
            const commit = branch.commits[currentId];
            if (!commit) break;

            commitChain.unshift(commit); // Agregar al inicio
            currentId = commit.parent;
        }

        // Aplicar deltas en orden
        for (const commit of commitChain) {
            if (commit.delta !== null) {
                state = jsondiffpatch.patch(state, commit.delta);
            }
        }

        return state;
    },

    // Obtener el estado actual del proyecto (head de la rama actual)
    getCurrentProjectState() {
        const branch = this.branches[this.currentBranch];

        if (!branch) {
            console.error('❌ Rama actual no existe');
            return Alpine.store('project').exportProject();
        }

        // Si no hay commits, retornar snapshot base o estado actual
        if (!branch.head) {
            return branch.baseSnapshot || Alpine.store('project').exportProject();
        }

        return this._reconstructState(branch, branch.head);
    },

    // Obtener estado en una rama específica
    getProjectStateAtBranch(branchName) {
        const branch = this.branches[branchName];
        if (!branch) {
            return null;
        }

        return this._reconstructState(branch, branch.head);
    },

    // Comparar dos commits
    compareCommits(commitId1, commitId2) {
        const state1 = this.getProjectAtCommit(commitId1);
        const state2 = this.getProjectAtCommit(commitId2);

        if (!state1 || !state2) {
            return null;
        }

        return {
            from: state1,
            to: state2,
            delta: jsondiffpatch.diff(state1, state2)
        };
    },

    // Deshacer al commit anterior
    revertToCommit(commitId) {
        const projectData = this.getProjectAtCommit(commitId);
        if (!projectData) {
            console.error('❌ Commit no encontrado');
            return false;
        }

        // Cargar el proyecto en el estado del commit
        Alpine.store('project').loadProject(projectData);
        console.log(`↩️ Estado revertido al commit ${commitId}`);
        return true;
    },

    // Guardar historial en almacenamiento
    saveHistory() {
        const historyData = {
            version: this.FORMAT_VERSION,
            branches: this.branches,
            forks: this.forks,
            currentBranch: this.currentBranch,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('pluma_version_history', JSON.stringify(historyData));

        // Calcular tamaño
        const size = new Blob([JSON.stringify(historyData)]).size;
        console.log(`💾 Historial de versiones guardado (${(size / 1024).toFixed(2)} KB)`);
    },

    // Cargar historial desde almacenamiento
    loadHistory() {
        try {
            const historyData = localStorage.getItem('pluma_version_history');
            if (historyData) {
                const parsed = JSON.parse(historyData);

                // Verificar versión
                if (parsed.version === '2.0') {
                    this.branches = parsed.branches || {};
                    this.forks = parsed.forks || {};
                    this.currentBranch = parsed.currentBranch || 'main';
                    console.log('📂 Historial de versiones v2.0 cargado');
                } else if (parsed.version === undefined) {
                    // Migrar de v1.0 a v2.0
                    console.log('🔄 Migrando historial de v1.0 a v2.0...');
                    this._migrateFromV1(parsed);
                } else {
                    console.warn('⚠️ Versión de historial desconocida, creando nuevo');
                    this.branches = {};
                    this.currentBranch = 'main';
                    this.forks = {};
                }
            } else {
                console.log('🆕 No hay historial de versiones previo');
            }
        } catch (error) {
            console.error('Error cargando historial de versiones:', error);
            // Inicializar con valores por defecto
            this.branches = {};
            this.forks = {};
            this.currentBranch = 'main';
        }
    },

    // Migrar de formato v1.0 a v2.0
    _migrateFromV1(oldData) {
        console.log('📦 Iniciando migración v1 -> v2...');

        // En v1, teníamos: commits, branches (array de IDs), forks
        const oldCommits = oldData.commits || {};
        const oldBranches = oldData.branches || {};

        // Crear estructura v2
        this.branches = {};
        this.forks = oldData.forks || {};

        // Migrar cada rama
        for (const branchName in oldBranches) {
            const commitIds = oldBranches[branchName];

            if (!commitIds || commitIds.length === 0) continue;

            // Crear nueva estructura de rama
            const newBranch = {
                baseSnapshot: null,
                head: null,
                commits: {}
            };

            // El primer commit se convierte en snapshot base
            const firstCommitId = commitIds[0];
            const firstCommit = oldCommits[firstCommitId];

            if (firstCommit && firstCommit.projectData) {
                newBranch.baseSnapshot = firstCommit.projectData;
                newBranch.head = firstCommitId;

                // Crear commit sin delta (es la base)
                newBranch.commits[firstCommitId] = {
                    id: firstCommitId,
                    parent: null,
                    delta: null,
                    message: firstCommit.message || 'Migrated from v1',
                    author: firstCommit.author || 'user',
                    timestamp: firstCommit.timestamp,
                    branch: branchName
                };

                // Procesar commits subsiguientes como deltas
                for (let i = 1; i < commitIds.length; i++) {
                    const commitId = commitIds[i];
                    const commit = oldCommits[commitId];
                    const prevCommit = oldCommits[commitIds[i - 1]];

                    if (commit && commit.projectData) {
                        const delta = jsondiffpatch.diff(
                            prevCommit.projectData,
                            commit.projectData
                        );

                        newBranch.commits[commitId] = {
                            id: commitId,
                            parent: commitIds[i - 1],
                            delta: delta,
                            message: commit.message || 'Migrated from v1',
                            author: commit.author || 'user',
                            timestamp: commit.timestamp,
                            branch: branchName
                        };

                        newBranch.head = commitId;
                    }
                }
            }

            this.branches[branchName] = newBranch;
        }

        this.currentBranch = oldData.currentBranch || 'main';

        // Guardar la versión migrada
        this.saveHistory();
        console.log('✅ Migración completada');
    },

    // Limpiar historial de versiones
    clearHistory() {
        this.branches = {};
        this.currentBranch = 'main';
        this.forks = {};
        localStorage.removeItem('pluma_version_history');
        console.log('🗑️ Historial de versiones eliminado');
    },

    // Obtener todas las ramas
    getAllBranches() {
        return Object.keys(this.branches);
    },

    // Obtener estadísticas del historial
    getHistoryStats() {
        const branchNames = this.getAllBranches();
        let totalCommits = 0;
        const commitsPerBranch = {};

        for (const branchName of branchNames) {
            const branch = this.branches[branchName];
            const commitCount = Object.keys(branch.commits).length;
            commitsPerBranch[branchName] = commitCount;
            totalCommits += commitCount;
        }

        return {
            version: this.FORMAT_VERSION,
            totalBranches: branchNames.length,
            totalCommits: totalCommits,
            commitsPerBranch: commitsPerBranch,
            currentBranch: this.currentBranch
        };
    }
};
