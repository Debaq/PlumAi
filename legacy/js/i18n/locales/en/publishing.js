// Publishing translations - English
export default {
    title: 'Publishing',
    subtitle: 'Prepare your book for publication',

    cover: {
        title: 'Cover',
        upload: 'Upload Cover',
        change: 'Change Cover',
        remove: 'Remove Cover',
        recommendation: 'Recommended: 1600x2400px (2:3 ratio)',
        preview: 'Preview',
        noCover: 'No cover'
    },

    metadata: {
        title: 'Book Information',
        bookTitle: 'Book Title',
        bookTitlePlaceholder: 'Your novel title',
        subtitle: 'Subtitle',
        subtitlePlaceholder: 'Optional subtitle',
        author: 'Author',
        authorPlaceholder: 'Your name',
        isbn: 'ISBN',
        isbnPlaceholder: 'ISBN-13 (optional)',
        publisher: 'Publisher',
        publisherPlaceholder: 'Publisher name',
        year: 'Publication Year',
        yearPlaceholder: '2025',
        description: 'Description',
        descriptionPlaceholder: 'Book synopsis...',
        genre: 'Genre',
        genrePlaceholder: 'Fantasy, Science Fiction, Romance...',
        language: 'Language',
        copyright: 'Copyright',
        copyrightPlaceholder: '© 2025 Your Name. All rights reserved.'
    },

    kdp: {
        professionalFormat: 'Professional format'
    },

    paperType: {
        label: 'Paper Type',
        cream: 'Cream Paper (recommended for fiction)',
        white: 'White Paper (for color images)'
    },

    chapters: {
        title: 'Chapter Selection',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        selected: '{count} chapters selected',
        totalWords: '{count} total words',
        orderBy: 'Order by',
        orderByNumber: 'Number',
        orderByTitle: 'Title',
        orderByDate: 'Date',
        includeInExport: 'Include in export',
        noChapters: 'No chapters to export',
        createChapter: 'Create first chapter',
        filterByStatus: 'Filter by status',
        statusAll: 'All statuses',
        statusFinal: 'Final only',
        statusReview: 'In review',
        statusDraft: 'Drafts',
        showDrafts: 'Show drafts',
        showReview: 'Show in review',
        onlyFinal: 'Only final chapters',
        available: 'available chapters',
        words: 'words',
        abbreviation: 'Ch.'
    },

    platform: {
        title: 'Publishing Platform',
        kdp: 'Amazon KDP',
        kdpDesc: 'Amazon Kindle Direct Publishing standard format',
        ingramspark: 'IngramSpark',
        ingramDesc: 'Professional distribution to bookstores',
        lulu: 'Lulu',
        luluDesc: 'Flexible self-publishing',
        custom: 'Custom',
        customDesc: 'Full manual configuration'
    },

    bookSize: {
        title: 'Book Size',
        kdp6x9: '6" x 9" (15.24 x 22.86 cm)',
        kdp6x9Desc: 'Standard size for novels - KDP',
        kdp5x8: '5" x 8" (12.7 x 20.32 cm)',
        kdp5x8Desc: 'Compact - KDP',
        kdp55x85: '5.5" x 8.5" (13.97 x 21.59 cm)',
        kdp55x85Desc: 'US Standard - KDP',
        a4: 'A4 (21 x 29.7 cm)',
        a5: 'A5 (14.8 x 21 cm)',
        letter: 'Letter (21.6 x 27.9 cm)'
    },

    images: {
        title: 'Book Images',
        addImage: 'Add Image',
        fullPage: 'Full page',
        position: 'Position in book',
        positionLabel: 'Position in book:',
        afterChapter: 'After chapter',
        beforeChapter: 'Before chapter',
        atBeginning: 'At beginning of book',
        atEnd: 'At end of book',
        reorder: 'Reorder',
        remove: 'Remove',
        noImages: 'No images added',
        insertHelp: 'You can insert images INSIDE chapters using markers',
        howToInsert: 'How to insert images inside chapters:',
        useMarkers: 'Use these markers in your chapter text:',
        fullPageDescription: 'Full page image (inserts a page)',
        inlineDescription: 'Inline image (flows with text)',
        numberHelp: 'The number corresponds to the # that appears on each image below.',
        fullPageNote: 'The image will appear on a full page',
        useMarkerNote: 'Use [IMG:X] or [INLINE-IMG:X] in the chapter text',
        positionInChapter: 'Inside chapter (use markers [IMG:X] or [INLINE-IMG:X])',
        positionFrontMatter: 'At beginning of book (Front Matter)',
        positionAfterChapter: 'After Chapter {chapter}: {title}',
        positionBackMatter: 'At end of book (Back Matter)',
        confirmDelete: 'Delete image from {name}?',
        deleted: 'Image deleted',
        sortByName: 'Name A-Z',
        generated: 'Image generated',
        updated: 'Image updated',
        viewImage: 'View: View image',
        delete: 'Delete Image',
        seedHint: '- If empty, it will be generated automatically',
        generate: 'Generate Image',
        generatedImage: 'Generated image:',
        generatedSuccessfully: 'Image generated successfully:'
    },

    format: {
        title: 'Format',
        pageSize: 'Page Size',
        pageSizeA4: 'A4 (210 x 297 mm)',
        pageSizeA5: 'A5 (148 x 210 mm)',
        pageSizeLetter: 'Letter (216 x 279 mm)',
        pageSize6x9: '6" x 9" (152 x 229 mm)',
        margins: 'Margins',
        marginsNormal: 'Normal (2.5 cm)',
        marginsNarrow: 'Narrow (1.5 cm)',
        marginsWide: 'Wide (3.5 cm)',
        fontFamily: 'Font',
        fontSize: 'Font Size',
        lineHeight: 'Line Spacing',
        lineHeightSingle: 'Single',
        lineHeight15: '1.5 lines',
        lineHeightDouble: 'Double',
        includePageNumbers: 'Include page numbers',
        includeTableOfContents: 'Include table of contents',
        includeHeader: 'Include headers',
        includeFooter: 'Include footers'
    },

    export: {
        title: 'Export',
        exportPDF: 'Export to PDF',
        exportDOCX: 'Export to DOCX',
        exportEPUB: 'Export to EPUB',
        exportDraft: 'Export Draft',
        exportFinal: 'Export Final Version',
        exporting: 'Exporting...',
        success: 'Book exported successfully',
        error: 'Error exporting book',
        preview: 'Preview',
        download: 'Download'
    },

    presets: {
        title: 'Templates',
        custom: 'Custom',
        amazonKDP: 'Amazon KDP (6x9)',
        createspace: 'CreateSpace (6x9)',
        ingramspark: 'IngramSpark (5.5x8.5)',
        lulu: 'Lulu (6x9)',
        savePreset: 'Save as template',
        loadPreset: 'Load template'
    },

    validation: {
        noCover: 'No cover added',
        noTitle: 'Book title missing',
        noAuthor: 'Author name missing',
        noChapters: 'No chapters selected',
        warnings: 'Warnings',
        ready: 'Ready to export'
    },

    frontMatter: {
        title: 'Front Matter Structure',
        description: 'Content that appears before chapters (optional)',
        otherBooks: 'Other books by the author',
        otherBooksPlaceholder: 'List of your other books (one per line)...',
        otherBooksHelp: 'Will appear on the back of the half-title page',
        dedication: 'Dedication',
        dedicationPlaceholder: 'To whom you dedicate this book...',
        dedicationHelp: 'Will appear on an ODD page after copyright',
        prologue: 'Prologue',
        prologuePlaceholder: 'Book prologue (context, introduction)...',
        prologueHelp: 'Will be professionally formatted with indentation and justification'
    },

    backMatter: {
        title: 'Back Matter Structure',
        description: 'Content that appears after chapters',
        epilogue: 'Epilogue (optional)',
        epiloguePlaceholder: 'Book epilogue (conclusion, closure)...',
        acknowledgments: 'Acknowledgments (optional)',
        acknowledgmentsPlaceholder: 'Thank editors, beta readers, family, friends...',
        aboutAuthor: 'About the Author (recommended)',
        aboutAuthorPlaceholder: '[Author Name] was born in [City, Country] in [Year]. \n\nTheir passion for [topic/genre] began at an early age, when [brief anecdote].\n\n[Achievements, relevant experiences, other works]\n\n[Name] currently lives in [City] with [family/pets]. This is their [number] published novel.',
        authorPhoto: 'Author Photo (optional)',
        uploadPhoto: 'Upload photo',
        photoHelp: 'Recommended: square, minimum 300x300px',
        contactInfo: 'Contact Information (optional)',
        websitePlaceholder: 'Website: www.yourauthor.com',
        socialPlaceholder: 'Social media: @yourauthor on Twitter/Instagram',
        newsletterPlaceholder: 'Newsletter: Subscribe at www.yourauthor.com/newsletter',
        contactInfoHelp: 'Will appear at the end of "About the Author"'
    }
};
