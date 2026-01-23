/**
 * Character Info Modal Component
 * Modal para mostrar información de personajes
 */

window.characterInfoModalComponent = function() {
    return {
        // Estado del modal
        showCharacterInfo: false,
        selectedCharacter: null,

        /**
         * Abrir modal con información del personaje
         * @param {Object} character - Personaje a mostrar
         */
        openCharacterInfo(character) {
            this.selectedCharacter = character;
            this.showCharacterInfo = true;
        },

        /**
         * Cerrar modal
         */
        closeCharacterInfo() {
            this.showCharacterInfo = false;
            this.selectedCharacter = null;
        }
    };
};
