// src/lib/publishing/ZineEngine.ts
import { jsPDF } from 'jspdf';
import type { Project } from '@/types/domain';
import type { ZineOptions, ZineFormat, ZineTemplate, ZinePageRole } from '@/types/zine';

interface VirtualPage {
  role: ZinePageRole | 'blank';
  textContent?: string;    // plain text for content pages
  title?: string;          // for cover
  author?: string;         // for cover
  issueNumber?: string;    // for cover
  date?: string;           // for cover
  pageNumber?: number;     // display page number
}

export const ZineEngine = {
  async exportToPdf(
    project: Project,
    options: ZineOptions,
    template: ZineTemplate,
    format: ZineFormat
  ) {
    const pages = this.generatePageSequence(project, options, template, format);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [format.sheetWidth, format.sheetHeight],
      compress: true,
    });

    const isReaderMode = options.export.impositionMode === 'reader';

    if (isReaderMode) {
      // Reader spread: one virtual page per PDF page, at actual page size
      const readerPdf = new jsPDF({
        orientation: format.pageWidth > format.pageHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [format.pageWidth, format.pageHeight],
        compress: true,
      });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) readerPdf.addPage();
        this.renderPage(readerPdf, pages[i], template, 0, 0, format.pageWidth, format.pageHeight, i + 1, pages.length);
      }

      readerPdf.save(`${options.metadata.title.replace(/\s+/g, '_')}_zine_reader.pdf`);
      return;
    }

    // Printer spread: impose pages onto sheets
    const imposed = this.impositionReorder(pages, format);

    for (let sheetIdx = 0; sheetIdx < imposed.length; sheetIdx++) {
      if (sheetIdx > 0) pdf.addPage();
      const sheet = imposed[sheetIdx];

      for (const placement of sheet) {
        pdf.saveGraphicsState();

        if (placement.rotation !== 0) {
          const cx = placement.x + placement.w / 2;
          const cy = placement.y + placement.h / 2;
          // Translate to center, rotate, translate back
          const rad = (placement.rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          // jsPDF transform matrix: [a, b, c, d, e, f]
          // For rotation around (cx, cy):
          pdf.setCurrentTransformationMatrix(
            pdf.Matrix(cos, sin, -sin, cos, cx - cos * cx + sin * cy, cy - sin * cx - cos * cy)
          );
        }

        this.renderPage(pdf, placement.page, template, placement.x, placement.y, placement.w, placement.h, placement.pageIndex + 1, pages.length);

        pdf.restoreGraphicsState();
      }

      // Fold guides
      if (options.export.foldGuides) {
        this.renderFoldGuides(pdf, format, format.sheetWidth, format.sheetHeight);
      }

      // Registration marks
      if (options.export.registrationMarks) {
        this.renderRegistrationMarks(pdf, format.sheetWidth, format.sheetHeight);
      }
    }

    pdf.save(`${options.metadata.title.replace(/\s+/g, '_')}_zine_printer.pdf`);
  },

  generatePageSequence(
    project: Project,
    options: ZineOptions,
    template: ZineTemplate,
    format: ZineFormat
  ): VirtualPage[] {
    const pages: VirtualPage[] = [];

    // Page 1: Cover
    pages.push({
      role: 'cover',
      title: options.metadata.title,
      author: options.metadata.author,
      issueNumber: options.metadata.issueNumber,
      date: options.metadata.date,
    });

    // Content pages: flow selected chapters
    const selectedChapters = project.chapters
      .filter(ch => options.selectedChapters.includes(ch.id))
      .sort((a, b) => (a.number || 0) - (b.number || 0));

    const allText = selectedChapters
      .map(ch => ch.content.replace(/<[^>]+>/g, '\n').trim())
      .join('\n\n---\n\n');

    // Estimate characters per page based on format and template
    const margins = template.defaults.margins;
    const usableW = format.pageWidth - margins.left - margins.right;
    const usableH = format.pageHeight - margins.top - margins.bottom;
    const fontSize = template.defaults.fontSize;
    const lineH = fontSize * template.defaults.lineHeight * 0.3528; // mm
    const linesPerPage = Math.floor(usableH / lineH);
    const charsPerLine = Math.floor(usableW / (fontSize * 0.22)); // rough estimate
    const charsPerPage = linesPerPage * charsPerLine;

    // Split text into page-sized chunks
    const plainText = allText.replace(/\n+/g, '\n').trim();
    let offset = 0;
    let pageNum = 2;
    while (offset < plainText.length) {
      const chunk = plainText.substring(offset, offset + charsPerPage);
      pages.push({
        role: 'content',
        textContent: chunk,
        pageNumber: pageNum,
      });
      offset += charsPerPage;
      pageNum++;
    }

    // Back cover
    pages.push({
      role: 'backCover',
      title: options.metadata.title,
      author: options.metadata.author,
      date: options.metadata.date,
    });

    // Pad to required multiple
    while (pages.length % format.pageMultiple !== 0) {
      pages.splice(pages.length - 1, 0, { role: 'blank' });
    }

    return pages;
  },

  impositionReorder(
    pages: VirtualPage[],
    format: ZineFormat
  ): Array<Array<{ page: VirtualPage; x: number; y: number; w: number; h: number; rotation: number; pageIndex: number }>> {
    const sheets: Array<Array<{ page: VirtualPage; x: number; y: number; w: number; h: number; rotation: number; pageIndex: number }>> = [];
    const pw = format.pageWidth;
    const ph = format.pageHeight;

    if (format.foldType === 'half-fold' || format.foldType === 'saddle-stitch') {
      // Saddle-stitch booklet imposition
      // For N pages: sheet front has [N, 1], back has [2, N-1], etc.
      const n = pages.length;
      const sheetsCount = n / 4;
      for (let s = 0; s < sheetsCount; s++) {
        // Front of sheet: page indices [n-1 - 2*s, 2*s]
        const frontLeft = n - 1 - 2 * s;
        const frontRight = 2 * s;
        sheets.push([
          { page: pages[frontLeft], x: 0, y: 0, w: pw, h: ph, rotation: 0, pageIndex: frontLeft },
          { page: pages[frontRight], x: pw, y: 0, w: pw, h: ph, rotation: 0, pageIndex: frontRight },
        ]);

        // Back of sheet: page indices [2*s + 1, n - 2 - 2*s]
        const backLeft = 2 * s + 1;
        const backRight = n - 2 - 2 * s;
        sheets.push([
          { page: pages[backLeft], x: 0, y: 0, w: pw, h: ph, rotation: 0, pageIndex: backLeft },
          { page: pages[backRight], x: pw, y: 0, w: pw, h: ph, rotation: 0, pageIndex: backRight },
        ]);
      }
    } else if (format.foldType === 'quarter-fold') {
      // 2x2 grid per sheet
      const n = pages.length;
      for (let i = 0; i < n; i += 4) {
        const halfW = format.sheetWidth / 2;
        const halfH = format.sheetHeight / 2;
        sheets.push([
          { page: pages[i] || { role: 'blank' }, x: 0, y: 0, w: halfW, h: halfH, rotation: 0, pageIndex: i },
          { page: pages[i + 1] || { role: 'blank' }, x: halfW, y: 0, w: halfW, h: halfH, rotation: 0, pageIndex: i + 1 },
          { page: pages[i + 2] || { role: 'blank' }, x: 0, y: halfH, w: halfW, h: halfH, rotation: 180, pageIndex: i + 2 },
          { page: pages[i + 3] || { role: 'blank' }, x: halfW, y: halfH, w: halfW, h: halfH, rotation: 180, pageIndex: i + 3 },
        ]);
      }
    } else if (format.foldType === 'mini-zine-fold') {
      // 4x2 grid, specific rotations for 8-page mini zine
      const n = pages.length;
      for (let i = 0; i < n; i += 8) {
        const cellW = format.sheetWidth / 4;
        const cellH = format.sheetHeight / 2;
        // Front side: top row L-R: pages 8,1,2,7  bottom row L-R: 5(rot),4(rot),3(rot),6(rot)
        // Simplified: just place 8 pages in reading order with proper positions
        const order = [0, 1, 2, 3, 4, 5, 6, 7];
        // Mini-zine layout: top row left to right, bottom row left to right (rotated 180)
        sheets.push(order.map((idx, slot) => {
          const col = slot % 4;
          const row = Math.floor(slot / 4);
          return {
            page: pages[i + idx] || { role: 'blank' as const },
            x: col * cellW,
            y: row * cellH,
            w: cellW,
            h: cellH,
            rotation: row === 1 ? 180 : 0,
            pageIndex: i + idx,
          };
        }));
      }
    }

    return sheets;
  },

  renderPage(
    pdf: jsPDF,
    page: VirtualPage,
    template: ZineTemplate,
    x: number,
    y: number,
    w: number,
    h: number,
    _displayNum: number,
    _totalPages: number
  ) {
    const d = template.defaults;
    const dec = template.decorations;

    // Background
    pdf.setFillColor(d.backgroundColor);
    pdf.rect(x, y, w, h, 'F');

    // Border decoration
    if (dec.borderStyle !== 'none') {
      pdf.setDrawColor(dec.borderColor);
      pdf.setLineWidth(dec.borderWidth * 0.3);
      if (dec.borderStyle === 'dashed') {
        pdf.setLineDashPattern([2, 2], 0);
      } else if (dec.borderStyle === 'dotted') {
        pdf.setLineDashPattern([0.5, 1], 0);
      }
      pdf.rect(x + 2, y + 2, w - 4, h - 4);
      pdf.setLineDashPattern([], 0);
    }

    // Header line
    if (dec.headerLine) {
      pdf.setDrawColor(dec.headerLineColor || '#cccccc');
      pdf.setLineWidth(0.2);
      pdf.line(x + d.margins.left, y + d.margins.top - 2, x + w - d.margins.right, y + d.margins.top - 2);
    }

    // Corner marks
    if (dec.cornerMarks) {
      pdf.setDrawColor(dec.borderColor);
      pdf.setLineWidth(0.3);
      const m = 3;
      const l = 4;
      // Top-left
      pdf.line(x + m, y + m, x + m + l, y + m);
      pdf.line(x + m, y + m, x + m, y + m + l);
      // Top-right
      pdf.line(x + w - m, y + m, x + w - m - l, y + m);
      pdf.line(x + w - m, y + m, x + w - m, y + m + l);
      // Bottom-left
      pdf.line(x + m, y + h - m, x + m + l, y + h - m);
      pdf.line(x + m, y + h - m, x + m, y + h - m - l);
      // Bottom-right
      pdf.line(x + w - m, y + h - m, x + w - m - l, y + h - m);
      pdf.line(x + w - m, y + h - m, x + w - m, y + h - m - l);
    }

    if (page.role === 'blank') return;

    pdf.setTextColor(d.textColor);

    if (page.role === 'cover') {
      // Cover: title + author + issue
      const coverLayout = template.pages.cover;
      const titleSlot = coverLayout.slots[0];
      const authorSlot = coverLayout.slots[1];

      // Title
      if (titleSlot && page.title) {
        const fs = titleSlot.style?.fontSize || 20;
        pdf.setFontSize(Math.min(fs, w * 0.12));
        pdf.setFont(d.fontFamily, titleSlot.style?.fontWeight || 'bold');
        const titleX = x + w / 2;
        const titleY = y + h * 0.35;
        const titleText = titleSlot.style?.textTransform === 'uppercase' ? page.title.toUpperCase() : page.title;
        pdf.text(titleText, titleX, titleY, { align: 'center', maxWidth: w - d.margins.left - d.margins.right });
      }

      // Author
      if (authorSlot && page.author) {
        const fs = authorSlot.style?.fontSize || 10;
        pdf.setFontSize(Math.min(fs, w * 0.07));
        pdf.setFont(d.fontFamily, 'normal');
        pdf.text(page.author, x + w / 2, y + h * 0.55, { align: 'center' });
      }

      // Issue number
      if (page.issueNumber) {
        pdf.setFontSize(8);
        pdf.text(`#${page.issueNumber}`, x + w / 2, y + h * 0.65, { align: 'center' });
      }

      // Date
      if (page.date) {
        pdf.setFontSize(7);
        pdf.setTextColor('#999999');
        pdf.text(page.date, x + w / 2, y + h - d.margins.bottom, { align: 'center' });
        pdf.setTextColor(d.textColor);
      }
    } else if (page.role === 'content') {
      // Content: flow text
      const m = d.margins;
      const textX = x + m.left;
      const textY = y + m.top;
      const textW = w - m.left - m.right;
      const textH = h - m.top - m.bottom;

      pdf.setFontSize(d.fontSize);
      pdf.setFont(d.fontFamily, 'normal');

      if (page.textContent) {
        const lines = pdf.splitTextToSize(page.textContent, textW);
        const lineH = d.fontSize * d.lineHeight * 0.3528;
        const maxLines = Math.floor(textH / lineH);
        const visibleLines = lines.slice(0, maxLines);

        let currentY = textY;
        for (const line of visibleLines) {
          if (d.textAlign === 'justify' && line.split(' ').length > 1) {
            this.renderJustifiedLine(pdf, line, textX, currentY, textW);
          } else {
            pdf.text(line, d.textAlign === 'center' ? x + w / 2 : textX, currentY, {
              align: d.textAlign === 'center' ? 'center' : undefined,
            });
          }
          currentY += lineH;
        }
      }

      // Page number
      if (page.pageNumber) {
        pdf.setFontSize(7);
        pdf.setTextColor('#999999');
        pdf.text(String(page.pageNumber), x + w / 2, y + h - m.bottom + 3, { align: 'center' });
        pdf.setTextColor(d.textColor);
      }
    } else if (page.role === 'backCover') {
      // Back cover: minimal info
      pdf.setFontSize(8);
      pdf.setFont(d.fontFamily, 'normal');
      pdf.setTextColor('#999999');
      const lines = [
        page.title || '',
        page.author || '',
        page.date || '',
      ].filter(Boolean);
      let cy = y + h / 2 - (lines.length * 4);
      for (const line of lines) {
        pdf.text(line, x + w / 2, cy, { align: 'center' });
        cy += 5;
      }
      pdf.setTextColor(d.textColor);
    }
  },

  renderJustifiedLine(pdf: jsPDF, line: string, x: number, y: number, maxWidth: number) {
    const words = line.split(' ');
    if (words.length <= 1) {
      pdf.text(line, x, y);
      return;
    }
    const lineWidth = pdf.getStringUnitWidth(line) * pdf.getFontSize() / (pdf as any).internal.scaleFactor;
    const extraSpace = maxWidth - lineWidth;
    const spacePerGap = extraSpace / (words.length - 1);

    let currentX = x;
    for (const word of words) {
      pdf.text(word, currentX, y);
      const wordWidth = pdf.getStringUnitWidth(word) * pdf.getFontSize() / (pdf as any).internal.scaleFactor;
      currentX += wordWidth + (pdf.getStringUnitWidth(' ') * pdf.getFontSize() / (pdf as any).internal.scaleFactor) + spacePerGap;
    }
  },

  renderFoldGuides(pdf: jsPDF, format: ZineFormat, sheetW: number, sheetH: number) {
    pdf.setDrawColor('#cccccc');
    pdf.setLineWidth(0.15);
    pdf.setLineDashPattern([3, 3], 0);

    if (format.foldType === 'half-fold' || format.foldType === 'saddle-stitch') {
      // Vertical center fold
      pdf.line(sheetW / 2, 0, sheetW / 2, sheetH);
    } else if (format.foldType === 'quarter-fold') {
      // Vertical and horizontal center folds
      pdf.line(sheetW / 2, 0, sheetW / 2, sheetH);
      pdf.line(0, sheetH / 2, sheetW, sheetH / 2);
    } else if (format.foldType === 'mini-zine-fold') {
      // Vertical folds at 1/4, 1/2, 3/4 + horizontal center
      pdf.line(sheetW / 4, 0, sheetW / 4, sheetH);
      pdf.line(sheetW / 2, 0, sheetW / 2, sheetH);
      pdf.line((3 * sheetW) / 4, 0, (3 * sheetW) / 4, sheetH);
      pdf.line(0, sheetH / 2, sheetW, sheetH / 2);
    }

    pdf.setLineDashPattern([], 0);
  },

  renderRegistrationMarks(pdf: jsPDF, sheetW: number, sheetH: number) {
    pdf.setDrawColor('#000000');
    pdf.setLineWidth(0.2);
    const offset = 3;
    const len = 5;

    // Top-left
    pdf.line(offset, offset, offset + len, offset);
    pdf.line(offset, offset, offset, offset + len);
    // Top-right
    pdf.line(sheetW - offset, offset, sheetW - offset - len, offset);
    pdf.line(sheetW - offset, offset, sheetW - offset, offset + len);
    // Bottom-left
    pdf.line(offset, sheetH - offset, offset + len, sheetH - offset);
    pdf.line(offset, sheetH - offset, offset, sheetH - offset - len);
    // Bottom-right
    pdf.line(sheetW - offset, sheetH - offset, sheetW - offset - len, sheetH - offset);
    pdf.line(sheetW - offset, sheetH - offset, sheetW - offset, sheetH - offset - len);
  },
};
