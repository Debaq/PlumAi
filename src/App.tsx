import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Editor } from '@/components/editor/editor';
import { EntityList } from '@/components/world/EntityList';
import { RelationsDiagram } from '@/components/visualization/RelationsDiagram';
import { TopologicalMap } from '@/components/visualization/TopologicalMap';
import { TimelineView } from '@/components/visualization/TimelineView';
import { StatsDashboard } from '@/components/visualization/StatsDashboard';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { AIChat } from '@/components/ai/AIChat';
import { Dashboard } from '@/components/world/Dashboard';
import { ChapterList } from '@/components/world/ChapterList';
import { ChapterModal } from '@/components/world/ChapterModal';
import { SceneModal } from '@/components/world/SceneModal';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { WelcomeModal } from '@/components/world/WelcomeModal';
import { NewProjectModal } from '@/components/world/NewProjectModal';
import { CharacterModal } from '@/components/world/CharacterModal';
import { LoreModal } from '@/components/world/LoreModal';
import { ContextBanner } from '@/components/ui/ContextBanner';
import { TimelineEventModal } from '@/components/world/TimelineEventModal';
import { LocationModal } from '@/components/world/LocationModal';
import { RelationshipModal } from '@/components/world/RelationshipModal';
import { CommandPalette } from '@/components/ui/command-palette';
import { ImagesGallery } from '@/components/world/ImagesGallery';
import { AIAssistantView } from '@/components/ai/AIAssistantView';
import { VersionControlView } from '@/components/version-control/VersionControlView';
import { PublishingView } from '@/components/world/PublishingView';
import { AppLock } from '@/components/layout/AppLock';
import { useAutoSnapshot } from '@/hooks/useAutoSnapshot';
import { WorldbuilderPanel } from '@/components/rpg/WorldbuilderPanel';
import { RagStudioView } from '@/components/ai/RagStudioView';

function App() {
  const { activeView, isSidebarOpen, activeLoreTab, openModal, editorZenMode } = useUIStore();
  const { activeProject } = useProjectStore();

  useAutoSnapshot();

  useEffect(() => {
    document.title = activeProject?.isRpgModeEnabled ? 'PlumaAI Worldbuilder' : 'PlumaAI';
  }, [activeProject?.isRpgModeEnabled]);

  useEffect(() => {
    // Legacy-like initialization: If no project is persisted, show welcome modal
    if (!activeProject) {
      openModal('welcome');
    }
  }, [activeProject, openModal]);

  const renderContent = () => {
    switch (activeView) {
      case 'editor':
        return <div className="h-full overflow-hidden"><Editor /></div>;
      case 'entities':
      case 'lore':
        if (activeLoreTab === 'summary') return <Dashboard />;
        if (activeLoreTab === 'relations') return <RelationsDiagram />;
        if (activeLoreTab === 'events') return <TimelineView />;
        if (activeLoreTab === 'locations') return <EntityList />;
        if (activeLoreTab === 'scenes') return <EntityList />;
        if (activeLoreTab === 'map') return <TopologicalMap />;
        return <EntityList />;
      case 'chapters':
        return <ChapterList />;
      case 'scenes':
        return <EntityList />;
      case 'images':
        return <ImagesGallery />;
      case 'versionControl':
        return <VersionControlView />;
      case 'publishing':
        return <PublishingView />;
      case 'relations':
        return <RelationsDiagram />;
      case 'timeline':
        return <TimelineView />;
      case 'stats':
        return <StatsDashboard />;
      case 'aiAssistant':
        return <AIAssistantView />;
      case 'ragStudio':
        return <RagStudioView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
             <div className="text-lg font-medium mb-2">{activeProject?.isRpgModeEnabled ? 'PlumaAI Worldbuilder' : 'PlumaAI'}</div>
             <p className="text-sm">This module is under construction.</p>
          </div>
        );
    }
  };

  const getBannerContext = () => {
    if (activeView === 'chapters') return 'chapters';
    if (activeView === 'scenes') return 'scenes';
    if (activeView === 'images') return 'images';
    if (activeView === 'versionControl') return 'versionControl';
    if (activeView === 'stats') return 'stats';
    if (activeView === 'aiAssistant') return 'aiAssistant';
    if (activeView === 'ragStudio') return 'ragStudio';
    if (activeView === 'rpgTools') return 'worldbuilder';
    
    if (activeView === 'lore' || activeView === 'entities') {
      if (activeLoreTab === 'characters') return 'characters';
      if (activeLoreTab === 'relations') return 'relations';
      if (activeLoreTab === 'locations' || activeLoreTab === 'map') return 'locations';
      if (activeLoreTab === 'events') return 'events';
      if (activeLoreTab === 'scenes') return 'scenes';
      return 'lore';
    }
    return null;
  };

  const bannerContext = getBannerContext();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <LoadingScreen />
      {!editorZenMode && <Header />}
      {!editorZenMode && <Sidebar /> }
      <ChapterModal />
      <SceneModal />
      <SettingsModal />
      <WelcomeModal />
      <NewProjectModal />
      <CharacterModal />
      <LoreModal />
      <TimelineEventModal />
      <LocationModal />
      <RelationshipModal />
      <CommandPalette />

      <main
        className={`
          flex-1 flex flex-col overflow-hidden ${!editorZenMode ? 'mt-[48px] mb-[22px]' : ''} transition-all duration-300 bg-background
          ${isSidebarOpen && !editorZenMode ? 'ml-[220px]' : (editorZenMode ? 'ml-0' : 'ml-[48px]')}
        `}
      >
        {bannerContext && !editorZenMode && <ContextBanner context={bannerContext} />}
        {renderContent()}
      </main>

      {!editorZenMode && <StatusBar />}
      <AIChat />
      <AppLock />
      <WorldbuilderPanel />
    </div>
  );
}

export default App;
