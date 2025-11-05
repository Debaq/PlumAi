// Storage Service for PlumaAI
// Gestión de múltiples proyectos con localStorage

window.storageService = {
    // Keys
    PROJECTS_LIST_KEY: 'pluma_projects_list',
    CURRENT_PROJECT_KEY: 'pluma_current_project_id',
    PROJECT_PREFIX: 'pluma_project_',

    // Obtener lista de proyectos guardados
    getProjectsList() {
        try {
            const list = localStorage.getItem(this.PROJECTS_LIST_KEY);
            return list ? JSON.parse(list) : [];
        } catch (e) {
            console.error('Error loading projects list:', e);
            return [];
        }
    },

    // Guardar lista de proyectos
    saveProjectsList(list) {
        try {
            localStorage.setItem(this.PROJECTS_LIST_KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            console.error('Error saving projects list:', e);
            return false;
        }
    },

    // Obtener ID del proyecto actual
    getCurrentProjectId() {
        return localStorage.getItem(this.CURRENT_PROJECT_KEY);
    },

    // Establecer proyecto actual
    setCurrentProjectId(projectId) {
        if (projectId) {
            localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId);
        } else {
            localStorage.removeItem(this.CURRENT_PROJECT_KEY);
        }
    },

    // Guardar proyecto completo
    saveProject(projectData) {
        try {
            const projectId = projectData.projectInfo.id;
            if (!projectId) {
                console.error('Project ID is required');
                return false;
            }

            // Guardar el proyecto
            const key = this.PROJECT_PREFIX + projectId;
            localStorage.setItem(key, JSON.stringify(projectData));

            // Actualizar lista de proyectos
            this.updateProjectInList(projectData.projectInfo);

            // Establecer como proyecto actual
            this.setCurrentProjectId(projectId);

            console.log(`✅ Project saved: ${projectData.projectInfo.title}`);
            return true;
        } catch (e) {
            console.error('Error saving project:', e);
            if (e.name === 'QuotaExceededError') {
                alert('No hay suficiente espacio en el almacenamiento local. Considera exportar y eliminar proyectos antiguos.');
            }
            return false;
        }
    },

    // Cargar proyecto por ID
    loadProject(projectId) {
        try {
            const key = this.PROJECT_PREFIX + projectId;
            const data = localStorage.getItem(key);

            if (!data) {
                console.error('Project not found:', projectId);
                return null;
            }

            const project = JSON.parse(data);
            this.setCurrentProjectId(projectId);

            console.log(`✅ Project loaded: ${project.projectInfo.title}`);
            return project;
        } catch (e) {
            console.error('Error loading project:', e);
            return null;
        }
    },

    // Actualizar información del proyecto en la lista
    updateProjectInList(projectInfo) {
        let list = this.getProjectsList();

        const index = list.findIndex(p => p.id === projectInfo.id);

        const listItem = {
            id: projectInfo.id,
            title: projectInfo.title,
            author: projectInfo.author,
            genre: projectInfo.genre,
            created: projectInfo.created,
            modified: projectInfo.modified,
            wordCount: 0 // Se puede calcular si se necesita
        };

        if (index !== -1) {
            list[index] = listItem;
        } else {
            list.push(listItem);
        }

        // Ordenar por fecha de modificación (más reciente primero)
        list.sort((a, b) => new Date(b.modified) - new Date(a.modified));

        this.saveProjectsList(list);
    },

    // Eliminar proyecto
    deleteProject(projectId) {
        try {
            // Eliminar el proyecto
            const key = this.PROJECT_PREFIX + projectId;
            localStorage.removeItem(key);

            // Actualizar lista
            let list = this.getProjectsList();
            list = list.filter(p => p.id !== projectId);
            this.saveProjectsList(list);

            // Si era el proyecto actual, limpiar
            if (this.getCurrentProjectId() === projectId) {
                this.setCurrentProjectId(null);
            }

            console.log(`🗑️ Project deleted: ${projectId}`);
            return true;
        } catch (e) {
            console.error('Error deleting project:', e);
            return false;
        }
    },

    // Exportar proyecto a JSON
    exportProject(projectData) {
        try {
            const json = JSON.stringify(projectData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const filename = `${projectData.projectInfo.title || 'proyecto'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();

            URL.revokeObjectURL(url);

            console.log(`📥 Project exported: ${filename}`);
            return true;
        } catch (e) {
            console.error('Error exporting project:', e);
            return false;
        }
    },

    // Importar proyecto desde JSON
    importProject(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);

                    // Validar estructura básica
                    if (!projectData.projectInfo || !projectData.projectInfo.id) {
                        reject(new Error('Formato de proyecto inválido'));
                        return;
                    }

                    // Generar nuevo ID para evitar conflictos
                    const oldId = projectData.projectInfo.id;
                    projectData.projectInfo.id = crypto.randomUUID();
                    projectData.projectInfo.modified = new Date().toISOString();

                    // Guardar proyecto importado
                    const success = this.saveProject(projectData);

                    if (success) {
                        console.log(`📤 Project imported: ${projectData.projectInfo.title}`);
                        resolve(projectData);
                    } else {
                        reject(new Error('Error al guardar el proyecto importado'));
                    }
                } catch (e) {
                    reject(e);
                }
            };

            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };

            reader.readAsText(file);
        });
    },

    // Obtener tamaño usado en localStorage
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    },

    // Limpiar proyectos antiguos (mantener solo los N más recientes)
    cleanOldProjects(keepCount = 10) {
        const list = this.getProjectsList();

        if (list.length <= keepCount) {
            return 0; // No hay nada que limpiar
        }

        // Ordenar por fecha de modificación
        list.sort((a, b) => new Date(b.modified) - new Date(a.modified));

        // Eliminar los más antiguos
        const toDelete = list.slice(keepCount);
        let deleted = 0;

        toDelete.forEach(project => {
            if (this.deleteProject(project.id)) {
                deleted++;
            }
        });

        console.log(`🧹 Cleaned ${deleted} old projects`);
        return deleted;
    },

    // Auto-guardado (llamar periódicamente)
    autoSave(projectStore) {
        if (!projectStore.isProjectInitialized()) {
            return false;
        }

        const projectData = projectStore.exportProject();
        return this.saveProject(projectData);
    },

    // Inicializar - cargar proyecto actual si existe
    init() {
        const currentId = this.getCurrentProjectId();
        if (currentId) {
            return this.loadProject(currentId);
        }
        return null;
    }
};
