// Store de control de versiones para PlumaAI
window.versionControlStore = {
    // Estado actual del sistema de versiones
    currentBranch: 'main',
    branches: [],
    commits: [],
    
    init() {
        console.log('🔄 Store de control de versiones inicializado');
        // Cargar estado inicial desde el sistema de control de versiones
        try {
            this.refreshState();
        } catch (error) {
            console.error('Error inicializando store de versiones:', error);
        }
    },
    
    // Actualizar el estado desde el sistema de control de versiones
    refreshState() {
        this.currentBranch = window.versionControl.currentBranch;
        this.branches = window.versionControl.getAllBranches();
        this.commits = window.versionControl.getBranchHistory(); // Usar el sistema directamente en lugar del proyecto
    },
    
    // Obtener estadísticas del historial
    getStats() {
        return Alpine.store('project').getVersionStats();
    },
    
    // Crear un nuevo commit
    createCommit(message = 'Auto-commit', author = 'user') {
        return Alpine.store('project').createCommit(message, author);
    },
    
    // Crear un fork del proyecto actual
    createFork(forkName, description = '') {
        return Alpine.store('project').createFork(forkName, description);
    },
    
    // Obtener historial de commits
    getCommitHistory() {
        return window.versionControl.getBranchHistory();
    },
    
    // Cambiar a un estado específico del proyecto desde un commit
    checkoutCommit(commitId) {
        return Alpine.store('project').checkoutCommit(commitId);
    },
    
    // Obtener forks del proyecto actual
    getProjectForks() {
        try {
            const projectId = Alpine.store('project').projectInfo.id;
            if (!projectId) {
                console.warn('No hay proyecto inicializado para obtener forks');
                return [];
            }
            
            // Obtener forks del proyecto original (no del fork actual)
            let originalProjectId = projectId;
            const forkInfo = Alpine.store('project').forkInfo;
            if (forkInfo && forkInfo.originalProjectId) {
                // Si este proyecto es un fork, obtenemos los forks del proyecto original
                originalProjectId = forkInfo.originalProjectId;
            }
            
            // Obtener forks del proyecto original
            const forks = window.versionControl.getForks(originalProjectId) || [];
            
            return forks;
        } catch (error) {
            console.error('Error obteniendo forks:', error);
            return [];
        }
    }
};