import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';
// @ts-ignore
import HTMLtoDOCX from 'html-to-docx';
import type { Project } from '@/types/domain';

// Initialize pdfMake vfs
if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
}

export const PublishingEngine = {
  async exportToPdf(project: Project) {
    const docDefinition = {
      content: [
        { text: project.title, style: 'header', alignment: 'center' },
        ...project.chapters.flatMap(chapter => [
           { text: chapter.title, style: 'subheader', pageBreak: 'before' },
           { text: chapter.content.replace(/<[^>]+>/g, '\n'), margin: [0, 10, 0, 0], preserveLeadingSpaces: true }
        ])
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 20]
        },
        subheader: {
          fontSize: 18,
          bold: true,
          margin: [0, 10, 0, 10]
        }
      },
      defaultStyle: {
        fontSize: 12,
        lineHeight: 1.5
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition as any);
    pdfDocGenerator.getBlob((blob) => {
      saveAs(blob, `${project.title}.pdf`);
    });
  },

  async exportToDocx(project: Project) {
    let fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${project.title}</title>
        </head>
        <body>
          <h1 style="text-align: center">${project.title}</h1>
    `;

    for (const chapter of project.chapters) {
        fullHtml += `<h2 style="page-break-before: always">${chapter.title}</h2>`;
        fullHtml += chapter.content;
    }

    fullHtml += `</body></html>`;

    try {
        const blob = await HTMLtoDOCX(fullHtml, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        saveAs(blob, `${project.title}.docx`);
    } catch (error) {
        console.error('Error generating DOCX:', error);
        throw error;
    }
  }
};
