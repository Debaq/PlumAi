// Sistema de Diagrama de Relaciones para PlumaAI
// Visualización gráfica de relaciones entre personajes como un gráfico de nodos y conexiones

// Exponer las funciones como métodos globales para que Alpine pueda acceder a ellas
window.relationsDiagramHelper = {
    // Método para obtener estilo para nodo
    getNodeStyle(character) {
        const size = 12 + (character.relationships ? character.relationships.length : 0) * 2;
        const isMainCharacter = character.role === 'protagonist' || character.role === 'antagonist';
        const color = isMainCharacter ? 'var(--accent)' : 'var(--text-secondary)';
        
        return {
            width: size + 'px',
            height: size + 'px',
            background: color,
            borderRadius: '50%'
        };
    },
    
    // Obtener color de relación
    getRelationColor(relationType) {
        // Mapeo para mantener compatibilidad con datos antiguos
        const spanishToEnglishMap = {
            'amigo': 'friend',
            'familia': 'family',
            'amor': 'love',
            'enemigo': 'enemy',
            'mentor': 'mentor',
            'conocido': 'acquaintance',
            'colaborador': 'collaborator'
        };
        
        // Convertir si es una clave en español
        const actualType = spanishToEnglishMap[relationType] || relationType;
        
        const colorMap = {
            'friend': '#4CAF50',
            'family': '#FF9800',
            'love': '#E91E63',
            'enemy': '#F44336',
            'mentor': '#2196F3',
            'acquaintance': '#9E9E9E',
            'colleague': '#607D8B',
            'collaborator': '#795548',
            'ally': '#8BC34A',
            'rival': '#FFC107',
            'boss': '#3F51B5',
            'subordinate': '#9C27B0',
            'teacher': '#009688',
            'student': '#FF5722',
            'neighbor': '#795548',
            'partner': '#00BCD4',
            'guardian': '#E91E63',
            'ward': '#CDDC39',
            'hero': '#607D8B',
            'villain': '#795548',
            'sidekick': '#FF9800',
            'archenemy': '#F44336',
            'businessPartner': '#9C27B0',
            'ex': '#9E9E9E',
            'crush': '#E91E63',
            'rivalLove': '#EC407A'
        };
        return colorMap[actualType] || '#BDBDBD';
    },
    
    // Obtener posición de nodo (simplificado para ejemplo)
    getNodePosition(characterId, index, totalCharacters) {
        // Calcular posición relativa para distribuir nodos
        const angle = (index / totalCharacters) * 2 * Math.PI;
        const radius = 200;
        const centerX = 50; // Porcentaje
        const centerY = 50; // Porcentaje
        
        const x = centerX + Math.cos(angle) * (radius / 10);
        const y = centerY + Math.sin(angle) * (radius / 10);
        
        return { x: x + '%', y: y + '%' };
    },
    
    // Obtener relaciones de un personaje específico
    getCharacterRelations(characterId, projectStore) {
        const character = projectStore.getCharacter(characterId);
        if (!character || !character.relationships) return [];
        
        return character.relationships.map(rel => {
            const relatedChar = projectStore.getCharacter(rel.characterId);
            return {
                ...rel,
                relatedCharacter: relatedChar
            };
        });
    },
    
    // Actualizar posición de nodos cuando cambian los datos
    updateNodePositions() {
        // Simplemente actualizar estilos para reflejar distribución nueva
        // En una implementación completa, esto se haría dinámicamente
    }
};