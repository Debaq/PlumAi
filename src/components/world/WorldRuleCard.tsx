import { WorldRule } from '@/types/domain';
import { ArrowLeft, Edit, BookOpen, Wand2, Atom, Users, Swords, Coins, Church, Leaf, Cpu, Clock, Ghost, HelpCircle, EyeOff, AlertTriangle, Sparkles, Link2 } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AITextArea } from '@/components/ui/ai-textarea';
import { Save } from 'lucide-react';
import type { WorldRuleCategory } from '@/types/domain';

interface WorldRuleCardProps {
  rule: WorldRule;
  onBack: () => void;
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

export const WorldRuleCard = ({ rule, onBack }: WorldRuleCardProps) => {
  const { updateWorldRule, activeProject } = useProjectStore();
  const { openModal } = useUIStore();
  const [content, setContent] = useState(rule.content || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    updateWorldRule(rule.id, { content });
    setHasChanges(false);
  };

  const categoryConfig = CATEGORY_CONFIG[rule.category] || CATEGORY_CONFIG.custom;
  const importanceConfig = IMPORTANCE_CONFIG[rule.importance] || IMPORTANCE_CONFIG.major;
  const CategoryIcon = categoryConfig.icon;

  const relatedRules = (rule.relatedRuleIds || [])
    .map(id => activeProject?.worldRules?.find(r => r.id === id))
    .filter(Boolean);

  const handleRelatedRuleClick = (ruleId: string) => {
    // Navigate to the related rule
    const relatedRule = activeProject?.worldRules?.find(r => r.id === ruleId);
    if (relatedRule) {
      openModal('editWorldRule', relatedRule);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a las reglas
          </button>
          <Button variant="ghost" size="sm" className="gap-2 h-8 text-muted-foreground" onClick={() => openModal('editWorldRule', rule)}>
            <Edit className="w-3.5 h-3.5" />
            Editar Regla
          </Button>
        </div>
        {hasChanges && (
          <Button size="sm" className="gap-2 h-8" onClick={handleSave}>
            <Save className="w-3 h-3" />
            Guardar Cambios
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start bg-card/50 p-6 rounded-xl border border-border/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${categoryConfig.bgColor}`}>
                <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{rule.title}</h2>
                {rule.isSecret && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <EyeOff size={12} />
                    Conocimiento Secreto
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={`${categoryConfig.bgColor} ${categoryConfig.color} border border-current/20`}>
                {rule.category === 'custom' && rule.customCategory ? rule.customCategory : CATEGORY_LABELS[rule.category]}
              </Badge>
              <Badge className={`${importanceConfig.bgColor} ${importanceConfig.color} border`}>
                {importanceConfig.label}
              </Badge>
            </div>
          </div>
          {rule.imageUrl && (
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0 ml-4">
              <img src={rule.imageUrl} alt={rule.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Summary */}
        {rule.summary && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-foreground/80 italic">{rule.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editable Content */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Contenido Detallado</label>
              <AITextArea
                className="min-h-[250px] font-serif leading-relaxed"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Describe la regla en detalle..."
                label="Rule Content"
                context={`Rule: ${rule.title}, Category: ${rule.category}`}
              />
            </div>

            {/* Examples */}
            {rule.examples && rule.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <Sparkles size={14} />
                  Ejemplos de Aplicación
                </h3>
                <div className="space-y-2">
                  {rule.examples.map((example) => (
                    <div key={example.id} className="p-4 bg-card rounded-lg border border-border">
                      <h4 className="font-bold text-sm mb-2">{example.title}</h4>
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Exceptions */}
            {rule.exceptions && rule.exceptions.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-500" />
                  Excepciones
                </h3>
                <ul className="space-y-2">
                  {rule.exceptions.map((exception, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="text-muted-foreground">{exception}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Rules */}
            {relatedRules.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
                  <Link2 size={14} />
                  Reglas Relacionadas
                </h3>
                <div className="space-y-2">
                  {relatedRules.map((relRule) => relRule && (
                    <button
                      key={relRule.id}
                      onClick={() => handleRelatedRuleClick(relRule.id)}
                      className="w-full text-left p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          const RelIcon = CATEGORY_CONFIG[relRule.category]?.icon || BookOpen;
                          const relColor = CATEGORY_CONFIG[relRule.category]?.color || 'text-primary';
                          return <RelIcon size={12} className={relColor} />;
                        })()}
                        <span className="text-sm font-medium text-primary">{relRule.title}</span>
                      </div>
                      {relRule.summary && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{relRule.summary}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Información</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoría</span>
                  <span className={categoryConfig.color}>{CATEGORY_LABELS[rule.category]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importancia</span>
                  <span className={importanceConfig.color}>{importanceConfig.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Excepciones</span>
                  <span>{rule.exceptions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ejemplos</span>
                  <span>{rule.examples?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
