// Traducciones del Asistente IA - Español
export default {
    title: 'Asistente IA',
    subtitle: 'Trabaja con inteligencia artificial',
    status: {
        active: 'IA Activa',
        inactive: 'IA Inactiva',
        processing: 'Procesando...'
    },
    modes: {
        write: 'IA Escribe',
        assist: 'IA Asiste'
    },
    assistantModes: {
        continue: 'Continuar escribiendo',
        suggest: 'Sugerir ideas',
        analyze: 'Analizar texto',
        improve: 'Mejorar pasaje',
        dialogue: 'Generar diálogo',
        worldbuild: 'Expandir worldbuilding',
        characterize: 'Desarrollar personaje'
    },
    systemPrompts: {
        continue: 'Eres un asistente de escritura creativa. Tu tarea es continuar la historia de manera coherente y creativa, manteniendo el estilo, tono y voz establecidos.',
        suggest: 'Eres un asistente creativo que genera ideas y sugerencias para desarrollar la historia. Proporciona opciones variadas y creativas.',
        analyze: 'Eres un editor literario. Analiza el texto en busca de inconsistencias, problemas de ritmo, caracterización, y oportunidades de mejora.',
        improve: 'Eres un editor literario experto. Reescribe el pasaje seleccionado mejorando la prosa, el ritmo, y la claridad sin cambiar la intención original.',
        dialogue: 'Eres un especialista en diálogos. Genera diálogos naturales y característicos para los personajes, respetando su personalidad y trasfondo.',
        worldbuild: 'Eres un experto en worldbuilding. Ayuda a expandir y profundizar el mundo de la historia, creando detalles coherentes y ricos.',
        characterize: 'Eres un experto en caracterización. Ayuda a desarrollar personajes tridimensionales con motivaciones, conflictos y arcos coherentes.'
    },
    prompt: {
        label: 'Instrucción para la IA',
        placeholder: 'Escribe qué quieres que haga la IA...',
        examples: {
            write: 'Ejemplo: Escribe un capítulo donde {character} descubre un secreto',
            assist: 'Ejemplo: Sugiere mejoras para este párrafo'
        }
    },
    actions: {
        generate: 'Generar',
        apply: 'Aplicar Cambios',
        reject: 'Rechazar',
        retry: 'Reintentar'
    },
    history: {
        title: 'Historial',
        empty: 'No hay interacciones aún',
        user: 'Tú',
        assistant: 'IA'
    },
    settings: {
        title: 'Configuración de IA',
        apiKeys: 'Claves API',
        model: 'Modelo',
        temperature: 'Temperatura',
        maxTokens: 'Tokens Máximos',
        noApiKey: 'No hay clave API configurada',
        configure: 'Configurar'
    },
    noProvidersConfigured: 'No hay proveedores con API key configurada. Ve a Configuración IA para agregar una.',
    projectContext: 'Contexto del Proyecto',
    project: 'Proyecto:',
    characters: 'Personajes:',
    chapters: 'Capítulos:',
    inputPlaceholder: 'Escribe tu consulta aquí... (Ej: \'Continúa el capítulo actual\', \'Dame ideas para la próxima escena\', \'Analiza este diálogo\')',
    configRequired: 'Configuración requerida: Por favor configura una API key en Ajustes → Configuración IA para poder usar el asistente.',
    confirmClearChat: '¿Estás seguro de que quieres limpiar el chat? Esta acción no se puede deshacer.',
    openChapterFirst: '⚠️ Por favor abre un capítulo primero',
    textInserted: '✅ Texto insertado en el capítulo actual',
    serviceUnavailable: '❌ El servicio de IA no está disponible'
};
