import { useState } from 'react';
import {
  Plus,
  Book,
  Trash2,
  User,
  Search,
  Dices,
  Globe,
  Settings2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { db } from '@/lib/db';
import type { Project, ProjectType } from '@/types/domain';

export const ProjectManagerView = () => {
  const { setActiveProject } = useProjectStore();
  const { setActiveView, openModal } = useUIStore();
  const projects = useLiveQuery(() => db.projects.toArray());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  useTranslation();

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  const handleCreateProject = () => {
    openModal('newProject');
  };

  const handleOpenProject = async (project: Project) => {
    setActiveProject(project);
    setActiveView('lore'); // Switch to main view
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    openModal('projectSettings', project);
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await db.projects.delete(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
    }
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
            <h2 className="text-xl font-bold tracking-tight">Projects</h2>
            <button 
              onClick={handleCreateProject}
              className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              title="Create New Project"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search projects..."
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
              onClick={() => setSelectedProjectId(project.id)}
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
                <span className="truncate max-w-[100px]">{project.author || 'Unknown Author'}</span>
                <span>•</span>
                <span>{project.chapters?.length || 0} chapters</span>
              </div>
            </div>
          ))}
          
          {filteredProjects?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No projects found.
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
          <div className="flex-1 p-8 flex flex-col w-full h-full overflow-y-auto animate-in fade-in duration-300 relative z-10">
            <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{selectedProject.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{selectedProject.author || 'No author specified'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getProjectTypeIcon(selectedProject.projectType)}
                      <span className="capitalize">{selectedProject.projectType || 'Novel'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleEditProject(e, selectedProject)}
                  className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                  title="Project Settings"
                >
                  <Settings2 className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Chapters</div>
                  <div className="text-2xl font-bold">{selectedProject.chapters?.length || 0}</div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Characters</div>
                  <div className="text-2xl font-bold">{selectedProject.characters?.length || 0}</div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Locations</div>
                  <div className="text-2xl font-bold">{selectedProject.locations?.length || 0}</div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Words</div>
                  <div className="text-2xl font-bold">
                    {selectedProject.chapters?.reduce((acc, c) => acc + (c.wordCount || 0), 0) || 0}
                  </div>
                </div>
              </div>

              {selectedProject.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-auto">
                <button
                  onClick={() => handleOpenProject(selectedProject)}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                  Open Project
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
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Book className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Select a project to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
