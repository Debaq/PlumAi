import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Book,
  Users,
  Heart,
  Calendar,
  MapPin,
  Minimize2,
  Maximize2,
  ArrowLeft,
  Minus,
  Square,
  X,
  Maximize,
  Shield,
  GitBranch,
  Terminal,
  Database,
  Brain,
  Package,
  Mic,
  Save
} from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

export const Header = () => {
  const { t } = useTranslation();
  const { activeProject } = useProjectStore();
  const {
    activeView,
    setActiveView,
    activeLoreTab,
    setActiveLoreTab,
    activeSettingsTab,
    setActiveSettingsTab,
    editorSaveStatus,
    editorZenMode,
    toggleEditorZenMode,
    currentEditingChapterId,
    openModal
  } = useUIStore();

  const handleMinimize = async () => {
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error('Failed to minimize:', err);
    }
  };

  const handleMaximize = async () => {
    try {
      await appWindow.toggleMaximize();
    } catch (err) {
      console.error('Failed to maximize:', err);
    }
  };

  const handleClose = async () => {
    try {
      await appWindow.close();
    } catch (err) {
      console.error('Failed to close:', err);
    }
  };

  const handleFullscreen = async () => {
    try {
      const isFullscreen = await appWindow.isFullscreen();
      await appWindow.setFullscreen(!isFullscreen);
    } catch (err) {
      console.error('Failed to toggle fullscreen:', err);
    }
  };

  const handleDrag = async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
    try {
      await appWindow.startDragging();
    } catch (err) {
      console.error('Failed to start dragging:', err);
    }
  };

  return (
    <header
      onMouseDown={handleDrag}
      className="h-[48px] bg-card border-b border-border flex items-center justify-between shrink-0 z-50 fixed top-0 left-0 right-0 select-none"
    >

      {/* Left: Logo & Project Info */}
      <div className="relative z-10 flex items-center gap-4 shrink-0 px-4 pointer-events-none">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <img src="/img/icon_alpha.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span>{activeProject?.isRpgModeEnabled ? 'PlumAi Worldbuilder' : 'PlumAi'}</span>
        </div>

        {activeProject && (
          <div className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] border-l border-border pl-4">
            {activeProject.title}
          </div>
        )}
      </div>

      {/* Center: Contextual Controls */}
      <div className="relative z-10 flex-1 flex items-center justify-center min-w-0 px-4 pointer-events-none">

        {/* Lore Tabs */}
        {(activeView === 'lore' || activeView === 'entities') && (
          <div className="flex items-center bg-accent/50 p-1 rounded-md pointer-events-auto">
            <button
              onClick={() => setActiveLoreTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'summary' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Book size={12} />
              <span>{t('ui.loreTabs.summary')}</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('characters')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'characters' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Users size={12} />
              <span>{t('ui.loreTabs.characters')}</span>
              {activeProject?.characters && activeProject.characters.length > 0 && (
                <span className="bg-primary/20 text-primary px-1 rounded-full text-[10px]">{activeProject.characters.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveLoreTab('relations')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'relations' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart size={12} />
              <span>{t('ui.loreTabs.relations')}</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'events' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Calendar size={12} />
              <span>{t('ui.loreTabs.events')}</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('locations')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'locations' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MapPin size={12} />
              <span>{t('ui.loreTabs.locations')}</span>
            </button>
            <button
              onClick={() => setActiveLoreTab('scenes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors ${activeLoreTab === 'scenes' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Users size={12} />
              <span>{t('ui.loreTabs.scenes')}</span>
              {activeProject?.scenes && activeProject.scenes.length > 0 && (
                <span className="bg-primary/20 text-primary px-1 rounded-full text-[10px]">{activeProject.scenes.length}</span>
              )}
            </button>
          </div>
        )}

        {/* Settings Tabs */}
        {activeView === 'settings' && (
          <div className="flex items-center gap-4">
            {!activeProject && (
              <button 
                onClick={() => setActiveView('projects')} 
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors pointer-events-auto" 
                title="Back to Projects"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center bg-accent/50 p-1 rounded-md overflow-x-auto max-w-full no-scrollbar pointer-events-auto">
              <SettingsTabButton id="general" icon={Settings} label={t('modals.projectSettings.tabs.general')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="ia" icon={Brain} label={t('modals.projectSettings.tabs.api')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="voice" icon={Mic} label={t('settingsModal.voice.tabName')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="packages" icon={Package} label={t('modals.packages')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="security" icon={Shield} label={t('modals.settings.dataManagement.title')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="integrations" icon={GitBranch} label={t('modals.settings.textAPIs')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="advanced" icon={Terminal} label={t('modals.settings.tokenOptimization')} current={activeSettingsTab} set={setActiveSettingsTab} />
              <SettingsTabButton id="data" icon={Database} label={t('modals.settings.dataManagement.title')} current={activeSettingsTab} set={setActiveSettingsTab} />
            </div>
          </div>
        )}

        {/* Editor Toolbar */}
        {activeView === 'editor' && (
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <button onClick={() => setActiveView('chapters')} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors pointer-events-auto" title="Back to Chapters">
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 text-center font-medium text-sm truncate">
              {activeProject?.chapters.find(c => c.id === currentEditingChapterId)?.title || t('common.untitled')}
            </div>

            <div className="flex items-center gap-2">
               <button onClick={() => openModal('settings')} className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors pointer-events-auto" title={t('editor.toolbar.settings')}>
                 <Settings size={16} />
               </button>

               <div className={`text-xs px-2 py-0.5 rounded-full ${
                 editorSaveStatus === 'saving' ? 'bg-blue-500/10 text-blue-500' :
                 editorSaveStatus === 'saved' ? 'bg-green-500/10 text-green-500' :
                 'bg-yellow-500/10 text-yellow-500'
               }`}>
                 {editorSaveStatus === 'saving' ? t('status.autosave.saving') : editorSaveStatus === 'saved' ? t('status.autosave.saved') : t('status.autosave.unsaved')}
               </div>

               <button
                 onClick={toggleEditorZenMode}
                 className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
                 title={editorZenMode ? "Exit Zen Mode" : "Zen Mode"}
               >
                 {editorZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
               </button>
            </div>
          </div>
        )}

        {/* Other Views Titles */}
        {activeView === 'chapters' && <span className="font-semibold text-sm">{t('sidebar.chapters')}</span>}
        {activeView === 'scenes' && <span className="font-semibold text-sm">{t('sidebar.scenes')}</span>}
        {activeView === 'images' && <span className="font-semibold text-sm">{t('sidebar.images')}</span>}
        {activeView === 'publishing' && <span className="font-semibold text-sm">{t('sidebar.publishing')}</span>}
        {activeView === 'aiAssistant' && <span className="font-semibold text-sm">{t('sidebar.aiAssistant')}</span>}

      </div>

      {/* Right: Window Controls */}
      <div className="relative z-10 flex items-center shrink-0 h-full pointer-events-none">
        {activeProject && useWorkspaceStore.getState().isInitialized && (
          <button
            onClick={() => useProjectStore.getState().saveProject()}
            className="w-10 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
            title={t('workspace.status.syncing')}
          >
            <Save size={15} />
          </button>
        )}
        <button
          onClick={handleFullscreen}
          className="w-10 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
          title={t('common.windowControls.fullscreen')}
        >
          <Maximize size={16} />
        </button>
        <button
          onClick={handleMinimize}
          className="w-10 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
          title={t('common.windowControls.minimize')}
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-10 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
          title={t('common.windowControls.maximize')}
        >
          <Square size={14} />
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors pointer-events-auto"
          title={t('common.windowControls.close')}
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
};

const SettingsTabButton = ({ id, icon: Icon, label, current, set }: { id: any, icon: any, label: string, current: string, set: (id: any) => void }) => (
  <button
    onClick={() => set(id)}
    className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors whitespace-nowrap ${current === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
  >
    <Icon size={12} />
    <span>{label}</span>
  </button>
);
