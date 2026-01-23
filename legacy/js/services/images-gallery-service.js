// Images Gallery Service - Servicio para gestionar todas las imágenes del proyecto
window.imagesGalleryService = {
    /**
     * Obtener todas las imágenes del proyecto agrupadas por tipo
     * @returns {Object} Objeto con arrays de imágenes por categoría
     */
    getAllImages() {
        const projectStore = Alpine.store('project');
        if (!projectStore) return null;

        const images = {
            characters: [],
            locations: [],
            chapters: [],
            scenes: []
        };

        // Recopilar avatares de personajes
        projectStore.characters.forEach(character => {
            if (character.avatar && character.avatar.url) {
                images.characters.push({
                    id: character.id,
                    type: 'character',
                    entityName: character.name,
                    url: character.avatar.url,
                    source: character.avatar.source || 'dicebear',
                    provider: character.avatar.provider,
                    model: character.avatar.model,
                    style: character.avatar.style,
                    created: character.created,
                    modified: character.modified
                });
            }
        });

        // Recopilar imágenes de lugares
        projectStore.locations.forEach(location => {
            if (location.image) {
                images.locations.push({
                    id: location.id,
                    type: 'location',
                    entityName: location.name,
                    url: location.image,
                    imageType: location.imageType || 'upload',
                    created: location.created,
                    modified: location.modified
                });
            }
        });

        // Recopilar imágenes de capítulos
        projectStore.chapters.forEach(chapter => {
            if (chapter.image) {
                images.chapters.push({
                    id: chapter.id,
                    type: 'chapter',
                    entityName: chapter.title,
                    url: chapter.image,
                    imageType: chapter.imageType || 'upload',
                    number: chapter.number,
                    created: chapter.created,
                    modified: chapter.modified
                });
            }
        });

        // Recopilar imágenes de escenas
        projectStore.scenes.forEach(scene => {
            if (scene.image) {
                images.scenes.push({
                    id: scene.id,
                    type: 'scene',
                    entityName: scene.title,
                    url: scene.image,
                    imageType: scene.imageType || 'upload',
                    created: scene.created,
                    modified: scene.modified
                });
            }
        });

        return images;
    },

    /**
     * Obtener todas las imágenes en un solo array ordenado
     * @param {string} sortBy - Campo por el que ordenar (created, modified, type, name)
     * @param {string} filterBy - Filtrar por tipo (character, location, chapter, scene, all)
     * @returns {Array} Array de imágenes
     */
    getImagesFlat(sortBy = 'modified', filterBy = 'all') {
        const grouped = this.getAllImages();
        if (!grouped) return [];

        let allImages = [];

        // Combinar todos los arrays
        Object.values(grouped).forEach(categoryImages => {
            allImages = allImages.concat(categoryImages);
        });

        // Filtrar por tipo
        if (filterBy !== 'all') {
            allImages = allImages.filter(img => img.type === filterBy);
        }

        // Ordenar
        allImages.sort((a, b) => {
            switch (sortBy) {
                case 'created':
                    return new Date(b.created) - new Date(a.created);
                case 'modified':
                    return new Date(b.modified) - new Date(a.modified);
                case 'name':
                    return a.entityName.localeCompare(b.entityName);
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });

        return allImages;
    },

    /**
     * Obtener el total de imágenes
     * @returns {number}
     */
    getTotalImagesCount() {
        const images = this.getAllImages();
        if (!images) return 0;

        return images.characters.length +
               images.locations.length +
               images.chapters.length +
               images.scenes.length;
    },

    /**
     * Obtener el conteo por categoría
     * @returns {Object}
     */
    getImagesCounts() {
        const images = this.getAllImages();
        if (!images) return { characters: 0, locations: 0, chapters: 0, scenes: 0 };

        return {
            characters: images.characters.length,
            locations: images.locations.length,
            chapters: images.chapters.length,
            scenes: images.scenes.length
        };
    },

    /**
     * Obtener etiqueta legible para el tipo
     * @param {string} type
     * @returns {string}
     */
    getTypeLabel(type) {
        const labels = {
            character: 'Personaje',
            location: 'Lugar',
            chapter: 'Capítulo',
            scene: 'Escena'
        };
        return labels[type] || type;
    },

    /**
     * Obtener ícono para el tipo
     * @param {string} type
     * @returns {string}
     */
    getTypeIcon(type) {
        const icons = {
            character: 'user',
            location: 'map-pin',
            chapter: 'book-open',
            scene: 'film'
        };
        return icons[type] || 'image';
    },

    /**
     * Eliminar imagen de una entidad
     * @param {string} type - Tipo de entidad
     * @param {string} id - ID de la entidad
     */
    removeImage(type, id) {
        const projectStore = Alpine.store('project');
        if (!projectStore) return false;

        switch (type) {
            case 'character':
                const character = projectStore.getCharacter(id);
                if (character) {
                    character.avatar = null;
                    projectStore.updateModified();
                    return true;
                }
                break;

            case 'location':
                const location = projectStore.locations.find(l => l.id === id);
                if (location) {
                    location.image = '';
                    location.imageType = 'upload';
                    projectStore.updateModified();
                    return true;
                }
                break;

            case 'chapter':
                const chapter = projectStore.getChapter(id);
                if (chapter) {
                    chapter.image = '';
                    chapter.imageType = 'upload';
                    projectStore.updateModified();
                    return true;
                }
                break;

            case 'scene':
                const scene = projectStore.scenes.find(s => s.id === id);
                if (scene) {
                    scene.image = '';
                    scene.imageType = 'upload';
                    projectStore.updateModified();
                    return true;
                }
                break;
        }

        return false;
    },

    /**
     * Abrir modal de edición de la entidad asociada
     * @param {string} type - Tipo de entidad
     * @param {string} id - ID de la entidad
     */
    editEntity(type, id) {
        const projectStore = Alpine.store('project');
        const uiStore = Alpine.store('ui');
        if (!projectStore || !uiStore) return;

        switch (type) {
            case 'character':
                const character = projectStore.getCharacter(id);
                if (character) {
                    uiStore.openModal('editCharacter', character);
                }
                break;

            case 'location':
                const location = projectStore.locations.find(l => l.id === id);
                if (location) {
                    uiStore.openModal('editLocation', location);
                }
                break;

            case 'chapter':
                const chapter = projectStore.getChapter(id);
                if (chapter) {
                    uiStore.openModal('editChapter', chapter);
                }
                break;

            case 'scene':
                const scene = projectStore.scenes.find(s => s.id === id);
                if (scene) {
                    uiStore.openModal('editScene', scene);
                }
                break;
        }
    },

    /**
     * Reemplazar imagen de una entidad
     * @param {string} type - Tipo de entidad
     * @param {string} id - ID de la entidad
     * @param {string} newImageUrl - Nueva URL de la imagen
     * @param {string} imageType - Tipo de imagen (upload, url, ai)
     */
    replaceImage(type, id, newImageUrl, imageType = 'upload') {
        const projectStore = Alpine.store('project');
        if (!projectStore) return false;

        switch (type) {
            case 'character':
                const character = projectStore.getCharacter(id);
                if (character) {
                    character.avatar = {
                        style: 'custom',
                        url: newImageUrl,
                        source: imageType,
                        seed: character.name
                    };
                    character.modified = new Date().toISOString();
                    projectStore.updateModified();
                    return true;
                }
                break;

            case 'location':
                const location = projectStore.locations.find(l => l.id === id);
                if (location) {
                    location.image = newImageUrl;
                    location.imageType = imageType;
                    location.modified = new Date().toISOString();
                    projectStore.updateModified();
                    return true;
                }
                break;

            case 'chapter':
                const chapter = projectStore.getChapter(id);
                if (chapter) {
                    chapter.image = newImageUrl;
                    chapter.imageType = imageType;
                    chapter.modified = new Date().toISOString();
                    projectStore.updateModified();
                    return true;
                }
                break;

            case 'scene':
                const scene = projectStore.scenes.find(s => s.id === id);
                if (scene) {
                    scene.image = newImageUrl;
                    scene.imageType = imageType;
                    scene.modified = new Date().toISOString();
                    projectStore.updateModified();
                    return true;
                }
                break;
        }

        return false;
    }
};
