import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { confirm } from '@/stores/useConfirmStore';
import { RelationshipHistoryEntry } from '@/types/domain';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Heart, Trash2, Plus, Clock, Calendar, Lock } from 'lucide-react';

const RELATION_TYPES = {
  positive: [
    { id: 'friend', label: 'characters.form.relationTypes.friend' },
    { id: 'love', label: 'characters.form.relationTypes.love' },
    { id: 'family', label: 'characters.form.relationTypes.family' },
    { id: 'mentor', label: 'characters.form.relationTypes.mentor' },
    { id: 'ally', label: 'characters.form.relationTypes.ally' },
  ],
  neutral: [
    { id: 'acquaintance', label: 'characters.form.relationTypes.acquaintance' },
    { id: 'colleague', label: 'characters.form.relationTypes.colleague' },
    { id: 'rival', label: 'characters.form.relationTypes.rival' },
  ],
  negative: [
    { id: 'enemy', label: 'characters.form.relationTypes.enemy' },
    { id: 'archenemy', label: 'characters.form.relationTypes.archenemy' },
  ]
};

const RELATION_STATUSES = [
  { id: 'active', label: 'relationships.statuses.active' },
  { id: 'strained', label: 'relationships.statuses.strained' },
  { id: 'improving', label: 'relationships.statuses.improving' },
  { id: 'deteriorating', label: 'relationships.statuses.deteriorating' },
  { id: 'ended', label: 'relationships.statuses.ended' },
  { id: 'complicated', label: 'relationships.statuses.complicated' },
];

export const RelationshipModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { activeProject, addRelationship, updateRelationshipHistory, deleteRelationship } = useProjectStore();

  const isEditing = activeModal === 'editRelationship' && modalData?.id;
  
  const [targetCharId, setTargetId] = useState('');
  const [type, setType] = useState('friend');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);

  useEffect(() => {
    if (activeModal === 'editRelationship') {
      if (modalData && modalData.id) {
        setTargetId(modalData.characterId);
        setType(modalData.currentType || 'friend');
        setStatus(modalData.currentStatus || 'active');
        setDescription(modalData.currentDescription || '');
        setIsSecret(modalData.isSecret || false);
        setShowHistoryForm(false);
      } else {
        setTargetId('');
        setType('friend');
        setStatus('active');
        setDescription('');
        setIsSecret(false);
        setShowHistoryForm(true);
      }
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'editRelationship') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCharId) return;

    if (isEditing) {
      updateRelationshipHistory(modalData.ownerId, modalData.id, {
        type,
        status,
        description,
        isSecret,
        notes: ''
      });
    } else {
      addRelationship(modalData.ownerId, targetCharId, type, status, description, isSecret);
    }
    
    closeModal();
  };

  const handleDelete = async () => {
    if (isEditing && await confirm(t('relationships.confirm.deleteRelationship'), { variant: 'destructive', confirmText: t('common.delete') })) {
      deleteRelationship(modalData.ownerId, modalData.id);
      closeModal();
    }
  };

  const owner = activeProject?.characters.find(c => c.id === modalData?.ownerId);
  const target = activeProject?.characters.find(c => c.id === (isEditing ? targetCharId : targetCharId));

  return (
    <Dialog open={activeModal === 'editRelationship'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {isEditing ? t('relationships.history') : t('relationships.create')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header info */}
          <div className="bg-accent/50 p-4 rounded-xl border flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('characters.defaultName')}</p>
              <p className="font-bold text-sm">{owner?.name}</p>
            </div>
            <div className="shrink-0">
              <Plus className="w-4 h-4 text-muted-foreground rotate-45" />
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('relationships.form.relatedCharacter')}</p>
              {isEditing ? (
                <p className="font-bold text-sm">{target?.name}</p>
              ) : (
                <select 
                  className="w-full bg-transparent font-bold text-sm text-center outline-none"
                  value={targetCharId}
                  onChange={(e) => setTargetId(e.target.value)}
                >
                  <option value="">{t('common.select')}...</option>
                  {activeProject?.characters
                    .filter(c => c.id !== owner?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              )}
            </div>
          </div>

          {(showHistoryForm || !isEditing) && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-card animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('relationships.form.type')}</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RELATION_TYPES).map(([group, items]) => (
                        <div key={group}>
                          <p className="px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground bg-muted/30">{group}</p>
                          {items.map(item => (
                            <SelectItem key={item.id} value={item.id}>{t(item.label)}</SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('relationships.form.currentStatus')}</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATION_STATUSES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{t(s.label)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/5">
                <div className="space-y-0.5">
                  <Label className="text-xs flex items-center gap-2">
                    <Lock className="w-3 h-3 text-primary" />
                    {t('worldRules.modal.secret')}
                  </Label>
                  <p className="text-[10px] text-muted-foreground">{t('relationships.form.additionalNotes')}</p>
                </div>
                <input 
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('relationships.form.whatHappened')}</Label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('relationships.form.whatHappenedPlaceholder')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {isEditing && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowHistoryForm(false)}>
                    {t('common.cancel')}
                  </Button>
                )}
                <Button type="submit" size="sm" disabled={!targetCharId || !description.trim()}>
                  {isEditing ? t('relationships.addChange') : t('relationships.create')}
                </Button>
              </div>
            </form>
          )}

          {isEditing && !showHistoryForm && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {t('relationships.history')}
                </h4>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setShowHistoryForm(true)}>
                  <Plus className="w-3 h-3" /> {t('relationships.addChange')}
                </Button>
              </div>

              <div className="space-y-4 relative pl-4 border-l-2 border-muted">
                {(modalData.history || []).slice().reverse().map((entry: RelationshipHistoryEntry) => (
                  <div key={entry.id} className="relative pb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-background border-2 border-primary" />
                    
                    <div className="bg-card border rounded-lg p-3 space-y-2 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {t(`characters.form.relationTypes.${entry.type}`)}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {t(`relationships.statuses.${entry.status}`)}
                          </span>
                          {entry.isSecret && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              {t('worldRules.modal.secret')}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-xs leading-relaxed italic text-muted-foreground">
                        "{entry.description}"
                      </p>

                      {entry.eventId && (
                        <div className="flex items-center gap-1 text-[9px] text-primary/70">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{t('timeline.form.event')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30 flex justify-between items-center sm:justify-between">
          <div>
            {isEditing && (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                {t('relationships.deleteRelationship')}
              </Button>
            )}
          </div>
          <Button type="button" variant="ghost" onClick={() => closeModal()}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
