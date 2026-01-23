/**
 * AI Conversations Service
 * Maneja conversaciones completas con IA, incluyendo:
 * - Generación de nombres de conversación
 * - Flujo iterativo (la IA puede pedir más contexto)
 * - Registro completo de interacciones
 * - Guardado y recuperación de conversaciones
 */

window.aiConversationsService = {
    /**
     * Crear una nueva conversación de IA
     * @param {Object} params
     * @param {string} params.mode - Modo de IA (continue, improve, analyze, etc.)
     * @param {string} params.userPrompt - Prompt inicial del usuario
     * @param {string} params.chapterId - ID del capítulo donde se inició
     * @param {string} params.selectedText - Texto seleccionado (si hay)
     * @returns {Object} Nueva conversación
     */
    async createConversation({ mode, userPrompt, chapterId, selectedText = null }) {
        const conversationId = window.uuid.generateUUID();
        const timestamp = new Date().toISOString();

        // Construir contexto inicial
        const context = this.buildInitialContext(chapterId, selectedText);

        // Construir el prompt completo que se enviará
        const fullPrompt = this.buildFullPrompt(mode, userPrompt, context, selectedText);

        const conversation = {
            id: conversationId,
            name: null, // Se generará con IA
            mode: mode,
            chapterId: chapterId,
            selectedText: selectedText,
            createdAt: timestamp,
            updatedAt: timestamp,
            status: 'active', // 'active' | 'completed' | 'archived'

            // Metadata sobre uso
            metadata: {
                chapterTitle: context.currentChapter?.title || 'Sin título',
                chapterNumber: context.currentChapter?.number || 0,
                hadSelection: !!selectedText,
                selectionLength: selectedText?.length || 0,
                wasUsed: false, // Si se insertó el contenido en el editor
                usedAt: null,
                usedLocation: null // 'end' | 'cursor' | null
            },

            // Mensajes de la conversación
            messages: [
                {
                    id: window.uuid.generateUUID(),
                    role: 'system',
                    type: 'prompt-preview',
                    content: fullPrompt,
                    timestamp: timestamp,
                    context: {
                        mode: mode,
                        userPrompt: userPrompt,
                        hasContext: true
                    }
                }
            ],

            // Contexto completo (para referencia futura)
            initialContext: context,
            fullPrompt: fullPrompt
        };

        return conversation;
    },

    /**
     * Construir contexto inicial desde el proyecto
     */
    buildInitialContext(chapterId, selectedText) {
        if (!window.aiService || !window.aiService.buildContext) {
            return {};
        }

        return window.aiService.buildContext(chapterId);
    },

    /**
     * Construir el prompt completo que se enviará
     */
    buildFullPrompt(mode, userPrompt, context, selectedText) {
        if (!window.aiService || !window.aiService.buildPrompt) {
            return userPrompt;
        }

        return window.aiService.buildPrompt(mode, userPrompt, context, selectedText);
    },

    /**
     * Agregar mensaje del usuario a la conversación
     */
    addUserMessage(conversation, content, type = 'text') {
        const message = {
            id: window.uuid.generateUUID(),
            role: 'user',
            type: type, // 'text' | 'context' | 'confirmation'
            content: content,
            timestamp: new Date().toISOString()
        };

        conversation.messages.push(message);
        conversation.updatedAt = message.timestamp;

        return conversation;
    },

    /**
     * Agregar respuesta de la IA a la conversación
     */
    addAIMessage(conversation, response, requestsMoreContext = false) {
        const message = {
            id: window.uuid.generateUUID(),
            role: 'assistant',
            type: requestsMoreContext ? 'request-context' : 'response',
            content: response.content || response.prompt,
            timestamp: new Date().toISOString(),
            metadata: {
                model: response.model,
                provider: response.provider,
                type: response.type,
                usage: response.usage,
                requestsMoreContext: requestsMoreContext
            }
        };

        conversation.messages.push(message);
        conversation.updatedAt = message.timestamp;

        return conversation;
    },

    /**
     * Generar nombre para la conversación usando IA
     */
    async generateConversationName(conversation) {
        try {
            // Obtener el primer mensaje del usuario
            const userMessage = conversation.messages.find(m => m.role === 'user' && m.type === 'text');
            if (!userMessage) {
                return this.getDefaultConversationName(conversation);
            }

            // Pedir a la IA que genere un nombre corto y descriptivo
            const namePrompt = `Basándote en esta solicitud del usuario, genera un nombre corto (máximo 4-5 palabras) y descriptivo para esta conversación. Solo responde con el nombre, sin comillas ni explicaciones adicionales.

Solicitud: ${userMessage.content}

Nombre:`;

            const response = await window.aiService.sendRequest(
                'continue',
                namePrompt,
                null,
                null
            );

            const generatedName = (response.content || response.prompt)
                .trim()
                .replace(/^["']|["']$/g, '') // Remover comillas si las agregó
                .substring(0, 60); // Limitar longitud

            conversation.name = generatedName;
            return generatedName;

        } catch (error) {
            console.error('Error generando nombre de conversación:', error);
            return this.getDefaultConversationName(conversation);
        }
    },

    /**
     * Obtener nombre por defecto basado en modo y timestamp
     */
    getDefaultConversationName(conversation) {
        const modeNames = {
            'continue': 'Continuar escritura',
            'improve': 'Sugerencias de mejora',
            'analyze': 'Análisis de texto',
            'dialogue': 'Mejorar diálogos',
            'suggest': 'Ideas y sugerencias'
        };

        const modeName = modeNames[conversation.mode] || 'Conversación IA';
        const date = new Date(conversation.createdAt);
        const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return `${modeName} - ${timeStr}`;
    },

    /**
     * Marcar conversación como usada (cuando se inserta el contenido)
     */
    markAsUsed(conversation, location = 'cursor') {
        conversation.metadata.wasUsed = true;
        conversation.metadata.usedAt = new Date().toISOString();
        conversation.metadata.usedLocation = location;
        conversation.updatedAt = conversation.metadata.usedAt;

        return conversation;
    },

    /**
     * Completar conversación (cuando el usuario está satisfecho)
     */
    completeConversation(conversation) {
        conversation.status = 'completed';
        conversation.updatedAt = new Date().toISOString();

        return conversation;
    },

    /**
     * Archivar conversación
     */
    archiveConversation(conversation) {
        conversation.status = 'archived';
        conversation.updatedAt = new Date().toISOString();

        return conversation;
    },

    /**
     * Obtener resumen de la conversación para mostrar en lista
     */
    getConversationSummary(conversation) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const preview = lastMessage.content.substring(0, 100) + '...';

        return {
            id: conversation.id,
            name: conversation.name,
            mode: conversation.mode,
            preview: preview,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            status: conversation.status,
            messageCount: conversation.messages.length,
            wasUsed: conversation.metadata.wasUsed,
            chapterTitle: conversation.metadata.chapterTitle
        };
    },

    /**
     * Formatear conversación para export/guardado
     */
    formatForExport(conversation) {
        return {
            ...conversation,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    },

    /**
     * Verificar si la IA está solicitando más contexto
     * (análisis simple de la respuesta)
     */
    isRequestingMoreContext(aiResponse) {
        const content = (aiResponse.content || aiResponse.prompt || '').toLowerCase();

        const indicators = [
            'necesito más información',
            'podrías proporcionarme',
            'me falta contexto',
            'necesito saber',
            'podrías decirme',
            '¿podrías',
            '¿puedes proporcionar',
            'para ayudarte mejor',
            'necesitaría saber'
        ];

        return indicators.some(indicator => content.includes(indicator));
    }
};

// Log de inicialización
console.log('✅ AI Conversations Service cargado');
