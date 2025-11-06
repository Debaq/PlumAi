// js/services/storage.js
// Este servicio maneja la persistencia de datos en localStorage e IndexedDB (Dexie.js)

// Importar Dexie.js (asumiendo que se carga globalmente en index.html o se importa)
// Si Dexie no está disponible globalmente, se necesitaría un import dinámico o un bundler.
// Por ahora, asumimos que Dexie está disponible en `window.Dexie`.

const DB_NAME = 'PlumaAIDB';
const DB_VERSION = 1;

class StorageService {
    constructor() {
        if (typeof Dexie === 'undefined') {
            console.warn('Dexie.js no está cargado. IndexedDB no estará disponible.');
            this.db = null;
        } else {
            this.db = new Dexie(DB_NAME);
            this.db.version(DB_VERSION).stores({
                projects: 'id,title,modified' // id es la clave primaria, title y modified son indexados
            });
            this.db.open().catch(e => {
                console.error("Error al abrir IndexedDB:", e);
                this.db = null; // Deshabilitar IndexedDB si hay un error
            });
        }
    }

    // ===========================================
    // LOCALSTORAGE
    // ===========================================

    saveProjectToLocalStorage(project) {
        try {
            localStorage.setItem('pluma_current_project', JSON.stringify(project));
            console.log('💾 Proyecto guardado en localStorage.');
            return true;
        } catch (e) {
            console.error('Error al guardar en localStorage:', e);
            return false;
        }
    }

    loadProjectFromLocalStorage() {
        try {
            const project = localStorage.getItem('pluma_current_project');
            if (project) {
                console.log('📂 Proyecto cargado desde localStorage.');
                return JSON.parse(project);
            }
        } catch (e) {
            console.error('Error al cargar desde localStorage:', e);
        }
        return null;
    }

    // ===========================================
    // INDEXEDDB (para proyectos grandes)
    // ===========================================

    async saveProjectToIndexedDB(project) {
        if (!this.db) {
            console.warn('IndexedDB no está disponible. No se puede guardar el proyecto.');
            return false;
        }
        try {
            await this.db.projects.put(project);
            console.log(`💾 Proyecto '${project.projectInfo.title}' guardado en IndexedDB.`);
            return true;
        } catch (e) {
            console.error('Error al guardar en IndexedDB:', e);
            return false;
        }
    }

    async loadProjectFromIndexedDB(projectId) {
        if (!this.db) {
            console.warn('IndexedDB no está disponible. No se puede cargar el proyecto.');
            return null;
        }
        try {
            const project = await this.db.projects.get(projectId);
            if (project) {
                console.log(`📂 Proyecto '${project.projectInfo.title}' cargado desde IndexedDB.`);
                return project;
            }
        } catch (e) {
            console.error('Error al cargar desde IndexedDB:', e);
        }
        return null;
    }

    async getAllProjectsFromIndexedDB() {
        if (!this.db) {
            console.warn('IndexedDB no está disponible. No se pueden listar proyectos.');
            return [];
        }
        try {
            return await this.db.projects.toArray();
        } catch (e) {
            console.error('Error al listar proyectos desde IndexedDB:', e);
            return [];
        }
    }

    async deleteProjectFromIndexedDB(projectId) {
        if (!this.db) {
            console.warn('IndexedDB no está disponible. No se puede eliminar el proyecto.');
            return false;
        }
        try {
            await this.db.projects.delete(projectId);
            console.log(`🗑️ Proyecto '${projectId}' eliminado de IndexedDB.`);
            return true;
        } catch (e) {
            console.error('Error al eliminar de IndexedDB:', e);
            return false;
        }
    }
}

window.storageService = new StorageService();