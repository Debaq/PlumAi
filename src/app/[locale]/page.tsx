'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Editor } from '@/components/editor/editor';
import { EntityList } from '@/components/world/EntityList';
import { RelationsDiagram } from '@/components/visualization/RelationsDiagram';
import { TimelineView } from '@/components/visualization/TimelineView';
import { StatsDashboard } from '@/components/visualization/StatsDashboard';

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
    { id: 'l1', name: 'Greenleaf', type: 'village', description: 'A small village.', significance: 'Home of Aria' },
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
  const { activeView } = useUIStore();
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
        return <div className="p-8 max-w-4xl mx-auto"><Editor /></div>;
      case 'entities':
        return <EntityList />;
      case 'relations':
        return <RelationsDiagram />;
      case 'timeline':
        return <TimelineView />;
      case 'stats':
        return <StatsDashboard />;
      default:
        return <div>Select a module</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Sidebar />
      <main className="flex-1 overflow-hidden h-screen bg-white dark:bg-gray-950">
        {renderContent()}
      </main>
    </div>
  );
}
