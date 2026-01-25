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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Skull, Trash2, Sparkles, Upload, Loader2, Plus, X, Swords } from 'lucide-react';
import { AITextArea } from '@/components/ui/ai-textarea';
import type { CreatureSize, DangerLevel, CreatureAbility } from '@/types/domain';

const CREATURE_TYPES = [
  { id: 'beast', label: 'Bestia' },
  { id: 'dragon', label: 'Dragón' },
  { id: 'undead', label: 'No Muerto' },
  { id: 'humanoid', label: 'Humanoide' },
  { id: 'aberration', label: 'Aberración' },
  { id: 'construct', label: 'Constructo' },
  { id: 'elemental', label: 'Elemental' },
  { id: 'fey', label: 'Feérico' },
  { id: 'fiend', label: 'Infernal' },
  { id: 'celestial', label: 'Celestial' },
  { id: 'plant', label: 'Planta' },
  { id: 'ooze', label: 'Cieno' },
  { id: 'monstrosity', label: 'Monstruosidad' },
  { id: 'custom', label: 'Personalizado' },
];

const CREATURE_SIZES: { id: CreatureSize; label: string }[] = [
  { id: 'tiny', label: 'Diminuto' },
  { id: 'small', label: 'Pequeño' },
  { id: 'medium', label: 'Mediano' },
  { id: 'large', label: 'Grande' },
  { id: 'huge', label: 'Enorme' },
  { id: 'gargantuan', label: 'Gargantuesco' },
];

const DANGER_LEVELS: { id: DangerLevel; label: string; color: string }[] = [
  { id: 'trivial', label: 'Trivial', color: 'bg-gray-500' },
  { id: 'low', label: 'Bajo', color: 'bg-green-500' },
  { id: 'medium', label: 'Medio', color: 'bg-yellow-500' },
  { id: 'high', label: 'Alto', color: 'bg-orange-500' },
  { id: 'deadly', label: 'Letal', color: 'bg-red-500' },
  { id: 'legendary', label: 'Legendario', color: 'bg-purple-500' },
];

