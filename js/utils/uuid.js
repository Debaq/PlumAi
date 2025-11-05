// Utilidades para generar UUIDs
// Nota: crypto.randomUUID() está disponible en navegadores modernos

/**
 * Genera un UUID v4
 * @returns {string} UUID generado
 */
export function generateUUID() {
    return crypto.randomUUID();
}

/**
 * Valida si un string es un UUID válido
 * @param {string} uuid - String a validar
 * @returns {boolean} true si es válido
 */
export function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Genera un ID corto de 8 caracteres
 * @returns {string} ID corto
 */
export function generateShortId() {
    return generateUUID().substring(0, 8);
}

export default {
    generateUUID,
    isValidUUID,
    generateShortId
};
