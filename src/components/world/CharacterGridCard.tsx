import { Character } from '@/types/domain';
import { useProjectStore } from '@/stores/useProjectStore';
import { Badge } from '@/components/ui/badge';
import { User, Heart, Zap } from 'lucide-react';

interface CharacterGridCardProps {
  character: Character;
  onClick: () => void;
}

export const CharacterGridCard = ({ character, onClick }: CharacterGridCardProps) => {
  const { activeProject } = useProjectStore();
  const isWorldbuilder = activeProject?.isRpgModeEnabled;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'antagonist': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'secondary': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('alive') || s.includes('vivo') || s.includes('healthy') || s.includes('sano')) return 'text-green-500';
    if (s.includes('dead') || s.includes('muerto')) return 'text-red-500';
    if (s.includes('wounded') || s.includes('herido') || s.includes('sick')) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer h-full"
    >
      {/* Top Half: Image */}
      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {character.avatarUrl ? (
          <img 
            src={character.avatarUrl} 
            alt={character.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <User size={64} />
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={`${getRoleBadgeColor(character.role)} border backdrop-blur-md`}>
            {character.role}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                {character.name}
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${getStatusColor(character.currentVitalStatus)}`}>
                {character.currentVitalStatus}
            </p>
        </div>
      </div>

      {/* Bottom Half: Info & Stats */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Short bio / Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
            {character.physicalDescription || character.personality || 'Sin descripción detallada.'}
        </p>

        {/* Worldbuilder Stats Section */}
        {isWorldbuilder && (
          <div className="mt-auto space-y-2 pt-3 border-t border-border/50">
            <div className="grid grid-cols-1 gap-1.5">
                {Object.entries(character.attributes || {}).slice(0, 3).map(([key, value]) => {
                    const originalValue = character.attributeHistory && character.attributeHistory.length > 0 
                        ? character.attributeHistory[0].attributes[key] 
                        : value;
                    const hasChanged = originalValue !== undefined && originalValue !== value;

                    return (
                        <div key={key} className="flex items-center justify-between bg-muted/30 px-2 py-1 rounded border border-border/20 group/stat">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground truncate mr-1">{key}</span>
                            <div className="flex items-center gap-1.5">
                                {hasChanged && (
                                    <span className="text-[9px] text-muted-foreground line-through opacity-50">{originalValue}</span>
                                )}
                                <span className="text-[10px] font-black text-primary">{value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {Object.keys(character.attributes || {}).length > 3 && (
                <p className="text-[8px] text-center text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
                    + {Object.keys(character.attributes || {}).length - 3} atributos más
                </p>
            )}
            {Object.keys(character.attributes || {}).length === 0 && (
                <p className="text-[9px] text-center text-muted-foreground italic py-1">
                    Sin estadísticas definidas
                </p>
            )}
          </div>
        )}

        {/* Relationships count etc */}
        {!isWorldbuilder && (
            <div className="flex items-center gap-3 mt-auto pt-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                    <Heart size={10} className="text-red-500/50" />
                    {character.relationships?.length || 0} Vínculos
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                    <Zap size={10} className="text-yellow-500/50" />
                    {character.vitalStatusHistory?.length || 0} Eventos
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
