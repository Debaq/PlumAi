import { Relationship } from '@/types/domain';
import { Plus, Heart } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Button } from '@/components/ui/button';

interface RelationshipManagerProps {
  characterId: string;
  relationships: Relationship[];
}

export const RelationshipManager = ({ characterId, relationships }: RelationshipManagerProps) => {
  const { openModal } = useUIStore();
  const { activeProject } = useProjectStore();

  const getTargetName = (id: string) => {
    return activeProject?.characters.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Heart className="w-4 h-4 text-primary" />
          Relaciones
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-[10px] gap-1 px-2"
          onClick={() => openModal('editRelationship', { ownerId: characterId })}
        >
          <Plus className="w-3 h-3" /> Añadir
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {relationships.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed rounded-lg opacity-40">
            <p className="text-xs italic text-muted-foreground">No hay relaciones definidas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {relationships.map(rel => (
              <div 
                key={rel.id} 
                onClick={() => openModal('editRelationship', { ...rel, ownerId: characterId })}
                className="flex items-center justify-between p-3 bg-accent/5 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-accent/10 transition-all cursor-pointer group"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{getTargetName(rel.characterId)}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {rel.currentType}
                    </span>
                  </div>
                  {rel.currentDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-1 italic">
                      "{rel.currentDescription}"
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground/60 px-1.5 py-0.5 rounded border">
                    {rel.currentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
