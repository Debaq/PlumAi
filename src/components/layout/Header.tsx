import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  PenLine,
  Settings,
  Save,
  Moon,
  Sun,
  Globe,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Plus,
  Loader2
} from 'lucide-react';

export const Header = () => {
  const { activeProject } = useProjectStore();
  const {
    theme, setTheme,
    activeView, setActiveView,
    editorSaveStatus, currentEditingChapterId, editorZenMode, toggleEditorZenMode,
    openModal
  } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Helper to get current chapter title
  const currentChapter = React.useMemo(() => {
    if (!activeProject || !currentEditingChapterId) return null;
    return activeProject.chapters.find(c => c.id === currentEditingChapterId);
  }, [activeProject, currentEditingChapterId]);

  // Helper to get view title
  const viewTitle = React.useMemo(() => {
     if (activeView === 'editor') return ''; // Handled separately

     // Specific mappings
     if (activeView === 'aiAssistant') return 'AI Assistant';

     return activeView.charAt(0).toUpperCase() + activeView.slice(1);
  }, [activeView]);

  return (
    <header className="h-[48px] bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-50 fixed top-0 left-0 right-0 transition-colors duration-200">
      {/* Left: Logo & Project Info */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <PenLine size={20} className="text-primary" />
          <span>PlumaAI</span>
        </div>

        {activeProject && (
          <div className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] border-l border-border pl-4">
            {activeProject.title}
          </div>
        )}
      </div>

      {/* Center: Contextual Info & Tabs */}
      <div className="flex-1 flex items-center justify-center min-w-0 mx-4">
        {activeView === 'editor' ? (
           <div className="flex items-center gap-4">
             <button
                onClick={() => setActiveView('chapters')}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Back to Chapters"
             >
               <ArrowLeft size={18} />
             </button>

             <div className="text-sm font-semibold text-foreground truncate max-w-[400px]">
                {currentChapter ? `Chapter ${activeProject?.chapters.indexOf(currentChapter)! + 1}: ${currentChapter.title}` : 'Untitled Chapter'}
             </div>

             <div className="flex items-center gap-1.5 text-xs">
                {editorSaveStatus === 'saving' && (
                    <>
                        <Loader2 size={12} className="animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Saving...</span>
                    </>
                )}
                {editorSaveStatus === 'saved' && (
                    <span className="text-emerald-500 font-medium">Saved</span>
                )}
                {editorSaveStatus === 'unsaved' && (
                    <span className="text-amber-500 font-medium">Unsaved</span>
                )}
             </div>
           </div>
        ) : (
           <div className="text-sm font-semibold text-foreground">
              {viewTitle}
           </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Contextual Actions */}
        <div className="flex items-center gap-2 mr-2">
            {activeView === 'lore' && (
                <button onClick={() => openModal('newLore')} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded hover:bg-primary/20 transition-colors">
                    <Plus size={14} /> New Lore
                </button>
            )}
            {activeView === 'chapters' && (
                <button onClick={() => openModal('newChapter')} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded hover:bg-primary/20 transition-colors">
                    <Plus size={14} /> New Chapter
                </button>
            )}
             {activeView === 'scenes' && (
                <button onClick={() => openModal('newScene')} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded hover:bg-primary/20 transition-colors">
                    <Plus size={14} /> New Scene
                </button>
            )}
             {activeView === 'editor' && (
                <button
                    onClick={toggleEditorZenMode}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title={editorZenMode ? "Exit Zen Mode" : "Zen Mode"}
                >
                    {editorZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            )}
        </div>

        <div className="w-px h-6 bg-border mx-2"></div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Language (Placeholder) */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Change Language"
        >
          <Globe size={16} />
        </button>

        {/* Settings */}
        <button
          onClick={() => openModal('settings')}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </button>

        {/* Save */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity ml-2"
          title="Save Project"
          disabled={editorSaveStatus === 'saving'}
        >
          <Save size={14} />
          <span>Save</span>
        </button>
      </div>
    </header>
  );
};
