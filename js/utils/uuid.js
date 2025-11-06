// Utilidades para generar UUIDs
window.uuid = {
    /**
     * Genera un UUID v4
     * @returns {string} UUID generado
     */
    generateUUID: function() {
        // Verificar si crypto.randomUUID está disponible y es una función
        if (window.crypto && window.crypto.randomUUID && typeof window.crypto.randomUUID === 'function') {
            try {
                return window.crypto.randomUUID();
            } catch (e) {
                console.warn('crypto.randomUUID failed:', e);
                // Si falla, usar el fallback
            }
        }
        
        // Fallback que no depende de crypto.randomUUID
        // https://stackoverflow.com/a/2117523
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Valida si un string es un UUID válido
     * @param {string} uuid - String a validar
     * @returns {boolean} true si es válido
     */
    isValidUUID: function(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    },

    /**
     * Genera un ID corto de 8 caracteres
     * @returns {string} ID corto
     */
    generateShortId: function() {
        return this.generateUUID().substring(0, 8);
    }
};