/**
 * Git Integration Service
 * Servicio para integrar con Git real desde una aplicación web
 *
 * IMPORTANTE: Este servicio requiere un backend o bridge para ejecutar comandos Git
 * Las aplicaciones web en el navegador NO pueden ejecutar comandos Git directamente por seguridad.
 *
 * Opciones de implementación:
 * 1. Backend Node.js/Express con endpoint para ejecutar comandos Git
 * 2. Electron/Tauri con APIs nativas para ejecutar comandos del sistema
 * 3. Extension del navegador con permisos nativos
 * 4. WebAssembly con Git compilado (isomorphic-git)
 */

window.gitIntegrationService = {
    // Estado
    isGitAvailable: false,
    backendUrl: null,

    /**
     * Inicializar el servicio
     */
    async init() {
        console.log('🔧 Git Integration Service initializing...');

        // Detectar si hay un backend disponible
        await this.detectBackend();

        // Detectar si estamos en Electron/Tauri
        this.detectNativeEnvironment();

        console.log(`✅ Git Integration Service initialized. Git available: ${this.isGitAvailable}`);
    },

    /**
     * Detectar si hay un backend disponible
     */
    async detectBackend() {
        // Intentar detectar backend en localhost
        const possibleUrls = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:5000',
        ];

        for (const url of possibleUrls) {
            try {
                const response = await fetch(`${url}/health`, {
                    method: 'GET',
                    timeout: 1000
                });
                if (response.ok) {
                    this.backendUrl = url;
                    this.isGitAvailable = true;
                    console.log(`✅ Backend detectado en: ${url}`);
                    return;
                }
            } catch (e) {
                // Backend no disponible en esta URL
            }
        }

        console.log('⚠️ No se detectó backend para Git. Usando sistema interno.');
    },

    /**
     * Detectar si estamos en un entorno nativo (Electron/Tauri)
     */
    detectNativeEnvironment() {
        // Detectar Electron
        if (typeof window !== 'undefined' && window.electronAPI) {
            this.isGitAvailable = true;
            console.log('✅ Entorno Electron detectado');
            return true;
        }

        // Detectar Tauri
        if (typeof window !== 'undefined' && window.__TAURI__) {
            this.isGitAvailable = true;
            console.log('✅ Entorno Tauri detectado');
            return true;
        }

        return false;
    },

    /**
     * Ejecutar comando Git
     */
    async executeGitCommand(command) {
        if (!this.isGitAvailable) {
            throw new Error('Git no está disponible. Necesitas configurar un backend o usar un entorno nativo.');
        }

        // Opción 1: Usar backend HTTP
        if (this.backendUrl) {
            return await this.executeViaBackend(command);
        }

        // Opción 2: Usar Electron API
        if (window.electronAPI?.executeCommand) {
            return await window.electronAPI.executeCommand(command);
        }

        // Opción 3: Usar Tauri API
        if (window.__TAURI__?.shell) {
            const { Command } = window.__TAURI__.shell;
            const cmd = new Command('sh', ['-c', command]);
            const output = await cmd.execute();
            return output.stdout || output.stderr;
        }

        throw new Error('No hay método disponible para ejecutar comandos Git');
    },

    /**
     * Ejecutar comando vía backend HTTP
     */
    async executeViaBackend(command) {
        try {
            const response = await fetch(`${this.backendUrl}/git/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.output || '';
        } catch (error) {
            console.error('❌ Error ejecutando comando Git via backend:', error);
            throw error;
        }
    },

    /**
     * Verificar si estamos en un repositorio Git
     */
    async isGitRepository() {
        try {
            const result = await this.executeGitCommand('git rev-parse --is-inside-work-tree');
            return result.trim() === 'true';
        } catch (error) {
            return false;
        }
    },

    /**
     * Obtener estado de Git
     */
    async getStatus() {
        try {
            return await this.executeGitCommand('git status --short');
        } catch (error) {
            console.error('Error obteniendo status de Git:', error);
            return '';
        }
    },

    /**
     * Agregar archivos al staging area
     */
    async add(files = '.') {
        return await this.executeGitCommand(`git add ${files}`);
    },

    /**
     * Crear commit
     */
    async commit(message) {
        // Escapar el mensaje para evitar problemas con comillas
        const escapedMessage = message.replace(/'/g, "'\\''");
        const command = `git commit -m '${escapedMessage}'`;
        return await this.executeGitCommand(command);
    },

    /**
     * Crear commit con add automático
     */
    async commitAll(message) {
        try {
            await this.add('.');
            return await this.commit(message);
        } catch (error) {
            console.error('Error en commitAll:', error);
            throw error;
        }
    },

    /**
     * Obtener historial de commits
     */
    async getLog(limit = 10) {
        const command = `git log --oneline --max-count=${limit}`;
        return await this.executeGitCommand(command);
    },

    /**
     * Obtener rama actual
     */
    async getCurrentBranch() {
        try {
            const result = await this.executeGitCommand('git branch --show-current');
            return result.trim();
        } catch (error) {
            console.error('Error obteniendo rama actual:', error);
            return 'main';
        }
    },

    /**
     * Push a remote
     */
    async push(remote = 'origin', branch = null) {
        if (!branch) {
            branch = await this.getCurrentBranch();
        }
        return await this.executeGitCommand(`git push ${remote} ${branch}`);
    }
};

// Hacer disponible globalmente para track-changes-ui
window.executeGitCommand = (cmd) => {
    return window.gitIntegrationService.executeGitCommand(cmd);
};

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (window.gitIntegrationService) {
            window.gitIntegrationService.init();
        }
    });
}
