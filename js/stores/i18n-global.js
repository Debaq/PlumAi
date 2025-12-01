// Store para internacionalización
// NOTA: Este archivo carga las traducciones de forma modular
// Los módulos están en /js/i18n/locales/{lang}/{module}.js

window.i18nStore = {
    // Idioma actual
    currentLocale: 'es', // 'es' | 'en'

    // Traducciones cargadas (se llenan dinámicamente)
    translations: {},

    // Indicador de si las traducciones están listas
    ready: false,

    // Idiomas disponibles
    availableLocales: [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ],

    // Módulos de traducción disponibles
    translationModules: [
        'common',
        'header',
        'sidebar',
        'dashboard',
        'characters',
        'scenes',
        'locations',
        'chapters',
        'timeline',
        'lore',
        'ai',
        'notes',
        'editor',
        'publishing',
        'modals',
        'status',
        'notifications',
        'stats',
        'validation',
        'relationships',
        'vitalStatus',
        'versionControl',
        'project',
        'loading',
        'avatars'
    ],

    // Inicializar
    async init() {
        // Cargar idioma guardado o detectar del navegador
        const savedLocale = localStorage.getItem('pluma_locale');
        if (savedLocale && this.availableLocales.find(l => l.code === savedLocale)) {
            this.currentLocale = savedLocale;
        } else {
            // Detectar idioma del navegador
            const browserLang = navigator.language.split('-')[0];
            if (this.availableLocales.find(l => l.code === browserLang)) {
                this.currentLocale = browserLang;
            }
        }

        // Cargar traducciones modulares
        await this.loadTranslations();
    },

    // Cargar todas las traducciones modulares para el idioma actual
    async loadTranslations() {
        // Crear objeto de traducciones vacío
        const translations = {};

        // Cargar cada módulo
        for (const module of this.translationModules) {
            try {
                const modulePath = `/js/i18n/locales/${this.currentLocale}/${module}.js`;

                // Importar dinámicamente el módulo
                const imported = await import(modulePath);
                translations[module] = imported.default;
            } catch (error) {
                console.error(`Error cargando módulo de traducción ${module}:`, error);
            }
        }

        // Guardar traducciones en el objeto global apropiado
        if (this.currentLocale === 'es') {
            window.translations_es = translations;
        } else if (this.currentLocale === 'en') {
            window.translations_en = translations;
        }

        // Guardar también en this.translations para acceso directo
        this.translations = translations;

        // Marcar como listo
        this.ready = true;
    },

    // Cambiar idioma
    async setLocale(locale) {
        if (this.availableLocales.find(l => l.code === locale)) {
            this.currentLocale = locale;
            localStorage.setItem('pluma_locale', locale);
            // Recargar la página para aplicar el nuevo idioma
            window.location.reload();
        }
    },

    // Cambiar idioma sin recargar (para uso en modales)
    async changeLocale(locale) {
        if (this.availableLocales.find(l => l.code === locale)) {
            this.currentLocale = locale;
            localStorage.setItem('pluma_locale', locale);
            // Recargar traducciones para el nuevo idioma
            await this.loadTranslations();
        }
    },

    // Obtener traducción por key (soporta notación de punto: 'header.title')
    t(key, params = {}) {
        const translation = this.getNestedTranslation(key);

        if (!translation) {
            // Solo mostrar warning en desarrollo (cuando debug está habilitado)
            if (localStorage.getItem('pluma_debug_logs') === 'true') {
                console.warn(`⚠️ Traducción no encontrada: ${key}`);
            }
            return key;
        }

        // Reemplazar parámetros {param}
        return this.interpolate(translation, params);
    },

    // Obtener traducción anidada
    getNestedTranslation(key) {
        // Si no están listas las traducciones, retornar null
        if (!this.ready) {
            return null;
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return null;
            }
        }

        return value;
    },

    // Interpolar parámetros en la traducción
    interpolate(text, params) {
        if (typeof text !== 'string') return text;

        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params.hasOwnProperty(key) ? params[key] : match;
        });
    },

    // Obtener nombre del idioma actual
    getCurrentLocaleName() {
        const locale = this.availableLocales.find(l => l.code === this.currentLocale);
        return locale ? locale.name : this.currentLocale;
    }
};

// NO auto-inicializar - dejar que app.js lo haga cuando Alpine.js esté listo
// Esto asegura que las traducciones estén cargadas antes de que Alpine.js renderice
