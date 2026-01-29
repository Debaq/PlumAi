import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { confirm } from '@/stores/useConfirmStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { UserRound, Trash2, Upload, Plus, X, Swords, MessageSquare, ScrollText } from 'lucide-react';
import { AITextArea } from '@/components/ui/ai-textarea';
import type { NpcDisposition, NpcImportance, NpcQuest, NpcDialogue, NpcRelationship } from '@/types/domain';

export const NpcModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { addNpc, updateNpc, deleteNpc, activeProject } = useProjectStore();

  const isEditing = activeModal === 'editNpc' && modalData?.id;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [faction, setFaction] = useState('');
  const [disposition, setDisposition] = useState<NpcDisposition>('neutral');
  const [importance, setImportance] = useState<NpcImportance>('minor');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stats, setStats] = useState<Record<string, number | string>>({});
  const [inventory, setInventory] = useState<string[]>([]);
  const [inventoryInput, setInventoryInput] = useState('');
  const [quests, setQuests] = useState<NpcQuest[]>([]);
  const [dialogues, setDialogues] = useState<NpcDialogue[]>([]);
  const [secrets, setSecrets] = useState<string[]>([]);
  const [secretInput, setSecretInput] = useState('');
  const [npcRelationships, setNpcRelationships] = useState<NpcRelationship[]>([]);
  const [schedule, setSchedule] = useState('');
  const [linkedCharacterId, setLinkedCharacterId] = useState('');
  const [notes, setNotes] = useState('');

  const [newStatKey, setNewStatKey] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModal === 'editNpc') {
      if (modalData) {
        setName(modalData.name || '');
        setRole(modalData.role || '');
        setFaction(modalData.faction || '');
        setDisposition(modalData.disposition || 'neutral');
        setImportance(modalData.importance || 'minor');
        setDescription(modalData.description || '');
        setPersonality(modalData.personality || '');
        setImageUrl(modalData.imageUrl || '');
        setStats(modalData.stats || {});
        setInventory(modalData.inventory || []);
        setQuests(modalData.quests || []);
        setDialogues(modalData.dialogues || []);
        setSecrets(modalData.secrets || []);
        setNpcRelationships(modalData.relationships || []);
        setSchedule(modalData.schedule || '');
        setLinkedCharacterId(modalData.linkedCharacterId || '');
        setNotes(modalData.notes || '');
      } else {
        resetForm();
      }
    }
  }, [activeModal, modalData]);

  const resetForm = () => {
    setName('');
    setRole('');
    setFaction('');
    setDisposition('neutral');
    setImportance('minor');
    setDescription('');
    setPersonality('');
    setImageUrl('');
    setStats({});
    setInventory([]);
    setQuests([]);
    setDialogues([]);
    setSecrets([]);
    setNpcRelationships([]);
    setSchedule('');
    setLinkedCharacterId('');
    setNotes('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addToList = (list: string[], setList: (l: string[]) => void, value: string, setValue: (v: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue('');
    }
  };

  const removeFromList = (list: string[], setList: (l: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const addStat = () => {
    if (newStatKey.trim() && newStatValue.trim()) {
      const value = isNaN(Number(newStatValue)) ? newStatValue : Number(newStatValue);
      setStats({ ...stats, [newStatKey.trim()]: value });
      setNewStatKey('');
      setNewStatValue('');
    }
  };

  const removeStat = (key: string) => {
    const newStats = { ...stats };
    delete newStats[key];
    setStats(newStats);
  };

  const addQuest = () => {
    setQuests([...quests, { id: crypto.randomUUID(), name: '', status: 'available' }]);
  };

  const updateQuest = (index: number, field: keyof NpcQuest, value: string) => {
    const updated = [...quests];
    updated[index] = { ...updated[index], [field]: value };
    setQuests(updated);
  };

  const removeQuest = (index: number) => {
    setQuests(quests.filter((_, i) => i !== index));
  };

  const addDialogue = () => {
    setDialogues([...dialogues, { id: crypto.randomUUID(), context: '', dialogue: '' }]);
  };

  const updateDialogue = (index: number, field: keyof NpcDialogue, value: string) => {
    const updated = [...dialogues];
    updated[index] = { ...updated[index], [field]: value };
    setDialogues(updated);
  };

  const removeDialogue = (index: number) => {
    setDialogues(dialogues.filter((_, i) => i !== index));
  };

  const addNpcRelationship = () => {
    setNpcRelationships([...npcRelationships, { id: crypto.randomUUID(), targetNpcId: '', type: '', description: '' }]);
  };

  const updateNpcRelationship = (index: number, field: keyof NpcRelationship, value: string) => {
    const updated = [...npcRelationships];
    updated[index] = { ...updated[index], [field]: value };
    setNpcRelationships(updated);
  };

  const removeNpcRelationship = (index: number) => {
    setNpcRelationships(npcRelationships.filter((_, i) => i !== index));
  };

  if (activeModal !== 'editNpc') return null;

  const otherNpcs = (activeProject?.npcs || []).filter(n => !modalData?.id || n.id !== modalData.id);
  const characters = activeProject?.characters || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      role: role.trim(),
      faction: faction.trim(),
      disposition,
      importance,
      description: description.trim(),
      personality: personality.trim(),
      imageUrl,
      stats,
      inventory,
      quests: quests.filter(q => q.name.trim()),
      dialogues: dialogues.filter(d => d.dialogue.trim()),
      secrets,
      relationships: npcRelationships.filter(r => r.targetNpcId),
      schedule: schedule.trim(),
      linkedCharacterId: linkedCharacterId || undefined,
      relatedLocationIds: modalData?.relatedLocationIds || [],
      notes: notes.trim(),
    };

    if (isEditing && modalData?.id) {
      updateNpc(modalData.id, data);
    } else {
      addNpc(data as any);
    }

    closeModal();
  };

  const handleDelete = async () => {
    if (isEditing && await confirm(t('npcs.modal.deleteConfirm', { name }), { variant: 'destructive', confirmText: t('common.delete') })) {
      deleteNpc(modalData.id);
      closeModal();
    }
  };

  return (
    <Dialog open={activeModal === 'editNpc'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="w-5 h-5 text-primary" />
            {isEditing ? t('npcs.modal.edit') : t('npcs.modal.new')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-border bg-muted group">
              {imageUrl ? (
                <img src={imageUrl} alt="NPC" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <UserRound size={48} className="opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button type="button" size="icon" variant="ghost" className="text-white hover:text-white hover:bg-white/20" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} />
                </Button>
                {imageUrl && (
                  <Button type="button" size="icon" variant="ghost" className="text-white hover:text-white hover:bg-white/20" onClick={() => setImageUrl('')}>
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> {t('common.change')}
            </Button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('npcs.fields.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('npcs.fields.namePlaceholder')} required />
            </div>
            <div className="space-y-2">
              <Label>{t('npcs.fields.role')}</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={t('npcs.fields.rolePlaceholder')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('npcs.fields.faction')}</Label>
              <Input value={faction} onChange={(e) => setFaction(e.target.value)} placeholder={t('npcs.fields.factionPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label>{t('npcs.fields.disposition')}</Label>
              <Select value={disposition} onValueChange={(v: string) => setDisposition(v as NpcDisposition)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['friendly', 'neutral', 'hostile', 'unknown'] as NpcDisposition[]).map(d => (
                    <SelectItem key={d} value={d}>{t(`npcs.disposition.${d}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('npcs.fields.importance')}</Label>
              <Select value={importance} onValueChange={(v: string) => setImportance(v as NpcImportance)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['key', 'major', 'minor', 'secondary'] as NpcImportance[]).map(imp => (
                    <SelectItem key={imp} value={imp}>{t(`npcs.importance.${imp}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Personality & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('npcs.fields.personality')}</Label>
              <AITextArea
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder={t('npcs.fields.personalityPlaceholder')}
                className="min-h-[100px]"
                label="Personality"
                context={`NPC: ${name}, Role: ${role}`}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('npcs.fields.description')}</Label>
              <AITextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('npcs.fields.descriptionPlaceholder')}
                className="min-h-[100px]"
                label="Description"
                context={`NPC: ${name}, Role: ${role}`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 border-t pt-4">
            <Label className="flex items-center gap-2">
              <Swords size={16} />
              {t('npcs.fields.stats')}
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(stats).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="gap-1 pr-1">
                  <span className="font-bold">{key}:</span> {value}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => removeStat(key)}>
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder={t('npcs.fields.stats')} value={newStatKey} onChange={(e) => setNewStatKey(e.target.value)} className="flex-1" />
              <Input placeholder="Value" value={newStatValue} onChange={(e) => setNewStatValue(e.target.value)} className="w-24" />
              <Button type="button" variant="outline" size="icon" onClick={addStat}><Plus size={16} /></Button>
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-2 border-t pt-4">
            <Label>{t('npcs.fields.inventory')}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {inventory.map((item, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {item}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => removeFromList(inventory, setInventory, i)}>
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder={t('npcs.fields.inventoryPlaceholder')} value={inventoryInput} onChange={(e) => setInventoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(inventory, setInventory, inventoryInput, setInventoryInput))} />
              <Button type="button" variant="outline" size="icon" onClick={() => addToList(inventory, setInventory, inventoryInput, setInventoryInput)}><Plus size={16} /></Button>
            </div>
          </div>

          {/* Quests */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2"><ScrollText size={16} />{t('npcs.fields.quests')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuest} className="gap-1"><Plus size={14} /> {t('entityList.add')}</Button>
            </div>
            {quests.map((quest, index) => (
              <div key={quest.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                <div className="flex gap-2">
                  <Input placeholder={t('npcs.fields.questName')} value={quest.name} onChange={(e) => updateQuest(index, 'name', e.target.value)} className="flex-1" />
                  <Select value={quest.status} onValueChange={(v: string) => updateQuest(index, 'status', v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['available', 'active', 'completed', 'failed'] as const).map(s => (
                        <SelectItem key={s} value={s}>{t(`npcs.questStatus.${s}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeQuest(index)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <Input placeholder={t('npcs.fields.questDescription')} value={quest.description || ''} onChange={(e) => updateQuest(index, 'description', e.target.value)} />
              </div>
            ))}
          </div>

          {/* Dialogues */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2"><MessageSquare size={16} />{t('npcs.fields.dialogues')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDialogue} className="gap-1"><Plus size={14} /> {t('entityList.add')}</Button>
            </div>
            {dialogues.map((dialogue, index) => (
              <div key={dialogue.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                <div className="flex gap-2">
                  <Input placeholder={t('npcs.fields.dialogueContextPlaceholder')} value={dialogue.context} onChange={(e) => updateDialogue(index, 'context', e.target.value)} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeDialogue(index)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <AITextArea
                  placeholder={t('npcs.fields.dialogueTextPlaceholder')}
                  value={dialogue.dialogue}
                  onChange={(e) => updateDialogue(index, 'dialogue', e.target.value)}
                  className="min-h-[60px]"
                  label="NPC Dialogue"
                  context={`NPC: ${name}, Context: ${dialogue.context}`}
                />
              </div>
            ))}
          </div>

          {/* Secrets */}
          <div className="space-y-2 border-t pt-4">
            <Label>{t('npcs.fields.secrets')}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {secrets.map((s, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1 border-amber-500/30 text-amber-500">
                  {s}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/20" onClick={() => removeFromList(secrets, setSecrets, i)}>
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder={t('npcs.fields.secretsPlaceholder')} value={secretInput} onChange={(e) => setSecretInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(secrets, setSecrets, secretInput, setSecretInput))} />
              <Button type="button" variant="outline" size="icon" onClick={() => addToList(secrets, setSecrets, secretInput, setSecretInput)}><Plus size={16} /></Button>
            </div>
          </div>

          {/* NPC Relationships */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>{t('npcs.fields.relationships')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addNpcRelationship} className="gap-1"><Plus size={14} /> {t('entityList.add')}</Button>
            </div>
            {npcRelationships.map((rel, index) => (
              <div key={rel.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                <div className="flex gap-2">
                  <Select value={rel.targetNpcId} onValueChange={(v: string) => updateNpcRelationship(index, 'targetNpcId', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder={t('npcs.fields.relationTarget')} /></SelectTrigger>
                    <SelectContent>
                      {otherNpcs.map(n => (
                        <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder={t('npcs.fields.relationType')} value={rel.type} onChange={(e) => updateNpcRelationship(index, 'type', e.target.value)} className="w-32" />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeNpcRelationship(index)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div className="space-y-2 border-t pt-4">
            <Label>{t('npcs.fields.schedule')}</Label>
            <AITextArea
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder={t('npcs.fields.schedulePlaceholder')}
              className="min-h-[80px]"
              label="Schedule"
              context={`NPC: ${name}, Role: ${role}`}
            />
          </div>

          {/* Linked Character */}
          <div className="space-y-2 border-t pt-4">
            <Label>{t('npcs.fields.linkedCharacter')}</Label>
            <p className="text-xs text-muted-foreground">{t('npcs.fields.linkedCharacterHint')}</p>
            <Select value={linkedCharacterId || '_none'} onValueChange={(v: string) => setLinkedCharacterId(v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">— {t('common.noResults')} —</SelectItem>
                {characters.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2 border-t pt-4">
            <Label>{t('npcs.fields.notes')}</Label>
            <AITextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('npcs.fields.notesPlaceholder')}
              className="min-h-[80px] bg-muted/20"
              label="Private Notes"
              context={`NPC: ${name}`}
            />
          </div>
        </form>

        <DialogFooter className="p-4 border-t bg-muted/30 flex justify-between items-center sm:justify-between">
          <div>
            {isEditing && (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                {t('common.delete')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => closeModal()}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={!name.trim()}>
              {isEditing ? t('common.saveChanges') : t('common.create')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
