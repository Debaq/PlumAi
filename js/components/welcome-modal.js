// Welcome Modal Component for PlumaAI - Function that returns the component object
window.welcomeModalComponent = function() {
    return {
        lastProject: null,
        
        async init() {
            // Cargar la lista de proyectos para ver si hay alguno reciente
            try {
                if (window.storageManager) {
                    const projects = await window.storageManager.getProjectsList();
                    if (projects && projects.length > 0) {
                        // Tomar el primer proyecto (más reciente) de la lista
                        this.lastProject = projects[0];
                        // Guardar en el store de UI para que esté disponible en el template
                        Alpine.store('ui').lastProject = projects[0];
                    }
                }
            } catch (error) {
                console.error('Error loading projects list in welcome modal:', error);
                // No hacer nada, simplemente no mostrar el botón de proyecto reciente
            }
        },
        
        async loadLastProject() {
            if (this.lastProject) {
                try {
                    // Cerrar el modal actual - acceder a través de Alpine.store
                    Alpine.store('ui').closeModal('welcome');
                    
                    // Cargar el proyecto desde el storage usando el método correcto
                    const projectData = await window.storageManager.load(this.lastProject.id);
                    if (projectData) {
                        Alpine.store('project').loadProject(projectData);
                        Alpine.store('ui').success(Alpine.store('i18n').t('notifications.success.projectLoaded'), 
                                                  Alpine.store('i18n').t('notifications.success.projectLoadedDesc', { projectName: projectData.projectInfo.title }));
                    } else {
                        Alpine.store('ui').error(Alpine.store('i18n').t('notifications.error.projectLoad'), '');
                        // Si falla, abrir modal de nuevo proyecto
                        Alpine.store('ui').openModal('newProject');
                    }
                } catch (error) {
                    console.error('Error loading last project:', error);
                    Alpine.store('ui').error(Alpine.store('i18n').t('notifications.error.projectLoad'), error.message);
                    Alpine.store('ui').openModal('newProject');
                }
            }
        }
    };
};