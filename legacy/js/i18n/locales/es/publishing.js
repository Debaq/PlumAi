// Traducciones de Publicación - Español

export default {
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

    kdp: {
        professionalFormat: 'Formato profesional'
    },

    paperType: {
        label: 'Tipo de Papel',
        cream: 'Papel Crema (recomendado para ficción)',
        white: 'Papel Blanco (para imágenes a color)'
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
        onlyFinal: 'Solo capítulos finales',
        available: 'capítulos disponibles',
        words: 'palabras',
        abbreviation: 'Cap.'
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
        positionLabel: 'Posición en el libro:',
        afterChapter: 'Después del capítulo',
        beforeChapter: 'Antes del capítulo',
        atBeginning: 'Al inicio del libro',
        atEnd: 'Al final del libro',
        reorder: 'Reordenar',
        remove: 'Quitar',
        noImages: 'Sin imágenes agregadas',
        insertHelp: 'Puedes insertar imágenes DENTRO de los capítulos usando marcadores',
        howToInsert: 'Cómo insertar imágenes dentro de los capítulos:',
        useMarkers: 'Usa estos marcadores en el texto de tus capítulos:',
        fullPageDescription: 'Imagen de página completa (inserta una página)',
        inlineDescription: 'Imagen en línea (fluye con el texto)',
        numberHelp: 'El número corresponde al # que aparece en cada imagen abajo.',
        fullPageNote: 'La imagen aparecerá en una página completa',
        useMarkerNote: 'Usa [IMG:X] o [INLINE-IMG:X] en el texto del capítulo',
        positionInChapter: 'Dentro de capítulo (usa marcadores [IMG:X] o [INLINE-IMG:X])',
        positionFrontMatter: 'Al inicio del libro (Front Matter)',
        positionAfterChapter: 'Después de Capítulo {chapter}: {title}',
        positionBackMatter: 'Al final del libro (Back Matter)',
        confirmDelete: 'Eliminar imagen de {name}?',
        deleted: 'Imagen eliminada',
        sortByName: 'Nombre A-Z',
        generated: 'Imagen generada',
        updated: 'Imagen actualizada',
        viewImage: 'Vista: Ver imagen',
        delete: 'Eliminar Imagen',
        seedHint: '- Si está vacío, se generará automáticamente',
        generate: 'Generar Imagen',
        generatedImage: 'Imagen generada:',
        generatedSuccessfully: 'Imagen generada exitosamente:'
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
    },

    frontMatter: {
        title: 'Estructura Preliminar (Front Matter)',
        description: 'Contenido que aparece antes de los capítulos (opcional)',
        otherBooks: 'Otros libros del autor',
        otherBooksPlaceholder: 'Lista de tus otros libros (uno por línea)...',
        otherBooksHelp: 'Aparecerá en el reverso de la portadilla',
        dedication: 'Dedicatoria',
        dedicationPlaceholder: 'A quien dedicas este libro...',
        dedicationHelp: 'Aparecerá en página IMPAR después del copyright',
        prologue: 'Prólogo',
        prologuePlaceholder: 'Prólogo del libro (contexto, introducción)...',
        prologueHelp: 'Se formateará profesionalmente con sangría y justificación'
    },

    backMatter: {
        title: 'Estructura Final (Back Matter)',
        description: 'Contenido que aparece después de los capítulos',
        epilogue: 'Epílogo (opcional)',
        epiloguePlaceholder: 'Epílogo del libro (conclusión, cierre)...',
        acknowledgments: 'Agradecimientos (opcional)',
        acknowledgmentsPlaceholder: 'Agradece a editores, beta readers, familia, amigos...',
        aboutAuthor: 'Sobre el Autor (recomendado)',
        aboutAuthorPlaceholder: '[Nombre del Autor] nació en [Ciudad, País] en [Año]. \n\nSu pasión por [tema/género] comenzó desde temprana edad, cuando [anécdota breve].\n\n[Logros, experiencias relevantes, otros trabajos]\n\n[Nombre] vive actualmente en [Ciudad] con [familia/mascotas]. Este es su [número] novela publicada.',
        authorPhoto: 'Foto del Autor (opcional)',
        uploadPhoto: 'Subir foto',
        photoHelp: 'Recomendado: cuadrada, mínimo 300x300px',
        contactInfo: 'Información de Contacto (opcional)',
        websitePlaceholder: 'Sitio web: www.tuautor.com',
        socialPlaceholder: 'Redes sociales: @tuautor en Twitter/Instagram',
        newsletterPlaceholder: 'Newsletter: Suscríbete en www.tuautor.com/newsletter',
        contactInfoHelp: 'Aparecerá al final de "Sobre el Autor"'
    }
};
