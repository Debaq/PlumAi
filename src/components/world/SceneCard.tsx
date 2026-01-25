import { Scene } from '@/types/domain';
import { ArrowLeft, Film, MapPin, Users, BookOpen } from 'lucide-react';
import { MediaManager } from './MediaManager';
import { useProjectStore } from '@/stores/useProjectStore';

interface SceneCardProps {
  scene: Scene;
  onBack: () => void;
}

export const SceneCard = ({ scene, onBack }: SceneCardProps) => {
  const { activeProject } = useProjectStore();
  
  const location = activeProject?.locations.find(l => l.id === scene.locationId);
  const chapter = activeProject?.chapters.find(c => c.id === scene.chapterId);
  const characters = activeProject?.characters.filter(c => scene.characterIds.includes(c.id)) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Film className="w-6 h-6 text-primary" />
              {scene.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {chapter && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  <BookOpen className="w-3 h-3" />
                  {chapter.title}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <MapPin className="w-3 h-3" />
                  {location.name}
                </span>
              )}
            </div>
          </div>
          <MediaManager imageUrl={scene.image} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <div className="p-3 bg-muted/30 rounded-md text-sm min-h-[100px] border">
                  {scene.description || <span className="italic text-muted-foreground">No description provided.</span>}
                </div>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <div className="p-3 bg-muted/30 rounded-md text-sm min-h-[60px] border">
                  {scene.notes || <span className="italic text-muted-foreground">No notes.</span>}
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Characters in this Scene
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {characters.map(char => (
                <div key={char.id} className="flex items-center gap-3 p-2 bg-card border rounded-md">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs">
                    {char.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{char.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{char.role}</div>
                  </div>
                </div>
              ))}
              {characters.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No characters assigned to this scene.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};