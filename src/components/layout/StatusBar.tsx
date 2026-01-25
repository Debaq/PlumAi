import { useProjectStore } from '@/stores/useProjectStore';
import { WorldbuilderStatusBar } from '@/components/rpg/WorldbuilderStatusBar';

export const StatusBar = () => {
  const { activeProject } = useProjectStore();
  const totalWords = activeProject?.chapters.reduce((acc, ch) => acc + (ch.wordCount || 0), 0) || 0;

  // Placeholder for AI activity
  const isAIActive = false;

  return (
    <footer className="h-[22px] bg-card border-t border-border flex items-center justify-between px-4 text-[11px] text-muted-foreground shrink-0 fixed bottom-0 left-0 right-0 z-50 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>{totalWords.toLocaleString()} words</span>
        </div>
        {activeProject?.isRpgModeEnabled && <WorldbuilderStatusBar />}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full transition-colors ${isAIActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/50'}`}></span>
          <span>{isAIActive ? 'AI Active' : 'AI Inactive'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>English</span>
        </div>
      </div>
    </footer>
  );
};
