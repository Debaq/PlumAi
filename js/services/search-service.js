/**
 * SearchService - Servicio de búsqueda unificado con Lunr.js
 * Indexa TODA la información de la app: personajes, escenas, ubicaciones, timeline, etc.
 */

class SearchService {
    constructor() {
        this.idx = null;
        this.documentsMap = {};
        this.isInitialized = false;
    }

    /**
     * Inicializar el índice con todos los datos del proyecto
     * @param {Object} projectData - Datos del store de proyecto
     */
    initialize(projectData) {
        const documents = [];

        // 1. PERSONAJES
        if (projectData.characters && projectData.characters.length > 0) {
            projectData.characters.forEach(char => {
                documents.push({
                    id: `character-${char.id}`,
                    type: 'character',
                    label: char.name,
                    name: char.name,
                    description: char.description || '',
                    content: this.buildCharacterContent(char),
                    icon: '👤',
                    data: char
                });
            });
        }

        // 2. ESCENAS
        if (projectData.scenes && projectData.scenes.length > 0) {
            projectData.scenes.forEach(scene => {
                documents.push({
                    id: `scene-${scene.id}`,
                    type: 'scene',
                    label: scene.title,
                    title: scene.title,
                    description: scene.description || '',
                    content: this.buildSceneContent(scene),
                    icon: '🎬',
                    data: scene
                });
            });
        }

        // 3. UBICACIONES
        if (projectData.locations && projectData.locations.length > 0) {
            projectData.locations.forEach(location => {
                documents.push({
                    id: `location-${location.id}`,
                    type: 'location',
                    label: location.name,
                    name: location.name,
                    description: location.description || '',
                    content: this.buildLocationContent(location),
                    icon: '📍',
                    data: location
                });
            });
        }

        // 4. TIMELINE
        if (projectData.timeline && projectData.timeline.length > 0) {
            projectData.timeline.forEach(event => {
                documents.push({
                    id: `timeline-${event.id}`,
                    type: 'timeline',
                    label: event.event || event.date,
                    event: event.event,
                    date: event.date,
                    description: event.description || '',
                    content: this.buildTimelineContent(event),
                    icon: '📅',
                    data: event
                });
            });
        }

        // 5. CAPÍTULOS (opcional, para referencias)
        if (projectData.chapters && projectData.chapters.length > 0) {
            projectData.chapters.forEach(chapter => {
                documents.push({
                    id: `chapter-${chapter.id}`,
                    type: 'chapter',
                    label: chapter.title,
                    title: chapter.title,
                    description: `Capítulo ${chapter.order || ''}`,
                    content: this.buildChapterContent(chapter),
                    icon: '📖',
                    data: chapter
                });
            });
        }

        // 6. LORE ENTRIES
        if (projectData.loreEntries && projectData.loreEntries.length > 0) {
            projectData.loreEntries.forEach(lore => {
                documents.push({
                    id: `lore-${lore.id}`,
                    type: 'lore',
                    label: lore.title || 'Sin título',
                    title: lore.title,
                    description: lore.summary || '',
                    content: this.buildLoreContent(lore),
                    category: lore.category || 'general',
                    icon: '📚',
                    data: lore
                });
            });
        }

        // Crear el mapa de documentos para acceso rápido
        this.documentsMap = {};
        documents.forEach(doc => {
            this.documentsMap[doc.id] = doc;
        });

        // Crear el índice de Lunr.js
        try {
            this.idx = lunr(function () {
                // Configuración del índice
                this.ref('id');

                // Campos indexados con pesos
                this.field('label', { boost: 10 });      // Más peso al nombre/título
                this.field('name', { boost: 10 });
                this.field('title', { boost: 10 });
                this.field('event', { boost: 8 });
                this.field('description', { boost: 5 }); // Peso medio a descripción
                this.field('content', { boost: 1 });     // Peso bajo al contenido completo

                // Agregar documentos
                documents.forEach(doc => {
                    this.add(doc);
                });
            });

            this.isInitialized = true;

        } catch (error) {
            console.error('❌ Error creando índice de Lunr:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Construir contenido completo de un personaje para búsqueda
     */
    buildCharacterContent(char) {
        const parts = [
            char.name,
            char.description,
            char.role,
            char.backstory,
            char.personality,
            char.appearance,
            char.goals,
            char.fears,
            char.notes
        ];
        return parts.filter(p => p).join(' ');
    }

    /**
     * Construir contenido completo de una escena
     */
    buildSceneContent(scene) {
        const parts = [
            scene.title,
            scene.description,
            scene.location,
            scene.notes
        ];
        return parts.filter(p => p).join(' ');
    }

    /**
     * Construir contenido completo de una ubicación
     */
    buildLocationContent(location) {
        const parts = [
            location.name,
            location.description,
            location.type,
            location.significance,
            location.notes
        ];
        return parts.filter(p => p).join(' ');
    }

    /**
     * Construir contenido completo de un evento de timeline
     */
    buildTimelineContent(event) {
        const parts = [
            event.event,
            event.date,
            event.description,
            event.notes
        ];
        return parts.filter(p => p).join(' ');
    }

    /**
     * Construir contenido completo de un capítulo
     */
    buildChapterContent(chapter) {
        const parts = [
            chapter.title,
            chapter.summary,
            // NO incluir chapter.content para evitar resultados muy largos
        ];
        return parts.filter(p => p).join(' ');
    }

    /**
     * Construir contenido completo de una entrada de lore
     */
    buildLoreContent(lore) {
        const parts = [
            lore.title,
            lore.summary,
            lore.category,
            lore.content
        ];
        return parts.filter(p => p).join(' ');
    }

    /**
     * Buscar en el índice
     * @param {String} query - Texto a buscar
     * @param {Object} options - Opciones de búsqueda
     * @returns {Array} Resultados encontrados
     */
    search(query, options = {}) {
        if (!this.isInitialized || !this.idx) {
            console.warn('⚠️ SearchService no inicializado');
            return [];
        }

        if (!query || query.trim() === '') {
            // Si no hay query, devolver algunos resultados populares
            return this.getPopularResults(options);
        }

        const {
            limit = 10,
            types = null, // ['character', 'scene', 'location', 'timeline', 'chapter']
            minScore = 0.1
        } = options;

        try {
            let results = [];

            // Estrategia 1: Búsqueda exacta
            results = this.idx.search(query);

            // Estrategia 2: Búsqueda con comodín si no hay resultados
            if (results.length === 0) {
                results = this.idx.search(query + '*');
            }

            // Estrategia 3: Búsqueda fuzzy si aún no hay resultados
            if (results.length === 0) {
                results = this.idx.search(query + '~1'); // Tolera 1 error
            }

            // Estrategia 4: Búsqueda por palabras individuales
            if (results.length === 0) {
                const words = query.split(/\s+/);
                if (words.length > 1) {
                    const wordQuery = words.map(w => w + '*').join(' OR ');
                    results = this.idx.search(wordQuery);
                }
            }

            // Mapear resultados con datos completos
            let mappedResults = results
                .filter(r => r.score >= minScore)
                .map(result => {
                    const doc = this.documentsMap[result.ref];
                    return {
                        ...doc,
                        score: result.score,
                        matchData: result.matchData
                    };
                });

            // Filtrar por tipos si se especifica
            if (types && types.length > 0) {
                mappedResults = mappedResults.filter(r => types.includes(r.type));
            }

            // Limitar resultados
            return mappedResults.slice(0, limit);

        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            return [];
        }
    }

    /**
     * Obtener resultados populares/recientes cuando no hay query
     */
    getPopularResults(options = {}) {
        const { limit = 5, types = null } = options;

        let allDocs = Object.values(this.documentsMap);

        // Filtrar por tipos si se especifica
        if (types && types.length > 0) {
            allDocs = allDocs.filter(doc => types.includes(doc.type));
        }

        // Ordenar por tipo (personajes primero) y limitar
        const typeOrder = { character: 1, scene: 2, location: 3, timeline: 4, chapter: 5 };
        allDocs.sort((a, b) => {
            return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
        });

        return allDocs.slice(0, limit);
    }

    /**
     * Actualizar el índice con nuevos datos
     * @param {Object} projectData - Nuevos datos del proyecto
     */
    update(projectData) {
        this.initialize(projectData);
    }

    /**
     * Buscar solo personajes
     */
    searchCharacters(query, limit = 10) {
        return this.search(query, { types: ['character'], limit });
    }

    /**
     * Buscar solo escenas
     */
    searchScenes(query, limit = 10) {
        return this.search(query, { types: ['scene'], limit });
    }

    /**
     * Buscar solo ubicaciones
     */
    searchLocations(query, limit = 10) {
        return this.search(query, { types: ['location'], limit });
    }

    /**
     * Buscar solo eventos de timeline
     */
    searchTimeline(query, limit = 10) {
        return this.search(query, { types: ['timeline'], limit });
    }

    /**
     * Buscar solo entradas de lore
     */
    searchLore(query, limit = 10) {
        return this.search(query, { types: ['lore'], limit });
    }

    /**
     * Obtener estadísticas del índice
     */
    getStats(documents = null) {
        const docs = documents || Object.values(this.documentsMap);
        const stats = {};

        docs.forEach(doc => {
            stats[doc.type] = (stats[doc.type] || 0) + 1;
        });

        return stats;
    }

    /**
     * Verificar si el servicio está listo
     */
    isReady() {
        return this.isInitialized && this.idx !== null;
    }

    /**
     * Obtener un documento por ID
     */
    getDocument(id) {
        return this.documentsMap[id] || null;
    }
}

// Crear instancia global
const searchService = new SearchService();

// Exportar para uso en módulos
if (typeof window !== 'undefined') {
    window.searchService = searchService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = searchService;
}
