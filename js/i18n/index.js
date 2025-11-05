// Sistema de internacionalización
import es from './locales/es.js';
import en from './locales/en.js';

// Exportar todas las traducciones
export const translations = {
    es,
    en
};

// Hacer las traducciones globales para Alpine.js
window.translations = translations;

export default translations;
