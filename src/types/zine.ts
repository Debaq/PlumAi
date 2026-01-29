// src/types/zine.ts

export type ZineFormatId = 'half-letter' | 'mini-zine' | 'a5' | 'quarter-letter';

export type FoldType = 'half-fold' | 'saddle-stitch' | 'mini-zine-fold' | 'quarter-fold';

export interface ZineFormat {
  id: ZineFormatId;
  nameKey: string;
  descriptionKey: string;
  pageWidth: number;   // mm
  pageHeight: number;  // mm
  sheetWidth: number;  // mm
  sheetHeight: number; // mm
  foldType: FoldType;
  pagesPerSheet: number;
  requiresImposition: boolean;
  pageMultiple: number; // pages must be a multiple of this (4 or 8)
}

export interface ZineTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  color: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface ZinePageSlot {
  type: 'text' | 'image' | 'decorative';
  x: number;      // mm from page left
  y: number;      // mm from page top
  width: number;  // mm
  height: number; // mm
  style?: Partial<ZineTextStyle>;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  borderColor?: string;
}

export type ZinePageRole = 'cover' | 'backCover' | 'content' | 'toc';

export interface ZineTemplatePageLayout {
  slots: ZinePageSlot[];
  backgroundColor?: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface ZineTemplate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  supportedFormats: ZineFormatId[];
  defaults: {
    fontFamily: string;
    fontSize: number;
    margins: { top: number; bottom: number; left: number; right: number };
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
  };
  pages: Record<ZinePageRole, ZineTemplatePageLayout>;
  decorations: {
    borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
    borderWidth: number;
    borderColor: string;
    cornerMarks: boolean;
    headerLine: boolean;
    headerLineColor?: string;
  };
  source: 'bundled' | 'package';
}

export type ImpositionMode = 'reader' | 'printer';

export interface ZineOptions {
  format: ZineFormatId;
  templateId: string;
  selectedChapters: string[];
  metadata: {
    title: string;
    author: string;
    issueNumber: string;
    date: string;
  };
  export: {
    foldGuides: boolean;
    registrationMarks: boolean;
    impositionMode: ImpositionMode;
  };
}
