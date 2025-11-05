// Store para internacionalización
window.i18nStore = {
    // Idioma actual
    currentLocale: 'es', // 'es' | 'en'

    // Traducciones cargadas
    translations: {},

    // Idiomas disponibles
    availableLocales: [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
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
    },

    // Cambiar idioma
    async setLocale(locale) {
        if (this.availableLocales.find(l => l.code === locale)) {
            this.currentLocale = locale;
            localStorage.setItem('pluma_locale', locale);
        }
    },

    // Obtener traducción por key (soporta notación de punto: 'header.title')
    t(key, params = {}) {
        const translation = this.getNestedTranslation(key);

        if (!translation) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }

        // Reemplazar parámetros {param}
        return this.interpolate(translation, params);
    },

    // Obtener traducción anidada
    getNestedTranslation(key) {
        const keys = key.split('.');
        // Usar las traducciones globales
        const translations = {
            es: window.translations_es,
            en: window.translations_en
        };
        let value = translations[this.currentLocale];

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
