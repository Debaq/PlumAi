import { Creature } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { Skull, Swords, Shield } from 'lucide-react';

interface CreatureGridCardProps {
  creature: Creature;
  onClick: () => void;
}

const DANGER_COLORS: Record<string, string> = {
  trivial: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  deadly: 'bg-red-500/10 text-red-500 border-red-500/20',
  legendary: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const SIZE_LABELS: Record<string, string> = {
  tiny: 'Diminuto',
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
  huge: 'Enorme',
  gargantuan: 'Gargantuesco',
};

export const CreatureGridCard = ({ creature, onClick }: CreatureGridCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer h-full"
    >
      {/* Top Half: Image */}
      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {creature.imageUrl ? (
          <img
            src={creature.imageUrl}
            alt={creature.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Skull size={64} />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={`${DANGER_COLORS[creature.dangerLevel]} border backdrop-blur-md text-[10px]`}>
            {creature.dangerLevel.toUpperCase()}
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="backdrop-blur-md text-[10px]">
            {SIZE_LABELS[creature.size] || creature.size}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
            {creature.name}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            {creature.type}
          </p>
        </div>
      </div>

      {/* Bottom Half: Info & Stats */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Short description */}
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          {creature.physicalDescription || creature.description || 'Sin descripción detallada.'}
        </p>

        {/* Stats Section */}
        <div className="mt-auto space-y-2 pt-3 border-t border-border/50">
          {/* Stats preview */}
          {Object.keys(creature.stats || {}).length > 0 && (
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(creature.stats).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-muted/30 px-2 py-1 rounded border border-border/20">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground truncate mr-1">{key}</span>
                  <span className="text-[10px] font-black text-primary">{value}</span>
                </div>
              ))}
            </div>
          )}

          {Object.keys(creature.stats || {}).length > 3 && (
            <p className="text-[8px] text-center text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
              + {Object.keys(creature.stats || {}).length - 3} stats más
            </p>
          )}

          {/* Quick info */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <Swords size={10} className="text-red-500/50" />
              {creature.abilities?.length || 0} Habilidades
            </div>
            {creature.challengeRating && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <Shield size={10} className="text-blue-500/50" />
                CR {creature.challengeRating}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
