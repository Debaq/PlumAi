// AI Service - Servicio unificado para múltiples proveedores de IA
// Soporta: APIs pagadas, free tiers, locales, y modo "copy prompt"

window.aiService = {
    // ============================================
    // CONFIGURACIÓN DE PROVEEDORES
    // ============================================

    providers: {
        // APIs PAGADAS CON FREE TIER
        anthropic: {
            id: 'anthropic',
            name: 'Claude (Anthropic)',
            models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
            defaultModel: 'claude-3-5-sonnet-20241022',
            requiresApiKey: true,
            endpoint: 'https://api.anthropic.com/v1/messages',
            freeTier: '$5 gratis al inicio',
            pricing: 'Desde $3/M tokens',
            type: 'api',
            enabled: false
        },
        openai: {
            id: 'openai',
            name: 'OpenAI (ChatGPT)',
            models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
            defaultModel: 'gpt-4o-mini',
            requiresApiKey: true,
            endpoint: 'https://api.openai.com/v1/chat/completions',
            freeTier: 'No (solo pago)',
            pricing: 'Desde $0.15/M tokens',
            type: 'api',
            enabled: false
        },
        google: {
            id: 'google',
            name: 'Google Gemini',
            models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
            defaultModel: 'gemini-1.5-flash',
            requiresApiKey: true,
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
            freeTier: '15 req/min gratis',
            pricing: 'Free tier generoso',
            type: 'api',
            enabled: true
        },
        groq: {
            id: 'groq',
            name: 'Groq (Ultra rápido)',
            models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
            defaultModel: 'llama-3.3-70b-versatile',
            requiresApiKey: true,
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            freeTier: 'FREE tier generoso',
            pricing: 'Gratis (rate limited)',
            type: 'api',
            enabled: true
        },
        together: {
            id: 'together',
            name: 'Together AI',
            models: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
            defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            requiresApiKey: true,
            endpoint: 'https://api.together.xyz/v1/chat/completions',
            freeTier: '$25 gratis al inicio',
            pricing: 'Desde $0.2/M tokens',
            type: 'api',
            enabled: false
        },

        // LOCALES / GRATUITAS
        ollama: {
            id: 'ollama',
            name: 'Ollama (Local)',
            models: ['llama3.2', 'qwen2.5', 'mistral', 'gemma2'],
            defaultModel: 'llama3.2',
            requiresApiKey: false,
            endpoint: 'http://localhost:11434/api/chat',
            freeTier: '100% GRATIS',
            pricing: 'Gratis (local)',
            type: 'local',
            enabled: true,
            instructions: 'Instalar: https://ollama.ai'
        },
        huggingface: {
            id: 'huggingface',
            name: 'HuggingFace',
            models: ['meta-llama/Llama-3.2-3B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.2'],
            defaultModel: 'meta-llama/Llama-3.2-3B-Instruct',
            requiresApiKey: true,
            endpoint: 'https://api-inference.huggingface.co/models',
            freeTier: 'Rate limited gratis',
            pricing: 'Gratis (algunos modelos)',
            type: 'api',
            enabled: false
        },

        // MODO COPY PROMPT (sin API)
        manual: {
            id: 'manual',
            name: 'Copiar Prompt (Manual)',
            models: ['copy-paste'],
            defaultModel: 'copy-paste',
            requiresApiKey: false,
            freeTier: '100% GRATIS',
            pricing: 'Gratis',
            type: 'manual',
            enabled: false,
            description: 'Genera un prompt completo para copiar y pegar en ChatGPT, Claude, etc.'
        }
    },

    // ============================================
    // PROVEEDORES DE GENERACIÓN DE IMÁGENES
    // ============================================

    imageProviders: {
        // Google Imagen (Vertex AI)
        googleImagen: {
            id: 'googleImagen',
            name: 'Google Imagen (Vertex AI)',
            models: ['imagegeneration@006', 'imagegeneration@005', 'imagegeneration@002'],
            defaultModel: 'imagegeneration@006',
            requiresApiKey: true,
            endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects',
            freeTier: 'Limitado con Google Cloud Free Tier',
            pricing: 'Desde $0.020 por imagen',
            type: 'api',
            enabled: false,
            description: 'Modelo de generación de imágenes de alta calidad de Google',
            instructions: 'Requiere proyecto en Google Cloud y habilitación de Vertex AI API'
        },

        // DALL-E (OpenAI)
        dalle: {
            id: 'dalle',
            name: 'DALL-E 3 (OpenAI)',
            models: ['dall-e-3', 'dall-e-2'],
            defaultModel: 'dall-e-3',
            requiresApiKey: true,
            endpoint: 'https://api.openai.com/v1/images/generations',
            freeTier: 'No (solo pago)',
            pricing: 'DALL-E 3: $0.04-$0.12 por imagen | DALL-E 2: $0.016-$0.020',
            type: 'api',
            enabled: false,
            description: 'Generador de imágenes fotorrealistas de alta calidad',
            instructions: 'Usa la misma API key de OpenAI para texto'
        },

        // Stability AI (Stable Diffusion)
        stabilityai: {
            id: 'stabilityai',
            name: 'Stable Diffusion (Stability AI)',
            models: [
                'stable-diffusion-xl-1024-v1-0',
                'stable-diffusion-v1-6',
                'stable-diffusion-xl-beta-v2-2-2'
            ],
            defaultModel: 'stable-diffusion-xl-1024-v1-0',
            requiresApiKey: true,
            endpoint: 'https://api.stability.ai/v1/generation',
            freeTier: '25 créditos gratis al inicio',
            pricing: 'Desde $0.002 por imagen',
            type: 'api',
            enabled: false,
            description: 'Modelo open-source de generación de imágenes, muy versátil',
            instructions: 'Regístrate en stability.ai y obtén tu API key'
        },

        // Replicate (Múltiples modelos)
        replicateImage: {
            id: 'replicateImage',
            name: 'Replicate (Flux, SD, etc)',
            models: [
                'black-forest-labs/flux-1.1-pro',
                'black-forest-labs/flux-dev',
                'stability-ai/sdxl',
                'playgroundai/playground-v2.5-1024px-aesthetic'
            ],
            defaultModel: 'black-forest-labs/flux-1.1-pro',
            requiresApiKey: true,
            endpoint: 'https://api.replicate.com/v1/predictions',
            freeTier: 'Crédito inicial gratis',
            pricing: 'Pay-per-use desde $0.0025 por imagen',
            type: 'api',
            enabled: false,
            description: 'Plataforma con acceso a múltiples modelos de imagen (Flux, SDXL, etc)',
            instructions: 'Regístrate en replicate.com y obtén tu API token'
        },

        // Leonardo AI
        leonardo: {
            id: 'leonardo',
            name: 'Leonardo AI',
            models: ['leonardo-phoenix-1.0', 'leonardo-kino-xl', 'leonardo-diffusion-xl'],
            defaultModel: 'leonardo-phoenix-1.0',
            requiresApiKey: true,
            endpoint: 'https://cloud.leonardo.ai/api/rest/v1/generations',
            freeTier: '150 tokens diarios gratis',
            pricing: 'Free tier generoso, planes desde $10/mes',
            type: 'api',
            enabled: false,
            description: 'IA especializada en arte de videojuegos y conceptual',
            instructions: 'Regístrate en leonardo.ai y obtén tu API key desde el dashboard'
        },

        // Midjourney (Nota: No tiene API oficial, pero se incluye para referencia)
        midjourney: {
            id: 'midjourney',
            name: 'Midjourney (Manual)',
            models: ['v6.1', 'v6', 'v5.2'],
            defaultModel: 'v6.1',
            requiresApiKey: false,
            freeTier: 'No disponible',
            pricing: 'Desde $10/mes (Discord)',
            type: 'manual',
            enabled: false,
            description: 'Generador artístico de alta calidad (requiere Discord)',
            instructions: 'Midjourney no tiene API pública. Usa Discord para generar imágenes manualmente.'
        }
    },

    // ============================================
    // ESTADO
    // ============================================

    currentProvider: null,
    currentModel: null,

    // ============================================
    // TIPOS DE ASISTENCIA
    // ============================================

    assistantModes: {
        continue: {
            id: 'continue',
            name: 'Continuar escribiendo',
            systemPrompt: 'Eres un asistente de escritura creativa. Tu tarea es continuar la historia de manera coherente y creativa, manteniendo el estilo, tono y voz establecidos.',
            icon: '✍️'
        },
        suggest: {
            id: 'suggest',
            name: 'Sugerir ideas',
            systemPrompt: 'Eres un asistente creativo que genera ideas y sugerencias para desarrollar la historia. Proporciona opciones variadas y creativas.',
            icon: '💡'
        },
        analyze: {
            id: 'analyze',
            name: 'Analizar texto',
            systemPrompt: 'Eres un editor literario. Analiza el texto en busca de inconsistencias, problemas de ritmo, caracterización, y oportunidades de mejora.',
            icon: '🔍'
        },
        improve: {
            id: 'improve',
            name: 'Mejorar pasaje',
            systemPrompt: 'Eres un editor literario experto. Reescribe el pasaje seleccionado mejorando la prosa, el ritmo, y la claridad sin cambiar la intención original.',
            icon: '✨'
        },
        dialogue: {
            id: 'dialogue',
            name: 'Generar diálogo',
            systemPrompt: 'Eres un especialista en diálogos. Genera diálogos naturales y característicos para los personajes, respetando su personalidad y trasfondo.',
            icon: '💬'
        },
        worldbuild: {
            id: 'worldbuild',
            name: 'Expandir worldbuilding',
            systemPrompt: 'Eres un experto en worldbuilding. Ayuda a expandir y profundizar el mundo de la historia, creando detalles coherentes y ricos.',
            icon: '🌍'
        },
        characterize: {
            id: 'characterize',
            name: 'Desarrollar personaje',
            systemPrompt: 'Eres un experto en caracterización. Ayuda a desarrollar personajes tridimensionales con motivaciones, conflictos y arcos coherentes.',
            icon: '🎭'
        }
    },

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    init() {
        // Cargar proveedor guardado
        const savedProvider = localStorage.getItem('pluma_ai_provider');
        const savedModel = localStorage.getItem('pluma_ai_model');

        if (savedProvider && this.providers[savedProvider]) {
            this.currentProvider = savedProvider;
            this.currentModel = savedModel || this.providers[savedProvider].defaultModel;
        } else {
            // Default a manual (copy prompt) para que siempre funcione
            this.currentProvider = 'manual';
            this.currentModel = 'copy-paste';
        }
    },

    // ============================================
    // GESTIÓN DE PROVEEDORES
    // ============================================

    setProvider(providerId, model = null) {
        if (!this.providers[providerId]) {
            throw new Error(`Proveedor no encontrado: ${providerId}`);
        }

        this.currentProvider = providerId;
        this.currentModel = model || this.providers[providerId].defaultModel;

        localStorage.setItem('pluma_ai_provider', providerId);
        localStorage.setItem('pluma_ai_model', this.currentModel);
    },

    getAvailableProviders() {
        return Object.values(this.providers).filter(p => p.enabled);
    },

    getCurrentProvider() {
        return this.providers[this.currentProvider];
    },

    /**
     * Verifica si el proveedor actual soporta el modo agéntico
     * El modo agéntico requiere proveedores que puedan hacer múltiples requests
     */
    supportsAgenticMode() {
        const provider = this.getCurrentProvider();
        if (!provider) return false;

        // Solo proveedores de API real soportan modo agéntico
        // El modo "manual" (copiar prompt) no puede hacer múltiples requests
        const supportedProviders = ['google', 'groq', 'anthropic', 'ollama', 'openai', 'together'];
        return supportedProviders.includes(provider.id);
    },

    /**
     * Clasifica y mejora los mensajes de error para el usuario
     */
    getErrorMessage(error, providerId) {
        const provider = this.providers[providerId];
        const errorMsg = error.message || error.toString();

        // Errores de red / conexión
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('ECONNREFUSED')) {
            if (providerId === 'ollama') {
                return {
                    type: 'connection',
                    title: 'Ollama no está disponible',
                    message: 'No se puede conectar a Ollama en localhost:11434',
                    suggestions: [
                        'Verifica que Ollama esté instalado: https://ollama.ai',
                        'Ejecuta "ollama serve" en la terminal',
                        'Comprueba que no haya otro proceso usando el puerto 11434'
                    ]
                };
            } else {
                return {
                    type: 'connection',
                    title: `${provider.name} no está disponible`,
                    message: `No se puede conectar con el servicio de ${provider.name}`,
                    suggestions: [
                        'Verifica tu conexión a internet',
                        `Revisa el estado del servicio: https://status.${providerId}.com`,
                        'El servicio podría estar experimentando problemas temporales',
                        'Intenta con otro proveedor de IA mientras tanto'
                    ]
                };
            }
        }

        // Errores de autenticación / API Key
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') ||
            errorMsg.includes('invalid_api_key') || errorMsg.includes('authentication')) {
            return {
                type: 'auth',
                title: 'API Key inválida o expirada',
                message: `La API key de ${provider.name} no es válida`,
                suggestions: [
                    'Verifica que la API key esté correctamente configurada en Ajustes',
                    'Comprueba que la API key no haya expirado',
                    `Genera una nueva API key en ${this.getProviderDashboard(providerId)}`,
                    'Asegúrate de copiar la API key completa sin espacios'
                ]
            };
        }

        // Errores de rate limit
        if (errorMsg.includes('429') || errorMsg.includes('rate_limit') ||
            errorMsg.includes('quota') || errorMsg.includes('too many requests')) {
            return {
                type: 'rate_limit',
                title: 'Límite de uso excedido',
                message: `Has alcanzado el límite de requests de ${provider.name}`,
                suggestions: [
                    'Espera unos minutos antes de intentar nuevamente',
                    'Verifica tu cuota disponible en el dashboard del proveedor',
                    'Considera actualizar tu plan si usas el tier gratuito',
                    'Usa otro proveedor de IA temporalmente'
                ]
            };
        }

        // Errores de CORS
        if (errorMsg.includes('CORS') || errorMsg.includes('Cross-Origin')) {
            return {
                type: 'cors',
                title: 'Error de seguridad del navegador',
                message: 'El navegador está bloqueando la conexión por políticas de seguridad',
                suggestions: [
                    'Esto puede ocurrir al usar la app localmente',
                    'Intenta usar un proveedor diferente',
                    'Considera usar el modo "Manual" (copiar prompt) como alternativa'
                ]
            };
        }

        // Error de modelo no encontrado
        if (errorMsg.includes('model_not_found') || errorMsg.includes('model not found')) {
            return {
                type: 'model',
                title: 'Modelo no disponible',
                message: `El modelo "${this.currentModel}" no está disponible`,
                suggestions: [
                    'El modelo podría haber sido deprecado o renombrado',
                    'Selecciona otro modelo en Ajustes',
                    'Consulta la documentación del proveedor para modelos disponibles'
                ]
            };
        }

        // Error genérico
        return {
            type: 'unknown',
            title: `Error en ${provider.name}`,
            message: errorMsg,
            suggestions: [
                'Verifica tu configuración en Ajustes',
                'Intenta con otro proveedor de IA',
                'Revisa la consola del navegador para más detalles'
            ]
        };
    },

    /**
     * Obtiene la URL del dashboard del proveedor
     */
    getProviderDashboard(providerId) {
        const dashboards = {
            'anthropic': 'https://console.anthropic.com',
            'openai': 'https://platform.openai.com/api-keys',
            'google': 'https://makersuite.google.com/app/apikey',
            'groq': 'https://console.groq.com/keys',
            'together': 'https://api.together.xyz/settings/api-keys',
            'huggingface': 'https://huggingface.co/settings/tokens'
        };
        return dashboards[providerId] || 'el dashboard del proveedor';
    },

    // ============================================
    // CONSTRUCCIÓN DE CONTEXTO
    // ============================================

    buildContext(chapterId = null) {
        const projectStore = Alpine.store('project');
        if (!projectStore) return null;

        const context = {
            project: {
                title: projectStore.projectInfo.title,
                author: projectStore.projectInfo.author,
                genre: projectStore.projectInfo.genre
            },
            characters: projectStore.characters.map(c => ({
                name: c.name,
                role: c.role,
                description: c.description,
                personality: c.personality,
                background: c.background
            })),
            locations: projectStore.locations.map(l => ({
                name: l.name,
                type: l.type,
                description: l.description
            })),
            scenes: projectStore.scenes.map(s => ({
                name: s.name,
                description: s.description,
                characters: s.characters || []
            })),
            lore: projectStore.loreEntries.map(l => ({
                title: l.title,
                content: l.content,
                category: l.category
            })),
            timeline: projectStore.timeline.map(t => ({
                title: t.title,
                date: t.date,
                description: t.description
            }))
        };

        // Si hay un capítulo específico, agregar contexto del capítulo
        if (chapterId) {
            const chapter = projectStore.getChapter(chapterId);
            if (chapter) {
                context.currentChapter = {
                    title: chapter.title,
                    number: chapter.number,
                    content: chapter.content,
                    wordCount: chapter.wordCount
                };

                // Capítulos anteriores (para continuidad)
                const previousChapters = projectStore.chapters
                    .filter(c => c.number < chapter.number)
                    .sort((a, b) => a.number - b.number)
                    .slice(-3) // Últimos 3 capítulos
                    .map(c => ({
                        number: c.number,
                        title: c.title,
                        summary: c.content.substring(0, 500) + '...' // Resumen
                    }));

                context.previousChapters = previousChapters;
            }
        }

        return context;
    },

    // ============================================
    // CONSTRUCCIÓN DE PROMPTS
    // ============================================

    buildPrompt(mode, userInput, context, selectedText = null) {
        const modeConfig = this.assistantModes[mode];
        if (!modeConfig) {
            throw new Error(`Modo no encontrado: ${mode}`);
        }

        let prompt = `# PROYECTO: ${context.project.title}\n`;
        prompt += `**Género**: ${context.project.genre || 'No especificado'}\n\n`;

        // Agregar personajes relevantes
        if (context.characters && context.characters.length > 0) {
            prompt += `## PERSONAJES PRINCIPALES\n`;
            context.characters.forEach(char => {
                if (char.role === 'protagonist' || char.role === 'antagonist') {
                    prompt += `\n### ${char.name} (${char.role})\n`;
                    if (char.description) prompt += `${char.description}\n`;
                    if (char.personality) prompt += `**Personalidad**: ${char.personality}\n`;
                }
            });
            prompt += '\n';
        }

        // Agregar lore relevante
        if (context.lore && context.lore.length > 0) {
            prompt += `## WORLDBUILDING\n`;
            context.lore.slice(0, 5).forEach(lore => {
                prompt += `- **${lore.title}**: ${lore.content.substring(0, 200)}...\n`;
            });
            prompt += '\n';
        }

        // Agregar capítulos previos (si existen)
        if (context.previousChapters && context.previousChapters.length > 0) {
            prompt += `## CAPÍTULOS ANTERIORES\n`;
            context.previousChapters.forEach(ch => {
                prompt += `\n**Capítulo ${ch.number}: ${ch.title}**\n${ch.summary}\n`;
            });
            prompt += '\n';
        }

        // Agregar capítulo actual
        if (context.currentChapter) {
            prompt += `## CAPÍTULO ACTUAL: ${context.currentChapter.title}\n`;
            prompt += `${context.currentChapter.content}\n\n`;
        }

        // Agregar texto seleccionado si existe
        if (selectedText) {
            prompt += `## TEXTO SELECCIONADO\n${selectedText}\n\n`;
        }

        // Agregar instrucción del usuario
        prompt += `---\n\n## INSTRUCCIÓN\n${userInput}\n\n`;

        // Agregar instrucción específica del modo
        prompt += `**Modo**: ${modeConfig.name}\n`;
        prompt += `**Tarea**: ${modeConfig.systemPrompt}\n`;

        return prompt;
    },

    // ============================================
    // ENVÍO DE REQUESTS
    // ============================================

    /**
     * Método agéntico conversacional: La IA decide qué contexto necesita (2 pasos)
     * Soporta historial de mensajes para conversaciones
     */
    async sendAgenticConversation(mode, messages, chapterId = null) {
        if (!window.agenticContextService) {
            throw new Error('Servicio agéntico no disponible');
        }

        return await window.agenticContextService.sendAgenticConversation(
            mode,
            messages,
            chapterId
        );
    },

    /**
     * Método agéntico: La IA decide qué contexto necesita (2 pasos)
     * PASO 1: IA analiza tarea y solicita contexto específico
     * PASO 2: Sistema envía solo el contexto solicitado
     */
    async sendAgenticRequest(mode, userInput, chapterId = null, selectedText = null) {
        if (!window.agenticContextService) {
            throw new Error('Servicio agéntico no disponible');
        }

        return await window.agenticContextService.sendAgenticRequest(
            mode,
            userInput,
            chapterId,
            selectedText
        );
    },

    /**
     * Método tradicional: Envía todo el contexto con optimización
     */
    async sendRequest(mode, userInput, chapterId = null, selectedText = null) {
        const startTime = performance.now();
        const provider = this.getCurrentProvider();

        // LOG: Inicio de request
        if (window.plumLogger) {
            window.plumLogger.aiRequest(mode, provider.name, userInput);
        }

        // Construir contexto completo
        const fullContext = this.buildContext(chapterId);

        // LOG: Contexto construido
        if (window.plumLogger) {
            const contextSize = (fullContext.characters?.length || 0) +
                               (fullContext.locations?.length || 0) +
                               (fullContext.lore?.length || 0) +
                               (fullContext.timeline?.length || 0);
            window.plumLogger.contextBuild(chapterId, contextSize);
            window.plumLogger.contextData('Personajes', fullContext.characters);
            window.plumLogger.contextData('Locaciones', fullContext.locations);
            window.plumLogger.contextData('Lore', fullContext.lore);
            window.plumLogger.contextData('Timeline', fullContext.timeline);
            window.plumLogger.groupEnd();
        }

        // OPTIMIZAR CONTEXTO con token-optimizer
        let context = fullContext;
        let optimizationStats = null;

        if (window.tokenOptimizer) {
            const currentText = selectedText || (fullContext.currentChapter?.content || '');
            const optimized = window.tokenOptimizer.optimizeContext(fullContext, currentText);
            context = optimized.context;
            optimizationStats = optimized.stats;

            // LOG: Optimización de tokens (los detalles los maneja token-optimizer.js)
        }

        // Construir prompt
        const prompt = this.buildPrompt(mode, userInput, context, selectedText);

        // LOG: Prompt construido
        if (window.plumLogger) {
            const estimatedTokens = Math.ceil(prompt.length / 4);
            window.plumLogger.promptBuilt(prompt.length, estimatedTokens);
            window.plumLogger.promptPreview(prompt);
        }

        // Si es modo manual, solo devolver el prompt
        if (provider.type === 'manual') {
            if (window.plumLogger) {
                window.plumLogger.success('MANUAL MODE', 'Prompt generado para copiar');
                window.plumLogger.groupEnd();
                window.plumLogger.groupEnd();
            }
            return {
                type: 'manual',
                prompt: prompt,
                instructions: 'Copia este prompt y pégalo en ChatGPT, Claude, o cualquier IA de tu elección.',
                stats: optimizationStats
            };
        }

        // Si requiere API key, verificar
        if (provider.requiresApiKey) {
            const apiKey = this.getApiKey(provider.id);
            if (!apiKey) {
                throw new Error(`API Key no configurada para ${provider.name}`);
            }
        }

        // Enviar según el tipo de proveedor
        let response;
        try {
            switch (provider.id) {
                case 'anthropic':
                    response = await this.sendAnthropicRequest(prompt);
                    break;
                case 'openai':
                    response = await this.sendOpenAIRequest(prompt);
                    break;
                case 'google':
                    response = await this.sendGoogleRequest(prompt);
                    break;
                case 'groq':
                    response = await this.sendGroqRequest(prompt);
                    break;
                case 'together':
                    response = await this.sendTogetherRequest(prompt);
                    break;
                case 'ollama':
                    response = await this.sendOllamaRequest(prompt);
                    break;
                case 'huggingface':
                    response = await this.sendHuggingFaceRequest(prompt);
                    break;
                default:
                    throw new Error(`Proveedor no soportado: ${provider.id}`);
            }

            // Agregar estadísticas de optimización a la respuesta
            if (optimizationStats) {
                response.optimizationStats = optimizationStats;
            }

            // LOG: Request completado
            if (window.plumLogger) {
                const totalTime = Math.round(performance.now() - startTime);
                window.plumLogger.aiComplete(totalTime, this.currentModel, response.usage?.total_tokens);
            }

            return response;

        } catch (error) {
            // LOG: Error en request
            if (window.plumLogger) {
                window.plumLogger.aiError(error);
            }
            throw error;
        }
    },

    // ============================================
    // IMPLEMENTACIÓN POR PROVEEDOR
    // ============================================

    async sendAnthropicRequest(prompt) {
        const apiKey = this.getApiKey('anthropic');
        const model = this.currentModel;

        // LOG: API Request
        if (window.plumLogger) {
            window.plumLogger.apiRequest('Anthropic', 'https://api.anthropic.com/v1/messages', model);
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
                const errorMessage = new Error(`${response.status}: ${error.error?.message || response.statusText}`);
                const detailedError = this.getErrorMessage(errorMessage, 'anthropic');
                const err = new Error(detailedError.title);
                err.detailedError = detailedError;
                throw err;
            }

            const data = await response.json();

            // LOG: API Response
            if (window.plumLogger) {
                window.plumLogger.apiResponse(true, {
                    contentLength: data.content[0].text.length,
                    usage: data.usage
                });
            }

            return {
                type: 'api',
                content: data.content[0].text,
                model: model,
                provider: 'anthropic',
                usage: data.usage
            };
        } catch (error) {
            if (error.detailedError) {
                throw error;
            }
            const detailedError = this.getErrorMessage(error, 'anthropic');
            const err = new Error(detailedError.title);
            err.detailedError = detailedError;
            throw err;
        }
    },

    async sendOpenAIRequest(prompt) {
        const apiKey = this.getApiKey('openai');
        const model = this.currentModel;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4096,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            type: 'api',
            content: data.choices[0].message.content,
            model: model,
            provider: 'openai'
        };
    },

    async sendGoogleRequest(prompt) {
        const apiKey = this.getApiKey('google');
        const model = this.currentModel;

        // LOG: API Request
        if (window.plumLogger) {
            window.plumLogger.apiRequest('Google Gemini', `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, model);
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
                const errorMessage = new Error(`${response.status}: ${error.error?.message || response.statusText}`);
                const detailedError = this.getErrorMessage(errorMessage, 'google');
                const err = new Error(detailedError.title);
                err.detailedError = detailedError;
                throw err;
            }

            const data = await response.json();

            // LOG: API Response
            if (window.plumLogger) {
                window.plumLogger.apiResponse(true, {
                    contentLength: data.candidates[0].content.parts[0].text.length,
                    usage: data.usageMetadata
                });
            }

            return {
                type: 'api',
                content: data.candidates[0].content.parts[0].text,
                model: model,
                provider: 'google',
                usage: data.usageMetadata
            };
        } catch (error) {
            if (error.detailedError) {
                throw error;
            }
            const detailedError = this.getErrorMessage(error, 'google');
            const err = new Error(detailedError.title);
            err.detailedError = detailedError;
            throw err;
        }
    },

    async sendGroqRequest(prompt) {
        const apiKey = this.getApiKey('groq');
        const model = this.currentModel;

        // LOG: API Request
        if (window.plumLogger) {
            window.plumLogger.apiRequest('Groq', 'https://api.groq.com/openai/v1/chat/completions', model);
        }

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 4096,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
                const errorMessage = new Error(`${response.status}: ${error.error?.message || response.statusText}`);
                const detailedError = this.getErrorMessage(errorMessage, 'groq');
                const err = new Error(detailedError.title);
                err.detailedError = detailedError;
                throw err;
            }

            const data = await response.json();

            // LOG: API Response
            if (window.plumLogger) {
                window.plumLogger.apiResponse(true, {
                    contentLength: data.choices[0].message.content.length,
                    usage: data.usage
                });
            }

            return {
                type: 'api',
                content: data.choices[0].message.content,
                model: model,
                provider: 'groq',
                usage: data.usage
            };
        } catch (error) {
            // Si ya tiene detailedError, re-lanzarlo
            if (error.detailedError) {
                throw error;
            }
            // Si no, crear uno nuevo
            const detailedError = this.getErrorMessage(error, 'groq');
            const err = new Error(detailedError.title);
            err.detailedError = detailedError;
            throw err;
        }
    },

    async sendTogetherRequest(prompt) {
        const apiKey = this.getApiKey('together');
        const model = this.currentModel;

        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4096,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Together API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            type: 'api',
            content: data.choices[0].message.content,
            model: model,
            provider: 'together'
        };
    },

    async sendOllamaRequest(prompt) {
        const model = this.currentModel;

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Connection failed' }));
                const errorMessage = new Error(`Failed to fetch`);
                const detailedError = this.getErrorMessage(errorMessage, 'ollama');
                const err = new Error(detailedError.title);
                err.detailedError = detailedError;
                throw err;
            }

            const data = await response.json();
            return {
                type: 'local',
                content: data.message.content,
                model: model,
                provider: 'ollama'
            };
        } catch (error) {
            if (error.detailedError) {
                throw error;
            }
            const detailedError = this.getErrorMessage(error, 'ollama');
            const err = new Error(detailedError.title);
            err.detailedError = detailedError;
            throw err;
        }
    },

    async sendHuggingFaceRequest(prompt) {
        const apiKey = this.getApiKey('huggingface');
        const model = this.currentModel;

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 2048,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`HuggingFace API Error: ${error.error || response.statusText}`);
        }

        const data = await response.json();
        return {
            type: 'api',
            content: data[0].generated_text || data.generated_text,
            model: model,
            provider: 'huggingface'
        };
    },

    // ============================================
    // GESTIÓN DE API KEYS
    // ============================================

    /**
     * Obtener API key para un proveedor
     * Retorna el objeto de key completo { id, name, key, isDefault, lastUsed }
     * o solo el string de la key si es formato legacy
     */
    getApiKey(providerId, keyId = null) {
        const projectStore = Alpine.store('project');
        if (!projectStore || !projectStore.apiKeys) return null;

        // Mapeo de IDs a nombres en el store
        const keyMap = {
            'anthropic': 'claude',
            'openai': 'openai',
            'google': 'google',
            'groq': 'groq',
            'together': 'together',
            'huggingface': 'huggingface'
        };

        const keyName = keyMap[providerId] || providerId;

        // Verificar si es nuevo formato (con text/image)
        if (projectStore.apiKeys.text && projectStore.apiKeys.text[keyName]) {
            // Si se solicita una key específica
            if (keyId) {
                const key = projectStore.apiKeys.text[keyName].find(k => k.id === keyId);
                return key ? key.key : null;
            }

            // Obtener la key por defecto
            const defaultKey = projectStore.getDefaultApiKey('text', keyName);
            return defaultKey ? defaultKey.key : null;
        }

        // Formato legacy (compatibilidad hacia atrás)
        return projectStore.apiKeys[keyName] || null;
    },

    /**
     * Obtener el objeto completo de API key (no solo el string)
     */
    getApiKeyObject(providerId, keyId = null) {
        const projectStore = Alpine.store('project');
        if (!projectStore || !projectStore.apiKeys) return null;

        const keyMap = {
            'anthropic': 'claude',
            'openai': 'openai',
            'google': 'google',
            'groq': 'groq',
            'together': 'together',
            'huggingface': 'huggingface'
        };

        const keyName = keyMap[providerId] || providerId;

        // Solo funciona con nuevo formato
        if (projectStore.apiKeys.text && projectStore.apiKeys.text[keyName]) {
            if (keyId) {
                return projectStore.apiKeys.text[keyName].find(k => k.id === keyId);
            }
            return projectStore.getDefaultApiKey('text', keyName);
        }

        return null;
    },

    /**
     * Intentar request con fallback automático a siguiente key
     * Si una key falla, intenta con la siguiente disponible
     */
    async sendRequestWithFallback(providerId, requestFn) {
        const projectStore = Alpine.store('project');
        if (!projectStore) {
            throw new Error('Project store no disponible');
        }

        const keyMap = {
            'anthropic': 'claude',
            'openai': 'openai',
            'google': 'google',
            'groq': 'groq',
            'together': 'together',
            'huggingface': 'huggingface'
        };

        const keyName = keyMap[providerId] || providerId;

        // Obtener todas las keys disponibles
        const keys = projectStore.getApiKeys('text', keyName);
        if (keys.length === 0) {
            throw new Error(`No hay API keys configuradas para ${providerId}`);
        }

        // Intentar con cada key hasta que una funcione
        let lastError = null;
        for (let i = 0; i < keys.length; i++) {
            const keyObj = keys[i];
            try {
                console.log(`🔑 Intentando con key: ${keyObj.name} (${i + 1}/${keys.length})`);

                // Ejecutar la función de request con esta key
                const result = await requestFn(keyObj.key);

                // Si tuvo éxito, marcar como usada
                projectStore.markApiKeyAsUsed('text', keyName, keyObj.id);

                console.log(`✅ Request exitoso con key: ${keyObj.name}`);
                return result;

            } catch (error) {
                console.warn(`❌ Falló key ${keyObj.name}:`, error.message);
                lastError = error;

                // Si no es el último intento, continuar con la siguiente key
                if (i < keys.length - 1) {
                    console.log(`↻ Intentando con siguiente key...`);
                    continue;
                }
            }
        }

        // Si llegamos aquí, todas las keys fallaron
        throw new Error(`Todas las API keys fallaron. Último error: ${lastError?.message || 'Desconocido'}`);
    },

    // ============================================
    // UTILIDADES
    // ============================================

    async testConnection(providerId = null) {
        const testProvider = providerId || this.currentProvider;
        const provider = this.providers[testProvider];

        if (!provider) {
            throw new Error(`Proveedor no encontrado: ${testProvider}`);
        }

        if (provider.type === 'manual') {
            return {
                success: true,
                message: 'Modo manual - no requiere conexión'
            };
        }

        if (provider.requiresApiKey && !this.getApiKey(testProvider)) {
            return {
                success: false,
                message: 'API Key no configurada'
            };
        }

        try {
            // Hacer un request de prueba simple
            const originalProvider = this.currentProvider;
            this.currentProvider = testProvider;

            const result = await this.sendRequest('continue', 'Test de conexión', null, null);

            this.currentProvider = originalProvider;

            return {
                success: true,
                message: 'Conexión exitosa',
                result: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },

    getProvidersStatus() {
        return Object.values(this.providers).map(provider => {
            const hasKey = provider.requiresApiKey ? !!this.getApiKey(provider.id) : true;

            return {
                id: provider.id,
                name: provider.name,
                type: provider.type,
                freeTier: provider.freeTier,
                pricing: provider.pricing,
                hasApiKey: hasKey,
                available: !provider.requiresApiKey || hasKey,
                models: provider.models
            };
        });
    },

    // ============================================
    // GENERACIÓN DE IMÁGENES CON IA
    // ============================================

    /**
     * Obtener API key para proveedores de imágenes
     */
    getImageApiKey(providerId, keyId = null) {
        const projectStore = Alpine.store('project');
        if (!projectStore || !projectStore.apiKeys) return null;

        // Mapeo de IDs a nombres en el store para imágenes
        const keyMap = {
            'googleImagen': 'googleImagen',
            'dalle': 'dalle',
            'stabilityai': 'stabilityai',
            'replicateImage': 'replicate',
            'leonardo': 'leonardo'
        };

        const keyName = keyMap[providerId] || providerId;

        // Verificar si es nuevo formato (con text/image)
        if (projectStore.apiKeys.image && projectStore.apiKeys.image[keyName]) {
            // Si se solicita una key específica
            if (keyId) {
                const key = projectStore.apiKeys.image[keyName].find(k => k.id === keyId);
                return key ? key.key : null;
            }

            // Obtener la key por defecto
            const defaultKey = projectStore.getDefaultApiKey('image', keyName);
            return defaultKey ? defaultKey.key : null;
        }

        return null;
    },

    /**
     * Obtener proveedores de imágenes disponibles (con API key configurada)
     */
    getAvailableImageProviders() {
        return Object.values(this.imageProviders).filter(provider => {
            if (provider.type === 'manual') return false; // Excluir Midjourney
            if (provider.requiresApiKey) {
                return !!this.getImageApiKey(provider.id);
            }
            return true;
        });
    },

    /**
     * Método principal de generación de imágenes
     * @param {string} prompt - Descripción de la imagen a generar
     * @param {string} providerId - ID del proveedor (dalle, stabilityai, etc)
     * @param {Object} options - Opciones adicionales (size, quality, style, etc)
     */
    async generateImage(prompt, providerId = null, options = {}) {
        // Si no se especifica proveedor, usar el primero disponible
        const provider = providerId
            ? this.imageProviders[providerId]
            : this.getAvailableImageProviders()[0];

        if (!provider) {
            throw new Error('No hay proveedores de imágenes configurados. Configura una API key en Ajustes.');
        }

        // Verificar API key
        if (provider.requiresApiKey) {
            const apiKey = this.getImageApiKey(provider.id);
            if (!apiKey) {
                throw new Error(`API Key no configurada para ${provider.name}`);
            }
        }

        // LOG
        if (window.plumLogger) {
            console.log(`🎨 Generando imagen con ${provider.name}`);
            console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
        }

        // Llamar al método específico del proveedor
        try {
            let result;
            switch (provider.id) {
                case 'dalle':
                    result = await this.generateDALLEImage(prompt, options);
                    break;
                case 'stabilityai':
                    result = await this.generateStabilityAIImage(prompt, options);
                    break;
                case 'replicateImage':
                    result = await this.generateReplicateImage(prompt, options);
                    break;
                case 'leonardo':
                    result = await this.generateLeonardoImage(prompt, options);
                    break;
                case 'googleImagen':
                    result = await this.generateGoogleImage(prompt, options);
                    break;
                default:
                    throw new Error(`Proveedor de imágenes no soportado: ${provider.id}`);
            }

            if (window.plumLogger) {
                console.log(`✅ Imagen generada exitosamente`);
            }

            return result;
        } catch (error) {
            if (window.plumLogger) {
                console.error(`❌ Error generando imagen:`, error);
            }
            throw error;
        }
    },

    /**
     * Generar imagen con DALL-E (OpenAI)
     */
    async generateDALLEImage(prompt, options = {}) {
        const apiKey = this.getImageApiKey('dalle');
        const model = options.model || 'dall-e-3';
        const size = options.size || '1024x1024';
        const quality = options.quality || 'standard'; // 'standard' o 'hd'
        const style = options.style || 'vivid'; // 'vivid' o 'natural'

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                n: 1,
                size: size,
                quality: quality,
                style: style
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(`DALL-E Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            provider: 'dalle',
            model: model,
            url: data.data[0].url,
            revisedPrompt: data.data[0].revised_prompt || prompt
        };
    },

    /**
     * Generar imagen con Stability AI (Stable Diffusion)
     */
    async generateStabilityAIImage(prompt, options = {}) {
        const apiKey = this.getImageApiKey('stabilityai');
        const engineId = options.model || 'stable-diffusion-xl-1024-v1-0';
        const width = options.width || 1024;
        const height = options.height || 1024;
        const steps = options.steps || 30;
        const cfgScale = options.cfgScale || 7;

        const response = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                text_prompts: [
                    {
                        text: prompt,
                        weight: 1
                    }
                ],
                cfg_scale: cfgScale,
                height: height,
                width: width,
                steps: steps,
                samples: 1
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Stability AI Error: ${error.message || response.statusText}`);
        }

        const data = await response.json();

        // Convertir base64 a data URL
        const base64Image = data.artifacts[0].base64;
        const dataUrl = `data:image/png;base64,${base64Image}`;

        return {
            provider: 'stabilityai',
            model: engineId,
            url: dataUrl,
            base64: base64Image
        };
    },

    /**
     * Generar imagen con Replicate
     */
    async generateReplicateImage(prompt, options = {}) {
        const apiKey = this.getImageApiKey('replicateImage');
        const model = options.model || 'black-forest-labs/flux-1.1-pro';

        // Paso 1: Crear predicción
        const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${apiKey}`
            },
            body: JSON.stringify({
                version: model,
                input: {
                    prompt: prompt,
                    width: options.width || 1024,
                    height: options.height || 1024,
                    num_outputs: 1
                }
            })
        });

        if (!createResponse.ok) {
            const error = await createResponse.json().catch(() => ({ detail: createResponse.statusText }));
            throw new Error(`Replicate Error: ${error.detail || createResponse.statusText}`);
        }

        const prediction = await createResponse.json();

        // Paso 2: Poll hasta que la imagen esté lista
        let result = prediction;
        while (result.status === 'starting' || result.status === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: {
                    'Authorization': `Token ${apiKey}`
                }
            });

            if (!statusResponse.ok) {
                throw new Error('Error checking prediction status');
            }

            result = await statusResponse.json();
        }

        if (result.status === 'failed') {
            throw new Error(`Image generation failed: ${result.error}`);
        }

        return {
            provider: 'replicate',
            model: model,
            url: result.output[0],
            predictionId: prediction.id
        };
    },

    /**
     * Generar imagen con Leonardo AI
     */
    async generateLeonardoImage(prompt, options = {}) {
        const apiKey = this.getImageApiKey('leonardo');
        const modelId = options.modelId || 'b24e16ff-06e3-43eb-8d33-4416c2d75876'; // Phoenix 1.0

        // Paso 1: Crear generación
        const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                modelId: modelId,
                width: options.width || 1024,
                height: options.height || 1024,
                num_images: 1
            })
        });

        if (!createResponse.ok) {
            const error = await createResponse.json().catch(() => ({ error: createResponse.statusText }));
            throw new Error(`Leonardo AI Error: ${error.error || createResponse.statusText}`);
        }

        const generation = await createResponse.json();
        const generationId = generation.sdGenerationJob.generationId;

        // Paso 2: Poll hasta que la imagen esté lista
        let imageUrl = null;
        for (let i = 0; i < 30; i++) { // Max 30 intentos (30 segundos)
            await new Promise(resolve => setTimeout(resolve, 1000));

            const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (!statusResponse.ok) {
                throw new Error('Error checking generation status');
            }

            const result = await statusResponse.json();

            if (result.generations_by_pk.status === 'COMPLETE') {
                imageUrl = result.generations_by_pk.generated_images[0].url;
                break;
            } else if (result.generations_by_pk.status === 'FAILED') {
                throw new Error('Image generation failed');
            }
        }

        if (!imageUrl) {
            throw new Error('Image generation timed out');
        }

        return {
            provider: 'leonardo',
            model: modelId,
            url: imageUrl,
            generationId: generationId
        };
    },

    /**
     * Generar imagen con Google Imagen (Vertex AI)
     */
    async generateGoogleImage(prompt, options = {}) {
        const apiKey = this.getImageApiKey('googleImagen');
        const projectId = options.projectId || 'your-project-id'; // Usuario debe configurar esto
        const model = options.model || 'imagegeneration@006';

        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                instances: [
                    {
                        prompt: prompt
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: options.aspectRatio || '1:1'
                }
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(`Google Imagen Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();

        // Google devuelve la imagen en base64
        const base64Image = data.predictions[0].bytesBase64Encoded;
        const dataUrl = `data:image/png;base64,${base64Image}`;

        return {
            provider: 'googleImagen',
            model: model,
            url: dataUrl,
            base64: base64Image
        };
    },

    /**
     * Construir prompt optimizado para generación de imágenes
     * basado en el contexto del personaje, lugar, o escena
     */
    buildImagePrompt(type, data) {
        let prompt = '';

        switch (type) {
            case 'character':
                prompt = `A detailed character portrait of ${data.name}`;
                if (data.description) {
                    const cleanDesc = data.description.replace(/<[^>]*>/g, '').substring(0, 200);
                    prompt += `, ${cleanDesc}`;
                }
                if (data.personality) {
                    const cleanPersonality = data.personality.replace(/<[^>]*>/g, '').substring(0, 100);
                    prompt += `. Personality: ${cleanPersonality}`;
                }
                prompt += '. High quality, detailed artwork, professional illustration';
                break;

            case 'location':
                prompt = `A detailed, atmospheric illustration of ${data.name}`;
                if (data.type) {
                    prompt += `, a ${data.type}`;
                }
                if (data.description) {
                    const cleanDesc = data.description.replace(/<[^>]*>/g, '').substring(0, 200);
                    prompt += `. ${cleanDesc}`;
                }
                if (data.significance) {
                    const cleanSig = data.significance.replace(/<[^>]*>/g, '').substring(0, 100);
                    prompt += `. ${cleanSig}`;
                }
                prompt += '. High quality, detailed artwork, atmospheric lighting, professional illustration';
                break;

            case 'scene':
                prompt = `An atmospheric scene illustration`;
                if (data.name) {
                    prompt += ` of ${data.name}`;
                }
                if (data.description) {
                    const cleanDesc = data.description.replace(/<[^>]*>/g, '').substring(0, 200);
                    prompt += `. ${cleanDesc}`;
                }
                prompt += '. Cinematic composition, high quality, detailed artwork';
                break;

            case 'chapter':
                prompt = `A chapter illustration`;
                if (data.title) {
                    prompt += ` for "${data.title}"`;
                }
                if (data.summary) {
                    const cleanSummary = data.summary.replace(/<[^>]*>/g, '').substring(0, 200);
                    prompt += `. ${cleanSummary}`;
                }
                prompt += '. Artistic, evocative, high quality illustration';
                break;

            default:
                prompt = data.prompt || 'A high quality illustration';
        }

        return prompt;
    }
};

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.aiService.init();
}
