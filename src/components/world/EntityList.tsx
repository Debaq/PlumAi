import React, { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { User, MapPin, BookOpen } from 'lucide-react';
import { CharacterCard } from './CharacterCard';
import { LocationCard } from './LocationCard';
import { LoreCard } from './LoreCard';

type EntityTab = 'characters' | 'locations' | 'lore';

export const EntityList = () => {
  const { activeProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<EntityTab>('characters');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  if (!activeProject) return <div>No project loaded.</div>;

  const renderContent = () => {
    if (selectedEntityId) {
      if (activeTab === 'characters') {
        const char = activeProject.characters.find(c => c.id === selectedEntityId);
        return char ? <CharacterCard character={char} onBack={() => setSelectedEntityId(null)} /> : <div>Character not found</div>;
      }
      if (activeTab === 'locations') {
        const loc = activeProject.locations.find(l => l.id === selectedEntityId);
        return loc ? <LocationCard location={loc} onBack={() => setSelectedEntityId(null)} /> : <div>Location not found</div>;
      }
      if (activeTab === 'lore') {
        const item = activeProject.loreItems.find(l => l.id === selectedEntityId);
        return item ? <LoreCard loreItem={item} onBack={() => setSelectedEntityId(null)} /> : <div>Lore item not found</div>;
      }
    }

    // List View
    const getList = () => {
      switch (activeTab) {
        case 'characters': return activeProject.characters;
        case 'locations': return activeProject.locations;
        case 'lore': return activeProject.loreItems;
        default: return [];
      }
    };

    const list = getList();

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((item: any) => (
            <div
              key={item.id}
              onClick={() => setSelectedEntityId(item.id)}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold">{item.name || item.title}</h3>
              {item.role && <p className="text-xs text-gray-500 capitalize">{item.role}</p>}
              {item.type && <p className="text-xs text-gray-500 capitalize">{item.type}</p>}
              {item.category && <p className="text-xs text-gray-500 capitalize">{item.category}</p>}
            </div>
          ))}
          {list.length === 0 && <p className="text-gray-500">No items found.</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {!selectedEntityId && (
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeTab === 'characters' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <User className="w-4 h-4" />
            <span>Characters</span>
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeTab === 'locations' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <MapPin className="w-4 h-4" />
            <span>Locations</span>
          </button>
          <button
            onClick={() => setActiveTab('lore')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${activeTab === 'lore' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Lore</span>
          </button>
        </div>
      )}
      {renderContent()}
    </div>
  );
};
