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

export const ChapterModal = () => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { activeProject, addChapter, updateChapter } = useProjectStore();
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'draft' | 'in_review' | 'final'>('draft');
  const [image, setImage] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'url' | 'ai'>('upload');

  const isOpen = activeModal === 'newChapter' || activeModal === 'editChapter';

  useEffect(() => {
    if (activeModal === 'newChapter') {
      setTitle('');
      setSummary('');
      setStatus('draft');
      setImage('');
      setImageType('upload');
    } else if (activeModal === 'editChapter' && modalData) {
      setTitle(modalData.title || '');
      setSummary(modalData.summary || '');
      setStatus(modalData.status || 'draft');
      setImage(modalData.image || '');
      setImageType(modalData.imageType || 'upload');
    }
  }, [activeModal, modalData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'newChapter') {
      const nextNumber = (activeProject?.chapters.length || 0) + 1;
      addChapter({
        title,
        summary,
        status,
        image,
        imageType,
        content: '',
        scenes: [],
        wordCount: 0,
        number: nextNumber,
      });
    } else if (activeModal === 'editChapter' && modalData?.id) {
      updateChapter(modalData.id, {
        title,
        summary,
        status,
        image,
        imageType,
      });
    }
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activeModal === 'newChapter' ? 'New Chapter' : 'Edit Chapter'}
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
              placeholder="Chapter title..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <AITextArea
              id="summary"
              className="min-h-[80px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary..."
              label="Chapter Summary"
              context={`Chapter Title: ${title}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {activeModal === 'newChapter' ? 'Create Chapter' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
