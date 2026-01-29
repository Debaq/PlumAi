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
import { useTranslation } from 'react-i18next';

export const ChapterModal = () => {
  const { t } = useTranslation();
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
      const nextOrder = (activeProject?.chapters.length || 0) + 1;
      addChapter({
        title,
        summary,
        status,
        image,
        imageType,
        content: '',
        wordCount: 0,
        order: nextOrder,
        lastModified: Date.now(),
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
            {activeModal === 'newChapter' ? t('chapterModal.new') : t('chapterModal.edit')}
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
            <Label htmlFor="title">{t('chapterModal.titleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder={t('chapterModal.titlePlaceholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">{t('chapterModal.summaryLabel')}</Label>
            <AITextArea
              id="summary"
              className="min-h-[80px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t('chapterModal.summaryPlaceholder')}
              label="Chapter Summary"
              context={`Chapter Title: ${title}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">{t('chapterModal.statusLabel')}</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('chapters.form.statuses.draft')}</SelectItem>
                <SelectItem value="in_review">{t('chapters.form.statuses.review')}</SelectItem>
                <SelectItem value="final">{t('chapters.form.statuses.final')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {activeModal === 'newChapter' ? t('chapterModal.create') : t('chapterModal.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
