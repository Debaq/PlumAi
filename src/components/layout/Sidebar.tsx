import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  Book,
  Film,
  Image as ImageIcon,
  GitBranch,
  BookMarked,
  Sparkles,
  ChevronLeft,
  BarChart
} from 'lucide-react';

export const Sidebar = () => {
  const { activeProject } = useProjectStore();
  const { activeView, setActiveView, isSidebarOpen, toggleSidebar } = useUIStore();

  if (!isSidebarOpen) {
     return (
        <aside className="w-[48px] bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 transition-all duration-300 fixed top-[48px] bottom-[22px] left-0 z-40">
           <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:text-sidebar-foreground">
              <ChevronLeft className="w-4 h-4 rotate-180" />
           </button>
        </aside>
     )
  }

  if (!activeProject) {
    return (
      <aside className="w-[220px] bg-sidebar border-r border-sidebar-border p-4 transition-all duration-300 mt-[48px] h-[calc(100vh-48px-22px)] fixed top-0 left-0 bottom-0 z-40">
        <p className="text-muted-foreground text-sm">No project loaded.</p>
        <p className="text-xs text-muted-foreground/70 mt-2">Create or load a project to start.</p>
      </aside>
    );
  }

  const NavItem = ({ view, icon: Icon, label, count }: { view: any, icon: any, label: string, count?: number }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`
        flex items-center w-full px-3 py-1.5 text-sm rounded-r-sm
        transition-colors mb-[1px] relative group
        ${activeView === view
          ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary pl-[10px]'
          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent'
        }
      `}
    >
      <Icon className="w-4 h-4 mr-3 shrink-0" />
      <span className="truncate flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <aside className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 mt-[48px] h-[calc(100vh-48px-22px)] fixed top-0 left-0 bottom-0 z-40">

      <div className="flex-1 overflow-y-auto py-2 px-0 space-y-6 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">

        {/* Main Navigation */}
        <div>
          <nav className="space-y-0.5 pr-2">
            <NavItem view="lore" icon={Book} label="Lore" count={activeProject.characters.length + activeProject.locations.length + activeProject.loreItems.length} />
            <NavItem view="chapters" icon={Book} label="Chapters" count={activeProject.chapters.length} />
            <NavItem view="scenes" icon={Film} label="Scenes" count={activeProject.chapters.reduce((acc, ch) => acc + ch.scenes.length, 0)} />
            <NavItem view="images" icon={ImageIcon} label="Images" />

            <div className="h-px bg-sidebar-border my-2 mx-3" />

            <NavItem view="versionControl" icon={GitBranch} label="Version Control" />
            <NavItem view="publishing" icon={BookMarked} label="Publishing" />
            <NavItem view="stats" icon={BarChart} label="Stats" />
            <NavItem view="aiAssistant" icon={Sparkles} label="AI Assistant" />
          </nav>
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute bottom-2 right-2 p-1.5 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </aside>
  );
};
