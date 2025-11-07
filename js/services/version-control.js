// Sistema de control de versiones tipo Git para PlumaAI
// Implementa commits, ramas, y forks para proyectos de novelas

window.versionControl = {
    // Estructura para almacenar el historial de commits
    commits: {},
    branches: {},
    currentBranch: 'main',
    
    // Inicializar el sistema de control de versiones
    init() {
        console.log('🔄 Inicializando sistema de control de versiones');
        // Inicializar estructuras
        if (!this.forks) this.forks = {};
        if (!this.commits) this.commits = {};
        if (!this.branches) this.branches = {};
        if (!this.currentBranch) this.currentBranch = 'main';
        
        // Recuperar historial de commits del almacenamiento si existe
        this.loadHistory();
    },

    // Crear un nuevo commit
    commit(projectData, message = 'Auto-commit', author = 'user') {
        const commitId = window.uuid.generateUUID();
        
        // Crear el objeto commit
        const commit = {
            id: commitId,
            parentId: this.getCurrentCommitId(this.currentBranch),
            projectData: JSON.parse(JSON.stringify(projectData)), // Copia profunda
            message: message,
            author: author,
            timestamp: new Date().toISOString(),
            branch: this.currentBranch
        };
        
        // Registrar el commit
        this.commits[commitId] = commit;
        
        // Actualizar la rama actual para apuntar a este commit
        if (!this.branches[this.currentBranch]) {
            this.branches[this.currentBranch] = [];
        }
        this.branches[this.currentBranch].push(commitId);
        
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
        
        // Usar el commit actual si no se especifica otro
        const sourceCommitId = fromCommitId || this.getCurrentCommitId(this.currentBranch);
        
        // Crear la nueva rama
        this.branches[branchName] = [sourceCommitId];
        
        console.log(`🌿 Rama ${branchName} creada desde commit ${sourceCommitId}`);
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
        
        // Obtener el último commit de la rama fuente
        const sourceCommitId = this.branches[sourceBranch][this.branches[sourceBranch].length - 1];
        
        // Añadir este commit a la rama destino
        this.branches[targetBranch].push(sourceCommitId);
        
        console.log(`🔗 Rama ${sourceBranch} fusionada en ${targetBranch}`);
        this.saveHistory();
        return true;
    },

    // Crear un fork del proyecto completo (nueva copia con su propia historia)
    createFork(projectId, forkName, description = '') {
        // En este caso, un fork es efectivamente un nuevo proyecto con la historia copiada
        // Esto implica crear un nuevo proyecto con el mismo contenido pero ID diferente
        const currentProjectData = Alpine.store('project').exportProject();
        
        // Crear nuevo ID para el fork
        const newProjectId = window.uuid.generateUUID();
        
        // Modificar el proyecto para el fork
        const forkProjectData = JSON.parse(JSON.stringify(currentProjectData));
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

    // Registrar un fork en el proyecto original (para seguimiento)
    registerFork(originalProjectId, forkInfo) {
        // En una implementación completa, aquí se guardaría el registro del fork
        // relacionado con el proyecto original
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
        return this.commits[commitId] || null;
    },

    // Obtener la historia completa de commits para una rama
    getBranchHistory(branchName = null) {
        if (!branchName) {
            branchName = this.currentBranch;
        }
        
        if (!this.branches[branchName]) {
            return [];
        }
        
        return this.branches[branchName].map(commitId => this.getCommit(commitId)).filter(commit => commit !== null);
    },

    // Obtener el último commit de una rama
    getCurrentCommitId(branchName = null) {
        if (!branchName) {
            branchName = this.currentBranch;
        }
        
        const branch = this.branches[branchName];
        if (!branch || branch.length === 0) {
            return null;
        }
        
        return branch[branch.length - 1];
    },

    // Obtener el proyecto en un estado específico de un commit
    getProjectAtCommit(commitId) {
        const commit = this.getCommit(commitId);
        return commit ? commit.projectData : null;
    },

    // Obtener todas las ramas
    getAllBranches() {
        return Object.keys(this.branches);
    },

    // Obtener el commit actual (último en la rama actual)
    getCurrentProjectState() {
        const currentCommitId = this.getCurrentCommitId();
        if (!currentCommitId) {
            // Si no hay commits, devolver el estado actual del proyecto
            return Alpine.store('project').exportProject();
        }
        return this.getProjectAtCommit(currentCommitId);
    },

    // Comparar dos commits y obtener diferencias
    compareCommits(commitId1, commitId2) {
        const commit1 = this.getCommit(commitId1);
        const commit2 = this.getCommit(commitId2);
        
        if (!commit1 || !commit2) {
            return null;
        }
        
        // Esta función devolvería un objeto con las diferencias entre los dos estados del proyecto
        // Por simplicidad en esta implementación, devolvemos ambos estados
        return {
            from: commit1.projectData,
            to: commit2.projectData
        };
    },

    // Deshacer al commit anterior (soft reset)
    revertToCommit(commitId) {
        // Esta función restablecería el estado del proyecto al del commit especificado
        // en la rama actual
        const commit = this.getCommit(commitId);
        if (!commit) {
            console.error('❌ Commit no encontrado');
            return false;
        }
        
        // Cargar el proyecto en el estado del commit
        Alpine.store('project').loadProject(commit.projectData);
        console.log(`↩️ Estado revertido al commit ${commitId}`);
        return true;
    },

    // Guardar historial en almacenamiento
    saveHistory() {
        // Guardar el historial de commits, ramas y forks
        const historyData = {
            commits: this.commits,
            branches: this.branches,
            forks: this.forks,
            currentBranch: this.currentBranch,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('pluma_version_history', JSON.stringify(historyData));
        console.log('💾 Historial de versiones guardado');
    },

    // Cargar historial desde almacenamiento
    loadHistory() {
        try {
            const historyData = localStorage.getItem('pluma_version_history');
            if (historyData) {
                const parsed = JSON.parse(historyData);
                this.commits = parsed.commits || {};
                this.branches = parsed.branches || {};
                this.forks = parsed.forks || {};
                this.currentBranch = parsed.currentBranch || 'main';
                console.log('📂 Historial de versiones cargado');
            } else {
                console.log('🆕 No hay historial de versiones previo');
            }
        } catch (error) {
            console.error('Error cargando historial de versiones:', error);
            // Inicializar con valores por defecto si hay error
            this.commits = {};
            this.branches = {};
            this.forks = {};
            this.currentBranch = 'main';
        }
    },

    // Limpiar historial de versiones
    clearHistory() {
        this.commits = {};
        this.branches = {};
        this.currentBranch = 'main';
        localStorage.removeItem('pluma_version_history');
        console.log('🗑️ Historial de versiones eliminado');
    },

    // Obtener estadísticas del historial
    getHistoryStats() {
        const branchNames = this.getAllBranches();
        const totalCommits = Object.keys(this.commits).length;
        const commitsPerBranch = {};
        
        for (const branchName of branchNames) {
            commitsPerBranch[branchName] = this.branches[branchName].length;
        }
        
        return {
            totalBranches: branchNames.length,
            totalCommits: totalCommits,
            commitsPerBranch: commitsPerBranch,
            currentBranch: this.currentBranch
        };
    }
};