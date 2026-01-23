// Sistema de Diagrama de Relaciones para PlumaAI
// Visualización gráfica de relaciones entre personajes como un gráfico de nodos y conexiones

// Exponer las funciones como métodos globales para que Alpine pueda acceder a ellas
window.relationsDiagramHelper = {
    // Cache de posiciones para mantener consistencia
    _positionsCache: new Map(),

    // Estado de transformación (zoom y pan)
    _transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
        minScale: 0.5,
        maxScale: 3
    },

    // Inicializar eventos de zoom y pan
    initDiagram(containerId) {
        console.log('[Relations Diagram] Initializing diagram for container:', containerId);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Relations Diagram] Container not found:', containerId);
            return;
        }

        const diagram = container.querySelector('#relations-diagram-content');
        if (!diagram) {
            console.error('[Relations Diagram] Diagram content not found');
            return;
        }

        console.log('[Relations Diagram] Successfully found elements, setting up interactions');

        // Reset transform
        this._transform.scale = 1;
        this._transform.translateX = 0;
        this._transform.translateY = 0;
        this.applyTransform(diagram);

        // Pan con arrastre
        let isPanning = false;
        let startX = 0;
        let startY = 0;

        diagram.addEventListener('mousedown', (e) => {
            // Solo pan con click izquierdo y no en nodos
            if (e.button === 0 && !e.target.closest('.character-node')) {
                isPanning = true;
                startX = e.clientX - this._transform.translateX;
                startY = e.clientY - this._transform.translateY;
                diagram.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                this._transform.translateX = e.clientX - startX;
                this._transform.translateY = e.clientY - startY;
                this.applyTransform(diagram);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                diagram.style.cursor = 'grab';
            }
        });

        // Zoom con rueda del mouse
        container.addEventListener('wheel', (e) => {
            e.preventDefault();

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(
                this._transform.minScale,
                Math.min(this._transform.maxScale, this._transform.scale * delta)
            );

            // Calcular zoom centrado en el cursor
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const scaleDiff = newScale / this._transform.scale;
            this._transform.translateX = x - (x - this._transform.translateX) * scaleDiff;
            this._transform.translateY = y - (y - this._transform.translateY) * scaleDiff;
            this._transform.scale = newScale;

            this.applyTransform(diagram);
        }, { passive: false });

        diagram.style.cursor = 'grab';
        console.log('[Relations Diagram] Initialization complete. Zoom and pan enabled.');
    },

    // Aplicar transformación
    applyTransform(element) {
        element.style.transform = `translate(${this._transform.translateX}px, ${this._transform.translateY}px) scale(${this._transform.scale})`;
    },

    // Controles de zoom
    zoomIn(containerId) {
        const diagram = document.querySelector(`#${containerId} #relations-diagram-content`);
        if (!diagram) return;

        this._transform.scale = Math.min(this._transform.maxScale, this._transform.scale * 1.2);
        this.applyTransform(diagram);
    },

    zoomOut(containerId) {
        const diagram = document.querySelector(`#${containerId} #relations-diagram-content`);
        if (!diagram) return;

        this._transform.scale = Math.max(this._transform.minScale, this._transform.scale / 1.2);
        this.applyTransform(diagram);
    },

    resetZoom(containerId) {
        const diagram = document.querySelector(`#${containerId} #relations-diagram-content`);
        if (!diagram) return;

        this._transform.scale = 1;
        this._transform.translateX = 0;
        this._transform.translateY = 0;
        this.applyTransform(diagram);
    },

    // Método para obtener estilo completo para nodo incluyendo posición
    getNodeStyle(character, index, totalCharacters) {
        const size = 80 + (character.relationships ? Math.min(character.relationships.length * 3, 30) : 0);
        const isMainCharacter = character.role === 'protagonist' || character.role === 'antagonist';
        const color = isMainCharacter ? 'var(--accent)' : 'var(--text-secondary)';

        // Calcular posición en círculo
        const position = this.getNodePosition(character.id, index, totalCharacters);

        return {
            width: size + 'px',
            height: size + 'px',
            background: color,
            borderRadius: '50%',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
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
    
    // Obtener icono para tipo de relación
    getRelationIcon(relationType) {
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

        const iconMap = {
            'friend': 'users',
            'family': 'home',
            'love': 'heart',
            'enemy': 'x-circle',
            'mentor': 'graduation-cap',
            'acquaintance': 'user',
            'colleague': 'briefcase',
            'collaborator': 'handshake',
            'ally': 'shield',
            'rival': 'sword',
            'boss': 'crown',
            'subordinate': 'arrow-down',
            'teacher': 'book-open',
            'student': 'book',
            'neighbor': 'home',
            'partner': 'users',
            'guardian': 'shield-check',
            'ward': 'baby',
            'hero': 'star',
            'villain': 'skull',
            'sidekick': 'user-plus',
            'archenemy': 'zap',
            'businessPartner': 'trending-up',
            'ex': 'heart-crack',
            'crush': 'heart',
            'rivalLove': 'heart'
        };
        return iconMap[actualType] || 'circle';
    },

    // Obtener posición de nodo con cache
    getNodePosition(characterId, index, totalCharacters) {
        // Verificar cache
        const cacheKey = `${characterId}-${totalCharacters}`;
        if (this._positionsCache.has(cacheKey)) {
            return this._positionsCache.get(cacheKey);
        }

        // Calcular posición en círculo más visible (radio mayor)
        const angle = (index / totalCharacters) * 2 * Math.PI - Math.PI / 2; // Empezar desde arriba
        const radius = 38; // Porcentaje del contenedor (más grande para mejor visibilidad)
        const centerX = 50; // Centro horizontal
        const centerY = 50; // Centro vertical

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const position = {
            x: x + '%',
            y: y + '%',
            // Guardar también las coordenadas numéricas para las líneas
            numericX: x,
            numericY: y
        };

        // Guardar en cache
        this._positionsCache.set(cacheKey, position);

        return position;
    },

    // Limpiar cache de posiciones
    clearPositionsCache() {
        this._positionsCache.clear();
    },

    // Obtener coordenadas para línea entre dos personajes
    getLineCoordinates(char1Id, char2Id, characters) {
        const char1Index = characters.findIndex(c => c.id === char1Id);
        const char2Index = characters.findIndex(c => c.id === char2Id);

        if (char1Index === -1 || char2Index === -1) {
            return null;
        }

        const total = characters.length;
        const pos1 = this.getNodePosition(char1Id, char1Index, total);
        const pos2 = this.getNodePosition(char2Id, char2Index, total);

        return {
            x1: pos1.numericX + '%',
            y1: pos1.numericY + '%',
            x2: pos2.numericX + '%',
            y2: pos2.numericY + '%',
            // Calcular punto medio para colocar icono
            midX: ((pos1.numericX + pos2.numericX) / 2) + '%',
            midY: ((pos1.numericY + pos2.numericY) / 2) + '%',
            midNumericX: (pos1.numericX + pos2.numericX) / 2,
            midNumericY: (pos1.numericY + pos2.numericY) / 2
        };
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