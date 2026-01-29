import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { generateImageAI } from '@/lib/ai/client-ai';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { UserPlus, Trash2, User, Sparkles, Upload, Loader2, Dices } from 'lucide-react';
import { confirm } from '@/stores/useConfirmStore';
import { AITextArea } from '@/components/ui/ai-textarea';
import { CharacterAttributeEditor } from '@/components/rpg/CharacterAttributeEditor';
import { generateRandomCharacter } from '@/lib/fantasyGenerator';

const CHARACTER_ROLES = [
  { id: 'protagonist', label: 'characterModal.roles.protagonist' },
  { id: 'antagonist', label: 'characterModal.roles.antagonist' },
  { id: 'secondary', label: 'characterModal.roles.secondary' },
  { id: 'supporting', label: 'characterModal.roles.supporting' },
];

export const CharacterModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { addCharacter, updateCharacter, deleteCharacter } = useProjectStore();

  const isEditing = activeModal === 'editCharacter' && modalData?.id;
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<'protagonist' | 'antagonist' | 'secondary' | 'supporting'>('secondary');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [history, setHistory] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeProject } = useProjectStore();

  useEffect(() => {
    if (activeModal === 'editCharacter') {
      if (modalData) {
        setName(modalData.name || '');
        setRole(modalData.role || 'secondary');
        setPhysicalDescription(modalData.physicalDescription || '');
        setPersonality(modalData.personality || '');
        setHistory(modalData.history || '');
        setNotes(modalData.notes || '');
        setAvatarUrl(modalData.avatarUrl || '');
        setAttributes(modalData.attributes || {});
      } else {
        setName('');
        setRole('secondary');
        setPhysicalDescription('');
        setPersonality('');
        setHistory('');
        setNotes('');
        setAvatarUrl('');
        setAttributes({});
      }
    }
  }, [activeModal, modalData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!physicalDescription && !name) return;
    setIsGeneratingImage(true);
    try {
      const prompt = `Character portrait of ${name}, ${physicalDescription || 'fantasy character'}, detailed, high quality, digital art`;
      // We use a dummy key for the demo/pollinations fallback if no real key is set
      const url = await generateImageAI(prompt, 'openai', 'dummy-key'); 
      setAvatarUrl(url);
    } catch (error) {
      console.error(error);
      alert('Error generating image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (activeModal !== 'editCharacter') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      role,
      physicalDescription: physicalDescription.trim(),
      personality: personality.trim(),
      history: history.trim(),
      notes: notes.trim(),
      avatarUrl,
      attributes,
      relationships: modalData?.relationships || []
    };

    if (isEditing && modalData?.id) {
      updateCharacter(modalData.id, data);
    } else {
      addCharacter(data);
    }
    
    closeModal();
  };

  const handleDelete = async () => {
    if (isEditing && await confirm(t('characterModal.deleteConfirm', { name }), { variant: 'destructive', confirmText: t('common.delete') })) {
      deleteCharacter(modalData.id);
      closeModal();
    }
  };

  const handleRandomize = () => {
    const data = generateRandomCharacter();
    setName(data.name);
    setRole(data.role);
    setPhysicalDescription(data.physicalDescription);
    setPersonality(data.personality);
    setHistory(data.history);
    setNotes(data.notes);
  };

  return (
    <Dialog open={activeModal === 'editCharacter'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? <User className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
              {isEditing ? t('characterModal.edit') : t('characterModal.new')}
            </DialogTitle>
            {!isEditing && (
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleRandomize}>
                <Dices className="w-4 h-4" />
                {t('common.randomize')}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
             <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border bg-muted group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User size={48} className="opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <Button type="button" size="icon" variant="ghost" className="text-white hover:text-white hover:bg-white/20" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} />
                   </Button>
                   {avatarUrl && (
                     <Button type="button" size="icon" variant="ghost" className="text-white hover:text-white hover:bg-white/20" onClick={() => setAvatarUrl('')}>
                        <Trash2 size={16} />
                     </Button>
                   )}
                </div>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             
             <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                   <Upload size={14} /> {t('characterModal.upload')}
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleGenerateImage} disabled={isGeneratingImage || (!name && !physicalDescription)}>
                   {isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                   {t('characterModal.generate')}
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="char-name">{t('characterModal.name')}</Label>
              <Input 
                id="char-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder={t('characterModal.namePlaceholder')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="char-role">{t('characterModal.role')}</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger id="char-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARACTER_ROLES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{t(r.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="char-physical">{t('characterModal.physical')}</Label>
              <AITextArea 
                id="char-physical" 
                value={physicalDescription} 
                onChange={(e) => setPhysicalDescription(e.target.value)} 
                placeholder={t('characterModal.physicalPlaceholder')}
                className="min-h-[100px]"
                label="Physical Description"
                context={`Character Name: ${name}. Role: ${role}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="char-personality">{t('characterModal.personality')}</Label>
              <AITextArea 
                id="char-personality" 
                value={personality} 
                onChange={(e) => setPersonality(e.target.value)} 
                placeholder={t('characterModal.personalityPlaceholder')}
                className="min-h-[100px]"
                label="Personality"
                context={`Character Name: ${name}. Role: ${role}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="char-history">{t('characterModal.history')}</Label>
            <AITextArea 
              id="char-history" 
              value={history} 
              onChange={(e) => setHistory(e.target.value)} 
              placeholder={t('characterModal.historyPlaceholder')}
              className="min-h-[120px]"
              label="Backstory"
              context={`Character Name: ${name}. Role: ${role}. Personality: ${personality}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="char-notes">{t('characterModal.notes')}</Label>
            <AITextArea 
              id="char-notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder={t('characterModal.notesPlaceholder')}
              className="min-h-[80px] bg-muted/20"
              label="Private Notes"
              context={`Character Name: ${name}. Role: ${role}`}
            />
          </div>

              {activeProject?.isRpgModeEnabled && (
                <div className="space-y-4 pt-4 border-t border-border mt-4">
                  <Label>Worldbuilder Stats</Label>
                  <CharacterAttributeEditor 
                    attributes={attributes} 
                    onChange={(newAttrs) => setAttributes(newAttrs)}
                  />
                </div>
              )}

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
              {isEditing ? t('common.saveChanges') : t('characterModal.new')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
