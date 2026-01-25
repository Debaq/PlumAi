import { Creature } from '@/types/domain';
import { ArrowLeft, Edit, Swords, Shield, Target, MapPin, Package } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AITextArea } from '@/components/ui/ai-textarea';
import { Save } from 'lucide-react';

interface CreatureCardProps {
  creature: Creature;
  onBack: () => void;
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

export const CreatureCard = ({ creature, onBack }: CreatureCardProps) => {
  const { updateCreature, activeProject } = useProjectStore();
  const { openModal } = useUIStore();
  const [description, setDescription] = useState(creature.description || '');
  const [behavior, setBehavior] = useState(creature.behavior || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    updateCreature(creature.id, {
      description,
      behavior
    });
    setHasChanges(false);
  };

  const relatedLocations = (creature.relatedLocationIds || [])
    .map(id => activeProject?.locations.find(l => l.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al bestiario
          </button>
          <Button variant="ghost" size="sm" className="gap-2 h-8 text-muted-foreground" onClick={() => openModal('editCreature', creature)}>
            <Edit className="w-3.5 h-3.5" />
            Editar Criatura
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
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{creature.name}</h2>
              <Badge className={`${DANGER_COLORS[creature.dangerLevel]} border`}>
                {creature.dangerLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                {creature.type}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-muted text-muted-foreground border border-border">
                {SIZE_LABELS[creature.size] || creature.size}
              </span>
              {creature.challengeRating && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-muted text-muted-foreground border border-border">
                  CR {creature.challengeRating}
                </span>
              )}
            </div>
          </div>
          {creature.imageUrl && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0 ml-4">
              <img src={creature.imageUrl} alt={creature.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Physical Description */}
            {creature.physicalDescription && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Descripción Física</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{creature.physicalDescription}</p>
              </div>
            )}

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Descripción General</label>
                <AITextArea
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Historia, origen, rol en el mundo..."
                  label="Description"
                  context={`Creature: ${creature.name}, Type: ${creature.type}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Comportamiento</label>
                <AITextArea
                  className="min-h-[120px]"
                  value={behavior}
                  onChange={(e) => {
                    setBehavior(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Comportamiento típico, instintos..."
                  label="Behavior"
                  context={`Creature: ${creature.name}, Type: ${creature.type}`}
                />
              </div>
            </div>

            {/* Abilities */}
            {creature.abilities && creature.abilities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <Swords size={14} />
                  Habilidades
                </h3>
                <div className="space-y-2">
                  {creature.abilities.map((ability) => (
                    <div key={ability.id} className="p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm">{ability.name}</h4>
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          {ability.damage && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded">{ability.damage}</span>}
                          {ability.range && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">{ability.range}</span>}
                          {ability.cooldown && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">{ability.cooldown}</span>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{ability.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            {Object.keys(creature.stats || {}).length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
                  <Target size={14} />
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(creature.stats).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded border border-border/20">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{key}</span>
                      <span className="text-sm font-black text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Combat Info */}
            <div className="p-4 bg-card rounded-lg border border-border space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <Shield size={14} />
                Combate
              </h3>

              {creature.weaknesses && creature.weaknesses.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-red-500 block mb-1">Debilidades</span>
                  <div className="flex flex-wrap gap-1">
                    {creature.weaknesses.map((w, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-red-500/30 text-red-500">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {creature.resistances && creature.resistances.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-500 block mb-1">Resistencias</span>
                  <div className="flex flex-wrap gap-1">
                    {creature.resistances.map((r, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-blue-500/30 text-blue-500">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {creature.immunities && creature.immunities.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-yellow-500 block mb-1">Inmunidades</span>
                  <div className="flex flex-wrap gap-1">
                    {creature.immunities.map((im, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-500">{im}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Habitat */}
            {creature.habitat && creature.habitat.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <MapPin size={14} />
                  Hábitat
                </h3>
                <div className="flex flex-wrap gap-1">
                  {creature.habitat.map((h, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{h}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Loot */}
            {creature.loot && creature.loot.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <Package size={14} />
                  Botín
                </h3>
                <div className="flex flex-wrap gap-1">
                  {creature.loot.map((l, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{l}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Locations */}
            {relatedLocations.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Ubicaciones</h3>
                <div className="space-y-1">
                  {relatedLocations.map((loc) => loc && (
                    <div key={loc.id} className="text-sm text-primary hover:underline cursor-pointer">
                      {loc.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {creature.notes && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Notas del Autor</h3>
                <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{creature.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
