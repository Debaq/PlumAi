import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
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
import { ScrollText, Trash2 } from 'lucide-react';
import { AITextArea } from '@/components/ui/ai-textarea';

const LORE_CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'history', label: 'Historia' },
  { id: 'magic', label: 'Magia/Sistemas' },
  { id: 'objects', label: 'Objetos' },
  { id: 'cultures', label: 'Culturas' },
  { id: 'religion', label: 'Religión' },
  { id: 'geography', label: 'Geografía' },
  { id: 'science', label: 'Ciencia/Tecnología' },
];

export const LoreModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { addLoreItem, updateLoreItem, deleteLoreItem } = useProjectStore();

  const isEditing = activeModal === 'loreItem' && modalData?.id;
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (activeModal === 'loreItem') {
      if (modalData) {
        setTitle(modalData.title || modalData.name || '');
        setCategory(modalData.category || 'general');
        setContent(modalData.content || '');
        setSummary(modalData.summary || '');
      } else {
        setTitle('');
        setCategory('general');
        setContent('');
        setSummary('');
      }
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'loreItem') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data = {
      title: title.trim(),
      category,
      content: content.trim(),
      summary: summary.trim(),
      relatedEntityIds: modalData?.relatedEntityIds || []
    };

    if (isEditing) {
      updateLoreItem(modalData.id, data);
    } else {
      addLoreItem(data);
    }
    
    closeModal();
  };

  const handleDelete = () => {
    if (isEditing && confirm('¿Estás seguro de que quieres eliminar esta entrada del lore?')) {
      deleteLoreItem(modalData.id);
      closeModal();
    }
  };

  return (
    <Dialog open={activeModal === 'loreItem'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Entrada del Lore' : 'Nueva Entrada del Lore'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lore-title">Título</Label>
              <Input 
                id="lore-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Nombre de la entrada..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lore-category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="lore-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LORE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lore-summary">Resumen Corto</Label>
            <Input 
              id="lore-summary" 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              placeholder="Una breve descripción para referencia rápida..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lore-content">Contenido Detallado</Label>
            <AITextArea 
              id="lore-content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Escribe aquí toda la información detallada sobre este elemento del mundo..."
              className="min-h-[250px] font-serif leading-relaxed"
              label="Lore Content"
              context={`Lore Title: ${title}. Category: ${category}. Summary: ${summary}`}
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
            <Button type="submit" onClick={handleSubmit} disabled={!title.trim()}>
              {isEditing ? 'Guardar Cambios' : 'Crear Entrada'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
