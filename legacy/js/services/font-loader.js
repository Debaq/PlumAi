/**
 * Font Loader Service
 * Gestiona la carga de fuentes personalizadas para jsPDF
 */

class FontLoader {
    constructor() {
        this.fonts = {};
        this.loaded = false;
    }

    /**
     * Registrar una fuente desde base64
     * @param {string} fontName - Nombre de la fuente (ej: 'AmazonEmber')
     * @param {string} fontStyle - Estilo: 'normal', 'bold', 'italic', 'bolditalic'
     * @param {string} base64Data - Datos de la fuente en base64
     */
    registerFont(fontName, fontStyle, base64Data) {
        if (!this.fonts[fontName]) {
            this.fonts[fontName] = {};
        }
        this.fonts[fontName][fontStyle] = base64Data;
    }

    /**
     * Cargar una fuente desde un archivo
     * @param {string} fontName
     * @param {string} fontStyle
     * @param {string} fontPath - Ruta relativa a la fuente
     */
    async loadFontFromFile(fontName, fontStyle, fontPath) {
        try {
            // Resolver ruta correcta para subdirectorios
            const resolvedPath = window.PathResolver ? window.PathResolver.resolve(fontPath) : fontPath;
            const response = await fetch(resolvedPath);
            const blob = await response.blob();
            const base64 = await this.blobToBase64(blob);
            this.registerFont(fontName, fontStyle, base64);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Convertir blob a base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Extraer solo la parte base64 (después de la coma)
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Aplicar fuentes registradas a un documento jsPDF
     * @param {jsPDF} pdf - Instancia de jsPDF
     */
    applyFonts(pdf) {
        for (const [fontName, styles] of Object.entries(this.fonts)) {
            for (const [style, base64Data] of Object.entries(styles)) {
                try {
                    // Agregar fuente a jsPDF
                    pdf.addFileToVFS(`${fontName}-${style}.ttf`, base64Data);
                    pdf.addFont(`${fontName}-${style}.ttf`, fontName, style);
                } catch (error) {
                    // Font could not be applied, silently continue
                }
            }
        }
    }

    /**
     * Verificar si una fuente está disponible
     */
    isFontAvailable(fontName) {
        return this.fonts.hasOwnProperty(fontName);
    }

    /**
     * Obtener nombre de fuente válido para jsPDF
     * Si la fuente personalizada no está disponible, devuelve fallback
     */
    getFontName(fontName, fallback = 'times') {
        return this.isFontAvailable(fontName) ? fontName : fallback;
    }

    /**
     * Cargar fuentes predeterminadas del proyecto
     */
    async loadDefaultFonts() {
        const fontsToLoad = [
            { name: 'AmazonEndure', style: 'normal', path: 'fonts/Amazon Endure font EN/AmazonEndure-Book.otf' },
            { name: 'AmazonEndure', style: 'bold', path: 'fonts/Amazon Endure font EN/AmazonEndure-SemiBold.otf' },
            { name: 'AmazonEndure', style: 'italic', path: 'fonts/Amazon Endure font EN/AmazonEndure-BookItalic.otf' },
            { name: 'AmazonEndure', style: 'bolditalic', path: 'fonts/Amazon Endure font EN/AmazonEndure-SemiBoldItalic.otf' },
        ];

        const results = await Promise.allSettled(
            fontsToLoad.map(font =>
                this.loadFontFromFile(font.name, font.style, font.path)
            )
        );

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

        this.loaded = true;
        return successCount;
    }
}

// Instancia global
window.fontLoader = new FontLoader();

// Auto-cargar fuentes al iniciar (opcional - puede hacerse on-demand)
// document.addEventListener('DOMContentLoaded', () => {
//     window.fontLoader.loadDefaultFonts();
// });
