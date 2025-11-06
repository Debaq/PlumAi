// Traducciones en Español
window.translations_es = {
    // Común
    common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        close: 'Cerrar',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        export: 'Exportar',
        import: 'Importar',
        loading: 'Cargando...',
        noResults: 'No hay resultados',
        confirm: 'Confirmar',
        confirmDelete: '¿Estás seguro de que quieres eliminar esto?',
        back: 'Volver',
        next: 'Siguiente',
        previous: 'Anterior',
        yes: 'Sí',
        no: 'No',
        optional: 'Opcional',
        required: 'Requerido',
        viewAll: 'Ver Todos'
    },

    // Header
    header: {
        title: 'PlumaAI',
        subtitle: 'Editor de Novelas con IA',
        newProject: 'Nuevo Proyecto',
        loadProject: 'Cargar Proyecto',
        saveProject: 'Guardar Proyecto',
        settings: 'Configuración',
        help: 'Ayuda'
    },

    // Sidebar
    sidebar: {
        dashboard: 'Dashboard',
        characters: 'Personajes',
        chapters: 'Capítulos',
        scenes: 'Escenas',
        locations: 'Ubicaciones',
        lore: 'Lore',
        relations: 'Relaciones',
        timeline: 'Eventos',
        aiAssistant: 'Asistente IA',
        notes: 'Notas',
        settings: 'Configuración',
        collapse: 'Contraer',
        expand: 'Expandir'
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        subtitle: 'Resumen de tu proyecto',
        stats: {
            words: 'Palabras',
            chapters: 'Capítulos',
            characters: 'Personajes',
            scenes: 'Escenas'
        },
        recentActivity: {
            title: 'Actividad Reciente',
            empty: 'No hay actividad reciente',
            hint: 'Comienza creando personajes, escenas o capítulos'
        },
        quickActions: {
            title: 'Acciones Rápidas',
            newChapter: 'Nuevo Capítulo',
            newCharacter: 'Nuevo Personaje',
            newScene: 'Nueva Escena',
            newLocation: 'Nueva Ubicación',
            newLore: 'Nuevo Elemento de Lore',
            openEditor: 'Abrir Editor'
        }
    },

    // Personajes
    characters: {
        title: 'Personajes',
        subtitle: 'Gestiona los personajes de tu novela',
        new: 'Nuevo Personaje',
        edit: 'Editar Personaje',
        empty: 'No hay personajes creados',
        emptyHint: 'Crea tu primer personaje para comenzar',
        form: {
            name: 'Nombre',
            namePlaceholder: 'Ej: Juan Pérez',
            role: 'Rol',
            rolePlaceholder: 'Selecciona un rol',
            roles: {
                protagonist: 'Protagonista',
                antagonist: 'Antagonista',
                secondary: 'Secundario',
                supporting: 'De apoyo'
            },
            description: 'Descripción Física',
            descriptionPlaceholder: 'Describe la apariencia física del personaje',
            personality: 'Personalidad',
            personalityPlaceholder: 'Describe la personalidad del personaje',
            background: 'Historia de Fondo',
            backgroundPlaceholder: 'Cuenta la historia del personaje',
            notes: 'Notas Adicionales',
            notesPlaceholder: 'Otras notas sobre el personaje',
            relationships: 'Relaciones',
            relationTypes: {
                friend: 'Amigo',
                family: 'Familia',
                love: 'Romántico',
                enemy: 'Enemigo',
                mentor: 'Mentor',
                acquaintance: 'Conocido',
                colleague: 'Colaborador',
                collaborator: 'Colaborador',
                colaborador: 'Colaborador'
            },
            relationshipsHint: 'Haz clic en el signo más para añadir una relación con otro personaje'
        },
        delete: {
            title: 'Eliminar Personaje',
            message: '¿Estás seguro de que quieres eliminar a {name}?',
            warning: 'Esta acción no se puede deshacer'
        }
    },

    // Escenas
    scenes: {
        title: 'Escenas',
        subtitle: 'Organiza las escenas de tu historia',
        new: 'Nueva Escena',
        edit: 'Editar Escena',
        empty: 'No hay escenas creadas',
        emptyHint: 'Crea tu primera escena',
        form: {
            title: 'Título',
            titlePlaceholder: 'Ej: Encuentro en el café',
            chapter: 'Capítulo',
            chapterPlaceholder: 'Selecciona un capítulo',
            description: 'Descripción',
            descriptionPlaceholder: 'Describe qué ocurre en esta escena',
            characters: 'Personajes',
            charactersPlaceholder: 'Selecciona los personajes que participan',
            location: 'Ubicación',
            locationPlaceholder: 'Dónde ocurre la escena',
            timelinePosition: 'Posición en la Línea Temporal',
            notes: 'Notas'
        }
    },

    // Ubicaciones
    locations: {
        title: 'Ubicaciones',
        subtitle: 'Gestiona los lugares de tu novela',
        new: 'Nueva Ubicación',
        edit: 'Editar Ubicación',
        empty: 'No hay ubicaciones creadas',
        emptyHint: 'Crea tu primera ubicación',
        form: {
            name: 'Nombre',
            namePlaceholder: 'Ej: Café Central',
            description: 'Descripción',
            descriptionPlaceholder: 'Describe este lugar'
        }
    },

    // Capítulos
    chapters: {
        title: 'Capítulos',
        subtitle: 'Escribe y organiza tus capítulos',
        new: 'Nuevo Capítulo',
        edit: 'Editar Capítulo',
        empty: 'No hay capítulos creados',
        emptyHint: 'Crea tu primer capítulo para comenzar a escribir',
        chapter: 'Capítulo',
        form: {
            number: 'Número',
            title: 'Título',
            titlePlaceholder: 'Título del capítulo',
            summary: 'Resumen',
            summaryPlaceholder: 'Breve descripción de qué trata el capítulo',
            summaryHint: 'Este resumen servirá como contexto para la IA',
            content: 'Contenido',
            contentHint: 'Escribe el contenido del capítulo aquí. Usa / para comandos especiales (@personaje, /escena, /ubicación, /tiempo)',
            status: 'Estado',
            statuses: {
                draft: 'Borrador',
                review: 'En revisión',
                final: 'Final'
            }
        },
        stats: {
            words: '{count} palabras',
            scenes: '{count} escenas',
            modified: 'Modificado: {date}'
        },
        openEditor: 'Abrir en Editor',
        delete: {
            title: 'Eliminar Capítulo',
            message: '¿Estás seguro de que quieres eliminar el Capítulo {number}?',
            warning: 'Esta acción no se puede deshacer'
        }
    },

    // Línea Temporal
    timeline: {
        title: 'Línea Temporal',
        subtitle: 'Visualiza la cronología de tu historia',
        new: 'Nuevo Evento',
        edit: 'Editar Evento',
        empty: 'No hay eventos en la línea temporal',
        emptyHint: 'Agrega eventos para organizar la cronología',
        form: {
            date: 'Fecha',
            datePlaceholder: 'Ej: 15 de mayo, 1990',
            event: 'Evento',
            eventPlaceholder: 'Qué ocurre en esta fecha',
            description: 'Descripción',
            descriptionPlaceholder: 'Detalles del evento',
            scenes: 'Escenas relacionadas',
            chapters: 'Capítulos relacionados',
            notes: 'Notas'
        }
    },

    // Lore
    lore: {
        title: 'Lore',
        subtitle: 'Conocimiento del mundo de la historia',
        new: 'Nuevo Elemento de Lore',
        edit: 'Editar Elemento de Lore',
        empty: 'No hay elementos de lore',
        emptyHint: 'Crea elementos de lore para construir el mundo de tu historia',
        form: {
            title: 'Título',
            titlePlaceholder: 'Ej: Historia del Reino del Norte',
            summary: 'Resumen',
            summaryPlaceholder: 'Breve descripción del elemento de lore',
            content: 'Contenido',
            contentPlaceholder: 'Detalles completos del elemento de lore...',
            category: 'Categoría',
            categoryPlaceholder: 'Selecciona una categoría',
            categories: {
                general: 'General',
                world: 'Mundo',
                history: 'Historia',
                magic: 'Magia',
                culture: 'Cultura',
                religion: 'Religión',
                organization: 'Organización',
                race: 'Raza',
                location: 'Ubicación',
                item: 'Objeto',
                creature: 'Criatura'
            },
            relatedEntities: 'Entidades Relacionadas',
            relatedEntitiesPlaceholder: 'Selecciona personajes, ubicaciones u otros elementos relacionados'
        }
    },

    // Asistente IA
    ai: {
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
        }
    },

    // Notas
    notes: {
        title: 'Notas',
        subtitle: 'Guarda ideas y apuntes',
        new: 'Nueva Nota',
        empty: 'No hay notas',
        emptyHint: 'Crea una nota para guardar ideas',
        form: {
            title: 'Título',
            titlePlaceholder: 'Título de la nota',
            content: 'Contenido',
            contentPlaceholder: 'Escribe tu nota aquí...'
        }
    },

    // Editor
    editor: {
        title: 'Editor',
        toolbar: {
            bold: 'Negrita',
            italic: 'Cursiva',
            underline: 'Subrayado',
            heading: 'Encabezado',
            bulletList: 'Lista',
            numberedList: 'Lista numerada',
            quote: 'Cita',
            undo: 'Deshacer',
            redo: 'Rehacer'
        },
        wordCount: '{count} palabras',
        saving: 'Guardando...',
        saved: 'Guardado',
        placeholder: 'Comienza a escribir tu historia...'
    },

    // Modales
    modals: {
        welcome: {
            title: '¡Bienvenido a PlumaAI!',
            subtitle: 'Editor de novelas con inteligencia artificial',
            description: 'Comienza creando un nuevo proyecto o carga uno existente',
            newProject: 'Crear Nuevo Proyecto',
            loadProject: 'Cargar Proyecto Existente',
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
                kimi: 'Kimi (Moonshot)',
                replicate: 'Replicate',
                qwen: 'Qwen (Alibaba)'
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
            description: 'Descarga tu proyecto como archivo JSON',
            includeApiKeys: 'Incluir claves API',
            filename: 'Nombre del archivo',
            download: 'Descargar'
        },
        import: {
            title: 'Importar Proyecto',
            description: 'Carga un proyecto desde archivo JSON',
            selectFile: 'Seleccionar archivo',
            selected: 'Archivo seleccionado: {filename}',
            warning: 'Esto reemplazará el proyecto actual'
        }
    },

    // Barra de estado
    status: {
        words: '{count} palabras',
        autosave: {
            enabled: 'Autoguardado activo',
            disabled: 'Autoguardado desactivado',
            saving: 'Guardando...',
            saved: 'Guardado a las {time}'
        },
        ai: {
            active: 'IA lista',
            inactive: 'IA no configurada',
            processing: 'IA procesando...'
        }
    },

    // Notificaciones
    notifications: {
        success: {
            projectCreated: 'Proyecto creado exitosamente',
            projectSaved: 'Proyecto guardado',
            projectLoaded: 'Proyecto cargado',
            projectLoadedDesc: 'Proyecto "{projectName}" cargado correctamente',
            characterCreated: 'Personaje creado',
            characterUpdated: 'Personaje actualizado',
            characterDeleted: 'Personaje eliminado',
            sceneCreated: 'Escena creada',
            sceneUpdated: 'Escena actualizada',
            sceneDeleted: 'Escena eliminada',
            chapterCreated: 'Capítulo creado',
            chapterUpdated: 'Capítulo actualizado',
            chapterDeleted: 'Capítulo eliminado',
            locationCreated: 'Ubicación creada',
            locationUpdated: 'Ubicación actualizada',
            locationDeleted: 'Ubicación eliminada',
            eventCreated: 'Evento creado',
            eventUpdated: 'Evento actualizado',
            eventDeleted: 'Evento eliminado',
            noteCreated: 'Nota creada',
            noteUpdated: 'Nota actualizada',
            noteDeleted: 'Nota eliminada',
            loreCreated: 'Elemento de lore creado',
            loreUpdated: 'Elemento de lore actualizado',
            loreDeleted: 'Elemento de lore eliminado'
        },
        error: {
            generic: 'Ha ocurrido un error',
            loadProject: 'Error al cargar el proyecto',
            saveProject: 'Error al guardar el proyecto',
            projectList: 'Error al obtener la lista de proyectos',
            invalidFile: 'Archivo inválido',
            apiError: 'Error de API',
            noApiKey: 'No hay clave API configurada'
        }
    },

    // Validación
    validation: {
        required: 'Este campo es requerido',
        minLength: 'Mínimo {min} caracteres',
        maxLength: 'Máximo {max} caracteres',
        invalid: 'Valor inválido'
    }
};
