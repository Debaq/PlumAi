import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  PenLine,
  Settings,
  Save,
  Palette,
  Globe,
  Check,
  MoreVertical,
  FileDown,
  Upload,
  Book,
  Users,
  Heart,
  Calendar,
  MapPin,
  Minimize2,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { PublishingEngine } from '@/lib/publishing/PublishingEngine';
import { LegacyImporter } from '@/lib/importers/LegacyImporter';

export const Header = () => {
  const { activeProject, setActiveProject } = useProjectStore();
  const {
    theme,
    setTheme,
    activeView,
    setActiveView,
    activeLoreTab,
    setActiveLoreTab,
    editorSaveStatus,
    editorZenMode,
    toggleEditorZenMode,
    currentEditingChapterId
  } = useUIStore();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) setIsThemeOpen(false);
      if (langRef.current && !langRef.current.contains(event.target as Node)) setIsLangOpen(false);
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (type: 'pdf' | 'docx') => {
      if (!activeProject) return;
      if (type === 'pdf') PublishingEngine.exportToPdf(activeProject);
      if (type === 'docx') PublishingEngine.exportToDocx(activeProject);
      setIsMoreOpen(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const text = await file.text();
          const json = JSON.parse(text);
          const project = LegacyImporter.importLegacyProject(json);
          setActiveProject(project);
          alert('Project imported successfully!');
      } catch (err) {
          console.error(err);
          alert('Failed to import project');
      }
      e.target.value = '';
      setIsMoreOpen(false);
  };

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'dracula');
    root.classList.add(theme);
  }, [theme]);

  return (
    <header className="h-[48px] bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-50 fixed top-0 left-0 right-0">
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

      {/* Center: Contextual Controls */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-4">

        {/* Lore Tabs */}
        {(activeView === 'lore' || activeView === 'entities') && (
          <div className="flex items-center bg-accent/50 p-1 rounded-md">
            <button
              onClick={() => setActiveLoreTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'summary' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Book size={12} />
              <span>Lore</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('characters')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'characters' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Users size={12} />
              <span>Characters</span>
              {activeProject?.characters && activeProject.characters.length > 0 && (
                <span className="bg-primary/20 text-primary px-1 rounded-full text-[10px]">{activeProject.characters.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveLoreTab('relations')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'relations' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart size={12} />
              <span>Relations</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'events' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Calendar size={12} />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('locations')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'locations' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MapPin size={12} />
              <span>Locations</span>
            </button>
          </div>
        )}

        {/* Editor Toolbar */}
        {activeView === 'editor' && (
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <button onClick={() => setActiveView('chapters')} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors" title="Back to Chapters">
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 text-center font-medium text-sm truncate">
              {activeProject?.chapters.find(c => c.id === currentEditingChapterId)?.title || 'Untitled Chapter'}
            </div>

            <div className="flex items-center gap-2">
               <button className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors" title="Chapter Settings">
                 <Settings size={16} />
               </button>

               <div className={`text-xs px-2 py-0.5 rounded-full ${
                 editorSaveStatus === 'saving' ? 'bg-blue-500/10 text-blue-500' :
                 editorSaveStatus === 'saved' ? 'bg-green-500/10 text-green-500' :
                 'bg-yellow-500/10 text-yellow-500'
               }`}>
                 {editorSaveStatus === 'saving' ? 'Saving...' : editorSaveStatus === 'saved' ? 'Saved' : 'Unsaved'}
               </div>

               <button
                 onClick={toggleEditorZenMode}
                 className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                 title={editorZenMode ? "Exit Zen Mode" : "Zen Mode"}
               >
                 {editorZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
               </button>
            </div>
          </div>
        )}

        {/* Other Views Titles */}
        {activeView === 'chapters' && <span className="font-semibold text-sm">Chapters</span>}
        {activeView === 'scenes' && <span className="font-semibold text-sm">Scenes</span>}
        {activeView === 'images' && <span className="font-semibold text-sm">Image Gallery</span>}
        {activeView === 'publishing' && <span className="font-semibold text-sm">Publishing</span>}
        {activeView === 'aiAssistant' && <span className="font-semibold text-sm">AI Assistant</span>}

      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-px h-6 bg-border mx-2"></div>

        {/* Theme Dropdown */}
        <div className="relative" ref={themeRef}>
             <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Theme"
             >
                 <Palette size={16} />
             </button>
             {isThemeOpen && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                     <button onClick={() => { setTheme('dark'); setIsThemeOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground">
                         <div className="flex gap-1"><div className="w-3 h-3 bg-[#1e1e1e] rounded-[1px]"></div><div className="w-3 h-3 bg-[#007acc] rounded-[1px]"></div></div>
                         <span>Dark</span>
                         {theme === 'dark' && <Check size={14} className="ml-auto" />}
                     </button>
                     <button onClick={() => { setTheme('dracula'); setIsThemeOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground">
                         <div className="flex gap-1"><div className="w-3 h-3 bg-[#282a36] rounded-[1px]"></div><div className="w-3 h-3 bg-[#bd93f9] rounded-[1px]"></div></div>
                         <span>Dracula</span>
                         {theme === 'dracula' && <Check size={14} className="ml-auto" />}
                     </button>
                     <button onClick={() => { setTheme('light'); setIsThemeOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground">
                         <div className="flex gap-1"><div className="w-3 h-3 bg-[#faf8f3] rounded-[1px] border border-gray-300"></div><div className="w-3 h-3 bg-[#a89bd5] rounded-[1px]"></div></div>
                         <span>Light</span>
                         {theme === 'light' && <Check size={14} className="ml-auto" />}
                     </button>
                 </div>
             )}
        </div>

        {/* Language Dropdown */}
        <div className="relative" ref={langRef}>
             <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Language"
             >
                 <Globe size={16} />
             </button>
             {isLangOpen && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                     <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground">
                         <span>🇬🇧 English</span>
                         <Check size={14} className="ml-auto" />
                     </button>
                     <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground opacity-50 cursor-not-allowed">
                         <span>🇪🇸 Español (Coming Soon)</span>
                     </button>
                 </div>
             )}
        </div>

        {/* Settings Button */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Settings"
        >
            <Settings size={16} />
        </button>

        {/* More Actions (Import/Export) */}
        <div className="relative" ref={moreRef}>
            <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="More Actions"
            >
                <MoreVertical size={16} />
            </button>
            {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Actions</div>
                    <label className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground cursor-pointer">
                        <Upload size={14} />
                        <span>Import JSON</span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                    </label>
                    <button onClick={() => handleExport('pdf')} className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground">
                        <FileDown size={14} />
                        <span>Export PDF</span>
                    </button>
                    <button onClick={() => handleExport('docx')} className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent gap-2 text-popover-foreground">
                        <FileDown size={14} />
                        <span>Export DOCX</span>
                    </button>
                </div>
            )}
        </div>

        {/* Save Button */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity ml-2"
          title="Save Project"
        >
          <Save size={14} />
          <span>Save</span>
        </button>

      </div>
    </header>
  );
};
