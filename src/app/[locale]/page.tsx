'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Editor } from '@/components/editor/editor';
import { EntityList } from '@/components/world/EntityList';
import { RelationsDiagram } from '@/components/visualization/RelationsDiagram';
import { TimelineView } from '@/components/visualization/TimelineView';
import { StatsDashboard } from '@/components/visualization/StatsDashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Mock data for demonstration if no project is loaded
import { Project } from '@/types/domain';

const MOCK_PROJECT: Project = {
  id: '1',
  title: 'The Lost Artifact',
  chapters: [
    {
      id: 'c1',
      title: 'Chapter 1: The Beginning',
      content: '<p>It was a dark and stormy night...</p>',
      scenes: [
        { id: 's1', title: 'The Tavern', chapterId: 'c1', characterIds: ['ch1'], timelinePosition: 1 },
        { id: 's2', title: 'The Forest', chapterId: 'c1', characterIds: ['ch1', 'ch2'], timelinePosition: 2 },
      ],
      status: 'draft',
      wordCount: 1200,
    },
    {
      id: 'c2',
      title: 'Chapter 2: The Journey',
      content: '',
      scenes: [],
      status: 'draft',
      wordCount: 0,
    }
  ],
  characters: [
    { id: 'ch1', name: 'Aria', role: 'protagonist', physicalDescription: 'Tall with red hair.', relationships: [{id: 'r1', characterId1: 'ch1', characterId2: 'ch2', type: 'friend'}] },
    { id: 'ch2', name: 'Born', role: 'secondary', relationships: [] },
  ],
  locations: [
    { id: 'l1', name: 'Greenleaf', type: 'other', description: 'A small village.', significance: 'Home of Aria' },
  ],
  loreItems: [
      { id: 'lo1', name: 'The Artifact', category: 'magic', content: 'A powerful ancient artifact.' }
  ],
  timelineEvents: [
      { id: 'e1', title: 'The Great War', dateMode: 'absolute', absoluteDate: '1200 AE', participants: [], importance: 'high' },
       { id: 'e2', title: 'Aria is born', dateMode: 'absolute', absoluteDate: '1220 AE', participants: ['ch1'], importance: 'medium' }
  ]
};

export default function Home() {
  const { activeView, isSidebarOpen } = useUIStore();
  const { activeProject, setActiveProject } = useProjectStore();

  // Load mock project for demo purposes if none exists
  useEffect(() => {
    if (!activeProject) {
      setActiveProject(MOCK_PROJECT);
    }
  }, [activeProject, setActiveProject]);

  const renderContent = () => {
    switch (activeView) {
      case 'editor':
        return <div className="h-full overflow-hidden"><Editor /></div>;
      case 'entities':
        return <EntityList />;
      case 'relations':
        return <RelationsDiagram />;
      case 'timeline':
        return <TimelineView />;
      case 'stats':
        return <StatsDashboard />;
      default:
        // Default fallbacks for views not yet implemented fully or placeholders
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
             <div className="text-lg font-medium mb-2">View: {activeView}</div>
             <p className="text-sm">This module is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <LoadingScreen />
      <Header />
      <Sidebar />

      <main
        className={`
          flex-1 overflow-hidden mt-[48px] mb-[22px] transition-all duration-300 bg-background
          ${isSidebarOpen ? 'ml-[220px]' : 'ml-[48px]'}
        `}
      >
        {renderContent()}
      </main>

      <StatusBar />
    </div>
  );
}
