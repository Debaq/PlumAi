import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Book,
  Trash2,
  User,
  Search,
  Dices,
  Globe,
  Settings2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { dbGetAllProjects, dbDeleteProject } from '@/lib/tauri-bridge';
import { confirm } from '@/stores/useConfirmStore';
import type { Project, ProjectType } from '@/types/domain';

import { ProjectConfigContent } from './ProjectConfigContent';

export const ProjectManagerView = () => {
  const { loadProject } = useProjectStore();
  const { setActiveView, openModal, activeModal } = useUIStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const refreshProjects = useCallback(async () => {
    try {
      const allProjects = await dbGetAllProjects();
      setProjects(allProjects);
    } catch (err) {
      console.error('Failed to load projects from SQLite:', err);
    }
  }, []);

  // Load projects on mount and when modal closes (project may have been created)
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects, activeModal]);

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  const handleCreateProject = () => {
    openModal('newProject');
  };

  const handleOpenProject = async (project: any) => {
    await loadProject(project.id);
    setActiveView('lore'); // Switch to main view
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setSelectedProjectId(project.id);
    setIsSettingsMode(true);
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (await confirm(t('project.confirmDelete', { name: '' }), { variant: 'destructive', confirmText: t('common.delete') })) {
      await dbDeleteProject(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
      await refreshProjects();
    }
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setIsSettingsMode(false); // Reset to stats view when selecting a new project
  };

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectTypeIcon = (type?: ProjectType) => {
    switch (type) {
      case 'rpg': return <Dices className="w-4 h-4" />;
      case 'worldbuilding': return <Globe className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-1 w-full h-full bg-background overflow-hidden">
      {/* Project List - Left Side */}
      <div className="w-1/3 min-w-[300px] border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{t('projectManager.title')}</h2>
            <button 
              onClick={handleCreateProject}
              className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              title={t('projectManager.create')}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={t('projectManager.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredProjects?.map(project => (
            <div
              key={project.id}
              onClick={() => handleSelectProject(project.id)}
              onDoubleClick={() => handleOpenProject(project)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all border
                ${selectedProjectId === project.id 
                  ? 'bg-accent border-primary/50 shadow-sm' 
                  : 'bg-card border-transparent hover:bg-accent/50 hover:border-border'
                }
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold truncate pr-2">{project.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getProjectTypeIcon(project.projectType)}
                </div>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-3">
                <span className="truncate max-w-[100px]">{project.author || t('project.untitled')}</span>
                <span>•</span>
                <span>{project.chapters?.length || 0} {t('common.list')}</span>
              </div>
            </div>
          ))}
          
          {filteredProjects?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('projectManager.noProjects')}
            </div>
          )}
        </div>
      </div>

      {/* Project Details - Right Side */}
      <div className="flex-1 flex flex-col bg-secondary/10 relative h-full overflow-hidden">
        {/* Decorative Logo */}
        <div className="absolute bottom-[-40px] right-[-40px] opacity-[0.15] pointer-events-none -rotate-12 z-0">
           <img src="/img/icon_alpha.png" alt="Logo Watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {selectedProject ? (
          <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative z-10">
            {isSettingsMode ? (
              <div className="flex-1 flex flex-col h-full bg-background/50">
                <div className="p-4 border-b border-border bg-card/30 flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => setIsSettingsMode(false)} className="rounded-lg h-8 px-2 gap-1 text-xs">
                    <ArrowLeft size={14} /> {t('projectManager.backToStats')}
                  </Button>
                  <h2 className="font-black text-xs uppercase tracking-widest text-muted-foreground">{t('projectManager.settingsTitle', { title: selectedProject.title })}</h2>
                </div>
                <ProjectConfigContent project={selectedProject} onSave={() => {}} />
              </div>
            ) : (
              <div className="flex-1 p-8 flex flex-col w-full h-full overflow-y-auto animate-in fade-in duration-300">
                <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-2">{selectedProject.title}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{selectedProject.author || t('projectManager.noAuthor')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getProjectTypeIcon(selectedProject.projectType)}
                          <span className="capitalize">{selectedProject.projectType || t('projectManager.novel')}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleEditProject(e, selectedProject)}
                      className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                      title={t('project.projectSettings')}
                    >
                      <Settings2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t('dashboard.stats.chapters')}</div>
                      <div className="text-2xl font-bold">{selectedProject.chapters?.length || 0}</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t('dashboard.stats.characters')}</div>
                      <div className="text-2xl font-bold">{selectedProject.characters?.length || 0}</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t('sidebar.locations')}</div>
                      <div className="text-2xl font-bold">{selectedProject.locations?.length || 0}</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t('dashboard.stats.words')}</div>
                      <div className="text-2xl font-bold">
                        {selectedProject.chapters?.reduce((acc, c) => acc + (c.wordCount || 0), 0) || 0}
                      </div>
                    </div>
                  </div>

                  {selectedProject.description && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{t('projectManager.description')}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 mt-auto">
                    <button
                      onClick={() => handleOpenProject(selectedProject)}
                      className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                      {t('projectManager.open')}
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(e, selectedProject.id)}
                      className="px-4 border border-destructive/50 text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Book className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">{t('projectManager.selectHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
