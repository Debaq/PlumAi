// Traducciones de Modales - Español

export default {
    welcome: {
        title: '¡Bienvenido a PlumaAI!',
        subtitle: 'Editor de novelas con inteligencia artificial',
        description: 'Comienza creando un nuevo proyecto o carga uno existente',
        selectLanguage: 'Selecciona tu idioma:',
        newProject: 'Crear Nuevo Proyecto',
        loadProject: 'Cargar Proyecto Existente',
        continueProject: 'Continuar con "{projectName}"',
        justLook: 'Solo Mirar',
        getStarted: 'Comenzar'
    },
    newProject: {
        title: 'Nuevo Proyecto',
        form: {
            title: 'Título de la Novela',
            titlePlaceholder: 'Ej: El Misterio del Faro',
            author: 'Autor',
            authorPlaceholder: 'Tu nombre',
            genre: 'Género',
            genrePlaceholder: 'Ej: Misterio, Fantasía, Romance',
            isPublicPC: 'Estoy usando un PC público',
            publicPCWarning: 'No se guardarán datos automáticamente'
        }
    },
    projectSettings: {
        title: 'Configuración del Proyecto',
        tabs: {
            general: 'General',
            api: 'APIs de IA',
            preferences: 'Preferencias'
        }
    },
    apiKeys: {
        title: 'Configurar APIs de IA',
        description: 'Configura las claves de API para usar la IA',
        providers: {
            claude: 'Claude (Anthropic)',
            openai: 'OpenAI (ChatGPT)',
            google: 'Google Gemini',
            groq: 'Groq (Ultra rápido)',
            together: 'Together AI',
            replicate: 'Replicate',
            huggingface: 'HuggingFace',
            ollama: 'Ollama (Local)',
            manual: 'Copiar Prompt (Manual)',
            kimi: 'Kimi (Moonshot)',
            qwen: 'Qwen (Alibaba)'
        },
        providerInfo: {
            claude: 'API de Anthropic - $5 gratis',
            openai: 'API de OpenAI - Solo pago',
            google: 'API de Google - Free tier generoso',
            groq: 'FREE tier generoso - Ultra rápido',
            together: 'Free tier $25 al inicio',
            replicate: 'Modelos variados - Pago por uso',
            huggingface: 'Algunos modelos gratis',
            ollama: '100% GRATIS - Requiere instalación local',
            manual: '100% GRATIS - Copia el prompt a cualquier IA'
        },
        form: {
            key: 'Clave API',
            keyPlaceholder: 'Ingresa tu clave API',
            test: 'Probar conexión',
            status: {
                valid: 'Válida',
                invalid: 'Inválida',
                testing: 'Probando...'
            }
        },
        warning: 'Las claves se guardan en tu dispositivo y no se envían a ningún servidor',
        publicPCWarning: 'Atención: Estás en un PC público. Las claves no se guardarán automáticamente'
    },
    export: {
        title: 'Exportar Proyecto',
        description: 'Descarga tu proyecto como archivo PLUMA (*.pluma)',
        includeApiKeys: 'Incluir claves API',
        filename: 'Nombre del archivo',
        download: 'Descargar',
        formatWithImages: 'Formato: PLUMA con imágenes',
        securityRequired: 'Seguridad (Obligatoria)',
        securityOptional: 'Seguridad (Opcional)',
        apiKeysWarning: 'Este proyecto contiene API keys. Por seguridad, es obligatorio encriptarlas. Si olvidas la contraseña solo perderás las claves, no el proyecto.',
        encryptApiKeysRequired: 'Encriptar API keys (obligatorio)',
        apiKeysAutoEncrypt: 'Las API keys detectadas serán encriptadas automáticamente',
        encryptAll: 'Encriptar proyecto completo',
        encryptAllHint: 'Máxima privacidad - encripta todo el contenido (incluye las API keys)',
        password: 'Contraseña de encriptación',
        passwordPlaceholder: 'Mínimo 12 caracteres',
        passwordHint: 'Usa una contraseña fuerte. Si la olvidas, no podrás recuperar los datos.',
        confirmPassword: 'Confirmar contraseña',
        confirmPasswordPlaceholder: 'Repite la contraseña',
        success: 'Proyecto exportado',
        successDetails: 'Archivo descargado correctamente',
        errors: {
            passwordRequired: 'Debes ingresar una contraseña',
            passwordTooShort: 'La contraseña debe tener al menos 12 caracteres',
            passwordMismatch: 'Las contraseñas no coinciden',
            exportFailed: 'No se pudo exportar el proyecto'
        }
    },
    import: {
        title: 'Importar Proyecto',
        description: 'Carga un proyecto desde archivo PLUMA (*.pluma)',
        selectFile: 'Seleccionar archivo',
        selected: 'Archivo seleccionado: {filename}',
        warning: 'Esto reemplazará el proyecto actual',
        success: 'Proyecto importado',
        encryptedFile: 'Archivo Encriptado'
    },
    password: {
        title: 'Contraseña Requerida',
        message: 'Este archivo está encriptado. Ingresa la contraseña para desencriptarlo.',
        decrypt: 'Desencriptar',
        password: 'Contraseña',
        passwordPlaceholder: 'Ingresa tu contraseña',
        encryptAll: 'Encriptar todo el proyecto'
    },
    manageImage: {
        title: 'Gestionar Imagen'
    },
    avatarSelector: {
        automaticProvider: 'Automático (usar primero disponible)',
        seedHint: '- Si está vacío, se generará automáticamente',
        generateImage: 'Generar Imagen',
        generatedSuccessfully: 'Imagen generada exitosamente',
        customImageLoaded: 'Imagen personalizada cargada'
    },
    projectsList: {
        title: 'Mis Proyectos',
        noProjects: 'No hay proyectos guardados'
    },
    editRelationship: {
        title: 'Relación y su Historia'
    },
    vitalStatus: {
        title: 'Estado Vital de {name}'
    },
    newRelationship: {
        title: 'Nueva Relación'
    },
    settings: {
        title: 'Configuración',
        theme: {
            title: 'Apariencia',
            label: 'Tema',
            dark: 'Oscuro',
            dracula: 'Drácula',
            light: 'Claro Pastel'
        },
        dataManagement: {
            title: 'Gestión de Datos',
            description: 'Gestiona los datos almacenados localmente en este navegador',
            exportProjectDescription: 'Descarga el proyecto actual como archivo .pluma con imágenes y encriptación opcional',
            warningTitle: '¡Advertencia Importante!',
            warningDescription: 'Esta acción eliminará permanentemente todos los proyectos, personajes, capítulos y configuraciones almacenados localmente en este navegador. Esta acción no se puede deshacer.',
            exportBeforeDeleteLabel: 'Recomendamos exportar tus datos antes de eliminarlos:',
            exportAllButton: 'Exportar Todos los Datos',
            noDataTitle: 'No hay datos',
            noDataMessage: 'No hay proyectos para exportar',
            exportSuccessTitle: 'Datos exportados',
            exportSuccessMessage: 'Todos los datos han sido exportados correctamente',
            exportErrorTitle: 'Error al exportar',
            exportErrorMessage: 'Ocurrió un error al intentar exportar los datos',
            confirmationLabel: 'Para confirmar la eliminación, escribe "ELIMINAR DATOS" en el campo siguiente:',
            confirmationPlaceholder: 'ELIMINAR DATOS',
            understandCheckbox: 'Entiendo que esta acción no se puede deshacer y que perderé todos los datos almacenados localmente',
            deleteButton: 'Eliminar Todos los Datos Localmente',
            deletionConfirmed: 'Datos eliminados correctamente. La aplicación se recargará en unos segundos.',
            confirmDeletion: '¿Estás completamente seguro? Esta acción eliminará todos tus datos locales y no se puede deshacer.',
            deletionSuccessTitle: 'Datos eliminados',
            deletionSuccessMessage: 'Todos los datos locales han sido eliminados correctamente.',
            deletionErrorTitle: 'Error al eliminar datos',
            deletionErrorMessage: 'Ocurrió un error al intentar eliminar los datos.'
        },
        textAPIs: 'APIs de Texto',
        imageAPIs: 'APIs de Imágenes',
        imageProvider: 'Proveedor de Imágenes',
        requiresLocalInstall: 'Requiere instalación local: Ver instrucciones',
        manualPromptCopy: 'Copia el prompt generado y pégalo en cualquier IA web (ChatGPT, Claude, etc.)',
        savedKeys: 'Keys Guardadas',
        lastUsed: 'Último uso:',
        autoFallbackHint: 'Fallback automático: Si una key falla, el sistema intentará automáticamente con la siguiente disponible.',
        keysPrivacy: 'Las claves se guardan en tu dispositivo y no se envían a ningún servidor',
        tokenOptimization: 'Optimización de Tokens',
        tokenOptimizationDesc: 'Controla cuánto contexto se envía a la IA para ahorrar tokens y reducir costos',
        tokenLevels: {
            minimal: '⚡ Mínimo (~1,000 tokens) - Solo lo esencial',
            normal: '⚖️ Normal (~3,000 tokens) - Balanceado (recomendado)',
            complete: '📚 Completo (~8,000 tokens) - Todo el contexto',
            unlimited: '🚀 Sin límite - Enviar todo'
        },
        contextLevel: 'Nivel de Contexto',
        minimalLevel: 'Nivel Mínimo',
        minimalLevelDesc: 'Solo incluye: Protagonista, antagonista, capítulo actual. Ideal para ahorrar tokens.',
        normalLevel: 'Nivel Normal (Recomendado)',
        smartLevelDesc: 'Incluye: Personajes mencionados, lore relevante, locaciones citadas. Balance perfecto entre calidad y costo.',
        completeLevel: 'Nivel Completo',
        fullLevelDesc: 'Incluye: Todos los personajes, todo el lore, todas las locaciones. Máxima calidad, mayor costo.',
        unlimitedLevel: 'Sin Límite',
        unlimitedLevelWarning: '⚠️ Envía TODO sin restricciones. Puede consumir muchos tokens en proyectos grandes.',
        smartSavingTip: '💡 Ahorro inteligente: El sistema detecta automáticamente personajes y lore mencionados en tu texto para incluir solo lo relevante.',
        agenticSystem: '🤖 Sistema de IA Agéntica',
        agenticSystemDesc: 'La IA analiza tu tarea y decide qué contexto necesita, enviando solo lo relevante',
        agenticMode: 'Modo Agéntico',
        agenticModeDesc: 'La IA decide qué contexto necesita (recomendado)',
        twoStepFlow: {
            title: '¿Cómo funciona el flujo de 2 pasos?',
            step1: '<strong>Paso 1:</strong> La IA recibe tu tarea y un inventario de contexto disponible (solo nombres, sin contenido)',
            step2: '<strong>Paso 2:</strong> La IA decide qué personajes, lore, locaciones necesita y el sistema envía SOLO eso'
        },
        agenticBenefits: {
            title: 'Ventajas del modo agéntico',
            tokenSaving: '<strong>Ahorro masivo de tokens:</strong> Solo envía lo que realmente necesita',
            relevantContext: '<strong>Contexto más relevante:</strong> La IA selecciona lo específico para tu tarea',
            fullTraceability: '<strong>Trazabilidad total:</strong> Los logs muestran exactamente qué decidió incluir',
            smartOptimization: '<strong>Optimización inteligente:</strong> La IA decide, no reglas predefinidas',
            tip: '<strong>💡 Tip:</strong> Activa los logs de depuración para ver el flujo de 2 pasos en acción.'
        },
        debugLogs: {
            title: 'Logs de Depuración',
            description: 'Activa logs detallados en la consola para ver el flujo de peticiones a la IA'
        },
        apiKeys: {
            editName: 'Editar nombre',
            markDefault: 'Marcar como default',
            delete: 'Eliminar',
            confirmDelete: '¿Eliminar esta API key?'
        },
        showLogs: 'Mostrar Logs',
        showLogsDesc: 'Ver información detallada del sistema de IA',
        logsInfo: {
            title: '¿Qué se registra?',
            items: {
                modeAndProvider: 'Modo y proveedor de IA seleccionado',
                contextBuilding: 'Construcción de contexto (personajes, lore, capítulos)',
                tokenOptimization: 'Optimización de tokens (antes/después)',
                finalPrompt: 'Prompt final generado',
                apiRequests: 'Peticiones y respuestas de la API',
                responseTimes: 'Tiempos de respuesta y errores'
            },
            tip: '💡 Tip: Abre la consola del navegador (F12) para ver los logs en tiempo real.'
        },
        localDataDesc: 'Gestiona los datos almacenados localmente en este navegador (Proyectos PLUMA)',
        exportCurrentProject: 'Exportar Proyecto Actual',
        exportProject: 'Exportar Proyecto',
        exportAllData: 'Exportar Todos los Datos',
        deleteAllData: 'Eliminar Todos los Datos Localmente',
        providerInfo: {
            freeTier: 'Tier gratuito:',
            pricing: 'Precio:',
            notAvailable: 'No disponible',
            checkWebsite: 'Consultar sitio web'
        },
        messages: {
            apiKeyExists: 'Esta API key ya está guardada',
            apiKeySaved: 'API key guardada como "{name}"',
            errorSavingKey: 'Error al guardar la API key',
            testingConnection: 'Probando conexión...',
            connectionSuccess: '✓ Conexión exitosa',
            apiKeyDeleted: 'API key eliminada',
            defaultKeyUpdated: 'Key por defecto actualizada',
            unnamed: 'Sin nombre',
            logsEnabled: '🔍 Logs de depuración activados',
            logsDisabled: '🔇 Logs de depuración desactivados',
            agenticModeEnabled: '🤖 Modo agéntico activado: La IA decidirá qué contexto necesita',
            traditionalModeEnabled: '📦 Modo tradicional activado: Se enviará todo el contexto con optimización',
            deleteDataText: 'ELIMINAR DATOS'
        }
    }
};
