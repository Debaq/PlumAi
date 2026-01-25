import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { TimelineEvent } from '@/types/domain';
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
import { Calendar, Trash2, Info, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TimelineEventModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { activeProject, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } = useProjectStore();

  const isEditing = activeModal === 'timelineEvent' && modalData?.id;
  
  const [title, setTitle] = useState('');
  const [dateMode, setDateMode] = useState<'absolute' | 'relative' | 'era'>('absolute');
  const [date, setDate] = useState('');
  const [era, setEra] = useState('');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [locationId, setLocationId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (activeModal === 'timelineEvent') {
      if (modalData) {
        setTitle(modalData.title || modalData.event || '');
        setDateMode(modalData.dateMode || 'absolute');
        setDate(modalData.date || '');
        setEra(modalData.era || '');
        setImportance(modalData.importance || 'medium');
        setDescription(modalData.description || '');
        setSelectedParticipants(modalData.participants || []);
        setLocationId(modalData.locationId || '');
        setTags(modalData.tags || []);
      } else {
        setTitle('');
        setDateMode('absolute');
        setDate('');
        setEra('');
        setImportance('medium');
        setDescription('');
        setSelectedParticipants([]);
        setLocationId('');
        setTags([]);
      }
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'timelineEvent') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: Omit<TimelineEvent, 'id'> = {
      title: title.trim(),
      dateMode,
      date,
      era,
      importance,
      description,
      participants: selectedParticipants,
      locationId: locationId || undefined,
      tags
    };

    if (isEditing) {
      updateTimelineEvent(modalData.id, data);
    } else {
      addTimelineEvent(data);
    }
    
    closeModal();
  };

  const handleDelete = () => {
    if (isEditing && confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      deleteTimelineEvent(modalData.id);
      closeModal();
    }
  };

  const toggleParticipant = (charId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Dialog open={activeModal === 'timelineEvent'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Nombre del Evento</Label>
              <Input 
                id="event-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ej: La Batalla de las Sombras..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modo de Fecha</Label>
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  {(['absolute', 'relative', 'era'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDateMode(mode)}
                      className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${
                        dateMode === mode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Importancia</Label>
                <Select value={importance} onValueChange={(v: any) => setImportance(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {dateMode === 'absolute' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label htmlFor="event-date">Fecha</Label>
                <Input 
                  id="event-date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  placeholder="Ej: Año 124, 3 de Marzo..."
                />
              </div>
            )}

            {dateMode === 'era' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label htmlFor="event-era">Era/Época</Label>
                <Input 
                  id="event-era" 
                  value={era} 
                  onChange={(e) => setEra(e.target.value)} 
                  placeholder="Ej: Segunda Era, Reino de Eldoria..."
                />
              </div>
            )}

            {dateMode === 'relative' && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg flex gap-3 animate-in slide-in-from-top-2 duration-200">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  El orden relativo se define arrastrando eventos en la vista de Timeline.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Descripción</Label>
            <textarea 
              id="event-description" 
              value={description} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
              placeholder="¿Qué sucedió en este evento?..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Contextual Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <User className="w-3 h-3" /> Participantes
              </Label>
              <div className="border rounded-lg p-2 max-h-[150px] overflow-y-auto space-y-1 bg-card/50">
                {activeProject?.characters.map(char => (
                  <label key={char.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedParticipants.includes(char.id)}
                      onChange={() => toggleParticipant(char.id)}
                      className="w-3.5 h-3.5 accent-primary"
                    />
                    <span className="text-xs">{char.name}</span>
                  </label>
                ))}
                {activeProject?.characters.length === 0 && <p className="text-[10px] text-muted-foreground p-2 italic">No hay personajes creados.</p>}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Ubicación
              </Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin ubicación</SelectItem>
                  {activeProject?.locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="pt-2 space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    placeholder="Añadir tag..." 
                    className="h-8 text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" size="sm" variant="outline" className="h-8" onClick={addTag}>+</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] h-5 pl-2 pr-1 gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
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
            <Button type="submit" onClick={handleSubmit} disabled={!title.trim()}>
              {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