export const CreatureModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { addCreature, updateCreature, deleteCreature } = useProjectStore();

  const isEditing = activeModal === 'editCreature' && modalData?.id;

  const [name, setName] = useState('');
  const [type, setType] = useState('beast');
  const [size, setSize] = useState<CreatureSize>('medium');
  const [dangerLevel, setDangerLevel] = useState<DangerLevel>('medium');
  const [description, setDescription] = useState('');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [behavior, setBehavior] = useState('');
  const [habitat, setHabitat] = useState<string[]>([]);
  const [habitatInput, setHabitatInput] = useState('');
  const [challengeRating, setChallengeRating] = useState('');
  const [stats, setStats] = useState<Record<string, number | string>>({});
  const [abilities, setAbilities] = useState<CreatureAbility[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [weaknessInput, setWeaknessInput] = useState('');
  const [resistances, setResistances] = useState<string[]>([]);
  const [resistanceInput, setResistanceInput] = useState('');
  const [immunities, setImmunities] = useState<string[]>([]);
  const [immunityInput, setImmunityInput] = useState('');
  const [loot, setLoot] = useState<string[]>([]);
  const [lootInput, setLootInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [newStatKey, setNewStatKey] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModal === 'editCreature') {
      if (modalData) {
        setName(modalData.name || '');
        setType(modalData.type || 'beast');
        setSize(modalData.size || 'medium');
        setDangerLevel(modalData.dangerLevel || 'medium');
        setDescription(modalData.description || '');
        setPhysicalDescription(modalData.physicalDescription || '');
        setBehavior(modalData.behavior || '');
        setHabitat(modalData.habitat || []);
        setChallengeRating(modalData.challengeRating || '');
        setStats(modalData.stats || {});
        setAbilities(modalData.abilities || []);
        setWeaknesses(modalData.weaknesses || []);
        setResistances(modalData.resistances || []);
        setImmunities(modalData.immunities || []);
        setLoot(modalData.loot || []);
        setImageUrl(modalData.imageUrl || '');
        setNotes(modalData.notes || '');
      } else {
        resetForm();
      }
    }
  }, [activeModal, modalData]);

  const resetForm = () => {
    setName('');
    setType('beast');
    setSize('medium');
    setDangerLevel('medium');
    setDescription('');
    setPhysicalDescription('');
    setBehavior('');
    setHabitat([]);
    setChallengeRating('');
    setStats({});
    setAbilities([]);
    setWeaknesses([]);
    setResistances([]);
    setImmunities([]);
    setLoot([]);
    setImageUrl('');
    setNotes('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!physicalDescription && !name) return;
    setIsGeneratingImage(true);
    try {
      const prompt = `Fantasy creature illustration: ${name}, ${physicalDescription || type}, detailed, high quality, digital art, monster design`;
      const url = await generateImageAI(prompt, 'openai', 'dummy-key');
      setImageUrl(url);
    } catch (error) {
      console.error(error);
      alert('Error generating image');
    } finally {
      setIsGeneratingImage(false);
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

  const addAbility = () => {
    setAbilities([...abilities, { id: crypto.randomUUID(), name: '', description: '' }]);
  };

  const updateAbility = (index: number, field: keyof CreatureAbility, value: string) => {
    const newAbilities = [...abilities];
    newAbilities[index] = { ...newAbilities[index], [field]: value };
    setAbilities(newAbilities);
  };

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index));
  };

  if (activeModal !== 'editCreature') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      type,
      size,
      dangerLevel,
      description: description.trim(),
      physicalDescription: physicalDescription.trim(),
      behavior: behavior.trim(),
      habitat,
      challengeRating: challengeRating.trim(),
      stats,
      abilities: abilities.filter(a => a.name.trim()),
      weaknesses,
      resistances,
      immunities,
      loot,
      imageUrl,
      notes: notes.trim(),
      relatedLocationIds: modalData?.relatedLocationIds || [],
    };

    if (isEditing && modalData?.id) {
      updateCreature(modalData.id, data);
    } else {
      addCreature(data);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (isEditing && confirm(`¿Estás seguro de que quieres eliminar a ${name}?`)) {
      deleteCreature(modalData.id);
      closeModal();
    }
  };

  return (
    <Dialog open={activeModal === 'editCreature'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Criatura' : 'Nueva Criatura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-border bg-muted group">
              {imageUrl ? (
                <img src={imageUrl} alt="Creature" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Skull size={48} className="opacity-20" />
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

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creature-name">Nombre</Label>
              <Input
                id="creature-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la criatura..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creature-type">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="creature-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATURE_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creature-size">Tamaño</Label>
              <Select value={size} onValueChange={(v: string) => setSize(v as CreatureSize)}>
                <SelectTrigger id="creature-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATURE_SIZES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creature-danger">Nivel de Peligro</Label>
              <Select value={dangerLevel} onValueChange={(v: string) => setDangerLevel(v as DangerLevel)}>
                <SelectTrigger id="creature-danger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DANGER_LEVELS.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${d.color}`} />
                        {d.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creature-cr">Challenge Rating</Label>
              <Input
                id="creature-cr"
                value={challengeRating}
                onChange={(e) => setChallengeRating(e.target.value)}
                placeholder="Ej: 5, 1/4..."
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creature-physical">Descripción Física</Label>
              <AITextArea
                id="creature-physical"
                value={physicalDescription}
                onChange={(e) => setPhysicalDescription(e.target.value)}
                placeholder="Apariencia, rasgos distintivos..."
                className="min-h-[100px]"
                label="Physical Description"
                context={`Creature: ${name}, Type: ${type}, Size: ${size}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creature-behavior">Comportamiento</Label>
              <AITextArea
                id="creature-behavior"
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                placeholder="Comportamiento típico, instintos..."
                className="min-h-[100px]"
                label="Behavior"
                context={`Creature: ${name}, Type: ${type}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creature-desc">Descripción General</Label>
            <AITextArea
              id="creature-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Historia, origen, rol en el mundo..."
              className="min-h-[100px]"
              label="Description"
              context={`Creature: ${name}, Type: ${type}, Danger: ${dangerLevel}`}
            />
          </div>

          {/* Stats */}
          <div className="space-y-3 border-t pt-4">
            <Label className="flex items-center gap-2">
              <Swords size={16} />
              Estadísticas
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
              <Input
                placeholder="Atributo"
                value={newStatKey}
                onChange={(e) => setNewStatKey(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Valor"
                value={newStatValue}
                onChange={(e) => setNewStatValue(e.target.value)}
                className="w-24"
              />
              <Button type="button" variant="outline" size="icon" onClick={addStat}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Abilities */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Habilidades</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAbility} className="gap-1">
                <Plus size={14} /> Añadir
              </Button>
            </div>
            {abilities.map((ability, index) => (
              <div key={ability.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de la habilidad"
                    value={ability.name}
                    onChange={(e) => updateAbility(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeAbility(index)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <AITextArea
                  placeholder="Descripción de la habilidad..."
                  value={ability.description}
                  onChange={(e) => updateAbility(index, 'description', e.target.value)}
                  className="min-h-[60px]"
                  label="Ability Description"
                  context={`Creature: ${name}, Ability: ${ability.name}`}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Daño (ej: 2d6+3)"
                    value={ability.damage || ''}
                    onChange={(e) => updateAbility(index, 'damage', e.target.value)}
                  />
                  <Input
                    placeholder="Alcance"
                    value={ability.range || ''}
                    onChange={(e) => updateAbility(index, 'range', e.target.value)}
                  />
                  <Input
                    placeholder="Cooldown"
                    value={ability.cooldown || ''}
                    onChange={(e) => updateAbility(index, 'cooldown', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Habitat */}
          <div className="space-y-2 border-t pt-4">
            <Label>Hábitat</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {habitat.map((h, i) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1">
                  {h}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => removeFromList(habitat, setHabitat, i)}>
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: Bosque, Cueva, Montaña..."
                value={habitatInput}
                onChange={(e) => setHabitatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(habitat, setHabitat, habitatInput, setHabitatInput))}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => addToList(habitat, setHabitat, habitatInput, setHabitatInput)}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Weaknesses, Resistances, Immunities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label className="text-red-500">Debilidades</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {weaknesses.map((w, i) => (
                  <Badge key={i} variant="outline" className="gap-1 pr-1 border-red-500/30 text-red-500">
                    {w}
                    <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/20" onClick={() => removeFromList(weaknesses, setWeaknesses, i)}>
                      <X size={10} />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  placeholder="Añadir..."
                  value={weaknessInput}
                  onChange={(e) => setWeaknessInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(weaknesses, setWeaknesses, weaknessInput, setWeaknessInput))}
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => addToList(weaknesses, setWeaknesses, weaknessInput, setWeaknessInput)}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-500">Resistencias</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {resistances.map((r, i) => (
                  <Badge key={i} variant="outline" className="gap-1 pr-1 border-blue-500/30 text-blue-500">
                    {r}
                    <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/20" onClick={() => removeFromList(resistances, setResistances, i)}>
                      <X size={10} />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  placeholder="Añadir..."
                  value={resistanceInput}
                  onChange={(e) => setResistanceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(resistances, setResistances, resistanceInput, setResistanceInput))}
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => addToList(resistances, setResistances, resistanceInput, setResistanceInput)}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-yellow-500">Inmunidades</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {immunities.map((im, i) => (
                  <Badge key={i} variant="outline" className="gap-1 pr-1 border-yellow-500/30 text-yellow-500">
                    {im}
                    <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/20" onClick={() => removeFromList(immunities, setImmunities, i)}>
                      <X size={10} />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  placeholder="Añadir..."
                  value={immunityInput}
                  onChange={(e) => setImmunityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(immunities, setImmunities, immunityInput, setImmunityInput))}
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => addToList(immunities, setImmunities, immunityInput, setImmunityInput)}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Loot */}
          <div className="space-y-2 border-t pt-4">
            <Label>Botín / Loot</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {loot.map((l, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {l}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => removeFromList(loot, setLoot, i)}>
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: Escamas de dragón, Colmillos..."
                value={lootInput}
                onChange={(e) => setLootInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList(loot, setLoot, lootInput, setLootInput))}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => addToList(loot, setLoot, lootInput, setLootInput)}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="creature-notes">Notas Privadas</Label>
            <AITextArea
              id="creature-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas del autor, ideas para encuentros..."
              className="min-h-[80px] bg-muted/20"
              label="Private Notes"
              context={`Creature: ${name}, Type: ${type}`}
            />
          </div>
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
              {isEditing ? 'Guardar Cambios' : 'Crear Criatura'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
