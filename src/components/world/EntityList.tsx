import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { CharacterCard } from './CharacterCard';
import { CharacterGridCard } from './CharacterGridCard';
import { LocationCard } from './LocationCard';
import { SceneCard } from './SceneCard';
import { CreatureCard } from './CreatureCard';
import { CreatureGridCard } from './CreatureGridCard';
import { WorldRuleCard } from './WorldRuleCard';
import { WorldRuleGridCard } from './WorldRuleGridCard';
import { Button } from '@/components/ui/button';
import { Plus, Map } from 'lucide-react';

export const EntityList = () => {
  const { activeProject } = useProjectStore();
  const { activeLoreTab, openModal, setActiveLoreTab } = useUIStore();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Sync selectedEntityId when tab changes
  useEffect(() => {
    setSelectedEntityId(null);
  }, [activeLoreTab]);

  if (!activeProject) return <div>No project loaded.</div>;

  const handleAddNew = () => {
    switch (activeLoreTab) {
      case 'characters': openModal('editCharacter'); break;
      case 'summary': openModal('loreItem'); break;
      case 'locations': openModal('editLocation'); break;
      case 'scenes': openModal('newScene'); break;
      case 'bestiary': openModal('editCreature'); break;
      case 'worldRules': openModal('editWorldRule'); break;
    }
  };

  const handleEntityClick = (item: any) => {
    if (activeLoreTab === 'summary') {
      openModal('loreItem', item);
    } else if (activeLoreTab === 'locations') {
      openModal('editLocation', item);
    } else if (activeLoreTab === 'worldRules') {
      setSelectedEntityId(item.id);
    } else {
      setSelectedEntityId(item.id);
    }
  };

  const handleViewMap = () => {
    setActiveLoreTab('map');
  };

  const renderContent = () => {
    // List View
    const getList = () => {
      switch (activeLoreTab) {
        case 'characters': return activeProject.characters;
        case 'locations': return activeProject.locations;
        case 'scenes': return activeProject.scenes || [];
        case 'summary': return activeProject.loreItems;
        case 'bestiary': return activeProject.creatures || [];
        case 'worldRules': return activeProject.worldRules || [];
        default: return [];
      }
    };

    if (selectedEntityId && activeLoreTab !== 'summary') {
      if (activeLoreTab === 'characters') {
        const char = activeProject.characters.find(c => c.id === selectedEntityId);
        return char ? <CharacterCard character={char} onBack={() => setSelectedEntityId(null)} /> : <div>Character not found</div>;
      }
      if (activeLoreTab === 'locations') {
        const loc = activeProject.locations.find(l => l.id === selectedEntityId);
        return loc ? <LocationCard location={loc} onBack={() => setSelectedEntityId(null)} /> : <div>Location not found</div>;
      }
      if (activeLoreTab === 'scenes') {
        const scene = (activeProject.scenes || []).find(s => s.id === selectedEntityId);
        return scene ? <SceneCard scene={scene} onBack={() => setSelectedEntityId(null)} /> : <div>Scene not found</div>;
      }
      if (activeLoreTab === 'bestiary') {
        const creature = (activeProject.creatures || []).find(c => c.id === selectedEntityId);
        return creature ? <CreatureCard creature={creature} onBack={() => setSelectedEntityId(null)} /> : <div>Creature not found</div>;
      }
      if (activeLoreTab === 'worldRules') {
        const rule = (activeProject.worldRules || []).find(r => r.id === selectedEntityId);
        return rule ? <WorldRuleCard rule={rule} onBack={() => setSelectedEntityId(null)} /> : <div>Rule not found</div>;
      }
    }

    const list = getList();

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold capitalize">
            {activeLoreTab === 'summary' ? 'Lore Items' :
             activeLoreTab === 'bestiary' ? 'Bestiario' :
             activeLoreTab === 'worldRules' ? 'Reglas del Mundo' :
             activeLoreTab}
          </h2>
          <div className="flex gap-2">
             {activeLoreTab === 'locations' && (
                <Button size="sm" variant="secondary" className="gap-2" onClick={handleViewMap}>
                  <Map className="w-4 h-4" />
                  Ver Mapa
                </Button>
             )}
             <Button size="sm" className="gap-2" onClick={handleAddNew}>
                <Plus className="w-4 h-4" />
                Añadir {
                  activeLoreTab === 'summary' ? 'Lore' :
                  activeLoreTab === 'bestiary' ? 'Criatura' :
                  activeLoreTab === 'worldRules' ? 'Regla' :
                  activeLoreTab.slice(0, -1)
                }
             </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((item: any) => {
            if (activeLoreTab === 'characters') {
              return (
                <CharacterGridCard
                  key={item.id}
                  character={item}
                  onClick={() => handleEntityClick(item)}
                />
              );
            }
            if (activeLoreTab === 'bestiary') {
              return (
                <CreatureGridCard
                  key={item.id}
                  creature={item}
                  onClick={() => handleEntityClick(item)}
                />
              );
            }
            if (activeLoreTab === 'worldRules') {
              return (
                <WorldRuleGridCard
                  key={item.id}
                  rule={item}
                  onClick={() => handleEntityClick(item)}
                />
              );
            }
            return (
              <div
                key={item.id}
                onClick={() => handleEntityClick(item)}
                className="group p-4 bg-card border border-border rounded-lg shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              >
                <h3 className="font-bold group-hover:text-primary transition-colors">{item.name || item.title}</h3>
                {item.role && <p className="text-xs text-muted-foreground capitalize mt-1 italic">{item.role}</p>}
                {item.type && <p className="text-xs text-muted-foreground capitalize mt-1">{item.type}</p>}
                {item.category && (
                  <div className="mt-3">
                    <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-muted-foreground font-medium uppercase tracking-tighter">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
               <p className="text-muted-foreground">No {activeLoreTab === 'bestiary' ? 'criaturas' : activeLoreTab === 'worldRules' ? 'reglas' : activeLoreTab} found in this project.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      {renderContent()}
    </div>
  );
};
