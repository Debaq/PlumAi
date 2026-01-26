import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useIdentity } from '@/hooks/useIdentity';
import { useBannerStore } from '@/stores/useBannerStore';
import { useTranslation } from 'react-i18next';
import {
  Book,
  Film,
  Image as ImageIcon,
  GitBranch,
  BookMarked,
  Sparkles,
  ChevronLeft,
  BarChart,
  Dices,
  Brain,
  Settings,
  Save,
  Skull,
  BookCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { activeProject, saveProject, closeProject } = useProjectStore();
  const { 
    activeView, 
    setActiveView, 
    isSidebarOpen, 
    toggleSidebar, 
    isRpgPanelOpen, 
    toggleRpgPanel, 
    setActiveLoreTab, 
    activeLoreTab,
    goBack
  } = useUIStore();
  const { ragStudioEnabled } = useSettingsStore();
  const { rotateBanner } = useBannerStore();
  const { getBanner } = useIdentity();
  const { t } = useTranslation();

  const sidebarBanner = getBanner('sidebar');
  const [bannerPosition, setBannerPosition] = useState(50); // Default center

  const handleSettingsClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeView === 'settings') {
      goBack();
    } else {
      setActiveView('settings');
    }
  };

  // On mount or when banner changes (if rotated externally), randomize position initially too? 
  // Or just keep it static until clicked. Let's randomize on mount once.
  useEffect(() => {
    setBannerPosition(Math.floor(Math.random() * 100));
  }, []);

    const handleBannerClick = () => {
      rotateBanner('sidebar');
      setBannerPosition(Math.floor(Math.random() * 100));
    };
  
    const showBanner = activeView === 'projects' || (activeView === 'settings' && !activeProject);
  
    if (!isSidebarOpen) {
       return (
          <aside className="w-[48px] bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 transition-all duration-300 fixed top-[48px] bottom-[22px] left-0 z-40 overflow-hidden">
             {showBanner ? (
               <div 
                 className="absolute inset-0 z-[-1] cursor-pointer group" 
                 onClick={handleBannerClick} 
                 title={t('sidebar.show')}
               >
                 {sidebarBanner ? (
                   <img 
                     src={sidebarBanner} 
                     alt="Project Manager" 
                     className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100"
                     style={{ objectPosition: `${bannerPosition}% 50%` }}
                   />
                 ) : (
                   <div className="w-full h-full bg-sidebar-accent/10 flex items-center justify-center">
                      <BookMarked className="w-6 h-6 text-sidebar-border opacity-20" />
                   </div>
                 )}
                 
                 {/* Navigation Buttons in Banner Mode */}
                 <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2 z-10">
                    {activeView === 'settings' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveView('projects');
                        }}
                        className="p-2 rounded-md bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-sm transition-all mb-2"
                        title={t('common.back')}
                      >
                        <BookMarked className="w-5 h-5" />
                      </button>
                    )}
                    
                  <button
                     onClick={handleSettingsClick}
                     className={`p-2 rounded-md backdrop-blur-sm transition-all ${
                       activeView === 'settings' 
                         ? 'bg-primary text-primary-foreground shadow-md' 
                         : 'bg-black/20 hover:bg-black/40 text-white/70 hover:text-white'
                     }`}
                     title={t('sidebar.settings')}
                   >
                     <Settings className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             ) : (
               <>
                 <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:text-sidebar-foreground">
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                 </button>
                 {activeProject?.isRpgModeEnabled && (
                   <button
                     onClick={toggleRpgPanel}
                     className={`mt-4 p-2 rounded-md transition-colors ${
                       isRpgPanelOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                     }`}
                     title={t('ai.settings.worldbuilder.title')}
                   >
                     <Dices className="w-5 h-5" />
                   </button>
                 )}
      
                 <div className="mt-auto flex flex-col items-center gap-2 mb-8">
                   {activeProject && (
                     <button
                       className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                       title={t('header.saveProject')}
                       onClick={() => saveProject()}
                     >
                       <Save className="w-5 h-5" />
                     </button>
                   )}
                   <button
                     onClick={handleSettingsClick}
                     className={`p-2 rounded-md transition-colors ${
                       activeView === 'settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                     }`}
                     title={t('sidebar.settings')}
                   >
                     <Settings className="w-5 h-5" />
                   </button>
                 </div>
               </>
             )}
             
             {/* Allow expanding even in banner mode */}
             {showBanner && (
               <button 
                 onClick={toggleSidebar} 
                 className="absolute top-4 left-1/2 -translate-x-1/2 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-md backdrop-blur-sm transition-all"
               >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
               </button>
             )}
          </aside>
       )
    }
  
    const NavItem = ({ view, icon: Icon, label, count, onClick, isActive }: { view: any, icon: any, label: string, count?: number, onClick?: () => void, isActive?: boolean }) => {
      const active = isActive !== undefined ? isActive : activeView === view;
      return (
        <button
          onClick={onClick || (() => setActiveView(view))}
          className={`
            flex items-center w-full px-3 py-1.5 text-sm rounded-r-sm
            transition-colors mb-[1px] relative group
            ${active
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
    };
  
    return (
      <aside className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 fixed top-[48px] bottom-[22px] left-0 z-40 overflow-hidden">
        <div className="flex-1 overflow-y-auto py-2 px-0 space-y-6 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent relative z-10">
          {showBanner ? (
             <div className="absolute inset-0 z-[-1] overflow-hidden bg-sidebar cursor-pointer group" onClick={handleBannerClick} title="Click to change banner">
               {sidebarBanner ? (
                 <>
                  <img 
                    src={sidebarBanner} 
                    alt="Project Manager" 
                    className="w-full h-full object-cover transition-all duration-700"
                    style={{ objectPosition: `${bannerPosition}% 50%` }}
                  />
                 </>
               ) : (
                 <div className="w-full h-full bg-sidebar-accent/10 flex items-center justify-center">
                    <BookMarked className="w-12 h-12 text-sidebar-border opacity-20" />
                 </div>
               )}
             </div>
          ) : activeProject ? (
            <div>
              <nav className="space-y-0.5 pr-2">              <NavItem
                view="lore"
                icon={Book}
                label={t('sidebar.lore')}
                count={activeProject.characters.length + activeProject.locations.length + activeProject.loreItems.length}
                onClick={() => {
                  setActiveView('lore');
                  setActiveLoreTab('summary');
                }}
                isActive={activeView === 'lore' && !['bestiary', 'worldRules'].includes(activeLoreTab)}
              />
              <NavItem view="chapters" icon={Book} label={t('sidebar.chapters')} count={activeProject.chapters.length} />
              <NavItem view="scenes" icon={Film} label={t('sidebar.scenes')} count={activeProject.scenes?.length || 0} />
              <NavItem view="images" icon={ImageIcon} label={t('sidebar.images')} />

              <div className="h-px bg-sidebar-border my-2 mx-3" />

              <NavItem view="projectSettings" icon={Settings} label={t('sidebar.projectSettings')} />
              <NavItem view="versionControl" icon={GitBranch} label={t('sidebar.versionControl')} />
              <NavItem view="publishing" icon={BookMarked} label={t('sidebar.publishing')} />
              <NavItem view="stats" icon={BarChart} label={t('sidebar.stats')} />
              <NavItem view="aiAssistant" icon={Sparkles} label={t('sidebar.aiAssistant')} />

              {ragStudioEnabled && (
                <NavItem view="ragStudio" icon={Brain} label={t('sidebar.ragStudio')} />
              )}
              
              {activeProject.isRpgModeEnabled && (
                <>
                  <div className="h-px bg-sidebar-border my-2 mx-3" />
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Worldbuilder
                    </span>
                  </div>
                  <NavItem
                    view="lore"
                    icon={Skull}
                    label={t('sidebar.bestiary')}
                    count={activeProject.creatures?.length || 0}
                    onClick={() => {
                      setActiveView('lore');
                      setActiveLoreTab('bestiary');
                    }}
                    isActive={activeView === 'lore' && activeLoreTab === 'bestiary'}
                  />
                  <NavItem
                    view="lore"
                    icon={BookCheck}
                    label={t('sidebar.worldRules')}
                    count={activeProject.worldRules?.length || 0}
                    onClick={() => {
                      setActiveView('lore');
                      setActiveLoreTab('worldRules');
                    }}
                    isActive={activeView === 'lore' && activeLoreTab === 'worldRules'}
                  />
                  <button
                    onClick={toggleRpgPanel}
                    className={`
                      flex items-center w-full px-3 py-1.5 text-sm rounded-r-sm
                      transition-colors mb-[1px] relative group
                      ${isRpgPanelOpen
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary pl-[10px]'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent'
                      }
                    `}
                  >
                    <Dices className="w-4 h-4 mr-3 shrink-0" />
                    <span className="truncate flex-1 text-left">{t('ai.settings.worldbuilder.title')}</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        ) : (
          <div className="p-4 text-center">
             <div className="h-20" /> {/* Spacer to push content down if banner is present */}
             {!showBanner && <p className="text-muted-foreground text-sm">{t('project.noProjectLoaded')}.</p>}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-2 space-y-1 bg-sidebar border-t border-sidebar-border pb-8">
        {activeProject && activeView !== 'projects' && (
          <button
            onClick={async () => {
              await saveProject();
              await closeProject();
              setActiveView('projects');
            }}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            title={t('modals.projectSettings.title')}
          >
            <Save className="w-4 h-4 mr-3 shrink-0" />
            <span className="truncate flex-1 text-left">{t('common.save')} & {t('common.close')}</span>
          </button>
        )}

        <button
          onClick={handleSettingsClick}
          className={`
            flex items-center w-full px-3 py-2 text-sm rounded-md
            transition-colors
            ${activeView === 'settings'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }
          `}
        >
          <Settings className="w-4 h-4 mr-3 shrink-0" />
          <span className="truncate flex-1 text-left">{t('sidebar.settings')}</span>
        </button>
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