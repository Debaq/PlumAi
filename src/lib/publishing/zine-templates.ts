// src/lib/publishing/zine-templates.ts
import type { ZineTemplate } from '@/types/zine';

const defaultContentSlots = (margins: { top: number; bottom: number; left: number; right: number }) => ({
  slots: [
    {
      type: 'text' as const,
      x: margins.left,
      y: margins.top,
      width: 0,  // 0 = auto (pageWidth - left - right)
      height: 0, // 0 = auto (pageHeight - top - bottom)
    },
  ],
  marginTop: margins.top,
  marginBottom: margins.bottom,
  marginLeft: margins.left,
  marginRight: margins.right,
});

export const BUNDLED_ZINE_TEMPLATES: ZineTemplate[] = [
  {
    id: 'punk-diy',
    nameKey: 'publishing.zine.template.punkDiy',
    descriptionKey: 'publishing.zine.template.punkDiyDesc',
    supportedFormats: ['half-letter', 'mini-zine', 'a5', 'quarter-letter'],
    defaults: {
      fontFamily: 'Courier',
      fontSize: 11,
      margins: { top: 8, bottom: 8, left: 8, right: 8 },
      primaryColor: '#000000',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      textAlign: 'left',
      lineHeight: 1.4,
    },
    pages: {
      cover: {
        slots: [
          {
            type: 'text',
            x: 8,
            y: 20,
            width: 0,
            height: 30,
            style: {
              fontFamily: 'Courier',
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
              color: '#000000',
            },
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#000000',
          },
          {
            type: 'text',
            x: 8,
            y: 55,
            width: 0,
            height: 10,
            style: {
              fontFamily: 'Courier',
              fontSize: 10,
              fontWeight: 'normal',
              textAlign: 'center',
              color: '#000000',
            },
          },
        ],
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
        backgroundColor: '#ffffff',
      },
      backCover: {
        slots: [
          {
            type: 'decorative',
            x: 8,
            y: 8,
            width: 0,
            height: 0,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: '#000000',
          },
        ],
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
      },
      content: defaultContentSlots({ top: 10, bottom: 10, left: 8, right: 8 }),
      toc: defaultContentSlots({ top: 10, bottom: 10, left: 8, right: 8 }),
    },
    decorations: {
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: '#000000',
      cornerMarks: true,
      headerLine: false,
    },
    source: 'bundled',
  },
  {
    id: 'clean-minimal',
    nameKey: 'publishing.zine.template.cleanMinimal',
    descriptionKey: 'publishing.zine.template.cleanMinimalDesc',
    supportedFormats: ['half-letter', 'mini-zine', 'a5', 'quarter-letter'],
    defaults: {
      fontFamily: 'times',
      fontSize: 10,
      margins: { top: 12, bottom: 12, left: 12, right: 12 },
      primaryColor: '#333333',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      textAlign: 'justify',
      lineHeight: 1.5,
    },
    pages: {
      cover: {
        slots: [
          {
            type: 'text',
            x: 12,
            y: 30,
            width: 0,
            height: 25,
            style: {
              fontFamily: 'times',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#333333',
            },
          },
          {
            type: 'text',
            x: 12,
            y: 58,
            width: 0,
            height: 8,
            style: {
              fontFamily: 'times',
              fontSize: 10,
              fontWeight: 'normal',
              textAlign: 'center',
              color: '#666666',
            },
          },
        ],
        marginTop: 12,
        marginBottom: 12,
        marginLeft: 12,
        marginRight: 12,
        backgroundColor: '#ffffff',
      },
      backCover: {
        slots: [
          {
            type: 'text',
            x: 12,
            y: 12,
            width: 0,
            height: 0,
            style: {
              fontFamily: 'times',
              fontSize: 9,
              fontWeight: 'normal',
              textAlign: 'center',
              color: '#999999',
            },
          },
        ],
        marginTop: 12,
        marginBottom: 12,
        marginLeft: 12,
        marginRight: 12,
      },
      content: defaultContentSlots({ top: 14, bottom: 14, left: 12, right: 12 }),
      toc: defaultContentSlots({ top: 14, bottom: 14, left: 12, right: 12 }),
    },
    decorations: {
      borderStyle: 'none',
      borderWidth: 0,
      borderColor: 'transparent',
      cornerMarks: false,
      headerLine: true,
      headerLineColor: '#cccccc',
    },
    source: 'bundled',
  },
];

export function getBundledTemplate(id: string): ZineTemplate | undefined {
  return BUNDLED_ZINE_TEMPLATES.find(t => t.id === id);
}
