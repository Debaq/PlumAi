// Publishing Component para Alpine.js
function publishingComponent() {
    return {
        // ===== PLATFORM & TEMPLATE (KDP ONLY) =====
        publishingPlatform: 'kdp',
        publishingBookSize: 'kdp6x9',
        publishingPaperType: 'cream', // 'cream' o 'white'

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
        publishingBookImages: [], // { id, file, dataUrl, position, number }

        // ===== FRONT MATTER (Estructura preliminar) =====
        publishingIncludeHalfTitle: true,
        publishingOtherBooks: '', // Lista de otros libros del autor
        publishingDedication: '', // Dedicatoria
        publishingAuthorNote: '', // Nota del autor (inicial)
        publishingPrologue: '', // Prólogo

        // ===== BACK MATTER (Estructura final) =====
        publishingEpilogue: '', // Epílogo
        publishingAuthorNoteFinal: '', // Nota del autor final
        publishingAcknowledgments: '', // Agradecimientos
        publishingAboutAuthor: '', // Sobre el autor
        publishingAuthorPhoto: null, // Foto del autor
        publishingContactInfo: {
            website: '',
            social: '',
            newsletter: ''
        },

        // ===== FORMAT SETTINGS (KDP Specs) =====
        publishingIncludePageNumbers: true,
        publishingIncludeToC: true,
        publishingIncludeHeaders: true,

        // KDP-specific defaults (Amazon Endure, 11pt, interlineado 1.3)
        publishingPageSize: '6x9',
        publishingFontFamily: 'AmazonEndure',
        publishingFontSize: '11', // KDP recomienda 11pt
        publishingLineHeight: 1.3, // Interlineado 1.3 según specs
        publishingParagraphIndent: 7.62, // 0.3" = 7.62mm

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
            // Solo KDP - especificaciones profesionales
            this.publishingFontFamily = 'AmazonEndure';
            this.publishingFontSize = '11';
            this.publishingLineHeight = 1.3;
            this.publishingIncludePageNumbers = true;
            this.publishingIncludeToC = true;
            this.publishingIncludeHeaders = true;
        },

        /**
         * Calcular márgenes según grosor del libro (especificación KDP)
         * Basado en conteo de páginas estimado
         */
        getKDPMargins(estimatedPages) {
            // Convertir a pulgadas (usaremos mm luego)
            let gutterInches, outerInches, topInches, bottomInches;

            if (estimatedPages <= 150) {
                gutterInches = 0.375;
                outerInches = 0.375;
            } else if (estimatedPages <= 300) {
                gutterInches = 0.5;
                outerInches = 0.375;
            } else if (estimatedPages <= 500) {
                gutterInches = 0.625;
                outerInches = 0.375;
            } else if (estimatedPages <= 700) {
                gutterInches = 0.75;
                outerInches = 0.375;
            } else {
                // 701-828 páginas (máximo papel crema)
                gutterInches = 0.875;
                outerInches = 0.375;
            }

            topInches = 0.625;
            bottomInches = 0.625;

            // Convertir a mm
            return {
                gutter: gutterInches * 25.4,
                outer: outerInches * 25.4,
                top: topInches * 25.4,
                bottom: bottomInches * 25.4
            };
        },

        /**
         * Estimar número de páginas basado en palabras
         * Aproximación: 250-300 palabras por página para 6x9
         */
        estimatePageCount() {
            const wordsPerPage = 280; // Promedio para Amazon Endure 11pt
            return Math.ceil(this.publishingTotalWords / wordsPerPage);
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
                    // Auto-asignar el siguiente número disponible
                    const existingNumbers = this.publishingBookImages
                        .map(img => img.number)
                        .filter(n => n !== undefined && n !== null);
                    const nextNumber = existingNumbers.length > 0
                        ? Math.max(...existingNumbers) + 1
                        : 1;

                    this.publishingBookImages.push({
                        id: imageId,
                        file: file,
                        dataUrl: e.target.result,
                        position: 'beginning', // 'beginning', 'end', 'after-chapterX', 'in-chapter'
                        number: nextNumber // Número para marcadores [IMG:X] o [INLINE-IMG:X]
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

        // ===== AUTHOR PHOTO METHODS =====
        handleAuthorPhotoUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.publishingAuthorPhoto = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                this.$store.ui.error(
                    this.$store.i18n.t('common.error'),
                    'Por favor selecciona una imagen válida para la foto del autor'
                );
            }
        },

        removeAuthorPhoto() {
            this.publishingAuthorPhoto = null;
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
                if (typeof window.jspdf === 'undefined') {
                    throw new Error('jsPDF no está cargado');
                }

                const { jsPDF } = window.jspdf;
                const bookData = this.prepareBookData();

                // Cargar fuentes personalizadas
                if (window.fontLoader && !window.fontLoader.loaded) {
                    await window.fontLoader.loadDefaultFonts();
                }

                // Crear PDF con configuración KDP profesional
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: this.getPageSize(),
                    putOnlyUsedFonts: true,
                    compress: true
                });

                if (window.fontLoader) {
                    window.fontLoader.applyFonts(pdf);
                }

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                // Estimar páginas y calcular márgenes dinámicos KDP
                const estimatedPages = this.estimatePageCount();
                const margins = this.getKDPMargins(estimatedPages);

                // Interlineado basado en especificaciones KDP (11pt * 1.3 = 14.3pt ≈ 5.04mm)
                const fontSize = parseInt(this.publishingFontSize);
                const lineHeight = fontSize * this.publishingLineHeight * 0.3528; // pt a mm

                const fontName = this.getCustomFontName();

                // Sistema de seguimiento de páginas
                let pageNumber = 0; // Número físico de página
                let contentPageNumber = 1; // Número que se muestra (inicia en capítulo 1)
                let isOddPage = true; // Control de páginas impares/pares

                // Páginas que NO deben tener números ni encabezados
                const pagesMeta = {}; // { pageNum: { showNumber: bool, showHeader: bool, isChapterStart: bool } }

                // ===== HELPER: Agregar página con control impar/par =====
                const addPage = (forceOdd = false) => {
                    if (pageNumber > 0) {
                        if (forceOdd && !isOddPage) {
                            // Agregar página en blanco para llegar a impar
                            pdf.addPage();
                            pageNumber++;
                            pagesMeta[pageNumber] = { showNumber: false, showHeader: false, blank: true };
                            isOddPage = true;
                        }
                        pdf.addPage();
                    }
                    pageNumber++;
                    isOddPage = !isOddPage;
                    return pageNumber;
                };

                // ===== HELPER: Obtener márgenes según página par/impar =====
                const getMargins = (currentPageNum) => {
                    const isPageOdd = (currentPageNum % 2 === 1);
                    if (isPageOdd) {
                        // Página IMPAR (derecha): margen izquierdo = gutter
                        return {
                            left: margins.gutter,
                            right: margins.outer,
                            top: margins.top,
                            bottom: margins.bottom
                        };
                    } else {
                        // Página PAR (izquierda): margen derecho = gutter
                        return {
                            left: margins.outer,
                            right: margins.gutter,
                            top: margins.top,
                            bottom: margins.bottom
                        };
                    }
                };

                // ===== HELPER: Renderizar texto en párrafo con sangría =====
                const renderParagraph = (pdf, text, margins, yPos, isFirstParagraph = false) => {
                    const textWidth = pageWidth - margins.left - margins.right;
                    const indentMM = isFirstParagraph ? 0 : this.publishingParagraphIndent; // Primera línea sin sangría

                    const lines = pdf.splitTextToSize(text.trim(), textWidth - indentMM);
                    let currentY = yPos;

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const xPos = margins.left + (i === 0 ? indentMM : 0);

                        // Verificar espacio disponible (control de viudas/huérfanas)
                        if (i === 0 && lines.length > 1) {
                            // Primera línea: necesitamos al menos 2 líneas en esta página
                            if (currentY + lineHeight * 2 > pageHeight - margins.bottom) {
                                return { y: currentY, needsNewPage: true, remainingLines: lines };
                            }
                        }

                        if (currentY + lineHeight > pageHeight - margins.bottom) {
                            return { y: currentY, needsNewPage: true, remainingLines: lines.slice(i) };
                        }

                        // Justificar todas las líneas excepto la última
                        const isLastLine = i === lines.length - 1;
                        if (!isLastLine && line.split(' ').length > 1) {
                            this.renderJustifiedLine(pdf, line, xPos, currentY, textWidth - (i === 0 ? indentMM : 0));
                        } else {
                            pdf.text(line, xPos, currentY);
                        }

                        currentY += lineHeight;
                    }

                    return { y: currentY, needsNewPage: false };
                };

                // ===== PORTADA (solo si hay imagen) =====
                if (bookData.cover) {
                    try {
                        addPage();
                        pdf.addImage(bookData.cover, 'JPEG', 0, 0, pageWidth, pageHeight);
                        pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                    } catch (e) {
                        console.warn('No se pudo agregar la portada:', e);
                    }
                }

                // ===== FRONT MATTER =====

                // Página en blanco inicial
                addPage();
                pagesMeta[pageNumber] = { showNumber: false, showHeader: false, blank: true };

                // Portadilla (Half-Title) - IMPAR
                addPage(true);
                let m = getMargins(pageNumber);
                pdf.setFont(fontName, 'normal');
                pdf.setFontSize(24);
                pdf.text(bookData.title, pageWidth / 2, pageHeight / 3, { align: 'center' });
                pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

                // Reverso portadilla (otros libros o en blanco) - PAR
                addPage();
                if (this.publishingOtherBooks && this.publishingOtherBooks.trim()) {
                    m = getMargins(pageNumber);
                    pdf.setFontSize(14);
                    pdf.text(`Otros libros de ${bookData.author}:`, pageWidth / 2, m.top + 20, { align: 'center' });
                    pdf.setFontSize(11);
                    const otherBooksLines = pdf.splitTextToSize(this.publishingOtherBooks, pageWidth - m.left - m.right);
                    pdf.text(otherBooksLines, pageWidth / 2, m.top + 35, { align: 'center' });
                }
                pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

                // Portada (Title Page) - IMPAR
                addPage(true);
                m = getMargins(pageNumber);
                let yPos = pageHeight / 3;
                pdf.setFontSize(28);
                pdf.text(bookData.title, pageWidth / 2, yPos, { align: 'center' });
                yPos += 15;

                if (bookData.subtitle) {
                    pdf.setFontSize(16);
                    pdf.text(bookData.subtitle, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 12;
                }

                yPos += 10;
                pdf.setFontSize(18);
                pdf.text(bookData.author, pageWidth / 2, yPos, { align: 'center' });

                yPos += 20;
                if (bookData.publisher) {
                    pdf.setFontSize(14);
                    pdf.text(bookData.publisher, pageWidth / 2, yPos, { align: 'center' });
                }
                pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

                // Página de Copyright - PAR (reverso de portada)
                addPage();
                m = getMargins(pageNumber);
                yPos = m.top + 40;
                pdf.setFontSize(9);
                pdf.setFont(fontName, 'normal');

                const copyrightText = `Copyright © ${bookData.year} por ${bookData.author}

Todos los derechos reservados. Ninguna parte de este libro puede ser reproducida, almacenada en un sistema de recuperación, o transmitida de cualquier forma o por cualquier medio, electrónico, mecánico, fotocopia, grabación o de otro tipo, sin el permiso previo por escrito del autor, excepto en el caso de breves citas incorporadas en reseñas críticas y ciertos otros usos no comerciales permitidos por la ley de derechos de autor.

${bookData.genre === 'ficción' || bookData.genre === 'Ficción' ? 'Esta es una obra de ficción. Los nombres, personajes, lugares e incidentes son producto de la imaginación del autor o se utilizan de manera ficticia. Cualquier parecido con personas reales, vivas o muertas, eventos o locales es pura coincidencia.' : ''}

${bookData.publisher || ''}

Primera edición: ${bookData.year}

${bookData.isbn ? 'ISBN: ' + bookData.isbn + ' (paperback)' : ''}`;

                const copyrightLines = pdf.splitTextToSize(copyrightText, pageWidth - m.left - m.right);
                pdf.text(copyrightLines, m.left, yPos);
                pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

                // Dedicatoria (si existe) - IMPAR
                if (this.publishingDedication && this.publishingDedication.trim()) {
                    addPage(true);
                    m = getMargins(pageNumber);
                    yPos = pageHeight / 3;
                    pdf.setFontSize(14);
                    pdf.text('DEDICATORIA', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 15;
                    pdf.setFontSize(11);
                    pdf.setFont(fontName, 'italic');
                    const dedicationLines = pdf.splitTextToSize(this.publishingDedication, pageWidth - m.left - m.right - 40);
                    pdf.text(dedicationLines, pageWidth / 2, yPos, { align: 'center' });
                    pdf.setFont(fontName, 'normal');
                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                }

                // Tabla de Contenidos - IMPAR
                if (bookData.format.includeToC && bookData.chapters.length > 0) {
                    addPage(true);
                    m = getMargins(pageNumber);
                    yPos = m.top;

                    pdf.setFontSize(18);
                    pdf.setFont(fontName, 'bold');
                    pdf.text('CONTENIDO', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 15;

                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(11);

                    bookData.chapters.forEach((chapter) => {
                        if (yPos > pageHeight - m.bottom - 10) {
                            addPage();
                            m = getMargins(pageNumber);
                            yPos = m.top;
                        }
                        const chapterLine = `Capítulo ${chapter.number}. ${chapter.title}`;
                        pdf.text(chapterLine, m.left + 5, yPos);
                        yPos += 8;
                    });
                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                }

                // Prólogo (si existe) - IMPAR
                if (this.publishingPrologue && this.publishingPrologue.trim()) {
                    addPage(true);
                    m = getMargins(pageNumber);
                    yPos = m.top;

                    pdf.setFontSize(18);
                    pdf.setFont(fontName, 'bold');
                    pdf.text('PRÓLOGO', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 15;

                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(fontSize);

                    const prologueParas = this.publishingPrologue.split(/\n\n+/);
                    let isFirst = true;
                    for (const para of prologueParas) {
                        if (!para.trim()) continue;
                        const result = renderParagraph(pdf, para, m, yPos, isFirst);
                        if (result.needsNewPage) {
                            addPage();
                            m = getMargins(pageNumber);
                            yPos = m.top;
                            const retryResult = renderParagraph(pdf, para, m, yPos, false);
                            yPos = retryResult.y + 3;
                        } else {
                            yPos = result.y + 3;
                        }
                        isFirst = false;
                    }
                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                }

                // ===== CAPÍTULOS =====
                // A partir de aquí comienza la numeración de páginas con números arábigos
                contentPageNumber = 1;

                for (let i = 0; i < bookData.chapters.length; i++) {
                    const chapter = bookData.chapters[i];

                    // Cada capítulo comienza en página IMPAR
                    addPage(true);
                    const chapterStartPage = pageNumber;
                    m = getMargins(pageNumber);
                    yPos = m.top;

                    // Espacio superior (25% de la página)
                    yPos = pageHeight * 0.25;

                    // Número del capítulo
                    pdf.setFontSize(48);
                    pdf.setFont(fontName, 'bold');
                    pdf.text(`CAPÍTULO ${chapter.number}`, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 10;

                    // Nombre del capítulo
                    pdf.setFontSize(18);
                    pdf.text(chapter.title, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 20;

                    // Configurar para contenido
                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(fontSize);

                    // Primera página del capítulo no lleva número ni encabezado
                    pagesMeta[chapterStartPage] = {
                        showNumber: false,
                        showHeader: false,
                        isChapterStart: true,
                        chapterTitle: chapter.title
                    };

                    // Procesar contenido
                    const content = chapter.content || 'Sin contenido';
                    const paragraphs = content.split(/\n\n+/);

                    let isFirstParagraph = true;
                    for (let paragraph of paragraphs) {
                        if (!paragraph.trim()) continue;

                        // Detectar saltos de escena (###, ***, etc.)
                        if (paragraph.trim() === '###' || paragraph.trim() === '***') {
                            yPos += lineHeight;
                            pdf.text(paragraph.trim(), pageWidth / 2, yPos, { align: 'center' });
                            yPos += lineHeight * 2;
                            isFirstParagraph = true; // Después de salto de escena, no hay sangría
                            continue;
                        }

                        // Detectar marcadores de imagen de página completa [IMG:X]
                        const fullPageImageMatch = paragraph.match(/^\[IMG:(\d+)\]$/);
                        if (fullPageImageMatch) {
                            const imageNumber = parseInt(fullPageImageMatch[1]);
                            const image = bookData.images.find(img => img.number === imageNumber);

                            if (image) {
                                // Agregar página para imagen completa
                                addPage();
                                m = getMargins(pageNumber);

                                try {
                                    // Insertar imagen a página completa con márgenes
                                    const imgWidth = pageWidth - m.left - m.right;
                                    const imgHeight = pageHeight - m.top - m.bottom;
                                    pdf.addImage(image.dataUrl, 'JPEG', m.left, m.top, imgWidth, imgHeight);
                                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                                } catch (e) {
                                    console.warn(`No se pudo agregar imagen ${imageNumber}:`, e);
                                }

                                // Continuar en nueva página
                                addPage();
                                m = getMargins(pageNumber);
                                yPos = m.top;
                                pagesMeta[pageNumber] = {
                                    showNumber: true,
                                    showHeader: true,
                                    chapterTitle: chapter.title
                                };
                                isFirstParagraph = true;
                            }
                            continue;
                        }

                        // Procesar párrafo con posibles marcadores de imagen en línea [INLINE-IMG:X]
                        const inlineImageRegex = /\[INLINE-IMG:(\d+)\]/g;
                        const parts = paragraph.split(inlineImageRegex);

                        for (let i = 0; i < parts.length; i++) {
                            const part = parts[i];

                            // Si el índice es impar, es un número de imagen
                            if (i % 2 === 1) {
                                const imageNumber = parseInt(part);
                                const image = bookData.images.find(img => img.number === imageNumber);

                                if (image) {
                                    try {
                                        // Calcular tamaño de imagen para inserción en línea
                                        const maxImgWidth = (pageWidth - m.left - m.right) * 0.6; // 60% del ancho
                                        const maxImgHeight = 40; // 40mm max altura

                                        // Verificar si hay espacio en la página actual
                                        if (yPos + maxImgHeight > pageHeight - m.bottom) {
                                            addPage();
                                            m = getMargins(pageNumber);
                                            yPos = m.top;
                                            pagesMeta[pageNumber] = {
                                                showNumber: true,
                                                showHeader: true,
                                                chapterTitle: chapter.title
                                            };
                                        }

                                        // Centrar imagen en línea
                                        const xPos = pageWidth / 2 - maxImgWidth / 2;
                                        pdf.addImage(image.dataUrl, 'JPEG', xPos, yPos, maxImgWidth, maxImgHeight);
                                        yPos += maxImgHeight + 5;
                                    } catch (e) {
                                        console.warn(`No se pudo agregar imagen en línea ${imageNumber}:`, e);
                                    }
                                }
                            } else if (part.trim()) {
                                // Renderizar texto normal
                                const result = renderParagraph(pdf, part, m, yPos, isFirstParagraph);

                                if (result.needsNewPage) {
                                    addPage();
                                    m = getMargins(pageNumber);
                                    yPos = m.top;
                                    pagesMeta[pageNumber] = {
                                        showNumber: true,
                                        showHeader: true,
                                        chapterTitle: chapter.title
                                    };
                                    const retryResult = renderParagraph(pdf, part, m, yPos, false);
                                    yPos = retryResult.y + 3;
                                } else {
                                    yPos = result.y + 3;
                                }

                                isFirstParagraph = false;
                            }
                        }
                    }
                }

                // ===== BACK MATTER =====

                // Epílogo (si existe) - IMPAR
                if (this.publishingEpilogue && this.publishingEpilogue.trim()) {
                    addPage(true);
                    m = getMargins(pageNumber);
                    yPos = m.top;

                    pdf.setFontSize(18);
                    pdf.setFont(fontName, 'bold');
                    pdf.text('EPÍLOGO', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 15;

                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(fontSize);

                    const epilogueParas = this.publishingEpilogue.split(/\n\n+/);
                    let isFirst = true;
                    for (const para of epilogueParas) {
                        if (!para.trim()) continue;
                        const result = renderParagraph(pdf, para, m, yPos, isFirst);
                        if (result.needsNewPage) {
                            addPage();
                            m = getMargins(pageNumber);
                            yPos = m.top;
                            const retryResult = renderParagraph(pdf, para, m, yPos, false);
                            yPos = retryResult.y + 3;
                        } else {
                            yPos = result.y + 3;
                        }
                        isFirst = false;
                    }
                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                }

                // Agradecimientos (si existen) - IMPAR
                if (this.publishingAcknowledgments && this.publishingAcknowledgments.trim()) {
                    addPage(true);
                    m = getMargins(pageNumber);
                    yPos = m.top;

                    pdf.setFontSize(18);
                    pdf.setFont(fontName, 'bold');
                    pdf.text('AGRADECIMIENTOS', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 15;

                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(fontSize);

                    const ackParas = this.publishingAcknowledgments.split(/\n\n+/);
                    for (const para of ackParas) {
                        if (!para.trim()) continue;
                        const result = renderParagraph(pdf, para, m, yPos, false);
                        if (result.needsNewPage) {
                            addPage();
                            m = getMargins(pageNumber);
                            yPos = m.top;
                            const retryResult = renderParagraph(pdf, para, m, yPos, false);
                            yPos = retryResult.y + 3;
                        } else {
                            yPos = result.y + 3;
                        }
                    }
                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                }

                // Sobre el Autor (OBLIGATORIO) - IMPAR
                if (this.publishingAboutAuthor && this.publishingAboutAuthor.trim()) {
                    addPage(true);
                    m = getMargins(pageNumber);
                    yPos = m.top;

                    pdf.setFontSize(18);
                    pdf.setFont(fontName, 'bold');
                    pdf.text('SOBRE EL AUTOR', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 15;

                    // Foto del autor (si existe)
                    if (this.publishingAuthorPhoto) {
                        try {
                            const photoSize = 30; // 30mm
                            pdf.addImage(this.publishingAuthorPhoto, 'JPEG',
                                pageWidth / 2 - photoSize / 2, yPos, photoSize, photoSize);
                            yPos += photoSize + 10;
                        } catch (e) {
                            console.warn('No se pudo agregar foto del autor:', e);
                        }
                    }

                    pdf.setFont(fontName, 'normal');
                    pdf.setFontSize(fontSize);

                    const aboutParas = this.publishingAboutAuthor.split(/\n\n+/);
                    for (const para of aboutParas) {
                        if (!para.trim()) continue;
                        const result = renderParagraph(pdf, para, m, yPos, false);
                        if (result.needsNewPage) {
                            addPage();
                            m = getMargins(pageNumber);
                            yPos = m.top;
                            const retryResult = renderParagraph(pdf, para, m, yPos, false);
                            yPos = retryResult.y + 3;
                        } else {
                            yPos = result.y + 3;
                        }
                    }

                    // Información de contacto
                    if (this.publishingContactInfo.website || this.publishingContactInfo.social) {
                        yPos += 10;
                        pdf.setFontSize(10);
                        if (this.publishingContactInfo.website) {
                            pdf.text(`Sitio web: ${this.publishingContactInfo.website}`, pageWidth / 2, yPos, { align: 'center' });
                            yPos += 6;
                        }
                        if (this.publishingContactInfo.social) {
                            pdf.text(this.publishingContactInfo.social, pageWidth / 2, yPos, { align: 'center' });
                            yPos += 6;
                        }
                        if (this.publishingContactInfo.newsletter) {
                            pdf.text(this.publishingContactInfo.newsletter, pageWidth / 2, yPos, { align: 'center' });
                        }
                    }

                    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
                }

                // ===== AGREGAR NÚMEROS DE PÁGINA Y ENCABEZADOS =====
                if (bookData.format.includePageNumbers || bookData.format.includeHeaders) {
                    const totalPages = pdf.internal.getNumberOfPages();

                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        const meta = pagesMeta[i] || { showNumber: true, showHeader: true };
                        m = getMargins(i);

                        // Encabezados (solo en páginas que no sean primera de capítulo)
                        if (bookData.format.includeHeaders && meta.showHeader) {
                            pdf.setFontSize(9);
                            pdf.setFont(fontName, 'normal');

                            const isPageOdd = (i % 2 === 1);
                            if (isPageOdd) {
                                // Página IMPAR: nombre del libro (derecha)
                                pdf.text(bookData.title.toUpperCase(), pageWidth - m.right, m.top - 5, { align: 'right' });
                            } else {
                                // Página PAR: nombre del capítulo (izquierda)
                                const chapterName = meta.chapterTitle ? meta.chapterTitle.toUpperCase() : bookData.author.toUpperCase();
                                pdf.text(chapterName, m.left, m.top - 5);
                            }
                        }

                        // Números de página (solo en páginas que corresponda)
                        if (bookData.format.includePageNumbers && meta.showNumber && i >= contentPageNumber) {
                            pdf.setFontSize(10);
                            pdf.setFont(fontName, 'normal');
                            pdf.text(String(i - contentPageNumber + 1), pageWidth / 2, pageHeight - 15, { align: 'center' });
                        }
                    }
                }

                // Guardar PDF
                const filename = `${bookData.title.replace(/[^a-z0-9]/gi, '_')}_KDP.pdf`;
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

                // Front Matter
                frontMatter: {
                    includeHalfTitle: this.publishingIncludeHalfTitle,
                    otherBooks: this.publishingOtherBooks,
                    dedication: this.publishingDedication,
                    authorNote: this.publishingAuthorNote,
                    prologue: this.publishingPrologue
                },

                // Back Matter
                backMatter: {
                    epilogue: this.publishingEpilogue,
                    authorNoteFinal: this.publishingAuthorNoteFinal,
                    acknowledgments: this.publishingAcknowledgments,
                    aboutAuthor: this.publishingAboutAuthor,
                    authorPhoto: this.publishingAuthorPhoto,
                    contactInfo: this.publishingContactInfo
                },

                // Formato KDP
                format: {
                    platform: this.publishingPlatform,
                    paperType: this.publishingPaperType,
                    pageSize: this.publishingBookSize,
                    fontFamily: this.publishingFontFamily,
                    fontSize: this.publishingFontSize,
                    lineHeight: this.publishingLineHeight,
                    paragraphIndent: this.publishingParagraphIndent,
                    includePageNumbers: this.publishingIncludePageNumbers,
                    includeToC: this.publishingIncludeToC,
                    includeHeaders: this.publishingIncludeHeaders
                }
            };
        }
    };
}

// Exponer para uso global
window.publishingComponent = publishingComponent;
