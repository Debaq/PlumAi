import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, BookOpen, FileText, Layers } from 'lucide-react';
import type { ZineFormat } from '@/types/zine';

interface ZineFormatCardProps {
  format: ZineFormat;
  selected: boolean;
  onSelect: () => void;
}

const foldIcons: Record<string, React.ElementType> = {
  'half-fold': BookOpen,
  'saddle-stitch': FileText,
  'mini-zine-fold': Scissors,
  'quarter-fold': Layers,
};

export const ZineFormatCard: React.FC<ZineFormatCardProps> = ({ format, selected, onSelect }) => {
  const { t } = useTranslation();
  const Icon = foldIcons[format.foldType] || FileText;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-muted bg-card hover:border-primary/40 hover:bg-muted/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-semibold">{t(format.nameKey)}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {Math.round(format.pageWidth)}x{Math.round(format.pageHeight)}mm
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground leading-tight">
        {t(format.descriptionKey)}
      </div>
    </button>
  );
};
