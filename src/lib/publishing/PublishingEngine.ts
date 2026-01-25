import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import type { Project } from '@/types/domain';

export interface PublishingOptions {
  platform: 'kdp' | 'custom';
  bookSize: string;
  paperType: 'cream' | 'white';
  includePageNumbers: boolean;
  includeToC: boolean;
  includeHeaders: boolean;
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  paragraphIndent: number;
  selectedChapters: string[];
  
  // Metadata
  title: string;
  subtitle: string;
  author: string;
  isbn: string;
  publisher: string;
  year: string;
  description: string;
  genre: string;
  language: string;
  copyright: string;

  // Front Matter
  includeHalfTitle: boolean;
  otherBooks: string;
  dedication: string;
  authorNote: string;
  prologue: string;

  // Back Matter
  epilogue: string;
  authorNoteFinal: string;
  acknowledgments: string;
  aboutAuthor: string;
  authorPhoto: string | null;
  contactInfo: {
    website: string;
    social: string;
    newsletter: string;
  };

  // Images
  coverImage: string | null;
  bookImages: any[]; // { id, dataUrl, position, number }
  labels?: {
    chapter?: string;
    toc?: string;
    copyright?: string;
  };
}

export const PublishingEngine = {
  async loadFonts(pdf: jsPDF) {
    try {
      const fonts = [
        { name: 'AmazonEndure', style: 'normal', path: '/fonts/Amazon Endure font EN/AmazonEndure-Book.otf' },
        { name: 'AmazonEndure', style: 'bold', path: '/fonts/Amazon Endure font EN/AmazonEndure-SemiBold.otf' },
        { name: 'AmazonEndure', style: 'italic', path: '/fonts/Amazon Endure font EN/AmazonEndure-BookItalic.otf' },
      ];

      for (const font of fonts) {
        try {
          const response = await fetch(font.path);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
          });
          pdf.addFileToVFS(`${font.name}-${font.style}.otf`, base64);
          pdf.addFont(`${font.name}-${font.style}.otf`, font.name, font.style);
        } catch (e) {
          console.warn(`Could not load font ${font.name}-${font.style}`);
        }
      }
      return true;
    } catch (e) {
      console.error('Error loading fonts:', e);
      return false;
    }
  },

  async exportToPdf(project: Project, options: PublishingOptions) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: this.getPageSize(options.bookSize),
      putOnlyUsedFonts: true,
      compress: true
    });

    await this.loadFonts(pdf);
    let fontName = pdf.getFontList().hasOwnProperty('AmazonEndure') ? 'AmazonEndure' : 'times';

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Estimate pages for margins
    const totalWords = this.calculateTotalWords(project, options.selectedChapters);
    const estimatedPages = Math.ceil(totalWords / 280);
    const margins = this.getKDPMargins(estimatedPages);

    const fontSize = parseInt(options.fontSize);
    const lineHeightMM = fontSize * options.lineHeight * 0.3528;

    let pageNumber = 0;
    let contentPageNumber = 1;
    let isOddPage = true;
    const pagesMeta: Record<number, any> = {};

    const addPage = (forceOdd = false) => {
      if (pageNumber > 0) {
        if (forceOdd && !isOddPage) {
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

    const getPageMargins = (pageNum: number) => {
      const isPageOdd = pageNum % 2 === 1;
      return isPageOdd 
        ? { left: margins.gutter, right: margins.outer, top: margins.top, bottom: margins.bottom }
        : { left: margins.outer, right: margins.gutter, top: margins.top, bottom: margins.bottom };
    };

    const renderJustifiedLine = (doc: jsPDF, line: string, x: number, y: number, maxWidth: number) => {
      const words = line.split(' ');
      if (words.length === 1) {
        doc.text(line, x, y);
        return;
      }

      const lineWidth = doc.getStringUnitWidth(line) * doc.getFontSize() / (doc as any).internal.scaleFactor;
      const extraSpace = maxWidth - lineWidth;
      const spacePerGap = extraSpace / (words.length - 1);

      let currentX = x;
      words.forEach((word) => {
        doc.text(word, currentX, y);
        const wordWidth = doc.getStringUnitWidth(word) * doc.getFontSize() / (doc as any).internal.scaleFactor;
        currentX += wordWidth + (doc.getStringUnitWidth(' ') * doc.getFontSize() / (doc as any).internal.scaleFactor) + spacePerGap;
      });
    };

    const renderParagraph = (doc: jsPDF, text: string, m: any, yPos: number, isFirst = false) => {
      const textWidth = pageWidth - m.left - m.right;
      const indent = isFirst ? 0 : options.paragraphIndent;
      
      const lines = doc.splitTextToSize(text.trim(), textWidth - indent);
      let currentY = yPos;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const xPos = m.left + (i === 0 ? indent : 0);

        if (currentY + lineHeightMM > pageHeight - m.bottom) {
          return { y: currentY, needsNewPage: true, remainingLines: lines.slice(i) };
        }

        const isLastLine = i === lines.length - 1;
        if (!isLastLine && line.split(' ').length > 1) {
          renderJustifiedLine(doc, line, xPos, currentY, textWidth - (i === 0 ? indent : 0));
        } else {
          doc.text(line, xPos, currentY);
        }
        currentY += lineHeightMM;
      }
      return { y: currentY, needsNewPage: false };
    };

    // 1. Cover
    if (options.coverImage) {
      addPage();
      pdf.addImage(options.coverImage, 'JPEG', 0, 0, pageWidth, pageHeight);
      pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
    }

    // 2. Front Matter
    addPage();
    pagesMeta[pageNumber] = { showNumber: false, showHeader: false, blank: true };

    // Portadilla
    addPage(true);
    let m = getPageMargins(pageNumber);
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(24);
    pdf.text(options.title, pageWidth / 2, pageHeight / 3, { align: 'center' });
    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

    // Reverso portadilla (Other Books)
    addPage();
    if (options.otherBooks) {
      m = getPageMargins(pageNumber);
      pdf.setFontSize(14);
      pdf.text(`Otros libros de ${options.author}:`, pageWidth / 2, m.top + 20, { align: 'center' });
      pdf.setFontSize(11);
      pdf.text(pdf.splitTextToSize(options.otherBooks, pageWidth - m.left - m.right), pageWidth / 2, m.top + 35, { align: 'center' });
    }
    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

    // Title Page
    addPage(true);
    m = getPageMargins(pageNumber);
    let y = pageHeight / 3;
    pdf.setFontSize(28);
    pdf.text(options.title, pageWidth / 2, y, { align: 'center' });
    y += 15;
    if (options.subtitle) {
      pdf.setFontSize(16);
      pdf.text(options.subtitle, pageWidth / 2, y, { align: 'center' });
      y += 12;
    }
    y += 10;
    pdf.setFontSize(18);
    pdf.text(options.author, pageWidth / 2, y, { align: 'center' });
    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

    // Copyright
    addPage();
    m = getPageMargins(pageNumber);
    pdf.setFontSize(9);
    const copyrightLabel = options.labels?.copyright || 'Copyright';
    const copyrightText = options.copyright || `${copyrightLabel} © ${options.year} ${options.author}. Todos los derechos reservados.\n\n${options.publisher || ''}\n\nPrimera edición: ${options.year}\n\n${options.isbn ? 'ISBN: ' + options.isbn : ''}`;
    pdf.text(pdf.splitTextToSize(copyrightText, pageWidth - m.left - m.right), m.left, m.top + 40);
    pagesMeta[pageNumber] = { showNumber: false, showHeader: false };

    // Dedication
    if (options.dedication) {
      addPage(true);
      m = getPageMargins(pageNumber);
      pdf.setFontSize(12);
      pdf.setFont(fontName, 'italic');
      pdf.text(pdf.splitTextToSize(options.dedication, pageWidth - m.left - m.right - 40), pageWidth / 2, pageHeight / 3, { align: 'center' });
      pdf.setFont(fontName, 'normal');
      pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
    }

    // Table of Contents
    const selectedChapters = project.chapters
      .filter(ch => options.selectedChapters.includes(ch.id))
      .sort((a, b) => (a.number || 0) - (b.number || 0));

    if (options.includeToC && selectedChapters.length > 0) {
      addPage(true);
      m = getPageMargins(pageNumber);
      let currentY = m.top;
      pdf.setFontSize(18);
      pdf.setFont(fontName, 'bold');
      pdf.text(options.labels?.toc || 'CONTENIDO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(11);
      selectedChapters.forEach((ch) => {
        pdf.text(`Capítulo ${ch.number}. ${ch.title}`, m.left + 5, currentY);
        currentY += 8;
      });
      pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
    }

    // Prologue
    if (options.prologue) {
      addPage(true);
      m = getPageMargins(pageNumber);
      let currentY = m.top;
      pdf.setFontSize(18);
      pdf.setFont(fontName, 'bold');
      pdf.text('PRÓLOGO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(fontSize);
      const prologueParas = options.prologue.split(/\n\n+/);
      let isFirst = true;
      for (const para of prologueParas) {
        const res = renderParagraph(pdf, para, m, currentY, isFirst);
        if (res.needsNewPage) {
          addPage();
          m = getPageMargins(pageNumber);
          currentY = m.top;
          const retry = renderParagraph(pdf, para, m, currentY, false);
          currentY = retry.y + 3;
        } else {
          currentY = res.y + 3;
        }
        isFirst = false;
      }
      pagesMeta[pageNumber] = { showNumber: false, showHeader: false };
    }

    contentPageNumber = pageNumber + 1;
    const chapterLabel = (options.labels?.chapter || 'CHAPTER').toUpperCase();

    for (const chapter of selectedChapters) {
      addPage(true);
      const chapterStartPage = pageNumber;
      m = getPageMargins(pageNumber);
      
      pdf.setFontSize(36);
      pdf.setFont(fontName, 'bold');
      pdf.text(`${chapterLabel} ${chapter.number}`, pageWidth / 2, pageHeight * 0.25, { align: 'center' });
      pdf.setFontSize(18);
      pdf.text(chapter.title, pageWidth / 2, pageHeight * 0.25 + 15, { align: 'center' });
      
      pagesMeta[chapterStartPage] = { showNumber: false, showHeader: false, isChapterStart: true, chapterTitle: chapter.title };
      
      pdf.setFont(fontName, 'normal');
      pdf.setFontSize(fontSize);
      
      let currentY = pageHeight * 0.25 + 40;
      const paragraphs = chapter.content.replace(/<[^>]+>/g, '\n').split(/\n\n+/);
      
      let isFirst = true;
      for (const para of paragraphs) {
        if (!para.trim()) continue;
        const res = renderParagraph(pdf, para, m, currentY, isFirst);
        if (res.needsNewPage) {
          addPage();
          m = getPageMargins(pageNumber);
          currentY = m.top;
          const retry = renderParagraph(pdf, para, m, currentY, false);
          currentY = retry.y + 3;
        } else {
          currentY = res.y + 3;
        }
        isFirst = false;
      }
    }

    // Headers and Page Numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const meta = pagesMeta[i] || { showNumber: true, showHeader: true };
      m = getPageMargins(i);

      if (options.includeHeaders && meta.showHeader) {
        pdf.setFontSize(9);
        const isPageOdd = i % 2 === 1;
        if (isPageOdd) {
          pdf.text(options.title.toUpperCase(), pageWidth - m.right, m.top - 5, { align: 'right' });
        } else {
          pdf.text((meta.chapterTitle || options.author).toUpperCase(), m.left, m.top - 5);
        }
      }

      if (options.includePageNumbers && meta.showNumber && i >= contentPageNumber) {
        pdf.setFontSize(10);
        pdf.text(String(i - contentPageNumber + 1), pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    }

    pdf.save(`${options.title.replace(/\s+/g, '_')}_KDP.pdf`);
  },

  async exportToDocx(project: Project, options: PublishingOptions) {
    const { Document, Packer, Paragraph, AlignmentType, HeadingLevel, PageBreak } = await import('docx');
    
    const selectedChapters = project.chapters
      .filter(ch => options.selectedChapters.includes(ch.id))
      .sort((a, b) => (a.number || 0) - (b.number || 0));

    const children: any[] = [];

    // Title
    children.push(new Paragraph({ text: options.title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
    if (options.subtitle) children.push(new Paragraph({ text: options.subtitle, alignment: AlignmentType.CENTER }));
    children.push(new Paragraph({ text: options.author, alignment: AlignmentType.CENTER }));
    children.push(new Paragraph({ children: [new PageBreak()] }));

    // Chapters
    for (const chapter of selectedChapters) {
      children.push(new Paragraph({ text: `Capítulo ${chapter.number}: ${chapter.title}`, heading: HeadingLevel.HEADING_1 }));
      const paragraphs = chapter.content.replace(/<[^>]+>/g, '\n').split(/\n\n+/);
      for (const para of paragraphs) {
        if (!para.trim()) continue;
        children.push(new Paragraph({ text: para.trim(), alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 } }));
      }
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    const doc = new Document({
      sections: [{ children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${options.title.replace(/\s+/g, '_')}.docx`);
  },

  getPageSize(size: string): [number, number] | string {
    const sizes: Record<string, [number, number] | string> = {
      'kdp6x9': [152.4, 228.6],
      'kdp5x8': [127, 203.2],
      'kdp5.5x8.5': [139.7, 215.9],
      'A4': 'a4',
      'A5': 'a5',
      'letter': 'letter'
    };
    return sizes[size] || [152.4, 228.6];
  },

  getKDPMargins(pages: number) {
    let gutter = 0.375;
    if (pages > 150) gutter = 0.5;
    if (pages > 300) gutter = 0.625;
    if (pages > 500) gutter = 0.75;
    if (pages > 700) gutter = 0.875;

    return {
      gutter: gutter * 25.4,
      outer: 0.375 * 25.4,
      top: 0.625 * 25.4,
      bottom: 0.625 * 25.4
    };
  },

  calculateTotalWords(project: Project, selectedIds: string[]) {
    return project.chapters
      .filter(ch => selectedIds.includes(ch.id))
      .reduce((sum, ch) => {
        const text = ch.content.replace(/<[^>]+>/g, ' ');
        return sum + (text.trim() ? text.trim().split(/\s+/).length : 0);
      }, 0);
  }
};