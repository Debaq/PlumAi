import { WorldRule } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { Wand2, Atom, Users, Swords, Coins, Church, Leaf, Cpu, Clock, Ghost, HelpCircle, EyeOff, Link2 } from 'lucide-react';
import type { WorldRuleCategory } from '@/types/domain';

interface WorldRuleGridCardProps {
  rule: WorldRule;
  onClick: () => void;
}

const CATEGORY_CONFIG: Record<WorldRuleCategory, { icon: any; color: string; bgColor: string }> = {
  magic: { icon: Wand2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  physics: { icon: Atom, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  social: { icon: Users, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  combat: { icon: Swords, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  economy: { icon: Coins, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  religion: { icon: Church, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  nature: { icon: Leaf, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  technology: { icon: Cpu, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  temporal: { icon: Clock, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  metaphysical: { icon: Ghost, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  custom: { icon: HelpCircle, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

const IMPORTANCE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  fundamental: { label: 'Fundamental', color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/20' },
  major: { label: 'Mayor', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
  minor: { label: 'Menor', color: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500/20' },
};

const CATEGORY_LABELS: Record<WorldRuleCategory, string> = {
  magic: 'Magia',
  physics: 'Física',
  social: 'Social',
  combat: 'Combate',
  economy: 'Economía',
  religion: 'Religión',
  nature: 'Naturaleza',
  technology: 'Tecnología',
  temporal: 'Temporal',
  metaphysical: 'Metafísica',
  custom: 'Personalizado',
};

export const WorldRuleGridCard = ({ rule, onClick }: WorldRuleGridCardProps) => {
  const categoryConfig = CATEGORY_CONFIG[rule.category] || CATEGORY_CONFIG.custom;
  const importanceConfig = IMPORTANCE_CONFIG[rule.importance] || IMPORTANCE_CONFIG.major;
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer h-full"
    >
      {/* Header with icon */}
      <div className={`relative h-32 w-full ${categoryConfig.bgColor} flex items-center justify-center`}>
        <CategoryIcon size={48} className={`${categoryConfig.color} opacity-30 group-hover:opacity-50 transition-opacity`} />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={`${importanceConfig.bgColor} ${importanceConfig.color} border text-[10px]`}>
            {importanceConfig.label}
          </Badge>
        </div>

        {rule.isSecret && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="backdrop-blur-md text-[10px] gap-1">
              <EyeOff size={10} />
              Secreto
            </Badge>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-foreground font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
            {rule.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Category badge */}
        <Badge variant="outline" className={`w-fit ${categoryConfig.color} border-current/30 text-[10px]`}>
          <CategoryIcon size={10} className="mr-1" />
          {rule.category === 'custom' && rule.customCategory ? rule.customCategory : CATEGORY_LABELS[rule.category]}
        </Badge>

        {/* Summary or content preview */}
        <p className="text-xs text-muted-foreground line-clamp-3">
          {rule.summary || rule.content || 'Sin descripción.'}
        </p>

        {/* Footer info */}
        <div className="mt-auto pt-3 border-t border-border/50 flex items-center gap-3">
          {rule.exceptions && rule.exceptions.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500/70">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              {rule.exceptions.length} excepciones
            </div>
          )}
          {rule.examples && rule.examples.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {rule.examples.length} ejemplos
            </div>
          )}
          {rule.relatedRuleIds && rule.relatedRuleIds.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <Link2 size={10} />
              {rule.relatedRuleIds.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
