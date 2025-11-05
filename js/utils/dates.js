// Utilidades para manejo de fechas

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} locale - Locale para formateo (default: 'es')
 * @returns {string} Fecha formateada
 */
export function formatDate(isoDate, locale = 'es') {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return date.toLocaleDateString(locale, options);
}

/**
 * Formatea una fecha ISO a formato corto
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} locale - Locale para formateo (default: 'es')
 * @returns {string} Fecha formateada (dd/mm/yyyy)
 */
export function formatDateShort(isoDate, locale = 'es') {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    return date.toLocaleDateString(locale, options);
}

/**
 * Formatea una fecha ISO a formato con hora
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} locale - Locale para formateo (default: 'es')
 * @returns {string} Fecha y hora formateadas
 */
export function formatDateTime(isoDate, locale = 'es') {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };

    const dateStr = date.toLocaleDateString(locale, dateOptions);
    const timeStr = date.toLocaleTimeString(locale, timeOptions);

    return `${dateStr}, ${timeStr}`;
}

/**
 * Obtiene una fecha relativa (ej: "hace 5 minutos")
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} locale - Locale para formateo (default: 'es')
 * @returns {string} Fecha relativa
 */
export function getRelativeTime(isoDate, locale = 'es') {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const translations = {
        es: {
            justNow: 'Justo ahora',
            seconds: 'hace {n} segundos',
            minute: 'hace 1 minuto',
            minutes: 'hace {n} minutos',
            hour: 'hace 1 hora',
            hours: 'hace {n} horas',
            day: 'hace 1 día',
            days: 'hace {n} días',
            month: 'hace 1 mes',
            months: 'hace {n} meses',
            year: 'hace 1 año',
            years: 'hace {n} años'
        },
        en: {
            justNow: 'Just now',
            seconds: '{n} seconds ago',
            minute: '1 minute ago',
            minutes: '{n} minutes ago',
            hour: '1 hour ago',
            hours: '{n} hours ago',
            day: '1 day ago',
            days: '{n} days ago',
            month: '1 month ago',
            months: '{n} months ago',
            year: '1 year ago',
            years: '{n} years ago'
        }
    };

    const t = translations[locale] || translations.es;

    if (diffInSeconds < 5) {
        return t.justNow;
    } else if (diffInSeconds < 60) {
        return t.seconds.replace('{n}', diffInSeconds);
    } else if (diffInSeconds < 120) {
        return t.minute;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return t.minutes.replace('{n}', minutes);
    } else if (diffInSeconds < 7200) {
        return t.hour;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return t.hours.replace('{n}', hours);
    } else if (diffInSeconds < 172800) {
        return t.day;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return t.days.replace('{n}', days);
    } else if (diffInSeconds < 5184000) {
        return t.month;
    } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return t.months.replace('{n}', months);
    } else if (diffInSeconds < 63072000) {
        return t.year;
    } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return t.years.replace('{n}', years);
    }
}

/**
 * Obtiene la hora formateada
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} locale - Locale para formateo (default: 'es')
 * @returns {string} Hora formateada (HH:MM)
 */
export function formatTime(isoDate, locale = 'es') {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const options = {
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleTimeString(locale, options);
}

/**
 * Verifica si una fecha es hoy
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {boolean} true si es hoy
 */
export function isToday(isoDate) {
    if (!isoDate) return false;

    const date = new Date(isoDate);
    const today = new Date();

    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

/**
 * Verifica si una fecha es de ayer
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {boolean} true si es ayer
 */
export function isYesterday(isoDate) {
    if (!isoDate) return false;

    const date = new Date(isoDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
}

export default {
    formatDate,
    formatDateShort,
    formatDateTime,
    formatTime,
    getRelativeTime,
    isToday,
    isYesterday
};
