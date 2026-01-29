import React from 'react';
import { Button } from '@/components/ui/button';
import type { Chapter } from '@/types/domain';

interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  author: string;
  chapters: Chapter[];
  paperColor?: string;
  aspectRatio?: string;
  footerLabel?: string;
}

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  author,
  chapters,
  paperColor = '#f9f4e8',
  footerLabel = 'Vista "Libro Abierto" \u2022 Previsualizaci\u00f3n de M\u00e1rgenes y Medianil',
}) => {
  if (!isOpen) return null;

  const firstChapter = chapters[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 overflow-hidden animate-in fade-in duration-500">
      <div className="absolute top-8 right-8 flex gap-4">
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={onClose}>
          Cerrar Vista
        </Button>
      </div>

      <div className="w-full max-w-5xl h-full flex items-center justify-center">
        {/* Left Page */}
        <div
          className="w-1/2 aspect-[2/3] shadow-2xl rounded-l-md border-r border-black/10 p-12 overflow-hidden relative"
          style={{ backgroundColor: paperColor }}
        >
          <div className="absolute top-8 left-8 text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
            {author}
          </div>
          <div className="prose prose-sm prose-stone h-full overflow-hidden text-justify leading-relaxed">
            <h3 className="text-center mb-8 font-serif uppercase tracking-widest">
              {firstChapter?.title}
            </h3>
            <p className="indent-8 first:indent-0">
              {firstChapter?.content.replace(/<[^>]+>/g, '').substring(0, 800)}...
            </p>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground/30">
            1
          </div>
        </div>

        {/* Right Page */}
        <div
          className="w-1/2 aspect-[2/3] shadow-2xl rounded-r-md border-l border-black/10 p-12 overflow-hidden relative"
          style={{ backgroundColor: paperColor }}
        >
          <div className="absolute top-8 right-8 text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
            {title}
          </div>
          <div className="prose prose-sm prose-stone h-full overflow-hidden text-justify leading-relaxed">
            <p className="indent-8">
              {firstChapter?.content.replace(/<[^>]+>/g, '').substring(800, 1800)}...
            </p>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground/30">
            2
          </div>
        </div>

        {/* Spine Shadow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[75%] bg-gradient-to-r from-black/10 via-black/20 to-black/10 blur-sm pointer-events-none" />
      </div>

      <p className="mt-8 text-white/50 text-xs font-bold uppercase tracking-[0.3em]">
        {footerLabel}
      </p>
    </div>
  );
};
