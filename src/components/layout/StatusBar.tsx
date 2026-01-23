import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';

export const StatusBar = () => {
  const { activeProject } = useProjectStore();

  const totalWords = React.useMemo(() => {
    if (!activeProject) return 0;
    return activeProject.chapters.reduce((acc, ch) => acc + (ch.wordCount || 0), 0);
  }, [activeProject]);

  return (
    <footer className="h-[22px] bg-card border-t border-border flex items-center justify-between px-4 text-[11px] text-muted-foreground shrink-0 fixed bottom-0 left-0 right-0 z-50 user-select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="font-medium text-foreground">{totalWords.toLocaleString()}</span> words
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" title="AI Assistant Status">
          {/* Placeholder for AI status. In legacy this was dynamic. */}
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
          <span>AI Inactive</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Placeholder for Locale. Legacy used i18n store. */}
          <span>Español</span>
        </div>
      </div>
    </footer>
  );
};
