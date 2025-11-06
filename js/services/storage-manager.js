// Storage Manager - Sistema híbrido de almacenamiento
// Soporta: localStorage, archivos locales (.pluma), y servidor (futuro)

window.storageManager = {
    // Modos de almacenamiento
    STORAGE_MODES: {
        LOCAL: 'local',      // localStorage (por defecto)
        FILE: 'file',        // Archivo local .pluma
        CLOUD: 'cloud'       // Servidor (futuro)
    },

    // Estado actual
    currentMode: 'local',
    fileHandle: null,       // File System Access API handle
    cloudToken: null,       // Token de autenticación (futuro)
    syncEnabled: true,

    // Configuración
    config: {
        autoSaveDelay: 2000,
        enableFileSync: true,
        enableCloudSync: false, // Por desarrollar
        fileExtension: '.pluma',
        useIndexedDB: true // Nuevo: para decidir si usar IndexedDB
    },

    // ============================================
    // DETECCIÓN DE COMPATIBILIDAD
    // ============================================

    get supportsFileSystem() {
        return 'showOpenFilePicker' in window;
    },

    get supportsCloudSync() {
        // Por desarrollar: verificar si hay conexión al servidor
        return false;
    },

    // ============================================
    // MODO: ARCHIVO LOCAL (.pluma)
    // ============================================

    async openProjectFile() {
        if (!this.supportsFileSystem) {
            throw new Error('Tu navegador no soporta File System Access API. Usa Chrome, Edge u Opera.');
        }

        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'PlumaAI Projects',
                    accept: {
                        'application/json': ['.pluma', '.json']
                    }
                }],
                excludeAcceptAllOption: true
            });

            const file = await fileHandle.getFile();
            const content = await file.text();
            const projectData = JSON.parse(content);

            // Guardar el handle para poder escribir después
            this.fileHandle = fileHandle;
            this.currentMode = this.STORAGE_MODES.FILE;

            console.log(`📁 Archivo abierto: ${file.name}`);
            return projectData;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Usuario canceló la selección de archivo');
                return null;
            }
            throw error;
        }
    },

    async saveAsFile(projectData) {
        if (!this.supportsFileSystem) {
            throw new Error('Tu navegador no soporta File System Access API');
        }

        try {
            const options = {
                types: [{
                    description: 'PlumaAI Projects',
                    accept: {
                        'application/json': ['.pluma']
                    }
                }],
                suggestedName: `${projectData.projectInfo.title || 'proyecto'}${this.config.fileExtension}`
            };

            const fileHandle = await window.showSaveFilePicker(options);

            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(projectData, null, 2));
            await writable.close();

            this.fileHandle = fileHandle;
            this.currentMode = this.STORAGE_MODES.FILE;

            console.log(`💾 Guardado como archivo: ${fileHandle.name}`);
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                return false;
            }
            throw error;
        }
    },

    async saveToFile(projectData) {
        if (!this.fileHandle) {
            return await this.saveAsFile(projectData);
        }

        try {
            // Verificar permisos
            const permission = await this.verifyFilePermission(this.fileHandle);
            if (!permission) {
                throw new Error('No hay permisos para escribir en el archivo');
            }

            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(projectData, null, 2));
            await writable.close();

            console.log('💾 Archivo actualizado');
            return true;
        } catch (error) {
            console.error('Error guardando en archivo:', error);
            // Si falla, intentar "Guardar como"
            return await this.saveAsFile(projectData);
        }
    },

    async verifyFilePermission(fileHandle) {
        const options = { mode: 'readwrite' };

        // Verificar si ya tenemos permiso
        if ((await fileHandle.queryPermission(options)) === 'granted') {
            return true;
        }

        // Pedir permiso
        if ((await fileHandle.requestPermission(options)) === 'granted') {
            return true;
        }

        return false;
    },

    getFileName() {
        return this.fileHandle ? this.fileHandle.name : null;
    },

    closeFile() {
        this.fileHandle = null;
        if (this.currentMode === this.STORAGE_MODES.FILE) {
            this.currentMode = this.STORAGE_MODES.LOCAL;
        }
    },

    // ============================================
    // MODO: SERVIDOR (CLOUD) - Por desarrollar
    // ============================================

    async syncToCloud(projectData) {
        if (!this.config.enableCloudSync) {
            console.log('☁️ Sincronización con servidor deshabilitada');
            return false;
        }

        if (!this.cloudToken) {
            console.log('⚠️ No hay token de autenticación');
            return false;
        }

        // TODO: Implementar cuando haya backend
        console.log('☁️ Sync to cloud - Por implementar');

        /*
        try {
            const response = await fetch('/api/projects/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.cloudToken}`
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) throw new Error('Error en servidor');

            console.log('☁️ Proyecto sincronizado con servidor');
            return true;
        } catch (error) {
            console.error('Error sync to cloud:', error);
            return false;
        }
        */

        return false;
    },

    async loadFromCloud(projectId) {
        // TODO: Implementar cuando haya backend
        console.log('☁️ Load from cloud - Por implementar');
        return null;
    },

    setCloudToken(token) {
        this.cloudToken = token;
        localStorage.setItem('pluma_cloud_token', token);
    },

    clearCloudToken() {
        this.cloudToken = null;
        localStorage.removeItem('pluma_cloud_token');
    },

    // ============================================
    // CONFIGURACIÓN Y ESTADO
    // ============================================

    getStatus() {
        return {
            currentMode: this.currentMode,
            hasFileOpen: !!this.fileHandle,
            fileName: this.getFileName(),
            cloudConnected: !!this.cloudToken,
            supportsFileSystem: this.supportsFileSystem,
            supportsCloudSync: this.supportsCloudSync,
            syncEnabled: this.syncEnabled
        };
    },

    setSyncMode(mode, enabled) {
        switch (mode) {
            case 'file':
                this.config.enableFileSync = enabled;
                break;
            case 'cloud':
                this.config.enableCloudSync = enabled;
                break;
        }
        this.saveConfig();
    },

    saveConfig() {
        localStorage.setItem('pluma_storage_config', JSON.stringify(this.config));
    },

    loadConfig() {
        const saved = localStorage.getItem('pluma_storage_config');
        if (saved) {
            try {
                this.config = { ...this.config, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading storage config:', e);
            }
        }
    },

    init() {
        this.loadConfig();

        // Cargar token de cloud si existe
        const token = localStorage.getItem('pluma_cloud_token');
        if (token) {
            this.cloudToken = token;
        }

        console.log('💾 Storage Manager initialized');
        console.log('📊 Status:', this.getStatus());
    },

    // ============================================
    // MÉTODOS DE ALMACENAMIENTO UNIFICADOS
    // ============================================

    // Método principal para guardar proyecto
    async save(projectData) {
        const results = {
            local: false,
            file: false,
            indexedDB: false,
            cloud: false
        };

        // Guardar en localStorage
        try {
            if (projectData.projectInfo && projectData.projectInfo.id) {
                localStorage.setItem(`pluma_project_${projectData.projectInfo.id}`, JSON.stringify(projectData));
                results.local = true;
                console.log(`📝 Guardado en localStorage: ${projectData.projectInfo.title}`);
            }
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
        }

        // Si hay archivo abierto, guardar en archivo
        if (this.fileHandle && this.currentMode === this.STORAGE_MODES.FILE) {
            try {
                await this.saveToFile(projectData);
                results.file = true;
            } catch (e) {
                console.error('Error guardando en archivo:', e);
            }
        }

        // Guardar en IndexedDB si está habilitado
        if (this.config.useIndexedDB) {
            try {
                await this.saveToIndexedDB(projectData);
                results.indexedDB = true;
            } catch (e) {
                console.error('Error guardando en IndexedDB:', e);
            }
        }

        // Intentar sincronizar con servidor si está habilitado
        if (this.config.enableCloudSync && this.cloudToken) {
            try {
                await this.syncToCloud(projectData);
                results.cloud = true;
            } catch (e) {
                console.error('Error guardando en servidor:', e);
            }
        }

        return results;
    },

    // Método principal para cargar proyecto
    async load(projectId) {
        let projectData = null;

        // Intentar cargar desde archivo si hay un archivo abierto y es el proyecto correcto
        if (this.fileHandle && this.currentMode === this.STORAGE_MODES.FILE) {
            try {
                const fileProjectData = await this.openProjectFile();
                if (fileProjectData && fileProjectData.projectInfo.id === projectId) {
                    console.log(`📂 Cargado desde archivo: ${fileProjectData.projectInfo.title}`);
                    return fileProjectData;
                }
            } catch (e) {
                console.error('Error cargando desde archivo:', e);
            }
        }

        // Intentar cargar desde IndexedDB primero si está habilitada
        if (this.config.useIndexedDB) {
            try {
                projectData = await this.loadFromIndexedDB(projectId);
                if (projectData) {
                    console.log(`💾 Cargado desde IndexedDB: ${projectData.projectInfo.title}`);
                    return projectData;
                }
            } catch (e) {
                console.error('Error cargando desde IndexedDB:', e);
            }
        }

        // Intentar cargar desde localStorage
        try {
            const storedProject = localStorage.getItem(`pluma_project_${projectId}`);
            if (storedProject) {
                projectData = JSON.parse(storedProject);
                console.log(`📝 Cargado desde localStorage: ${projectData.projectInfo.title}`);
                return projectData;
            }
        } catch (e) {
            console.error('Error cargando desde localStorage:', e);
        }

        // Intentar cargar desde servidor si está habilitado
        if (this.config.enableCloudSync && this.cloudToken) {
            try {
                projectData = await this.loadFromCloud(projectId);
                if (projectData) {
                    console.log(`☁️ Cargado desde servidor: ${projectData.projectInfo.title}`);
                    return projectData;
                }
            } catch (e) {
                console.error('Error cargando desde servidor:', e);
            }
        }

        return null;
    },

    // Método para eliminar proyecto
    async delete(projectId) {
        const results = {
            local: false,
            file: false,
            indexedDB: false,
            cloud: false
        };

        // Eliminar de localStorage
        try {
            localStorage.removeItem(`pluma_project_${projectId}`);
            results.local = true;
        } catch (e) {
            console.error('Error eliminando de localStorage:', e);
        }

        // Eliminar de IndexedDB
        if (this.config.useIndexedDB) {
            try {
                await this.deleteFromIndexedDB(projectId);
                results.indexedDB = true;
            } catch (e) {
                console.error('Error eliminando de IndexedDB:', e);
            }
        }

        return results;
    },

    // Método para eliminar proyecto (alias para compatibilidad)
    deleteProject(projectId) {
        return this.delete(projectId);
    },

    // ============================================
    // MÉTODOS PARA INDEXEDDB
    // ============================================

    async saveToIndexedDB(projectData) {
        // Verificar si IndexedDB está disponible
        if (!window.indexedDB) {
            throw new Error('IndexedDB no está disponible en este navegador');
        }

        // Limpiar el objeto para evitar problemas de serialización en IndexedDB
        const cleanProjectData = this.cleanObjectForStorage(projectData);

        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('PlumaDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['projects'], 'readwrite');
                const store = transaction.objectStore('projects');

                const putRequest = store.put(cleanProjectData);

                putRequest.onsuccess = () => {
                    console.log(`📦 Guardado en IndexedDB: ${cleanProjectData.projectInfo.title}`);
                    resolve(putRequest.result);
                };
                putRequest.onerror = () => reject(putRequest.error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    const store = db.createObjectStore('projects', { keyPath: 'projectInfo.id' });
                    store.createIndex('title', 'projectInfo.title', { unique: false });
                    store.createIndex('author', 'projectInfo.author', { unique: false });
                    store.createIndex('created', 'projectInfo.created', { unique: false });
                    store.createIndex('modified', 'projectInfo.modified', { unique: false });
                }
            };
        });
    },

    // Método auxiliar para limpiar objetos antes de guardarlos
    cleanObjectForStorage(obj) {
        // Convertir el objeto a JSON y luego de vuelta a objeto para eliminar funciones y referencias
        return JSON.parse(JSON.stringify(obj));
    },

    async loadFromIndexedDB(projectId) {
        if (!window.indexedDB) {
            throw new Error('IndexedDB no está disponible en este navegador');
        }

        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('PlumaDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['projects'], 'readonly');
                const store = transaction.objectStore('projects');

                const getRequest = store.get(projectId);

                getRequest.onsuccess = () => {
                    if (getRequest.result) {
                        // Asegurar que el objeto esté completamente deserializado
                        resolve(typeof(getRequest.result) === 'object' ? this.cleanObjectForStorage(getRequest.result) : getRequest.result);
                    } else {
                        resolve(null);
                    }
                };
                getRequest.onerror = () => reject(getRequest.error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    const store = db.createObjectStore('projects', { keyPath: 'projectInfo.id' });
                    store.createIndex('title', 'projectInfo.title', { unique: false });
                    store.createIndex('author', 'projectInfo.author', { unique: false });
                    store.createIndex('created', 'projectInfo.created', { unique: false });
                    store.createIndex('modified', 'projectInfo.modified', { unique: false });
                }
            };
        });
    },

    async deleteFromIndexedDB(projectId) {
        if (!window.indexedDB) {
            throw new Error('IndexedDB no está disponible en este navegador');
        }

        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('PlumaDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['projects'], 'readwrite');
                const store = transaction.objectStore('projects');

                const deleteRequest = store.delete(projectId);

                deleteRequest.onsuccess = () => resolve(deleteRequest.result);
                deleteRequest.onerror = () => reject(deleteRequest.error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    const store = db.createObjectStore('projects', { keyPath: 'projectInfo.id' });
                    store.createIndex('title', 'projectInfo.title', { unique: false });
                    store.createIndex('author', 'projectInfo.author', { unique: false });
                    store.createIndex('created', 'projectInfo.created', { unique: false });
                    store.createIndex('modified', 'projectInfo.modified', { unique: false });
                }
            };
        });
    },

    // Método para importar proyecto desde archivo
    async importProject(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const projectData = JSON.parse(event.target.result);
                    
                    // Validar estructura básica del proyecto
                    if (!projectData.projectInfo || !projectData.projectInfo.id) {
                        throw new Error('Archivo de proyecto inválido: falta información del proyecto');
                    }
                    
                    // Guardar el proyecto importado
                    const results = await this.save(projectData);
                    
                    console.log(`📦 Proyecto importado: ${projectData.projectInfo.title}`);
                    resolve(projectData);
                } catch (error) {
                    console.error('Error importando proyecto:', error);
                    reject(new Error(`Error al importar proyecto: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    },

    // Método para exportar proyecto
    exportProject(projectData) {
        try {
            // Crear un archivo blob con los datos del proyecto
            const blob = new Blob([JSON.stringify(projectData, null, 2)], {
                type: 'application/json'
            });

            // Crear un enlace temporal para descargar
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectData.projectInfo.title || 'proyecto'}.pluma`;
            document.body.appendChild(a);
            a.click();
            
            // Limpiar después de descargar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            console.log(`📤 Proyecto exportado: ${projectData.projectInfo.title}`);
            return true;
        } catch (error) {
            console.error('Error exportando proyecto:', error);
            return false;
        }
    },

    // Método para obtener lista de proyectos
    async getProjectsList() {
        const projects = [];

        // Obtener desde IndexedDB
        if (this.config.useIndexedDB) {
            try {
                const indexedDBProjects = await this.getAllFromIndexedDB();
                projects.push(...indexedDBProjects);
            } catch (e) {
                console.error('Error obteniendo proyectos de IndexedDB:', e);
            }
        }

        // Obtener desde localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('pluma_project_')) {
                try {
                    const project = JSON.parse(localStorage.getItem(key));
                    // Verificar si ya está en la lista de IndexedDB (para evitar duplicados)
                    const exists = projects.some(p => p.projectInfo.id === project.projectInfo.id);
                    if (!exists) {
                        projects.push({
                            id: project.projectInfo.id,
                            title: project.projectInfo.title,
                            author: project.projectInfo.author,
                            genre: project.projectInfo.genre,
                            created: project.projectInfo.created,
                            modified: project.projectInfo.modified,
                            isPublicPC: project.projectInfo.isPublicPC
                        });
                    }
                } catch (e) {
                    console.error('Error parseando proyecto de localStorage:', key, e);
                }
            }
        }

        // Ordenar por fecha de modificación (más reciente primero)
        projects.sort((a, b) => new Date(b.modified) - new Date(a.modified));

        return projects;
    },

    async getAllFromIndexedDB() {
        if (!window.indexedDB) {
            return [];
        }

        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('PlumaDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['projects'], 'readonly');
                const store = transaction.objectStore('projects');

                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    const projects = getAllRequest.result.map(project => {
                        // Asegurar que los objetos estén completamente deserializados
                        project = this.cleanObjectForStorage(project);
                        return {
                            id: project.projectInfo.id,
                            title: project.projectInfo.title,
                            author: project.projectInfo.author,
                            genre: project.projectInfo.genre,
                            created: project.projectInfo.created,
                            modified: project.projectInfo.modified,
                            isPublicPC: project.projectInfo.isPublicPC
                        };
                    });
                    resolve(projects);
                };
                getAllRequest.onerror = () => reject(getAllRequest.error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    const store = db.createObjectStore('projects', { keyPath: 'projectInfo.id' });
                    store.createIndex('title', 'projectInfo.title', { unique: false });
                    store.createIndex('author', 'projectInfo.author', { unique: false });
                    store.createIndex('created', 'projectInfo.created', { unique: false });
                    store.createIndex('modified', 'projectInfo.modified', { unique: false });
                }
            };
        });
    }
};