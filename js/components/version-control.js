// Componente de control de versiones para la interfaz de usuario
window.versionControlComponent = {
    init() {
        console.log('🔄 Componente de control de versiones inicializado');
    },

    // Crear un nuevo commit
    async createCommit() {
        const i18n = Alpine.store('i18n');
        
        // Abrir el modal de commit con datos del estado actual
        const projectStats = Alpine.store('project').getStats();
        const commitData = {
            message: '',
            author: 'User',
            projectStats: projectStats
        };
        
        Alpine.store('ui').openModal('createCommit', commitData);
    },

    // Crear un commit con mensaje predeterminado
    async createQuickCommit(message = 'Quick save') {
        const store = Alpine.store('project');
        
        try {
            const commitId = store.createCommit(message, 'User');
            if (commitId) {
                console.log(`✅ Commit rápido creado: ${commitId.substring(0, 8)}`);
            }
        } catch (error) {
            console.error('Error creando commit rápido:', error);
        }
    },

    // Crear un fork del proyecto actual
    async createFork() {
        const i18n = Alpine.store('i18n');
        
        // Abrir el modal de fork con datos del estado actual
        const projectStats = Alpine.store('project').getStats();
        const forkData = {
            name: (Alpine.store('project').projectInfo.title || 'Proyecto') + ' (Fork)',
            description: '',
            projectStats: projectStats
        };
        
        Alpine.store('ui').openModal('createFork', forkData);
    },

    // Ver historial de commits
    showCommitHistory() {
        // Actualizar el store de versiones y abrir el modal con los datos
        Alpine.store('versionControl').refreshState();
        const history = Alpine.store('project').getCommitHistory();
        Alpine.store('ui').openModal('versionHistory', { history: history });
    },

    // Cambiar a un commit específico
    checkoutCommit(commitId) {
        const store = Alpine.store('project');
        const i18n = Alpine.store('i18n');
        
        if (confirm(i18n.t('versionControl.checkoutConfirm') || '¿Estás seguro de que quieres cambiar al estado de este commit?')) {
            try {
                const success = store.checkoutCommit(commitId);
                if (success) {
                    Alpine.store('ui').success(
                        i18n.t('notifications.success.checkoutSuccess') || 'Checkout exitoso',
                        i18n.t('notifications.success.checkoutSuccessDesc') || `Estado cambiado al commit ${commitId.substring(0, 8)}`
                    );
                    // Actualizar la interfaz
                    Alpine.store('ui').refreshView();
                } else {
                    Alpine.store('ui').error(
                        i18n.t('notifications.error.checkoutFailed') || 'Error en checkout',
                        i18n.t('notifications.error.checkoutFailedDesc') || 'No se pudo cambiar al estado del commit'
                    );
                }
            } catch (error) {
                console.error('Error en checkout:', error);
                Alpine.store('ui').error(
                    i18n.t('notifications.error.checkoutFailed') || 'Error en checkout',
                    error.message
                );
            }
        }
    },

    // Crear un fork del proyecto
    async createFork() {
        const store = Alpine.store('project');
        const i18n = Alpine.store('i18n');
        
        const forkName = prompt(i18n.t('versionControl.forkName') || 'Nombre del fork:');
        if (!forkName) {
            return;
        }

        try {
            const forkId = store.createFork(forkName);
            if (forkId) {
                Alpine.store('ui').success(
                    i18n.t('notifications.success.forkCreated') || 'Fork creado exitosamente',
                    i18n.t('notifications.success.forkCreatedDesc') || `Fork ${forkName} creado`
                );
                
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
    },

    // Actualizar la interfaz con información de versiones
    updateVersionInfo() {
        const store = Alpine.store('project');
        try {
            const stats = store.getVersionStats();
            return stats;
        } catch (error) {
            console.error('Error obteniendo estadísticas de versiones:', error);
            return {
                totalBranches: 0,
                totalCommits: 0,
                commitsPerBranch: {},
                currentBranch: 'main'
            };
        }
    },
    
    // Mostrar la vista de forks
    showForksView() {
        Alpine.store('ui').openModal('forksView');
    },
    
    // Crear una estructura de árbol
    createTree() {
        const i18n = Alpine.store('i18n');
        
        // Abrir el modal de creación de árbol
        const treeData = {
            name: '',
            type: 'chapter',
            description: '',
            createFromCurrent: false
        };
        
        Alpine.store('ui').openModal('createTree', treeData);
    }
};