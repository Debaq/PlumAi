// Token Optimizer Service - Sistema de optimización de tokens para IA
// Reduce el consumo de tokens enviando solo contexto relevante

window.tokenOptimizer = {
    // ============================================
    // CONFIGURACIÓN
    // ============================================

    config: {
        // Límites de tokens por nivel
        limits: {
            minimal: 1000,      // Mínimo: solo lo esencial
            normal: 3000,       // Normal: contexto balanceado
            complete: 8000,     // Completo: todo el contexto
            unlimited: 999999   // Sin límite
        },

        // Nivel actual (se guarda en localStorage)
        currentLevel: 'normal',

        // Aproximación de tokens (1 token ≈ 4 caracteres en español)
        charsPerToken: 4
    },

    // ============================================
    // MÉTODOS DE CONTEO
    // ============================================

    /**
     * Estimar tokens de un texto
     */
    estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.length / this.config.charsPerToken);
    },

    /**
     * Contar tokens de un objeto
     */
    countObjectTokens(obj) {
        const json = JSON.stringify(obj);
        return this.estimateTokens(json);
    },

    /**
     * Obtener límite actual de tokens
     */
    getCurrentLimit() {
        return this.config.limits[this.config.currentLevel] || this.config.limits.normal;
    },

    /**
     * Establecer nivel de optimización
     */
    setLevel(level) {
        if (this.config.limits[level]) {
            this.config.currentLevel = level;
            localStorage.setItem('pluma_ai_token_level', level);
        }
    },

    /**
     * Cargar nivel guardado
     */
    loadSavedLevel() {
        const saved = localStorage.getItem('pluma_ai_token_level');
        if (saved && this.config.limits[saved]) {
            this.config.currentLevel = saved;
        }
    },

    // ============================================
    // DETECCIÓN DE CONTEXTO RELEVANTE
    // ============================================

    /**
     * Detectar personajes mencionados en el texto
     */
    findMentionedCharacters(text, allCharacters) {
        if (!text || !allCharacters) return [];

        const mentioned = [];
        const textLower = text.toLowerCase();

        allCharacters.forEach(char => {
            if (char.name && textLower.includes(char.name.toLowerCase())) {
                mentioned.push(char);
            }
        });

        return mentioned;
    },

    /**
     * Detectar locaciones mencionadas en el texto
     */
    findMentionedLocations(text, allLocations) {
        if (!text || !allLocations) return [];

        const mentioned = [];
        const textLower = text.toLowerCase();

        allLocations.forEach(loc => {
            if (loc.name && textLower.includes(loc.name.toLowerCase())) {
                mentioned.push(loc);
            }
        });

        return mentioned;
    },

    /**
     * Detectar lore relevante por menciones o categoría
     */
    findRelevantLore(text, allLore, limit = 5) {
        if (!text || !allLore) return [];

        const textLower = text.toLowerCase();
        const scored = [];

        allLore.forEach(lore => {
            let score = 0;

            // Puntos por mención directa del título
            if (lore.title && textLower.includes(lore.title.toLowerCase())) {
                score += 10;
            }

            // Puntos por palabras clave en el contenido
            if (lore.content) {
                const words = lore.content.toLowerCase().split(/\s+/).slice(0, 50);
                words.forEach(word => {
                    if (word.length > 4 && textLower.includes(word)) {
                        score += 1;
                    }
                });
            }

            if (score > 0) {
                scored.push({ lore, score });
            }
        });

        // Ordenar por relevancia y limitar
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.lore);
    },

    // ============================================
    // OPTIMIZACIÓN DE CONTEXTO
    // ============================================

    /**
     * Optimizar contexto basado en nivel y relevancia
     */
    optimizeContext(fullContext, currentText = '', level = null) {
        const targetLevel = level || this.config.currentLevel;
        const limit = this.config.limits[targetLevel];

        let optimized = {
            project: fullContext.project,
            characters: [],
            locations: [],
            scenes: [],
            lore: [],
            timeline: [],
            currentChapter: fullContext.currentChapter,
            previousChapters: fullContext.previousChapters
        };

        let currentTokens = this.countObjectTokens(optimized);

        // Función helper para agregar items si hay espacio
        const addIfSpace = (items, target, itemName) => {
            for (const item of items) {
                const itemTokens = this.countObjectTokens(item);
                if (currentTokens + itemTokens <= limit) {
                    target.push(item);
                    currentTokens += itemTokens;
                } else {
                    console.log(`⚠️ Omitiendo ${itemName} por límite de tokens`);
                    break;
                }
            }
        };

        // Estrategia según el nivel
        switch (targetLevel) {
            case 'minimal':
                // Solo protagonista, antagonista, y capítulo actual
                optimized.characters = fullContext.characters.filter(c =>
                    c.role === 'protagonist' || c.role === 'antagonist'
                ).slice(0, 2);
                // No incluir lore ni timeline
                break;

            case 'normal':
                // Personajes mencionados + principales
                const mentionedChars = this.findMentionedCharacters(currentText, fullContext.characters);
                const mainChars = fullContext.characters.filter(c =>
                    c.role === 'protagonist' || c.role === 'antagonist'
                );

                // Combinar y deduplicar
                const relevantChars = [...new Set([...mainChars, ...mentionedChars])];
                addIfSpace(relevantChars, optimized.characters, 'personaje');

                // Lore relevante
                const relevantLore = this.findRelevantLore(currentText, fullContext.lore, 5);
                addIfSpace(relevantLore, optimized.lore, 'entrada de lore');

                // Locaciones mencionadas
                const mentionedLocs = this.findMentionedLocations(currentText, fullContext.locations);
                addIfSpace(mentionedLocs, optimized.locations, 'locación');

                break;

            case 'complete':
            case 'unlimited':
                // Incluir todo, pero respetando límite si no es unlimited
                addIfSpace(fullContext.characters, optimized.characters, 'personaje');
                addIfSpace(fullContext.locations, optimized.locations, 'locación');
                addIfSpace(fullContext.lore, optimized.lore, 'lore');
                addIfSpace(fullContext.timeline.slice(0, 10), optimized.timeline, 'evento');
                addIfSpace(fullContext.scenes, optimized.scenes, 'escena');
                break;
        }

        return {
            context: optimized,
            stats: {
                level: targetLevel,
                estimatedTokens: this.countObjectTokens(optimized),
                limit: limit,
                characters: optimized.characters.length,
                locations: optimized.locations.length,
                lore: optimized.lore.length,
                scenes: optimized.scenes.length
            }
        };
    },

    /**
     * Obtener estadísticas de un contexto
     */
    getContextStats(context) {
        return {
            total: this.countObjectTokens(context),
            breakdown: {
                project: this.countObjectTokens(context.project),
                characters: this.countObjectTokens(context.characters),
                locations: this.countObjectTokens(context.locations),
                scenes: this.countObjectTokens(context.scenes),
                lore: this.countObjectTokens(context.lore),
                timeline: this.countObjectTokens(context.timeline),
                currentChapter: this.countObjectTokens(context.currentChapter),
                previousChapters: this.countObjectTokens(context.previousChapters)
            }
        };
    },

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Formatear número de tokens con separadores
     */
    formatTokens(tokens) {
        return tokens.toLocaleString('es-ES');
    },

    /**
     * Calcular costo aproximado (varía por proveedor)
     */
    estimateCost(tokens, provider = 'anthropic') {
        const prices = {
            'anthropic': { input: 3 / 1000000, output: 15 / 1000000 }, // Claude Sonnet
            'openai': { input: 0.15 / 1000000, output: 0.6 / 1000000 }, // GPT-4o-mini
            'google': { input: 0, output: 0 }, // Gemini free tier
            'groq': { input: 0, output: 0 } // Groq free
        };

        const price = prices[provider] || prices['anthropic'];
        const inputCost = tokens * price.input;
        const outputCost = tokens * price.output * 2; // Estimado 2x para respuesta

        return {
            input: inputCost,
            output: outputCost,
            total: inputCost + outputCost,
            currency: 'USD'
        };
    },

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    init() {
        this.loadSavedLevel();
        console.log(`🎯 Token Optimizer initialized - Level: ${this.config.currentLevel}`);
    }
};

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.tokenOptimizer.init();
}
