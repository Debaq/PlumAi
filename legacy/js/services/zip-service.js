// Servicio de manejo de archivos ZIP para formato .pluma
// Los archivos .pluma son archivos ZIP que contienen project.json + assets

window.zipService = {
    /**
     * Crea un archivo .pluma (ZIP) desde los datos del proyecto
     * @param {object} projectData - Datos del proyecto
     * @param {object} options - Opciones de creación
     * @param {boolean} options.includeAssets - Incluir assets (imágenes, avatares)
     * @param {string} options.password - Contraseña para encriptación (opcional)
     * @param {boolean} options.encryptAll - Encriptar proyecto completo
     * @returns {Promise<Blob>} Blob del archivo ZIP
     */
    async createPlumaFile(projectData, options = {}) {
        try {
            const zip = new JSZip();

            // Preparar datos del proyecto
            let finalProjectData = JSON.parse(JSON.stringify(projectData));

            // Encriptar si se especifica contraseña
            if (options.password) {
                if (options.encryptAll) {
                    // Encriptar proyecto completo
                    const encryptedProject = await window.cryptoService.encryptProject(
                        finalProjectData,
                        options.password
                    );
                    finalProjectData = encryptedProject;
                } else {
                    // Solo encriptar API keys
                    finalProjectData = await window.cryptoService.encryptApiKeys(
                        finalProjectData,
                        options.password
                    );
                }
            }

            // Agregar project.json
            zip.file('project.json', JSON.stringify(finalProjectData, null, 2));

            // Agregar metadata.json
            const metadata = {
                version: '2.0',
                format: 'pluma-zip',
                created: new Date().toISOString(),
                encrypted: !!options.password,
                encryptedFull: options.encryptAll || false,
                hasAssets: options.includeAssets || false
            };
            zip.file('metadata.json', JSON.stringify(metadata, null, 2));

            // Incluir assets si está especificado
            if (options.includeAssets) {
                await this.addAssetsToZip(zip, projectData);
            }

            // Generar el archivo ZIP
            const blob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 9 // Máxima compresión
                }
            });

            return blob;
        } catch (error) {
            console.error('Error creando archivo .pluma:', error);
            throw new Error(`Error al crear archivo .pluma: ${error.message}`);
        }
    },

    /**
     * Agrega assets (imágenes, avatares) al ZIP
     * @param {JSZip} zip - Instancia de JSZip
     * @param {object} projectData - Datos del proyecto
     */
    async addAssetsToZip(zip, projectData) {
        const assetsFolder = zip.folder('assets');
        const avatarsFolder = assetsFolder.folder('avatars');
        const coversFolder = assetsFolder.folder('covers');
        const imagesFolder = assetsFolder.folder('images');

        // Procesar avatares de personajes
        if (projectData.characters && projectData.characters.length > 0) {
            for (const character of projectData.characters) {
                if (character.avatar && this.isDataUrl(character.avatar)) {
                    const fileName = `${character.id}.png`;
                    const imageData = this.dataUrlToBlob(character.avatar);
                    avatarsFolder.file(fileName, imageData);

                    // Actualizar referencia en el proyecto
                    character.avatar = `assets/avatars/${fileName}`;
                }
            }
        }

        // Procesar portada del proyecto (si existe)
        if (projectData.projectInfo && projectData.projectInfo.cover &&
            this.isDataUrl(projectData.projectInfo.cover)) {
            const imageData = this.dataUrlToBlob(projectData.projectInfo.cover);
            coversFolder.file('cover.png', imageData);
            projectData.projectInfo.cover = 'assets/covers/cover.png';
        }

        // TODO: Agregar soporte para otras imágenes cuando se implemente
        // (imágenes de ubicaciones, escenas, etc.)
    },

    /**
     * Lee un archivo .pluma (ZIP) y extrae los datos
     * @param {File|Blob} file - Archivo .pluma
     * @param {string} password - Contraseña para desencriptar (opcional)
     * @returns {Promise<object>} Datos del proyecto con assets cargados
     */
    async readPlumaFile(file, password = null) {
        try {
            // Intentar leer como ZIP
            const zip = await JSZip.loadAsync(file);

            // Verificar que tenga project.json
            const projectFile = zip.file('project.json');
            if (!projectFile) {
                throw new Error('Archivo .pluma inválido: falta project.json');
            }

            // Leer project.json
            const projectJson = await projectFile.async('text');
            let projectData = JSON.parse(projectJson);

            // Leer metadata si existe
            const metadataFile = zip.file('metadata.json');
            let metadata = null;
            if (metadataFile) {
                const metadataJson = await metadataFile.async('text');
                metadata = JSON.parse(metadataJson);
            }

            // Desencriptar si es necesario
            if (metadata && metadata.encrypted) {
                if (!password) {
                    throw new Error('Este archivo está encriptado y requiere una contraseña');
                }

                if (metadata.encryptedFull) {
                    // Proyecto completo encriptado
                    projectData = await window.cryptoService.decryptProject(projectData, password);
                } else {
                    // Solo API keys encriptadas
                    projectData = await window.cryptoService.decryptApiKeys(projectData, password);
                }
            } else if (window.cryptoService.isProjectEncrypted(projectData)) {
                // Encriptación legacy (sin metadata)
                if (!password) {
                    throw new Error('Este archivo está encriptado y requiere una contraseña');
                }
                projectData = await window.cryptoService.decryptProject(projectData, password);
            } else if (window.cryptoService.hasEncryptedApiKeys(projectData)) {
                // API keys encriptadas legacy
                if (!password) {
                    throw new Error('Este archivo tiene API keys encriptadas y requiere una contraseña');
                }
                projectData = await window.cryptoService.decryptApiKeys(projectData, password);
            }

            // Cargar assets si existen
            if (metadata && metadata.hasAssets) {
                await this.loadAssetsFromZip(zip, projectData);
            }

            return projectData;
        } catch (error) {
            // Si falla como ZIP, intentar leer como JSON legacy
            if (error.message.includes('corrupted') || error.message.includes('invalid')) {
                return await this.readLegacyJsonFile(file, password);
            }
            throw error;
        }
    },

    /**
     * Carga assets desde el ZIP al proyecto
     * @param {JSZip} zip - Instancia de JSZip
     * @param {object} projectData - Datos del proyecto
     */
    async loadAssetsFromZip(zip, projectData) {
        // Cargar avatares de personajes
        if (projectData.characters && projectData.characters.length > 0) {
            for (const character of projectData.characters) {
                if (character.avatar && character.avatar.startsWith('assets/avatars/')) {
                    const avatarFile = zip.file(character.avatar);
                    if (avatarFile) {
                        const blob = await avatarFile.async('blob');
                        character.avatar = await this.blobToDataUrl(blob);
                    }
                }
            }
        }

        // Cargar portada del proyecto
        if (projectData.projectInfo && projectData.projectInfo.cover &&
            projectData.projectInfo.cover.startsWith('assets/covers/')) {
            const coverFile = zip.file(projectData.projectInfo.cover);
            if (coverFile) {
                const blob = await coverFile.async('blob');
                projectData.projectInfo.cover = await this.blobToDataUrl(blob);
            }
        }

        // TODO: Cargar otras imágenes cuando se implemente
    },

    /**
     * Lee un archivo .pluma legacy (JSON puro) para retrocompatibilidad
     * @param {File|Blob} file - Archivo JSON
     * @param {string} password - Contraseña para desencriptar (opcional)
     * @returns {Promise<object>} Datos del proyecto
     */
    async readLegacyJsonFile(file, password = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    let projectData = JSON.parse(event.target.result);

                    // Desencriptar si es necesario
                    if (window.cryptoService.isProjectEncrypted(projectData)) {
                        if (!password) {
                            throw new Error('Este archivo está encriptado y requiere una contraseña');
                        }
                        projectData = await window.cryptoService.decryptProject(projectData, password);
                    } else if (window.cryptoService.hasEncryptedApiKeys(projectData)) {
                        if (!password) {
                            throw new Error('Este archivo tiene API keys encriptadas y requiere una contraseña');
                        }
                        projectData = await window.cryptoService.decryptApiKeys(projectData, password);
                    }

                    resolve(projectData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    },

    /**
     * Verifica si un string es una Data URL
     * @param {string} str - String a verificar
     * @returns {boolean} True si es Data URL
     */
    isDataUrl(str) {
        return typeof str === 'string' && str.startsWith('data:');
    },

    /**
     * Convierte Data URL a Blob
     * @param {string} dataUrl - Data URL
     * @returns {Blob} Blob de la imagen
     */
    dataUrlToBlob(dataUrl) {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    },

    /**
     * Convierte Blob a Data URL
     * @param {Blob} blob - Blob de la imagen
     * @returns {Promise<string>} Data URL
     */
    blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Detecta si un archivo es ZIP o JSON
     * @param {File} file - Archivo a verificar
     * @returns {Promise<string>} 'zip' o 'json'
     */
    async detectFileType(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arr = new Uint8Array(event.target.result);
                // ZIP files empiezan con 'PK' (50 4B en hex)
                if (arr[0] === 0x50 && arr[1] === 0x4B) {
                    resolve('zip');
                } else {
                    resolve('json');
                }
            };
            reader.onerror = reject;
            // Leer solo los primeros 2 bytes
            reader.readAsArrayBuffer(file.slice(0, 2));
        });
    }
};
