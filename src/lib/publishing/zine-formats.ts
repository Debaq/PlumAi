// src/lib/publishing/zine-formats.ts
import type { ZineFormat, ZineFormatId } from '@/types/zine';

export const ZINE_FORMATS: ZineFormat[] = [
  {
    id: 'half-letter',
    nameKey: 'publishing.zine.format.halfLetter',
    descriptionKey: 'publishing.zine.format.halfLetterDesc',
    pageWidth: 139.7,
    pageHeight: 215.9,
    sheetWidth: 279.4,   // Letter landscape
    sheetHeight: 215.9,
    foldType: 'half-fold',
    pagesPerSheet: 2,
    requiresImposition: true,
    pageMultiple: 4,
  },
  {
    id: 'mini-zine',
    nameKey: 'publishing.zine.format.miniZine',
    descriptionKey: 'publishing.zine.format.miniZineDesc',
    pageWidth: 69.85,
    pageHeight: 107.95,
    sheetWidth: 279.4,   // Letter
    sheetHeight: 215.9,
    foldType: 'mini-zine-fold',
    pagesPerSheet: 8,
    requiresImposition: true,
    pageMultiple: 8,
  },
  {
    id: 'a5',
    nameKey: 'publishing.zine.format.a5',
    descriptionKey: 'publishing.zine.format.a5Desc',
    pageWidth: 148,
    pageHeight: 210,
    sheetWidth: 297,     // A4 landscape
    sheetHeight: 210,
    foldType: 'saddle-stitch',
    pagesPerSheet: 2,
    requiresImposition: true,
    pageMultiple: 4,
  },
  {
    id: 'quarter-letter',
    nameKey: 'publishing.zine.format.quarterLetter',
    descriptionKey: 'publishing.zine.format.quarterLetterDesc',
    pageWidth: 107.95,
    pageHeight: 139.7,
    sheetWidth: 279.4,   // Letter
    sheetHeight: 215.9,
    foldType: 'quarter-fold',
    pagesPerSheet: 4,
    requiresImposition: true,
    pageMultiple: 4,
  },
];

export function getZineFormat(id: ZineFormatId): ZineFormat | undefined {
  return ZINE_FORMATS.find(f => f.id === id);
}
