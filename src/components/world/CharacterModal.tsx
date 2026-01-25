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
import { UserPlus, Trash2, User, Sparkles, Upload, Loader2 } from 'lucide-react';
import { AITextArea } from '@/components/ui/ai-textarea';
import { CharacterAttributeEditor } from '@/components/rpg/CharacterAttributeEditor';

const CHARACTER_ROLES = [
  { id: 'protagonist', label: 'Protagonista' },
  { id: 'antagonist', label: 'Antagonista' },
  { id: 'secondary', label: 'Secundario' },
  { id: 'supporting', label: 'Apoyo' },
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

  const handleDelete = () => {
    if (isEditing && confirm(`¿Estás seguro de que quieres eliminar a ${name}?`)) {
      deleteCharacter(modalData.id);
      closeModal();
    }
  };

  return (
    <Dialog open={activeModal === 'editCharacter'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <User className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
            {isEditing ? 'Editar Personaje' : 'Nuevo Personaje'}
          </DialogTitle>
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
                   <Upload size={14} /> Subir
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleGenerateImage} disabled={isGeneratingImage || (!name && !physicalDescription)}>
                   {isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                   Generar con IA
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="char-name">Nombre</Label>
              <Input 
                id="char-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nombre del personaje..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="char-role">Rol en la Historia</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger id="char-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARACTER_ROLES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="char-physical">Descripción Física</Label>
              <AITextArea 
                id="char-physical" 
                value={physicalDescription} 
                onChange={(e) => setPhysicalDescription(e.target.value)} 
                placeholder="Ej: Alto, ojos azules, cicatriz en..."
                className="min-h-[100px]"
                label="Physical Description"
                context={`Character Name: ${name}. Role: ${role}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="char-personality">Personalidad</Label>
              <AITextArea 
                id="char-personality" 
                value={personality} 
                onChange={(e) => setPersonality(e.target.value)} 
                placeholder="Ej: Introvertido, valiente, sarcástico..."
                className="min-h-[100px]"
                label="Personality"
                context={`Character Name: ${name}. Role: ${role}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="char-history">Historia / Trasfondo</Label>
            <AITextArea 
              id="char-history" 
              value={history} 
              onChange={(e) => setHistory(e.target.value)} 
              placeholder="Origen, motivaciones, eventos pasados..."
              className="min-h-[120px]"
              label="Backstory"
              context={`Character Name: ${name}. Role: ${role}. Personality: ${personality}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="char-notes">Notas Privadas</Label>
            <AITextArea 
              id="char-notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Secretos, debilidades, planes futuros..."
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
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => closeModal()}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={!name.trim()}>
              {isEditing ? 'Guardar Cambios' : 'Crear Personaje'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
