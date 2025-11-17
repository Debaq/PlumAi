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
        provider: 'Proveedor',
        optional: 'Opcional',
        required: 'Requerido',
        viewAll: 'Ver Todos',
        view: 'Ver',
        select: 'Seleccionar',
        remove: 'Quitar',
        title: 'Título:',
        author: 'Autor:'
    },

    // Avatares
    avatars: {
        selectAvatar: 'Seleccionar Avatar',
        change: 'Cambiar Avatar',
        select: 'Seleccionar',
        upload: 'Subir',
        preview: 'Vista Previa',
        seedPlaceholder: 'Nombre para generar',
        hint: 'Los avatares se generan usando tu nombre como semilla. Cambia el nombre de vista previa para ver diferentes variaciones.'
    },

    // Header
    header: {
        title: 'PlumaAI',
        subtitle: 'Editor de Novelas con IA',
        newProject: 'Nuevo Proyecto',
        loadProject: 'Cargar Proyecto',
        saveProject: 'Guardar Proyecto',
        settings: 'Configuración',
        help: 'Ayuda',
        changeLanguage: 'Cambiar idioma'
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
        versionControl: 'Control de Versiones',
        publishing: 'Publicación',
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
            avatar: 'Avatar',
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
                colleague: 'Colega',
                collaborator: 'Colaborador',
                ally: 'Aliado',
                rival: 'Rival',
                boss: 'Jefe',
                subordinate: 'Subordinado',
                teacher: 'Profesor',
                student: 'Estudiante',
                neighbor: 'Vecino',
                partner: 'Socio',
                guardian: 'Guardián',
                ward: 'Tutelado',
                hero: 'Héroe',
                villain: 'Villano',
                sidekick: 'Compañero',
                archenemy: 'Arquienemigo',
                businessPartner: 'Socio de Negocios',
                ex: 'Ex',
                crush: 'Crush',
                rivalLove: 'Rival Amoroso'
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
        copyAIPrompt: 'Copiar Prompt IA',
        aiPromptCopied: 'Prompt copiado al portapapeles',
        aiPromptCopiedDesc: 'Ahora puedes pegarlo en tu generador de imágenes IA favorito (DALL-E, Midjourney, Stable Diffusion, etc.)',
        form: {
            name: 'Nombre',
            namePlaceholder: 'Ej: Café Central',
            type: 'Tipo',
            typePlaceholder: 'Ciudad, bosque, montaña, edificio...',
            typeHint: 'Tipo de ubicación (ciudad, bosque, montaña, etc.)',
            image: 'Imagen',
            noImage: 'Sin imagen',
            uploadImage: 'Subir',
            imageUrl: 'URL',
            imageUrlPlaceholder: 'https://...',
            description: 'Descripción',
            descriptionPlaceholder: 'Describe este lugar',
            significance: 'Significancia',
            significancePlaceholder: 'Importancia en la historia...',
            significanceHint: 'Importancia y relevancia de esta ubicación en la historia',
            notes: 'Notas',
            notesPlaceholder: 'Notas adicionales...'
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
        viewList: 'Lista',
        viewVisual: 'Visual',
        viewEra: 'Eras',
        filterAll: 'Todos los eventos',
        filterAbsolute: 'Solo con fechas',
        filterRelative: 'Solo relativos',
        filterEra: 'Solo eras',
        dragHint: 'Arrastra los eventos para reordenarlos',
        dateMode: {
            absolute: 'Absoluto',
            relative: 'Relativo',
            era: 'Era'
        },
        importance: {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta'
        },
        form: {
            dateMode: 'Modo de Fecha',
            dateModes: {
                absolute: 'Fecha Absoluta',
                relative: 'Orden Relativo',
                era: 'Era/Época'
            },
            date: 'Fecha',
            datePlaceholder: 'Ej: 15 de mayo, 1990',
            dateHint: 'Fecha exacta del evento',
            era: 'Era/Época',
            eraPlaceholder: 'Ej: Era del Caos, Edad Media...',
            eraHint: 'Época o era en la que ocurre el evento',
            relativeInfo: 'El orden relativo se define arrastrando eventos en la vista de timeline',
            event: 'Evento',
            eventPlaceholder: 'Qué ocurre en esta fecha',
            description: 'Descripción',
            descriptionPlaceholder: 'Detalles del evento',
            participants: 'Participantes',
            participantsPlaceholder: 'Personajes involucrados',
            noCharacters: 'No hay personajes creados',
            location: 'Ubicación',
            locationPlaceholder: 'Dónde ocurre',
            noLocation: 'Sin ubicación',
            importance: 'Importancia',
            importanceLevels: {
                low: 'Baja',
                medium: 'Media',
                high: 'Alta'
            },
            tags: 'Etiquetas',
            tagsPlaceholder: 'Agregar etiqueta...',
            relatedScenes: 'Escenas Relacionadas',
            noScenes: 'No hay escenas creadas',
            scenes: 'Escenas relacionadas',
            relatedChapters: 'Capítulos Relacionados',
            noChapters: 'No hay capítulos creados',
            chapters: 'Capítulos relacionados',
            impacts: 'Impactos',
            impactsHint: 'Cómo afecta este evento a personajes y relaciones',
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
        assistantModes: {
            continue: 'Continuar escribiendo',
            suggest: 'Sugerir ideas',
            analyze: 'Analizar texto',
            improve: 'Mejorar pasaje',
            dialogue: 'Generar diálogo',
            worldbuild: 'Expandir worldbuilding',
            characterize: 'Desarrollar personaje'
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
        zenMode: 'Modo sin distracciones',
        exitZenMode: 'Salir del modo zen',
        placeholder: 'Comienza a escribir tu historia...'
    },

    // Publicación
    publishing: {
        title: 'Publicación',
        subtitle: 'Prepara tu libro para publicar',

        cover: {
            title: 'Portada',
            upload: 'Subir Portada',
            change: 'Cambiar Portada',
            remove: 'Quitar Portada',
            recommendation: 'Recomendado: 1600x2400px (proporción 2:3)',
            preview: 'Vista Previa',
            noCover: 'Sin portada'
        },

        metadata: {
            title: 'Información del Libro',
            bookTitle: 'Título del Libro',
            bookTitlePlaceholder: 'El título de tu novela',
            subtitle: 'Subtítulo',
            subtitlePlaceholder: 'Subtítulo opcional',
            author: 'Autor',
            authorPlaceholder: 'Tu nombre',
            isbn: 'ISBN',
            isbnPlaceholder: 'ISBN-13 (opcional)',
            publisher: 'Editorial',
            publisherPlaceholder: 'Nombre de la editorial',
            year: 'Año de Publicación',
            yearPlaceholder: '2025',
            description: 'Descripción',
            descriptionPlaceholder: 'Sinopsis del libro...',
            genre: 'Género',
            genrePlaceholder: 'Fantasía, Ciencia Ficción, Romance...',
            language: 'Idioma',
            copyright: 'Copyright',
            copyrightPlaceholder: '© 2025 Tu Nombre. Todos los derechos reservados.'
        },

        chapters: {
            title: 'Selección de Capítulos',
            selectAll: 'Seleccionar Todos',
            deselectAll: 'Deseleccionar Todos',
            selected: '{count} capítulos seleccionados',
            totalWords: '{count} palabras totales',
            orderBy: 'Ordenar por',
            orderByNumber: 'Número',
            orderByTitle: 'Título',
            orderByDate: 'Fecha',
            includeInExport: 'Incluir en la exportación',
            noChapters: 'No hay capítulos para exportar',
            createChapter: 'Crear primer capítulo',
            filterByStatus: 'Filtrar por estado',
            statusAll: 'Todos los estados',
            statusFinal: 'Solo finales',
            statusReview: 'En revisión',
            statusDraft: 'Borradores',
            showDrafts: 'Mostrar borradores',
            showReview: 'Mostrar en revisión',
            onlyFinal: 'Solo capítulos finales'
        },

        platform: {
            title: 'Plataforma de Publicación',
            kdp: 'Amazon KDP',
            kdpDesc: 'Formato estándar de Amazon Kindle Direct Publishing',
            ingramspark: 'IngramSpark',
            ingramDesc: 'Distribución profesional a librerías',
            lulu: 'Lulu',
            luluDesc: 'Autopublicación flexible',
            custom: 'Personalizado',
            customDesc: 'Configuración manual completa'
        },

        bookSize: {
            title: 'Tamaño del Libro',
            kdp6x9: '6" x 9" (15.24 x 22.86 cm)',
            kdp6x9Desc: 'Tamaño estándar para novelas - KDP',
            kdp5x8: '5" x 8" (12.7 x 20.32 cm)',
            kdp5x8Desc: 'Compacto - KDP',
            kdp55x85: '5.5" x 8.5" (13.97 x 21.59 cm)',
            kdp55x85Desc: 'Estándar US - KDP',
            a4: 'A4 (21 x 29.7 cm)',
            a5: 'A5 (14.8 x 21 cm)',
            letter: 'Carta (21.6 x 27.9 cm)'
        },

        images: {
            title: 'Imágenes del Libro',
            addImage: 'Agregar Imagen',
            fullPage: 'Página completa',
            position: 'Posición en el libro',
            afterChapter: 'Después del capítulo',
            beforeChapter: 'Antes del capítulo',
            atBeginning: 'Al inicio del libro',
            atEnd: 'Al final del libro',
            reorder: 'Reordenar',
            remove: 'Quitar',
            noImages: 'Sin imágenes agregadas'
        },

        format: {
            title: 'Formato',
            pageSize: 'Tamaño de Página',
            pageSizeA4: 'A4 (210 x 297 mm)',
            pageSizeA5: 'A5 (148 x 210 mm)',
            pageSizeLetter: 'Carta (216 x 279 mm)',
            pageSize6x9: '6" x 9" (152 x 229 mm)',
            margins: 'Márgenes',
            marginsNormal: 'Normal (2.5 cm)',
            marginsNarrow: 'Estrecho (1.5 cm)',
            marginsWide: 'Ancho (3.5 cm)',
            fontFamily: 'Fuente',
            fontSize: 'Tamaño de Fuente',
            lineHeight: 'Interlineado',
            lineHeightSingle: 'Sencillo',
            lineHeight15: '1.5 líneas',
            lineHeightDouble: 'Doble',
            includePageNumbers: 'Incluir números de página',
            includeTableOfContents: 'Incluir tabla de contenidos',
            includeHeader: 'Incluir encabezados',
            includeFooter: 'Incluir pie de página'
        },

        export: {
            title: 'Exportar',
            exportPDF: 'Exportar a PDF',
            exportDOCX: 'Exportar a DOCX',
            exportEPUB: 'Exportar a EPUB',
            exportDraft: 'Exportar Borrador',
            exportFinal: 'Exportar Versión Final',
            exporting: 'Exportando...',
            success: 'Libro exportado correctamente',
            error: 'Error al exportar el libro',
            preview: 'Vista Previa',
            download: 'Descargar'
        },

        presets: {
            title: 'Plantillas',
            custom: 'Personalizado',
            amazonKDP: 'Amazon KDP (6x9)',
            createspace: 'CreateSpace (6x9)',
            ingramspark: 'IngramSpark (5.5x8.5)',
            lulu: 'Lulu (6x9)',
            savePreset: 'Guardar como plantilla',
            loadPreset: 'Cargar plantilla'
        },

        validation: {
            noCover: 'No se ha agregado una portada',
            noTitle: 'Falta el título del libro',
            noAuthor: 'Falta el nombre del autor',
            noChapters: 'No hay capítulos seleccionados',
            warnings: 'Advertencias',
            ready: 'Listo para exportar'
        }
    },

    // Modales
    modals: {
        welcome: {
            title: '¡Bienvenido a PlumaAI!',
            subtitle: 'Editor de novelas con inteligencia artificial',
            description: 'Comienza creando un nuevo proyecto o carga uno existente',
            newProject: 'Crear Nuevo Proyecto',
            loadProject: 'Cargar Proyecto Existente',
            continueProject: 'Continuar con "{projectName}"',
            justLook: 'Solo Mirar',
            getStarted: 'Comenzar'
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
                understandCheckbox: 'Entiendo que esta acción no se puede deshacer y que perderé todos los datos almacenados localmente',
                deleteButton: 'Eliminar Todos los Datos Localmente',
                deletionConfirmed: 'Datos eliminados correctamente. La aplicación se recargará en unos segundos.',
                confirmDeletion: '¿Estás completamente seguro? Esta acción eliminará todos tus datos locales y no se puede deshacer.',
                deletionSuccessTitle: 'Datos eliminados',
                deletionSuccessMessage: 'Todos los datos locales han sido eliminados correctamente.',
                deletionErrorTitle: 'Error al eliminar datos',
                deletionErrorMessage: 'Ocurrió un error al intentar eliminar los datos.'
            }
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
            download: 'Descargar'
        },
        import: {
            title: 'Importar Proyecto',
            description: 'Carga un proyecto desde archivo PLUMA (*.pluma)',
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
            loreDeleted: 'Elemento de lore eliminado',
            commitCreated: 'Commit creado exitosamente',
            commitCreatedDesc: 'Commit {commitId} creado',
            checkoutSuccess: 'Checkout exitoso',
            checkoutSuccessDesc: 'Estado cambiado al commit {commitId}',
            forkCreated: 'Fork creado exitosamente',
            forkCreatedDesc: 'Fork {forkName} creado',
            treeCreated: 'Estructura creada exitosamente',
            treeCreatedDesc: 'Estructura {treeName} creada',
            treeFailed: 'Error creando estructura',
            treeFailedDesc: 'No se pudo crear la estructura'
        },
        error: {
            generic: 'Ha ocurrido un error',
            loadProject: 'Error al cargar el proyecto',
            saveProject: 'Error al guardar el proyecto',
            projectList: 'Error al obtener la lista de proyectos',
            invalidFile: 'Archivo inválido',
            apiError: 'Error de API',
            noApiKey: 'No hay clave API configurada',
            commitFailed: 'Error creando commit',
            commitFailedDesc: 'No se pudo crear el commit',
            checkoutFailed: 'Error en checkout',
            checkoutFailedDesc: 'No se pudo cambiar al estado del commit',
            forkFailed: 'Error creando fork',
            forkFailedDesc: 'No se pudo crear el fork'
        }
    },

    // Estadísticas
    stats: {
        totalWords: 'Palabras totales:',
        totalChapters: 'Capítulos:',
        totalCharacters: 'Personajes:',
        totalScenes: 'Escenas:'
    },

    // Validación
    validation: {
        required: 'Este campo es requerido',
        minLength: 'Mínimo {min} caracteres',
        maxLength: 'Máximo {max} caracteres',
        invalid: 'Valor inválido'
    },
    
    // Control de Versiones
    versionControl: {
        title: 'Control de Versiones',
        commitMessage: 'Mensaje del commit:',
        commitMessagePlaceholder: 'Descripción del cambio...',
        author: 'Autor',
        authorPlaceholder: 'Tu nombre...',
        currentProjectStats: 'Estadísticas del Proyecto Actual',
        forkName: 'Nombre del fork:',
        forkNamePlaceholder: 'Nombre del nuevo proyecto...',
        description: 'Descripción',
        descriptionPlaceholder: 'Breve descripción del propósito del fork...',
        originalProject: 'Proyecto Original',
        forkInfo: 'Un fork crea una copia independiente del proyecto con su propia historia de versiones.',
        checkoutConfirm: '¿Estás seguro de que quieres cambiar al estado de este commit?',
        createCommit: 'Crear Commit',
        createFork: 'Crear Fork',
        history: 'Historial',
        branches: 'Ramas',
        commits: 'Commits',
        currentBranch: 'Rama actual:',
        totalCommits: 'Total de commits:',
        date: 'Fecha',
        message: 'Mensaje',
        actions: 'Acciones',
        emptyHistory: 'No hay commits en esta rama',
        emptyStateHint: 'Puedes crear un commit usando el botón de commit en la cabecera',
        forksViewTitle: 'Gestión de Forks',
        forksList: 'Forks del Proyecto',
        noForks: 'No hay forks de este proyecto',
        diffsTitle: 'Comparar Versiones',
        compareFrom: 'Desde commit:',
        compareTo: 'Hasta commit:',
        selectCommit: 'Seleccionar commit...',
        compare: 'Comparar',
        changes: 'Cambios',
        createTree: 'Crear Estructura de Proyecto',
        treeStructure: 'Estructura de Proyecto',
        treeStructureDesc: 'Crea una estructura de árbol para organizar tus capítulos y escenas',
        treeName: 'Nombre de la estructura',
        treeNamePlaceholder: 'Nombre de la estructura...',
        treeType: 'Tipo de estructura',
        chapterTree: 'Árbol de Capítulos',
        sceneTree: 'Árbol de Escenas',
        outlineTree: 'Árbol de Esquema',
        treeDescription: 'Descripción',
        treeDescriptionPlaceholder: 'Breve descripción de la estructura...',
        createFromCurrent: 'Crear a partir del proyecto actual'
    },

    // Avatares
    avatars: {
        selectAvatar: 'Seleccionar Avatar',
        preview: 'Vista Previa',
        upload: 'Subir Imagen',
        select: 'Seleccionar Avatar',
        change: 'Cambiar Avatar',
        seedPlaceholder: 'Nombre para generar',
        hint: 'Los avatares se generan usando tu nombre como semilla. Cambia el nombre de vista previa para ver diferentes variaciones.',
        categories: {
            human: 'Humanos',
            fantasy: 'Fantasía',
            pixel: 'Pixel Art',
            simple: 'Simples'
        },
        uploadHint: 'Formatos soportados: JPG, PNG, GIF, SVG, WebP (máx. 5MB)',
        errorInvalidType: 'Tipo de archivo no válido',
        errorTooLarge: 'El archivo es muy grande'
    }
};
