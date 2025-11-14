// Publishing Component para Alpine.js
function publishingComponent() {
    return {
        // ===== PLATFORM & TEMPLATE =====
        publishingPlatform: 'kdp',
        publishingBookSize: 'kdp6x9',

        // ===== COVER =====
        publishingCoverImage: null,

        // ===== METADATA =====
        publishingBookTitle: '',
        publishingSubtitle: '',
        publishingAuthor: '',
        publishingISBN: '',
        publishingPublisher: '',
        publishingYear: new Date().getFullYear().toString(),
        publishingDescription: '',
        publishingGenre: '',
        publishingLanguage: 'Español',
        publishingCopyright: '',

        // ===== CHAPTER SELECTION & FILTERING =====
        publishingChapterFilter: 'final', // 'final', 'review', 'all'
        publishingSelectedChapters: [],

        // ===== IMAGES =====
        publishingBookImages: [], // { id, file, dataUrl, position }

        // ===== FORMAT SETTINGS =====
        publishingIncludePageNumbers: true,
        publishingIncludeToC: true,

        // Platform-specific defaults (auto-assigned)
        publishingPageSize: '6x9',
        publishingMargins: 'normal',
        publishingFontFamily: 'Garamond',
        publishingFontSize: '12',

        // ===== COMPUTED PROPERTIES =====
        get publishingFilteredChapters() {
            let chapters = this.$store.project.chapters;

            if (this.publishingChapterFilter === 'final') {
                chapters = chapters.filter(c => c.status === 'final');
            } else if (this.publishingChapterFilter === 'review') {
                chapters = chapters.filter(c => c.status === 'final' || c.status === 'review');
            }
            // 'all' = no filter

            return chapters.sort((a, b) => (a.number || 0) - (b.number || 0));
        },

        get publishingTotalWords() {
            let total = 0;
            for (const chapterId of this.publishingSelectedChapters) {
                const chapter = this.$store.project.chapters.find(c => c.id === chapterId);
                if (chapter && chapter.content) {
                    total += chapter.content.split(/\s+/).filter(w => w.length > 0).length;
                }
            }
            return total;
        },

        // ===== INITIALIZATION =====
        init() {
            // Pre-cargar datos del proyecto si existen
            if (this.$store.project.projectInfo) {
                this.publishingBookTitle = this.$store.project.projectInfo.title || '';
                this.publishingAuthor = this.$store.project.projectInfo.author || '';
                this.publishingDescription = this.$store.project.projectInfo.description || '';
                this.publishingGenre = this.$store.project.projectInfo.genre || '';
            }

            // Aplicar defaults de la plataforma
            this.applyPlatformDefaults();

            // Seleccionar todos los capítulos finales por defecto
            this.publishingSelectAllFiltered();

            // Set copyright por defecto
            if (!this.publishingCopyright) {
                this.publishingCopyright = `© ${this.publishingYear} ${this.publishingAuthor || 'Tu Nombre'}. Todos los derechos reservados.`;
            }
        },

        // ===== PLATFORM METHODS =====
        applyPlatformDefaults() {
            const platformDefaults = {
                kdp: {
                    fontFamily: 'AmazonEndure', // Fuente oficial de Amazon KDP
                    fontSize: '12',
                    margins: 'normal',
                    includePageNumbers: true,
                    includeToC: true
                },
                ingramspark: {
                    fontFamily: 'Baskerville',
                    fontSize: '11',
                    margins: 'normal',
                    includePageNumbers: true,
                    includeToC: true
                },
                lulu: {
                    fontFamily: 'Georgia',
                    fontSize: '12',
                    margins: 'normal',
                    includePageNumbers: true,
                    includeToC: true
                },
                custom: {
                    fontFamily: 'serif',
                    fontSize: '12',
                    margins: 'normal',
                    includePageNumbers: true,
                    includeToC: true
                }
            };

            const defaults = platformDefaults[this.publishingPlatform];
            if (defaults) {
                Object.assign(this, defaults);
            }
        },

        // ===== COVER METHODS =====
        handleCoverUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.publishingCoverImage = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                this.$store.ui.error(
                    this.$store.i18n.t('common.error'),
                    'Por favor selecciona una imagen válida'
                );
            }
        },

        removeCover() {
            this.publishingCoverImage = null;
        },

        // ===== CHAPTER SELECTION METHODS =====
        toggleChapterSelection(chapterId) {
            const index = this.publishingSelectedChapters.indexOf(chapterId);
            if (index > -1) {
                this.publishingSelectedChapters.splice(index, 1);
            } else {
                this.publishingSelectedChapters.push(chapterId);
            }
        },

        publishingSelectAllFiltered() {
            this.publishingSelectedChapters = this.publishingFilteredChapters.map(c => c.id);
        },

        publishingDeselectAll() {
            this.publishingSelectedChapters = [];
        },

        // ===== IMAGE METHODS =====
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageId = 'img_' + Date.now();
                    this.publishingBookImages.push({
                        id: imageId,
                        file: file,
                        dataUrl: e.target.result,
                        position: 'beginning' // 'beginning', 'end', 'after-chapterX'
                    });
                };
                reader.readAsDataURL(file);
            } else {
                this.$store.ui.error(
                    this.$store.i18n.t('common.error'),
                    'Por favor selecciona una imagen válida'
                );
            }
        },

        removeBookImage(imageId) {
            const index = this.publishingBookImages.findIndex(img => img.id === imageId);
            if (index > -1) {
                this.publishingBookImages.splice(index, 1);
            }
        },

        // ===== VALIDATION =====
        publishingIsValid() {
            return this.publishingBookTitle.trim() !== '' &&
                   this.publishingAuthor.trim() !== '' &&
                   this.publishingSelectedChapters.length > 0;
        },

        // ===== PDF EXPORT WITH PROFESSIONAL KDP SPECS =====
        async exportToPDF() {
            if (!this.publishingIsValid()) {
                this.$store.ui.warning(
                    this.$store.i18n.t('publishing.validation.warnings'),
                    this.$store.i18n.t('publishing.validation.completeRequired')
                );
                return;
            }

            this.$store.ui.startLoading('global');

            try {
                // Verificar que jsPDF esté disponible
                if (typeof window.jspdf === 'undefined') {
                    throw new Error('jsPDF no está cargado');
                }

                const { jsPDF } = window.jspdf;
                const bookData = this.prepareBookData();

                // Cargar fuentes personalizadas si están disponibles
                if (window.fontLoader && !window.fontLoader.loaded) {
                    await window.fontLoader.loadDefaultFonts();
                }

                // Crear PDF con configuración profesional
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: this.getPageSize(),
                    putOnlyUsedFonts: true,
                    compress: true
                });

                // Aplicar fuentes personalizadas al PDF
                if (window.fontLoader) {
                    window.fontLoader.applyFonts(pdf);
                }

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = this.getMargins();
                const textWidth = pageWidth - 2 * margin;
                const lineHeight = 7; // mm
                const minLinesPerPage = 3; // Para evitar viudas/huérfanas

                // Configurar fuente (usará la personalizada si está disponible)
                const fontName = this.getCustomFontName();
                pdf.setFont(fontName, 'normal');

                let currentPage = 0;

                // ===== PORTADA (solo si hay imagen) =====
                if (bookData.cover) {
                    try {
                        pdf.addImage(bookData.cover, 'JPEG', 0, 0, pageWidth, pageHeight);
                        currentPage++;
                    } catch (e) {
                        console.warn('No se pudo agregar la portada:', e);
                    }
                }

                // ===== PÁGINA DE TÍTULO =====
                if (currentPage > 0) pdf.addPage();
                currentPage++;

                let yPosition = pageHeight / 3;
                pdf.setFontSize(28);
                pdf.text(bookData.title, pageWidth / 2, yPosition, { align: 'center' });
                yPosition += 15;

                if (bookData.subtitle) {
                    pdf.setFontSize(18);
                    pdf.text(bookData.subtitle, pageWidth / 2, yPosition, { align: 'center' });
                    yPosition += 12;
                }

                pdf.setFontSize(16);
                yPosition += 10;
                pdf.text(bookData.author, pageWidth / 2, yPosition, { align: 'center' });

                // ===== PÁGINA DE COPYRIGHT =====
                pdf.addPage();
                currentPage++;
                yPosition = margin + 40;
                pdf.setFontSize(10);
                const copyrightLines = pdf.splitTextToSize(bookData.copyright, textWidth);
                pdf.text(copyrightLines, margin, yPosition);

                // ===== TABLA DE CONTENIDOS =====
                if (bookData.format.includeToC && bookData.chapters.length > 0) {
                    pdf.addPage();
                    currentPage++;
                    yPosition = margin;

                    pdf.setFontSize(20);
                    pdf.text(this.$store.i18n.t('publishing.format.tableOfContents'), margin, yPosition);
                    yPosition += 15;

                    pdf.setFontSize(12);
                    bookData.chapters.forEach((chapter) => {
                        if (yPosition > pageHeight - margin - 10) {
                            pdf.addPage();
                            currentPage++;
                            yPosition = margin;
                        }
                        const chapterLine = `${this.$store.i18n.t('publishing.chapters.chapter')} ${chapter.number}. ${chapter.title}`;
                        pdf.text(chapterLine, margin + 5, yPosition);
                        yPosition += 8;
                    });
                }

                // ===== INSERTAR IMÁGENES AL INICIO =====
                const beginningImages = bookData.images.filter(img => img.position === 'beginning');
                for (const img of beginningImages) {
                    pdf.addPage();
                    currentPage++;
                    try {
                        pdf.addImage(img.dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
                    } catch (e) {
                        console.warn('No se pudo agregar imagen:', e);
                    }
                }

                // ===== CAPÍTULOS CON FORMATO PROFESIONAL =====
                for (let i = 0; i < bookData.chapters.length; i++) {
                    const chapter = bookData.chapters[i];

                    // Cada capítulo comienza en página nueva
                    pdf.addPage();
                    currentPage++;
                    yPosition = margin;

                    // Título del capítulo
                    pdf.setFontSize(18);
                    pdf.setFont(fontName, 'bold');
                    const chapterTitle = `${this.$store.i18n.t('publishing.chapters.chapter')} ${chapter.number}`;
                    pdf.text(chapterTitle, margin, yPosition);
                    yPosition += 10;

                    pdf.setFontSize(16);
                    pdf.text(chapter.title, margin, yPosition);
                    yPosition += 15;

                    // Contenido del capítulo con justificación
                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(parseInt(bookData.format.fontSize));

                    const content = chapter.content || this.$store.i18n.t('publishing.chapters.noContent');
                    const paragraphs = content.split(/\n\n+/);

                    for (const paragraph of paragraphs) {
                        if (!paragraph.trim()) continue;

                        const lines = pdf.splitTextToSize(paragraph.trim(), textWidth);

                        // Prevención de viudas/huérfanas: verificar espacio disponible
                        const linesNeeded = Math.min(lines.length, minLinesPerPage);
                        const spaceNeeded = linesNeeded * lineHeight;

                        if (yPosition + spaceNeeded > pageHeight - margin) {
                            // No hay suficiente espacio, nueva página
                            pdf.addPage();
                            currentPage++;
                            yPosition = margin;
                        }

                        // Renderizar líneas con justificación
                        for (let j = 0; j < lines.length; j++) {
                            const line = lines[j];
                            const isLastLine = j === lines.length - 1;

                            if (yPosition > pageHeight - margin - lineHeight) {
                                pdf.addPage();
                                currentPage++;
                                yPosition = margin;
                            }

                            // Justificar todas las líneas excepto la última del párrafo
                            if (!isLastLine && line.split(' ').length > 1) {
                                this.renderJustifiedLine(pdf, line, margin, yPosition, textWidth);
                            } else {
                                pdf.text(line, margin, yPosition);
                            }

                            yPosition += lineHeight;
                        }

                        // Espacio entre párrafos
                        yPosition += 3;
                    }

                    // Insertar imágenes después de este capítulo
                    const afterImages = bookData.images.filter(img => img.position === `after-${chapter.id}`);
                    for (const img of afterImages) {
                        pdf.addPage();
                        currentPage++;
                        try {
                            pdf.addImage(img.dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
                        } catch (e) {
                            console.warn('No se pudo agregar imagen:', e);
                        }
                    }

                    // Números de página (si están habilitados)
                    if (bookData.format.includePageNumbers) {
                        this.addPageNumbers(pdf, currentPage);
                    }
                }

                // ===== IMÁGENES AL FINAL =====
                const endImages = bookData.images.filter(img => img.position === 'end');
                for (const img of endImages) {
                    pdf.addPage();
                    currentPage++;
                    try {
                        pdf.addImage(img.dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
                    } catch (e) {
                        console.warn('No se pudo agregar imagen:', e);
                    }
                }

                // Guardar PDF
                const filename = `${bookData.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                pdf.save(filename);

                this.$store.ui.success(
                    this.$store.i18n.t('publishing.export.success'),
                    `"${this.publishingBookTitle}" ${this.$store.i18n.t('publishing.export.successMessage')}`
                );

            } catch (error) {
                console.error('Error exporting to PDF:', error);
                this.$store.ui.error(
                    this.$store.i18n.t('publishing.export.error'),
                    error.message
                );
            } finally {
                this.$store.ui.stopLoading('global');
            }
        },

        // Helper: Renderizar línea justificada
        renderJustifiedLine(pdf, line, x, y, maxWidth) {
            const words = line.split(' ');
            if (words.length === 1) {
                pdf.text(line, x, y);
                return;
            }

            const spaceWidth = pdf.getStringUnitWidth(' ') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
            const lineWidth = pdf.getStringUnitWidth(line) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
            const extraSpace = maxWidth - lineWidth + (words.length - 1) * spaceWidth;
            const spacePerGap = extraSpace / (words.length - 1);

            let currentX = x;
            words.forEach((word, i) => {
                pdf.text(word, currentX, y);
                const wordWidth = pdf.getStringUnitWidth(word) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                currentX += wordWidth + spacePerGap;
            });
        },

        // Helper: Agregar números de página
        addPageNumbers(pdf, pageNumber) {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.setFontSize(10);
            pdf.text(String(pageNumber), pageWidth / 2, pageHeight - 15, { align: 'center' });
        },

        // ===== DOCX EXPORT =====
        async exportToDOCX() {
            if (!this.publishingIsValid()) {
                this.$store.ui.warning(
                    this.$store.i18n.t('publishing.validation.warnings'),
                    this.$store.i18n.t('publishing.validation.completeRequired')
                );
                return;
            }

            this.$store.ui.startLoading('global');

            try {
                // Verificar que docx esté disponible
                if (typeof window.docx === 'undefined') {
                    throw new Error('docx no está cargado');
                }

                const { Document, Packer, Paragraph, AlignmentType, HeadingLevel } = window.docx;
                const bookData = this.prepareBookData();

                const sections = [];

                // PÁGINA DE TÍTULO
                sections.push(
                    new Paragraph({
                        text: bookData.title,
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    })
                );

                if (bookData.subtitle) {
                    sections.push(
                        new Paragraph({
                            text: bookData.subtitle,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 }
                        })
                    );
                }

                sections.push(
                    new Paragraph({
                        text: bookData.author,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 800 }
                    })
                );

                // PÁGINA DE COPYRIGHT
                sections.push(
                    new Paragraph({
                        text: bookData.copyright,
                        spacing: { before: 400, after: 800 }
                    })
                );

                // TABLA DE CONTENIDOS
                if (bookData.format.includeToC) {
                    sections.push(
                        new Paragraph({
                            text: this.$store.i18n.t('publishing.format.tableOfContents'),
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 400, after: 200 }
                        })
                    );

                    bookData.chapters.forEach(chapter => {
                        sections.push(
                            new Paragraph({
                                text: `${this.$store.i18n.t('publishing.chapters.chapter')} ${chapter.number}. ${chapter.title}`,
                                spacing: { after: 100 }
                            })
                        );
                    });
                }

                // CAPÍTULOS
                bookData.chapters.forEach(chapter => {
                    sections.push(
                        new Paragraph({
                            text: `${this.$store.i18n.t('publishing.chapters.chapter')} ${chapter.number}`,
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 800, after: 200 }
                        })
                    );

                    sections.push(
                        new Paragraph({
                            text: chapter.title,
                            heading: HeadingLevel.HEADING_2,
                            spacing: { after: 400 }
                        })
                    );

                    const content = chapter.content || this.$store.i18n.t('publishing.chapters.noContent');
                    const paragraphs = content.split(/\n\n+/);

                    paragraphs.forEach(para => {
                        if (para.trim()) {
                            sections.push(
                                new Paragraph({
                                    text: para.trim(),
                                    alignment: AlignmentType.JUSTIFIED,
                                    spacing: { after: 200 }
                                })
                            );
                        }
                    });
                });

                // Crear documento
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: sections
                    }]
                });

                // Generar y descargar
                const blob = await Packer.toBlob(doc);
                const filename = `${bookData.title.replace(/[^a-z0-9]/gi, '_')}.docx`;

                if (typeof saveAs !== 'undefined') {
                    saveAs(blob, filename);
                } else {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.click();
                    window.URL.revokeObjectURL(url);
                }

                this.$store.ui.success(
                    this.$store.i18n.t('publishing.export.success'),
                    `"${this.publishingBookTitle}" ${this.$store.i18n.t('publishing.export.successMessage')}`
                );

            } catch (error) {
                console.error('Error exporting to DOCX:', error);
                this.$store.ui.error(
                    this.$store.i18n.t('publishing.export.error'),
                    error.message
                );
            } finally {
                this.$store.ui.stopLoading('global');
            }
        },

        // ===== HELPER METHODS =====
        getPageSize() {
            const sizes = {
                // KDP Sizes
                'kdp6x9': [152.4, 228.6],
                'kdp5x8': [127, 203.2],
                'kdp5.5x8.5': [139.7, 215.9],

                // IngramSpark Sizes
                'ingram6x9': [152.4, 228.6],
                'ingram5.5x8.5': [139.7, 215.9],
                'ingramA5': 'a5',

                // Lulu Sizes
                'lulu6x9': [152.4, 228.6],
                'lulu5x8': [127, 203.2],
                'luluA5': 'a5',

                // Custom
                'A4': 'a4',
                'A5': 'a5',
                'letter': 'letter'
            };
            return sizes[this.publishingBookSize] || sizes['kdp6x9'];
        },

        getMargins() {
            const marginSizes = {
                'kdp6x9': 19, // KDP recommended for 6x9
                'kdp5x8': 16,
                'kdp5.5x8.5': 18,
                'normal': 25,
                'narrow': 15,
                'wide': 35
            };
            return marginSizes[this.publishingBookSize] || marginSizes[this.publishingMargins] || 25;
        },

        getFontName() {
            const fontMap = {
                'Garamond': 'times', // Fallback to times (similar serif)
                'Baskerville': 'times',
                'Georgia': 'times',
                'serif': 'times'
            };
            return fontMap[this.publishingFontFamily] || 'times';
        },

        /**
         * Obtener nombre de fuente personalizada con fallback
         * Usa fontLoader si está disponible
         */
        getCustomFontName() {
            // Para KDP, intentar usar Amazon Endure si está disponible
            if (this.publishingPlatform === 'kdp') {
                if (window.fontLoader && window.fontLoader.isFontAvailable('AmazonEndure')) {
                    return 'AmazonEndure';
                }
                // Fallback: Garamond si está disponible
                if (window.fontLoader && window.fontLoader.isFontAvailable('Garamond')) {
                    return 'Garamond';
                }
            }

            // Para otras plataformas, usar configuración manual
            const customFontMap = {
                'AmazonEndure': 'AmazonEndure',
                'Garamond': 'Garamond',
                'Baskerville': 'Baskerville',
                'Georgia': 'Georgia'
            };

            const requestedFont = customFontMap[this.publishingFontFamily];
            if (requestedFont && window.fontLoader && window.fontLoader.isFontAvailable(requestedFont)) {
                return requestedFont;
            }

            // Fallback final a fuentes del sistema
            return this.getFontName();
        },

        prepareBookData() {
            // Obtener capítulos seleccionados en orden
            const chapters = this.publishingSelectedChapters
                .map(id => this.$store.project.chapters.find(c => c.id === id))
                .filter(c => c)
                .sort((a, b) => (a.number || 0) - (b.number || 0));

            return {
                // Portada y metadatos
                cover: this.publishingCoverImage,
                title: this.publishingBookTitle,
                subtitle: this.publishingSubtitle,
                author: this.publishingAuthor,
                isbn: this.publishingISBN,
                publisher: this.publishingPublisher,
                year: this.publishingYear,
                description: this.publishingDescription,
                genre: this.publishingGenre,
                language: this.publishingLanguage,
                copyright: this.publishingCopyright,

                // Capítulos
                chapters: chapters,
                totalWords: this.publishingTotalWords,

                // Imágenes
                images: this.publishingBookImages,

                // Formato
                format: {
                    platform: this.publishingPlatform,
                    pageSize: this.publishingBookSize,
                    margins: this.publishingMargins,
                    fontFamily: this.publishingFontFamily,
                    fontSize: this.publishingFontSize,
                    includePageNumbers: this.publishingIncludePageNumbers,
                    includeToC: this.publishingIncludeToC
                }
            };
        }
    };
}

// Exponer para uso global
window.publishingComponent = publishingComponent;
