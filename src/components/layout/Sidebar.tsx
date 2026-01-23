import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { Book, Users, GitBranch, Activity, BarChart, FileText } from 'lucide-react';

export const Sidebar = () => {
  const { activeProject } = useProjectStore();
  const { activeView, setActiveView } = useUIStore();

  if (!activeProject) {
    return (
      <aside className="w-64 h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <p className="text-gray-500 text-sm">No project loaded.</p>
        <p className="text-xs text-gray-400 mt-2">Create or load a project to start.</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="font-bold text-lg truncate" title={activeProject.title}>{activeProject.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Navigation Modules */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Modules</h2>
          <nav className="space-y-1">
             <button
              onClick={() => setActiveView('editor')}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${activeView === 'editor' ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <Book className="w-4 h-4 mr-2" />
              Editor
            </button>
            <button
              onClick={() => setActiveView('entities')}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${activeView === 'entities' ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <Users className="w-4 h-4 mr-2" />
              Entities
            </button>
            <button
              onClick={() => setActiveView('relations')}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${activeView === 'relations' ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Relations
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${activeView === 'timeline' ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Timeline
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md ${activeView === 'stats' ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Stats
            </button>
          </nav>
        </div>

        {/* Chapters Structure */}
        <div>
           <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Chapters</h2>
           <div className="space-y-2">
             {activeProject.chapters.map((chapter) => (
               <div key={chapter.id}>
                 <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4 mr-2" />
                    {chapter.title}
                 </div>
                 <div className="ml-6 space-y-1">
                   {chapter.scenes.map((scene) => (
                     <button
                        key={scene.id}
                        onClick={() => setActiveView('editor')} // In a real app, also select the scene in store
                        className="block w-full text-left px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 truncate"
                     >
                       {scene.title}
                     </button>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </aside>
  );
};
