// PlumaAI - Main Application
// Inicialización de Alpine.js y Stores

// Importar traducciones
import translations from './i18n/index.js';

// Importar stores
import i18nStore from './stores/i18n.js';
import projectStore from './stores/project.js';
import uiStore from './stores/ui.js';
import aiStore from './stores/ai.js';

// Inicializar cuando Alpine esté listo
document.addEventListener('alpine:init', () => {
    console.log('🚀 Inicializando PlumaAI...');

    // Registrar stores globales
    Alpine.store('i18n', i18nStore);
    Alpine.store('project', projectStore);
    Alpine.store('ui', uiStore);
    Alpine.store('ai', aiStore);

    // Inicializar stores que lo requieran
    Alpine.store('i18n').init();
    Alpine.store('ui').init();
    Alpine.store('ai').init();

    console.log('✅ Stores registrados');

    // App principal
    Alpine.data('app', () => ({
        init() {
            console.log('📱 App component initialized');
            console.log('Idioma actual:', this.$store.i18n.currentLocale);
        }
    }));

    console.log('✅ PlumaAI inicializado correctamente');
});

// Agregar estilos para x-cloak
const style = document.createElement('style');
style.textContent = `
    [x-cloak] {
        display: none !important;
    }
`;
document.head.appendChild(style);
