/**
 * Avatar Service - Generación de avatares con DiceBear
 * https://dicebear.com/
 */

window.avatarService = {
    // Estilos disponibles (nombres en kebab-case como requiere DiceBear)
    styles: {
        // Personajes humanos
        'adventurer': { name: 'Adventurer', category: 'human', desc: 'Aventurero estilo ilustración' },
        'adventurer-neutral': { name: 'Adventurer Neutral', category: 'human', desc: 'Aventurero neutral' },
        'avataaars': { name: 'Avataaars', category: 'human', desc: 'Estilo clásico' },
        'avataaars-neutral': { name: 'Avataaars Neutral', category: 'human', desc: 'Avataaars neutral' },
        'big-ears': { name: 'Big Ears', category: 'human', desc: 'Orejas grandes' },
        'big-ears-neutral': { name: 'Big Ears Neutral', category: 'human', desc: 'Orejas grandes neutral' },
        'big-smile': { name: 'Big Smile', category: 'human', desc: 'Sonrisa grande' },
        'lorelei': { name: 'Lorelei', category: 'human', desc: 'Estilo femenino' },
        'lorelei-neutral': { name: 'Lorelei Neutral', category: 'human', desc: 'Estilo femenino neutral' },
        'micah': { name: 'Micah', category: 'human', desc: 'Estilo moderno' },
        'miniavs': { name: 'Miniavs', category: 'human', desc: 'Minimalista' },
        'open-peeps': { name: 'Open Peeps', category: 'human', desc: 'Peeps abierto' },
        'personas': { name: 'Personas', category: 'human', desc: 'Personas ilustradas' },
        'notionists': { name: 'Notionists', category: 'human', desc: 'Estilo Notion' },
        'notionists-neutral': { name: 'Notionists Neutral', category: 'human', desc: 'Notion neutral' },

        // Fantasía y criaturas
        'bottts': { name: 'Bottts', category: 'fantasy', desc: 'Robots' },
        'bottts-neutral': { name: 'Bottts Neutral', category: 'fantasy', desc: 'Robots neutral' },
        'croodles': { name: 'Croodles', category: 'fantasy', desc: 'Garabatos lindos' },
        'croodles-neutral': { name: 'Croodles Neutral', category: 'fantasy', desc: 'Garabatos neutral' },
        'fun-emoji': { name: 'Fun Emoji', category: 'fantasy', desc: 'Emoji divertido' },
        'icons': { name: 'Icons', category: 'fantasy', desc: 'Iconos' },
        'identicon': { name: 'Identicon', category: 'fantasy', desc: 'Patrón geométrico' },

        // Pixel art
        'pixel-art': { name: 'Pixel Art', category: 'pixel', desc: 'Arte pixel' },
        'pixel-art-neutral': { name: 'Pixel Art Neutral', category: 'pixel', desc: 'Pixel neutral' },

        // Otros
        'initials': { name: 'Initials', category: 'simple', desc: 'Solo iniciales' },
        'shapes': { name: 'Shapes', category: 'simple', desc: 'Formas abstractas' },
        'rings': { name: 'Rings', category: 'simple', desc: 'Anillos' },
        'thumbs': { name: 'Thumbs', category: 'simple', desc: 'Pulgares' }
    },

    // Categorías
    categories: {
        human: { name: 'Humanos', icon: '👤', color: '#4a90e2' },
        fantasy: { name: 'Fantasía', icon: '🎭', color: '#9b59b6' },
        pixel: { name: 'Pixel Art', icon: '🎮', color: '#e74c3c' },
        simple: { name: 'Simples', icon: '⚪', color: '#95a5a6' }
    },

    /**
     * Generar URL de avatar de DiceBear
     * @param {string} style - Estilo del avatar
     * @param {string} seed - Semilla (nombre del personaje)
     * @param {object} options - Opciones adicionales
     * @returns {string} URL del avatar SVG
     */
    generateAvatarURL(style = 'adventurer', seed = 'default', options = {}) {
        const baseURL = 'https://api.dicebear.com/7.x';

        // Opciones por defecto
        const defaultOptions = {
            size: 128,
            backgroundColor: 'transparent',
            ...options
        };

        // Construir query params
        const params = new URLSearchParams();
        Object.entries(defaultOptions).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value);
            }
        });

        // Añadir seed
        params.append('seed', seed);

        return `${baseURL}/${style}/svg?${params.toString()}`;
    },

    /**
     * Generar avatar con opciones específicas para personajes
     */
    generateCharacterAvatar(character, style = 'adventurer') {
        const seed = character.name || character.id || 'default';

        return {
            style: style,
            seed: seed,
            url: this.generateAvatarURL(style, seed),
            source: 'dicebear'
        };
    },

    /**
     * Generar avatar para ubicación
     */
    generateLocationAvatar(location, style = 'icons') {
        const seed = location.name || location.id || 'default';

        return {
            style: style,
            seed: seed,
            url: this.generateAvatarURL(style, seed, {
                backgroundColor: '1a1a1a'
            }),
            source: 'dicebear'
        };
    },

    /**
     * Obtener estilos por categoría
     */
    getStylesByCategory(category) {
        return Object.entries(this.styles)
            .filter(([, data]) => data.category === category)
            .map(([key, data]) => ({ key, ...data }));
    },

    /**
     * Obtener todas las categorías con sus estilos
     */
    getAllStylesGrouped() {
        const grouped = {};

        Object.keys(this.categories).forEach(cat => {
            grouped[cat] = {
                ...this.categories[cat],
                styles: this.getStylesByCategory(cat)
            };
        });

        return grouped;
    },

    /**
     * Crear avatar desde archivo subido (base64)
     */
    createCustomAvatar(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve({
                    source: 'upload',
                    url: e.target.result,
                    filename: file.name,
                    size: file.size,
                    type: file.type
                });
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    },

    /**
     * Validar archivo de imagen
     */
    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Tipo de archivo no válido. Usa JPG, PNG, GIF, SVG o WebP.');
        }

        if (file.size > maxSize) {
            throw new Error('El archivo es muy grande. Máximo 5MB.');
        }

        return true;
    }
};
