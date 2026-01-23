import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  PenLine,
  Settings,
  Save,
  Moon,
  Sun,
  Palette,
  Globe,
  Monitor,
  FileDown,
  Upload
} from 'lucide-react';
import { PublishingEngine } from '@/lib/publishing/PublishingEngine';
import { LegacyImporter } from '@/lib/importers/LegacyImporter';

export const Header = () => {
  const { activeProject, setActiveProject } = useProjectStore();
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleExport = (type: 'pdf' | 'docx') => {
      if (!activeProject) return;
      if (type === 'pdf') PublishingEngine.exportToPdf(activeProject);
      if (type === 'docx') PublishingEngine.exportToDocx(activeProject);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const text = await file.text();
          const json = JSON.parse(text);
          const project = LegacyImporter.importLegacyProject(json);

          setActiveProject(project);
          // In a real app we might want to save it to storage immediately
          alert('Project imported successfully!');
      } catch (err) {
          console.error(err);
          alert('Failed to import project');
      }
      // Reset input
      e.target.value = '';
  };

  // Helper function to apply theme to document
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

      {/* Center: Contextual Controls (Placeholder) */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {/* Can be used for tabs like Editor, Relations etc. if moved from sidebar */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
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
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </button>

        {/* Export/Import */}
        <div className="flex items-center gap-1 mx-1 border-l border-r border-border px-1">
            <input
                type="file"
                id="import-upload"
                className="hidden"
                accept=".json"
                onChange={handleImport}
            />
            <button
                onClick={() => document.getElementById('import-upload')?.click()}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Import Legacy Project"
            >
                <Upload size={14} /> <span className="text-[10px]">Import</span>
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <button
                onClick={() => handleExport('pdf')}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Export as PDF"
            >
                <FileDown size={14} /> <span className="text-[10px]">PDF</span>
            </button>
            <button
                onClick={() => handleExport('docx')}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Export as DOCX"
            >
                <FileDown size={14} /> <span className="text-[10px]">DOCX</span>
            </button>
        </div>

        {/* Save */}
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
