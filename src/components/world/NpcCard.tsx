import { Npc } from '@/types/domain';
import { ArrowLeft, Edit, Target, ScrollText, MessageSquare, MapPin, UserRound, Lock, Clock, Link2 } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AITextArea } from '@/components/ui/ai-textarea';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NpcCardProps {
  npc: Npc;
  onBack: () => void;
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

const QUEST_STATUS_COLORS: Record<string, string> = {
  available: 'text-blue-400',
  active: 'text-amber-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

export const NpcCard = ({ npc, onBack }: NpcCardProps) => {
  const { t } = useTranslation();
  const { updateNpc, activeProject } = useProjectStore();
  const { openModal } = useUIStore();
  const [description, setDescription] = useState(npc.description || '');
  const [personality, setPersonality] = useState(npc.personality || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    updateNpc(npc.id, { description, personality });
    setHasChanges(false);
  };

  const linkedCharacter = npc.linkedCharacterId
    ? activeProject?.characters.find(c => c.id === npc.linkedCharacterId)
    : null;

  const relatedLocations = (npc.relatedLocationIds || [])
    .map(id => activeProject?.locations.find(l => l.id === id))
    .filter(Boolean);

  const otherNpcs = (activeProject?.npcs || []).filter(n => n.id !== npc.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('npcs.card.back')}
          </button>
          <Button variant="ghost" size="sm" className="gap-2 h-8 text-muted-foreground" onClick={() => openModal('editNpc', npc)}>
            <Edit className="w-3.5 h-3.5" />
            {t('npcs.card.edit')}
          </Button>
        </div>
        {hasChanges && (
          <Button size="sm" className="gap-2 h-8" onClick={handleSave}>
            <Save className="w-3 h-3" />
            {t('npcs.card.save')}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start bg-card/50 p-6 rounded-xl border border-border/50">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{npc.name}</h2>
              <Badge className={`${DISPOSITION_COLORS[npc.disposition]} border`}>
                {t(`npcs.disposition.${npc.disposition}`)}
              </Badge>
              <Badge className={`${IMPORTANCE_COLORS[npc.importance]} border`}>
                {t(`npcs.importance.${npc.importance}`)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {npc.role && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                  {npc.role}
                </span>
              )}
              {npc.faction && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-muted text-muted-foreground border border-border">
                  {npc.faction}
                </span>
              )}
            </div>
          </div>
          {npc.imageUrl && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0 ml-4">
              <img src={npc.imageUrl} alt={npc.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('npcs.fields.personality')}</label>
                <AITextArea
                  className="min-h-[120px]"
                  value={personality}
                  onChange={(e) => { setPersonality(e.target.value); setHasChanges(true); }}
                  placeholder={t('npcs.fields.personalityPlaceholder')}
                  label="Personality"
                  context={`NPC: ${npc.name}, Role: ${npc.role || ''}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('npcs.fields.description')}</label>
                <AITextArea
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
                  placeholder={t('npcs.fields.descriptionPlaceholder')}
                  label="Description"
                  context={`NPC: ${npc.name}, Role: ${npc.role || ''}`}
                />
              </div>
            </div>

            {/* Key Dialogues */}
            {npc.dialogues && npc.dialogues.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <MessageSquare size={14} />
                  {t('npcs.fields.dialogues')}
                </h3>
                <div className="space-y-2">
                  {npc.dialogues.map((d) => (
                    <div key={d.id} className="p-4 bg-card rounded-lg border border-border">
                      <span className="text-[10px] font-bold uppercase text-primary block mb-1">{d.context}</span>
                      <p className="text-sm text-foreground/80 italic">"{d.dialogue}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quests */}
            {npc.quests && npc.quests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <ScrollText size={14} />
                  {t('npcs.fields.quests')}
                </h3>
                <div className="space-y-2">
                  {npc.quests.map((q) => (
                    <div key={q.id} className="p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm">{q.name}</h4>
                        <span className={`text-[10px] font-bold uppercase ${QUEST_STATUS_COLORS[q.status]}`}>
                          {t(`npcs.questStatus.${q.status}`)}
                        </span>
                      </div>
                      {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            {npc.schedule && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <Clock size={14} />
                  {t('npcs.fields.schedule')}
                </h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{npc.schedule}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            {Object.keys(npc.stats || {}).length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-2">
                  <Target size={14} />
                  {t('npcs.fields.stats')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(npc.stats).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded border border-border/20">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{key}</span>
                      <span className="text-sm font-black text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory */}
            {npc.inventory && npc.inventory.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">{t('npcs.fields.inventory')}</h3>
                <div className="flex flex-wrap gap-1">
                  {npc.inventory.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Secrets */}
            {npc.secrets && npc.secrets.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <Lock size={14} />
                  {t('npcs.fields.secrets')}
                </h3>
                <div className="space-y-1">
                  {npc.secrets.map((s, i) => (
                    <p key={i} className="text-sm text-muted-foreground italic">- {s}</p>
                  ))}
                </div>
              </div>
            )}

            {/* NPC Relationships */}
            {npc.relationships && npc.relationships.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <UserRound size={14} />
                  {t('npcs.fields.relationships')}
                </h3>
                <div className="space-y-2">
                  {npc.relationships.map((rel) => {
                    const targetNpc = otherNpcs.find(n => n.id === rel.targetNpcId);
                    return (
                      <div key={rel.id} className="text-sm">
                        <span className="font-bold text-primary">{targetNpc?.name || '???'}</span>
                        <span className="text-muted-foreground"> - {rel.type}</span>
                        {rel.description && <p className="text-xs text-muted-foreground/70 mt-0.5">{rel.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Locations */}
            {relatedLocations.length > 0 && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <MapPin size={14} />
                  {t('npcs.fields.locations')}
                </h3>
                <div className="space-y-1">
                  {relatedLocations.map((loc) => loc && (
                    <div key={loc.id} className="text-sm text-primary hover:underline cursor-pointer">
                      {loc.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Character */}
            {linkedCharacter && (
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                  <Link2 size={14} />
                  {t('npcs.fields.linkedCharacter')}
                </h3>
                <div className="flex items-center gap-2">
                  {linkedCharacter.avatarUrl && (
                    <img src={linkedCharacter.avatarUrl} alt={linkedCharacter.name} className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <span className="text-sm font-bold text-primary">{linkedCharacter.name}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {npc.notes && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">{t('npcs.fields.notes')}</h3>
                <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{npc.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
