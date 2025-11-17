// Servicio de Encriptación para PlumaAI
// Utiliza Web Crypto API para encriptación segura de datos sensibles

window.cryptoService = {
    // Constantes de configuración
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    SALT_LENGTH: 16,
    IV_LENGTH: 12,
    ITERATIONS: 100000, // PBKDF2 iterations para derivación de clave

    /**
     * Genera una clave de encriptación desde una contraseña
     * @param {string} password - Contraseña del usuario
     * @param {Uint8Array} salt - Salt para PBKDF2
     * @returns {Promise<CryptoKey>} Clave de encriptación
     */
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Importar la contraseña como clave para PBKDF2
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derivar clave usando PBKDF2
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.ITERATIONS,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: this.ALGORITHM, length: this.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Encripta datos usando una contraseña
     * @param {string} data - Datos a encriptar (JSON string)
     * @param {string} password - Contraseña
     * @returns {Promise<string>} Datos encriptados en formato base64
     */
    async encrypt(data, password) {
        try {
            // Generar salt e IV aleatorios
            const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

            // Derivar clave desde la contraseña
            const key = await this.deriveKey(password, salt);

            // Convertir datos a buffer
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);

            // Encriptar
            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                dataBuffer
            );

            // Combinar salt + iv + datos encriptados
            const encryptedArray = new Uint8Array(encryptedBuffer);
            const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(encryptedArray, salt.length + iv.length);

            // Convertir a base64
            return this.arrayBufferToBase64(result);
        } catch (error) {
            console.error('Error al encriptar:', error);
            throw new Error('Error al encriptar los datos');
        }
    },

    /**
     * Desencripta datos usando una contraseña
     * @param {string} encryptedData - Datos encriptados en base64
     * @param {string} password - Contraseña
     * @returns {Promise<string>} Datos desencriptados (JSON string)
     */
    async decrypt(encryptedData, password) {
        try {
            // Convertir de base64 a buffer
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
            const encryptedArray = new Uint8Array(encryptedBuffer);

            // Extraer salt, iv y datos encriptados
            const salt = encryptedArray.slice(0, this.SALT_LENGTH);
            const iv = encryptedArray.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
            const data = encryptedArray.slice(this.SALT_LENGTH + this.IV_LENGTH);

            // Derivar clave desde la contraseña
            const key = await this.deriveKey(password, salt);

            // Desencriptar
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                data
            );

            // Convertir a string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Error al desencriptar:', error);
            throw new Error('Contraseña incorrecta o datos corruptos');
        }
    },

    /**
     * Encripta solo las API keys de un proyecto
     * @param {object} projectData - Datos del proyecto
     * @param {string} password - Contraseña
     * @returns {Promise<object>} Proyecto con API keys encriptadas
     */
    async encryptApiKeys(projectData, password) {
        if (!password || !projectData.apiKeys || Object.keys(projectData.apiKeys).length === 0) {
            return projectData;
        }

        try {
            const apiKeysJson = JSON.stringify(projectData.apiKeys);
            const encryptedApiKeys = await this.encrypt(apiKeysJson, password);

            return {
                ...projectData,
                apiKeys: {
                    _encrypted: true,
                    _data: encryptedApiKeys
                }
            };
        } catch (error) {
            console.error('Error al encriptar API keys:', error);
            throw error;
        }
    },

    /**
     * Desencripta las API keys de un proyecto
     * @param {object} projectData - Datos del proyecto
     * @param {string} password - Contraseña
     * @returns {Promise<object>} Proyecto con API keys desencriptadas
     */
    async decryptApiKeys(projectData, password) {
        if (!projectData.apiKeys || !projectData.apiKeys._encrypted) {
            return projectData;
        }

        try {
            const decryptedJson = await this.decrypt(projectData.apiKeys._data, password);
            const apiKeys = JSON.parse(decryptedJson);

            return {
                ...projectData,
                apiKeys: apiKeys
            };
        } catch (error) {
            console.error('Error al desencriptar API keys:', error);
            throw error;
        }
    },

    /**
     * Encripta todo el proyecto
     * @param {object} projectData - Datos del proyecto
     * @param {string} password - Contraseña
     * @returns {Promise<object>} Objeto con datos encriptados
     */
    async encryptProject(projectData, password) {
        try {
            const projectJson = JSON.stringify(projectData);
            const encryptedData = await this.encrypt(projectJson, password);

            return {
                _encrypted: true,
                _version: '2.0',
                _data: encryptedData,
                projectInfo: {
                    id: projectData.projectInfo.id,
                    title: projectData.projectInfo.title,
                    author: projectData.projectInfo.author
                }
            };
        } catch (error) {
            console.error('Error al encriptar proyecto:', error);
            throw error;
        }
    },

    /**
     * Desencripta todo el proyecto
     * @param {object} encryptedProject - Proyecto encriptado
     * @param {string} password - Contraseña
     * @returns {Promise<object>} Proyecto desencriptado
     */
    async decryptProject(encryptedProject, password) {
        if (!encryptedProject._encrypted) {
            return encryptedProject;
        }

        try {
            const decryptedJson = await this.decrypt(encryptedProject._data, password);
            return JSON.parse(decryptedJson);
        } catch (error) {
            console.error('Error al desencriptar proyecto:', error);
            throw error;
        }
    },

    /**
     * Verifica si un proyecto tiene API keys encriptadas
     * @param {object} projectData - Datos del proyecto
     * @returns {boolean} True si las API keys están encriptadas
     */
    hasEncryptedApiKeys(projectData) {
        return projectData.apiKeys && projectData.apiKeys._encrypted === true;
    },

    /**
     * Verifica si un proyecto está completamente encriptado
     * @param {object} data - Datos del proyecto
     * @returns {boolean} True si el proyecto está encriptado
     */
    isProjectEncrypted(data) {
        return data._encrypted === true;
    },

    /**
     * Genera un hash de la contraseña para verificación (sin almacenar)
     * @param {string} password - Contraseña
     * @returns {Promise<string>} Hash de la contraseña
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return this.arrayBufferToBase64(hashBuffer);
    },

    // Utilidades para conversión de formatos
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
};
