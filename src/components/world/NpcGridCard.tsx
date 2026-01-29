import { Npc } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { UserRound, ScrollText, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NpcGridCardProps {
  npc: Npc;
  onClick: () => void;
}

const DISPOSITION_COLORS: Record<string, string> = {
  friendly: 'bg-green-500/10 text-green-500 border-green-500/20',
  neutral: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  hostile: 'bg-red-500/10 text-red-500 border-red-500/20',
  unknown: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const IMPORTANCE_COLORS: Record<string, string> = {
  key: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  major: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  minor: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  secondary: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export const NpcGridCard = ({ npc, onClick }: NpcGridCardProps) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer h-full"
    >
      {/* Top Half: Image */}
      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {npc.imageUrl ? (
          <img
            src={npc.imageUrl}
            alt={npc.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <UserRound size={64} />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={`${DISPOSITION_COLORS[npc.disposition]} border backdrop-blur-md text-[10px]`}>
            {t(`npcs.disposition.${npc.disposition}`)}
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          <Badge className={`${IMPORTANCE_COLORS[npc.importance]} border backdrop-blur-md text-[10px]`}>
            {t(`npcs.importance.${npc.importance}`)}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
            {npc.name}
          </h3>
          {npc.role && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              {npc.role}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Half: Info */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Faction */}
        {npc.faction && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
            {npc.faction}
          </p>
        )}

        {/* Personality preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          {npc.personality || npc.description || t('common.noDescription')}
        </p>

        {/* Stats & quests */}
        <div className="mt-auto space-y-2 pt-3 border-t border-border/50">
          {Object.keys(npc.stats || {}).length > 0 && (
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(npc.stats).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-muted/30 px-2 py-1 rounded border border-border/20">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground truncate mr-1">{key}</span>
                  <span className="text-[10px] font-black text-primary">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {(npc.quests?.length || 0) > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <ScrollText size={10} className="text-amber-500/50" />
                {npc.quests?.length} {t('npcs.fields.quests')}
              </div>
            )}
            {Object.keys(npc.stats || {}).length > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <Swords size={10} className="text-blue-500/50" />
                {Object.keys(npc.stats).length} stats
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
