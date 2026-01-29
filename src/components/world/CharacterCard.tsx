import { Character } from '@/types/domain';
import { ArrowLeft, Save, Edit } from 'lucide-react';
import { RelationshipManager } from './RelationshipManager';
import { MediaManager } from './MediaManager';
import { VitalStatusManager } from './VitalStatusManager';
import { useProjectStore } from '@/stores/useProjectStore';
import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';
import { AITextArea } from '@/components/ui/ai-textarea';
import { useTranslation } from 'react-i18next';

interface CharacterCardProps {
  character: Character;
  onBack: () => void;
}

export const CharacterCard = ({ character, onBack }: CharacterCardProps) => {
  const { t } = useTranslation();
  const { updateCharacter } = useProjectStore();
  const { openModal } = useUIStore();
  const [physicalDescription, setPhysicalDescription] = useState(character.physicalDescription || '');
  const [personality, setPersonality] = useState(character.personality || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    updateCharacter(character.id, {
      physicalDescription,
      personality
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('characterCard.back')}
          </button>
          <Button variant="ghost" size="sm" className="gap-2 h-8 text-muted-foreground" onClick={() => openModal('editCharacter', character)}>
            <Edit className="w-3.5 h-3.5" />
            {t('characterCard.edit')}
          </Button>
        </div>
        {hasChanges && (
          <Button size="sm" className="gap-2 h-8" onClick={handleSave}>
            <Save className="w-3 h-3" />
            {t('characterCard.save')}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start bg-card/50 p-6 rounded-xl border border-border/50">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{character.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                {t(`characterModal.roles.${character.role}`)}
              </span>
            </div>
          </div>
          <MediaManager imageUrl={character.avatarUrl} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('characterCard.physical')}</label>
                  <AITextArea
                    className="min-h-[150px]"
                    value={physicalDescription}
                    onChange={(e) => {
                      setPhysicalDescription(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder={t('characterCard.placeholders.physical')}
                    label="Physical Description"
                    context={`Character: ${character.name}`}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('characterCard.personality')}</label>
                  <AITextArea
                    className="min-h-[150px]"
                    value={personality}
                    onChange={(e) => {
                      setPersonality(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder={t('characterCard.placeholders.personality')}
                    label="Personality"
                    context={`Character: ${character.name}`}
                  />
               </div>
            </div>

            <RelationshipManager characterId={character.id} relationships={character.relationships} />
          </div>

          <div className="space-y-6">
            <VitalStatusManager character={character} />
          </div>
        </div>
      </div>
    </div>
  );
};
