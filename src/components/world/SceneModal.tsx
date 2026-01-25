import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { ImageManager } from '@/components/ui/ImageManager';
import { AITextArea } from '@/components/ui/ai-textarea';

export const SceneModal = () => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { activeProject, addScene, updateScene } = useProjectStore();
  
  const [title, setTitle] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'url' | 'ai'>('upload');

  const isOpen = activeModal === 'newScene' || activeModal === 'editScene';

  useEffect(() => {
    if (activeModal === 'newScene') {
      setTitle('');
      setChapterId(activeProject?.chapters[0]?.id || '');
      setLocationId('');
      setCharacterIds([]);
      setDescription('');
      setNotes('');
      setImage('');
      setImageType('upload');
    } else if (activeModal === 'editScene' && modalData) {
      setTitle(modalData.title || '');
      setChapterId(modalData.chapterId || '');
      setLocationId(modalData.locationId || '');
      setCharacterIds(modalData.characterIds || []);
      setDescription(modalData.description || '');
      setNotes(modalData.notes || '');
      setImage(modalData.image || '');
      setImageType(modalData.imageType || 'upload');
    }
  }, [activeModal, modalData, activeProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sceneData = {
      title,
      chapterId,
      locationId: locationId || undefined,
      characterIds,
      description,
      notes,
      image,
      imageType,
      timelinePosition: modalData?.timelinePosition || 0,
    };

    if (activeModal === 'newScene') {
      addScene(sceneData);
    } else if (activeModal === 'editScene' && modalData?.id) {
      updateScene(modalData.id, sceneData);
    }
    closeModal();
  };

  const toggleCharacter = (id: string) => {
    setCharacterIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activeModal === 'newScene' ? 'New Scene' : 'Edit Scene'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <ImageManager 
            initialImage={image}
            initialType={imageType}
            onImageChange={(img, type) => {
              setImage(img);
              setImageType(type);
            }}
            entityContext={title}
          />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder="Scene title..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter</Label>
              <Select value={chapterId} onValueChange={setChapterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {activeProject?.chapters.map(ch => (
                    <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No location</SelectItem>
                  {activeProject?.locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Characters</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-[120px] overflow-y-auto bg-muted/20">
              {activeProject?.characters.map(char => (
                <label key={char.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={characterIds.includes(char.id)}
                    onChange={() => toggleCharacter(char.id)}
                    className="rounded border-gray-300"
                  />
                  {char.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <AITextArea
              id="description"
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happens in this scene?..."
              label="Scene Description"
              context={`Scene Title: ${title}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <AITextArea
              id="notes"
              className="min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              label="Scene Notes"
              context={`Scene Title: ${title}`}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {activeModal === 'newScene' ? 'Create Scene' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};