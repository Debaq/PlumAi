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
            models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
            defaultModel: 'gemini-1.5-flash',
            requiresApiKey: true,
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
            freeTier: '15 req/min gratis',
            pricing: 'Free tier generoso',
            type: 'api',
            enabled: false
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

    async sendRequest(mode, userInput, chapterId = null, selectedText = null) {
        const provider = this.getCurrentProvider();

        // Construir contexto
        const context = this.buildContext(chapterId);

        // Construir prompt
        const prompt = this.buildPrompt(mode, userInput, context, selectedText);

        // Si es modo manual, solo devolver el prompt
        if (provider.type === 'manual') {
            return {
                type: 'manual',
                prompt: prompt,
                instructions: 'Copia este prompt y pégalo en ChatGPT, Claude, o cualquier IA de tu elección.'
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
        switch (provider.id) {
            case 'anthropic':
                return await this.sendAnthropicRequest(prompt);
            case 'openai':
                return await this.sendOpenAIRequest(prompt);
            case 'google':
                return await this.sendGoogleRequest(prompt);
            case 'groq':
                return await this.sendGroqRequest(prompt);
            case 'together':
                return await this.sendTogetherRequest(prompt);
            case 'ollama':
                return await this.sendOllamaRequest(prompt);
            case 'huggingface':
                return await this.sendHuggingFaceRequest(prompt);
            default:
                throw new Error(`Proveedor no soportado: ${provider.id}`);
        }
    },

    // ============================================
    // IMPLEMENTACIÓN POR PROVEEDOR
    // ============================================

    async sendAnthropicRequest(prompt) {
        const apiKey = this.getApiKey('anthropic');
        const model = this.currentModel;

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
            const error = await response.json();
            throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            type: 'api',
            content: data.content[0].text,
            model: model,
            provider: 'anthropic'
        };
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
            const error = await response.json();
            throw new Error(`Google API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            type: 'api',
            content: data.candidates[0].content.parts[0].text,
            model: model,
            provider: 'google'
        };
    },

    async sendGroqRequest(prompt) {
        const apiKey = this.getApiKey('groq');
        const model = this.currentModel;

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
            const error = await response.json();
            throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            type: 'api',
            content: data.choices[0].message.content,
            model: model,
            provider: 'groq'
        };
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
                throw new Error(`Ollama no está disponible. ¿Está corriendo? Instala desde https://ollama.ai`);
            }

            const data = await response.json();
            return {
                type: 'local',
                content: data.message.content,
                model: model,
                provider: 'ollama'
            };
        } catch (error) {
            throw new Error(`Ollama Error: ${error.message}. Asegúrate de que Ollama esté corriendo (ollama serve)`);
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

    getApiKey(providerId) {
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
        return projectStore.apiKeys[keyName] || null;
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
    }
};

// Inicializar al cargar
if (typeof window !== 'undefined') {
    window.aiService.init();
}
