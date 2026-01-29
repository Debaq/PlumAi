import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ZineTemplate } from '@/types/zine';

interface ZineTemplateCardProps {
  template: ZineTemplate;
  selected: boolean;
  onSelect: () => void;
}

export const ZineTemplateCard: React.FC<ZineTemplateCardProps> = ({ template, selected, onSelect }) => {
  const { t } = useTranslation();
  const d = template.defaults;
  const dec = template.decorations;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-muted bg-card hover:border-primary/40 hover:bg-muted/50'
      }`}
    >
      {/* Mini mockup */}
      <div
        className="w-full aspect-[3/4] rounded-md overflow-hidden relative"
        style={{
          backgroundColor: d.backgroundColor,
          border: dec.borderStyle !== 'none'
            ? `${dec.borderWidth}px ${dec.borderStyle} ${dec.borderColor}`
            : '1px solid var(--border)',
        }}
      >
        {/* Header line */}
        {dec.headerLine && (
          <div
            className="absolute top-3 left-3 right-3 h-px"
            style={{ backgroundColor: dec.headerLineColor || '#ccc' }}
          />
        )}
        {/* Corner marks */}
        {dec.cornerMarks && (
          <>
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l" style={{ borderColor: dec.borderColor }} />
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r" style={{ borderColor: dec.borderColor }} />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l" style={{ borderColor: dec.borderColor }} />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r" style={{ borderColor: dec.borderColor }} />
          </>
        )}
        {/* Text lines mockup */}
        <div className="p-3 pt-5 space-y-1.5">
          <div className="h-2 rounded-full" style={{ backgroundColor: d.textColor, opacity: 0.6, width: '70%', marginLeft: d.textAlign === 'center' ? 'auto' : undefined, marginRight: d.textAlign === 'center' ? 'auto' : undefined }} />
          <div className="h-1 rounded-full" style={{ backgroundColor: d.textColor, opacity: 0.2, width: '100%' }} />
          <div className="h-1 rounded-full" style={{ backgroundColor: d.textColor, opacity: 0.2, width: '90%' }} />
          <div className="h-1 rounded-full" style={{ backgroundColor: d.textColor, opacity: 0.2, width: '95%' }} />
          <div className="h-1 rounded-full" style={{ backgroundColor: d.textColor, opacity: 0.2, width: '60%' }} />
        </div>
      </div>

      {/* Label */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{t(template.nameKey)}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
            template.source === 'bundled'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {template.source === 'bundled'
              ? t('publishing.zine.template.bundled', 'Bundled')
              : t('publishing.zine.template.package', 'Package')}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {t(template.descriptionKey)}
        </div>
      </div>
    </button>
  );
};
