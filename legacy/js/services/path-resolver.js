/**
 * Servicio de resolución de rutas
 * Detecta automáticamente el subdirectorio base y construye rutas correctamente
 * para que la aplicación funcione tanto en raíz (/) como en subdirectorios (/plumaai/)
 */

window.PathResolver = {
    // Ruta base de la aplicación (se detecta automáticamente)
    basePath: '',

    /**
     * Inicializa el resolver detectando la ruta base automáticamente
     */
    init() {
        // Obtener la ruta desde donde se cargó index.html
        const currentPath = window.location.pathname;

        // Si index.html está en la raíz, currentPath será '/' o '/index.html'
        // Si está en subdirectorio, será '/plumaai/' o '/plumaai/index.html'

        if (currentPath === '/' || currentPath === '/index.html') {
            this.basePath = '';
        } else {
            // Extraer el directorio base
            const pathParts = currentPath.split('/').filter(p => p && p !== 'index.html');
            if (pathParts.length > 0) {
                this.basePath = '/' + pathParts[0];
            }
        }

        console.log('🔗 PathResolver inicializado con basePath:', this.basePath || '(raíz)');
    },

    /**
     * Resuelve una ruta relativa a una ruta absoluta correcta
     * @param {string} path - Ruta relativa (ej: 'templates/header.html')
     * @returns {string} - Ruta absoluta correcta (ej: '/plumaai/templates/header.html')
     */
    resolve(path) {
        // Si ya es una URL completa o una ruta absoluta con protocolo, no hacer nada
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
            return path;
        }

        // Limpiar la ruta: quitar ./ inicial si existe
        const cleanPath = path.replace(/^\.\//, '');

        // Construir ruta completa
        if (this.basePath) {
            return `${this.basePath}/${cleanPath}`;
        } else {
            return `/${cleanPath}`;
        }
    },

    /**
     * Resuelve una ruta relativa para imports de módulos ES6
     * @param {string} path - Ruta relativa del módulo
     * @returns {string} - Ruta correcta para import()
     */
    resolveModule(path) {
        // Los módulos ES6 requieren rutas relativas que empiecen con ./ o ../
        // No deben ser rutas absolutas con /

        // Si ya empieza con ./ o ../, retornar tal cual
        if (path.startsWith('./') || path.startsWith('../')) {
            return path;
        }

        // Para imports dinámicos desde js/stores/, los módulos están en js/i18n/
        // Asegurar que use ruta relativa
        return `./${path}`;
    },

    /**
     * Obtiene la ruta base actual
     * @returns {string} - Ruta base (ej: '/plumaai' o '')
     */
    getBasePath() {
        return this.basePath;
    }
};

// Auto-inicializar cuando se carga el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.PathResolver.init();
    });
} else {
    window.PathResolver.init();
}
