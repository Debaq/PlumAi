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
        fileExtension: '.pluma'
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
    // GUARDADO UNIFICADO (Auto-selecciona modo)
    // ============================================

    async save(projectData) {
        const results = {
            local: false,
            file: false,
            cloud: false
        };

        // 1. Siempre guardar en localStorage (rápido, backup)
        try {
            results.local = window.storageService.saveProject(projectData);
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }

        // 2. Si hay archivo abierto, sincronizar
        if (this.fileHandle && this.config.enableFileSync) {
            try {
                results.file = await this.saveToFile(projectData);
            } catch (error) {
                console.error('Error guardando en archivo:', error);
            }
        }

        // 3. Si está habilitado, sincronizar con servidor
        if (this.config.enableCloudSync) {
            try {
                results.cloud = await this.syncToCloud(projectData);
            } catch (error) {
                console.error('Error sincronizando con servidor:', error);
            }
        }

        return results;
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
    }
};
