/**
 * Sistema de Contexto Agéntico para PlumAI
 * La IA decide qué contexto necesita en lugar de enviar todo
 *
 * FLUJO DE 2 PASOS:
 * 1. Request 1: IA analiza tarea y decide qué contexto necesita
 * 2. Request 2: Sistema envía SOLO el contexto solicitado
 */

window.agenticContextService = {

    // ============================================
    // SISTEMA DE INVENTARIO DE CONTEXTO
    // ============================================

    /**
     * Construye un inventario ligero del contexto disponible
     * Solo nombres/títulos, NO contenido completo
     */
    buildContextInventory(chapterId = null) {
        const projectStore = Alpine.store('project');
        if (!projectStore) return null;

        const inventory = {
            project: {
                title: projectStore.projectInfo.title,
                author: projectStore.projectInfo.author,
                genre: projectStore.projectInfo.genre
            },
            availableCharacters: projectStore.characters.map(c => ({
                name: c.name,
                role: c.role
            })),
            availableLocations: projectStore.locations.map(l => ({
                name: l.name,
                type: l.type
            })),
            availableScenes: projectStore.scenes.map(s => ({
                name: s.name
            })),
            availableLore: projectStore.loreEntries.map(l => ({
                title: l.title,
                category: l.category
            })),
            availableTimeline: projectStore.timeline.map(t => ({
                title: t.title,
                date: t.date
            })),
            currentChapterInfo: null,
            previousChaptersCount: 0
        };

        // Info del capítulo actual (sin contenido completo)
        if (chapterId) {
            const chapter = projectStore.getChapter(chapterId);
            if (chapter) {
                inventory.currentChapterInfo = {
                    title: chapter.title,
                    number: chapter.number,
                    wordCount: chapter.wordCount
                };

                // Contar capítulos anteriores disponibles
                inventory.previousChaptersCount = projectStore.chapters
                    .filter(c => c.number < chapter.number)
                    .length;
            }
        }

        return inventory;
    },

    // ============================================
    // PASO 1: ANÁLISIS DE NECESIDADES
    // ============================================

    /**
     * Prompt para que la IA analice qué contexto necesita
     */
    buildContextAnalysisPrompt(mode, userInput, inventory, selectedText = null) {
        const modeConfig = window.aiService.assistantModes[mode];

        let prompt = `# ANÁLISIS DE CONTEXTO NECESARIO

Eres un asistente que debe analizar una tarea de escritura y determinar qué contexto específico necesitas para completarla de manera óptima.

## TAREA DEL USUARIO
**Modo**: ${modeConfig.name}
**Instrucción**: ${userInput}
`;

        if (selectedText) {
            prompt += `**Texto seleccionado**: ${selectedText.substring(0, 500)}${selectedText.length > 500 ? '...' : ''}\n`;
        }

        prompt += `\n## PROYECTO: ${inventory.project.title}
**Género**: ${inventory.project.genre || 'No especificado'}

## CONTEXTO DISPONIBLE

### Personajes disponibles (${inventory.availableCharacters.length}):
${inventory.availableCharacters.map(c => `- ${c.name} (${c.role})`).join('\n')}

### Locaciones disponibles (${inventory.availableLocations.length}):
${inventory.availableLocations.map(l => `- ${l.name} (${l.type})`).join('\n')}

### Escenas disponibles (${inventory.availableScenes.length}):
${inventory.availableScenes.map(s => `- ${s.name}`).join('\n')}

### Lore disponible (${inventory.availableLore.length}):
${inventory.availableLore.map(l => `- ${l.title} (${l.category})`).join('\n')}

### Timeline disponible (${inventory.availableTimeline.length}):
${inventory.availableTimeline.map(t => `- ${t.title} (${t.date})`).join('\n')}
`;

        if (inventory.currentChapterInfo) {
            prompt += `\n### Capítulo actual:
- Número: ${inventory.currentChapterInfo.number}
- Título: ${inventory.currentChapterInfo.title}
- Palabras: ${inventory.currentChapterInfo.wordCount}

### Capítulos anteriores disponibles: ${inventory.previousChaptersCount}
`;
        }

        prompt += `\n---

## INSTRUCCIONES

Analiza la tarea y responde ÚNICAMENTE con un JSON que especifique qué contexto necesitas.

**Formato de respuesta (JSON estricto):**
\`\`\`json
{
  "contextNeeded": {
    "characters": ["nombre1", "nombre2"] o [] si no necesitas ninguno o ["all"] para todos,
    "locations": ["nombre1"] o [] o ["all"],
    "scenes": ["nombre1"] o [] o ["all"],
    "lore": ["título1", "título2"] o [] o ["all"],
    "timeline": ["título1"] o [] o ["all"],
    "currentChapter": true o false (si necesitas el contenido completo del capítulo actual),
    "previousChapters": 0-${inventory.previousChaptersCount} (cuántos capítulos anteriores necesitas),
    "reasoning": "breve explicación de por qué necesitas este contexto"
  }
}
\`\`\`

**IMPORTANTE**:
- Sé SELECTIVO: Solo pide lo que realmente necesitas para la tarea
- Si solo necesitas algunos personajes específicos mencionados en el texto, pide solo esos
- No pidas "all" a menos que genuinamente necesites toda esa categoría
- El objetivo es MINIMIZAR tokens mientras mantienes la calidad
- Responde SOLO con el JSON, sin texto adicional

Analiza y responde:`;

        return prompt;
    },

    /**
     * REQUEST 1: Envía análisis de contexto a la IA
     */
    async analyzeContextNeeds(mode, userInput, inventory, selectedText = null) {
        const provider = window.aiService.getCurrentProvider();

        // LOG: Inicio de Análisis Agéntico (Step 1)
        if (window.plumLogger) {
            window.plumLogger.group('AGENTIC STEP 1', '🧠 Análisis de contexto necesario', '#00BCD4');
            window.plumLogger.info('Modo', mode);
            window.plumLogger.info('Inventario', `${inventory.availableCharacters.length} chars, ${inventory.availableLocations.length} locs, ${inventory.availableLore.length} lore`);
        }

        const analysisPrompt = this.buildContextAnalysisPrompt(mode, userInput, inventory, selectedText);

        // LOG: Prompt de análisis
        if (window.plumLogger) {
            window.plumLogger.debug('Prompt enviado', `${analysisPrompt.length} chars`);
        }

        try {
            let response;

            // Usar el proveedor actual para analizar
            switch (provider.id) {
                case 'google':
                    response = await window.aiService.sendGoogleRequest(analysisPrompt);
                    break;
                case 'groq':
                    response = await window.aiService.sendGroqRequest(analysisPrompt);
                    break;
                case 'anthropic':
                    response = await window.aiService.sendAnthropicRequest(analysisPrompt);
                    break;
                case 'ollama':
                    response = await window.aiService.sendOllamaRequest(analysisPrompt);
                    break;
                default:
                    throw new Error(`Proveedor ${provider.id} no soportado para modo agéntico`);
            }

            // Parsear respuesta JSON
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('La IA no devolvió un JSON válido');
            }

            const contextDecision = JSON.parse(jsonMatch[0]);

            // LOG: Decisión de la IA
            if (window.plumLogger) {
                window.plumLogger.success('Análisis completo', 'IA decidió qué contexto necesita');
                window.plumLogger.groupCollapsed('DECISIÓN', '🎯 Contexto solicitado', '#4CAF50');
                window.plumLogger.info('Personajes', contextDecision.contextNeeded.characters);
                window.plumLogger.info('Locaciones', contextDecision.contextNeeded.locations);
                window.plumLogger.info('Escenas', contextDecision.contextNeeded.scenes);
                window.plumLogger.info('Lore', contextDecision.contextNeeded.lore);
                window.plumLogger.info('Timeline', contextDecision.contextNeeded.timeline);
                window.plumLogger.info('Capítulo actual', contextDecision.contextNeeded.currentChapter);
                window.plumLogger.info('Capítulos previos', contextDecision.contextNeeded.previousChapters);
                window.plumLogger.debug('Razonamiento', contextDecision.contextNeeded.reasoning);
                window.plumLogger.groupEnd();
                window.plumLogger.groupEnd(); // Cierra AGENTIC STEP 1
            }

            return contextDecision.contextNeeded;

        } catch (error) {
            if (window.plumLogger) {
                window.plumLogger.error('ERROR', `Error en análisis: ${error.message}`);
                window.plumLogger.groupEnd();
            }
            throw error;
        }
    },

    // ============================================
    // CONSTRUCCIÓN SELECTIVA DE CONTEXTO
    // ============================================

    /**
     * Construye SOLO el contexto solicitado por la IA
     */
    buildSelectiveContext(contextNeeds, chapterId = null) {
        const projectStore = Alpine.store('project');
        if (!projectStore) return null;

        const context = {
            project: {
                title: projectStore.projectInfo.title,
                author: projectStore.projectInfo.author,
                genre: projectStore.projectInfo.genre
            }
        };

        // Personajes selectivos
        if (contextNeeds.characters && contextNeeds.characters.length > 0) {
            if (contextNeeds.characters.includes('all')) {
                context.characters = projectStore.characters.map(c => ({
                    name: c.name,
                    role: c.role,
                    description: c.description,
                    personality: c.personality,
                    background: c.background
                }));
            } else {
                context.characters = projectStore.characters
                    .filter(c => contextNeeds.characters.includes(c.name))
                    .map(c => ({
                        name: c.name,
                        role: c.role,
                        description: c.description,
                        personality: c.personality,
                        background: c.background
                    }));
            }
        } else {
            context.characters = [];
        }

        // Locaciones selectivas
        if (contextNeeds.locations && contextNeeds.locations.length > 0) {
            if (contextNeeds.locations.includes('all')) {
                context.locations = projectStore.locations.map(l => ({
                    name: l.name,
                    type: l.type,
                    description: l.description
                }));
            } else {
                context.locations = projectStore.locations
                    .filter(l => contextNeeds.locations.includes(l.name))
                    .map(l => ({
                        name: l.name,
                        type: l.type,
                        description: l.description
                    }));
            }
        } else {
            context.locations = [];
        }

        // Escenas selectivas
        if (contextNeeds.scenes && contextNeeds.scenes.length > 0) {
            if (contextNeeds.scenes.includes('all')) {
                context.scenes = projectStore.scenes.map(s => ({
                    name: s.name,
                    description: s.description,
                    characters: s.characters || []
                }));
            } else {
                context.scenes = projectStore.scenes
                    .filter(s => contextNeeds.scenes.includes(s.name))
                    .map(s => ({
                        name: s.name,
                        description: s.description,
                        characters: s.characters || []
                    }));
            }
        } else {
            context.scenes = [];
        }

        // Lore selectivo
        if (contextNeeds.lore && contextNeeds.lore.length > 0) {
            if (contextNeeds.lore.includes('all')) {
                context.lore = projectStore.loreEntries.map(l => ({
                    title: l.title,
                    content: l.content,
                    category: l.category
                }));
            } else {
                context.lore = projectStore.loreEntries
                    .filter(l => contextNeeds.lore.includes(l.title))
                    .map(l => ({
                        title: l.title,
                        content: l.content,
                        category: l.category
                    }));
            }
        } else {
            context.lore = [];
        }

        // Timeline selectivo
        if (contextNeeds.timeline && contextNeeds.timeline.length > 0) {
            if (contextNeeds.timeline.includes('all')) {
                context.timeline = projectStore.timeline.map(t => ({
                    title: t.title,
                    date: t.date,
                    description: t.description
                }));
            } else {
                context.timeline = projectStore.timeline
                    .filter(t => contextNeeds.timeline.includes(t.title))
                    .map(t => ({
                        title: t.title,
                        date: t.date,
                        description: t.description
                    }));
            }
        } else {
            context.timeline = [];
        }

        // Capítulo actual (si solicitado)
        if (contextNeeds.currentChapter && chapterId) {
            const chapter = projectStore.getChapter(chapterId);
            if (chapter) {
                context.currentChapter = {
                    title: chapter.title,
                    number: chapter.number,
                    content: chapter.content,
                    wordCount: chapter.wordCount
                };
            }
        }

        // Capítulos anteriores (cantidad específica)
        if (contextNeeds.previousChapters && contextNeeds.previousChapters > 0 && chapterId) {
            const chapter = projectStore.getChapter(chapterId);
            if (chapter) {
                context.previousChapters = projectStore.chapters
                    .filter(c => c.number < chapter.number)
                    .sort((a, b) => a.number - b.number)
                    .slice(-contextNeeds.previousChapters)
                    .map(c => ({
                        number: c.number,
                        title: c.title,
                        summary: c.content.substring(0, 500) + '...'
                    }));
            }
        }

        return context;
    },

    // ============================================
    // PASO 2: EJECUCIÓN CON CONTEXTO OPTIMIZADO
    // ============================================

    /**
     * REQUEST 2: Ejecuta la tarea con el contexto selectivo
     */
    async executeWithSelectiveContext(mode, userInput, context, selectedText = null) {
        const startTime = performance.now();
        const provider = window.aiService.getCurrentProvider();

        // LOG: Inicio de Ejecución Agéntica (Step 2)
        if (window.plumLogger) {
            window.plumLogger.group('AGENTIC STEP 2', '⚡ Ejecución con contexto optimizado', '#4CAF50');
            const contextSize = (context.characters?.length || 0) +
                               (context.locations?.length || 0) +
                               (context.lore?.length || 0) +
                               (context.timeline?.length || 0);
            window.plumLogger.info('Contexto selectivo', `${contextSize} elementos enviados`);
            window.plumLogger.contextData('Personajes', context.characters);
            window.plumLogger.contextData('Locaciones', context.locations);
            window.plumLogger.contextData('Lore', context.lore);
            window.plumLogger.contextData('Timeline', context.timeline);
        }

        // Construir prompt final con contexto selectivo
        const prompt = window.aiService.buildPrompt(mode, userInput, context, selectedText);

        // LOG: Prompt final
        if (window.plumLogger) {
            const estimatedTokens = Math.ceil(prompt.length / 4);
            window.plumLogger.promptBuilt(prompt.length, estimatedTokens);
            window.plumLogger.promptPreview(prompt);
        }

        try {
            let response;

            switch (provider.id) {
                case 'google':
                    response = await window.aiService.sendGoogleRequest(prompt);
                    break;
                case 'groq':
                    response = await window.aiService.sendGroqRequest(prompt);
                    break;
                case 'anthropic':
                    response = await window.aiService.sendAnthropicRequest(prompt);
                    break;
                case 'ollama':
                    response = await window.aiService.sendOllamaRequest(prompt);
                    break;
                default:
                    throw new Error(`Proveedor ${provider.id} no soportado`);
            }

            // LOG: Completado
            if (window.plumLogger) {
                const totalTime = Math.round(performance.now() - startTime);
                window.plumLogger.success('AGENTIC COMPLETE', `⏱ Tiempo total: ${totalTime}ms`);
                window.plumLogger.info('Modelo usado', window.aiService.currentModel);
                if (response.usage) {
                    window.plumLogger.info('Tokens', `Usados: ${response.usage.totalTokens || response.usage.total_tokens}`);
                }
                window.plumLogger.groupEnd(); // Cierra AGENTIC STEP 2
            }

            return response;

        } catch (error) {
            if (window.plumLogger) {
                window.plumLogger.error('ERROR', error.message);
                window.plumLogger.groupEnd();
            }
            throw error;
        }
    },

    // ============================================
    // MÉTODO PRINCIPAL: FLUJO COMPLETO DE 2 PASOS
    // ============================================

    /**
     * Ejecuta el flujo agéntico completo de 2 pasos
     */
    async sendAgenticRequest(mode, userInput, chapterId = null, selectedText = null) {
        const overallStart = performance.now();

        // LOG: Inicio del flujo agéntico
        if (window.plumLogger) {
            window.plumLogger.separator();
            window.plumLogger.group('🤖 AGENTIC AI', 'Sistema de Contexto Agéntico', '#00BCD4');
            window.plumLogger.info('Usuario', userInput);
            window.plumLogger.info('Modo', mode);
        }

        try {
            // PASO 1: Construir inventario y analizar necesidades
            const inventory = this.buildContextInventory(chapterId);
            const contextNeeds = await this.analyzeContextNeeds(mode, userInput, inventory, selectedText);

            // PASO 2: Construir contexto selectivo y ejecutar
            const selectiveContext = this.buildSelectiveContext(contextNeeds, chapterId);
            const response = await this.executeWithSelectiveContext(mode, userInput, selectiveContext, selectedText);

            // LOG: Resumen final
            if (window.plumLogger) {
                const totalTime = Math.round(performance.now() - overallStart);
                window.plumLogger.separator();
                window.plumLogger.success('FLUJO COMPLETO', `✓ Proceso agéntico completado en ${totalTime}ms`);
                window.plumLogger.groupEnd(); // Cierra AGENTIC AI
                window.plumLogger.separator();
            }

            return response;

        } catch (error) {
            if (window.plumLogger) {
                window.plumLogger.error('ERROR AGÉNTICO', error.message);
                window.plumLogger.groupEnd();
            }
            throw error;
        }
    }
};
