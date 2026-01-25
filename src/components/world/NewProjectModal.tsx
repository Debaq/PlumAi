import { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { BookPlus } from 'lucide-react';

export const NewProjectModal = () => {
  const { t } = useTranslation();
  const { activeModal, closeModal, openModal } = useUIStore();
  const { createNewProject } = useProjectStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');

  if (activeModal !== 'newProject') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNewProject({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim()
    });
    
    closeModal();
  };

  const handleBack = () => {
    openModal('welcome');
  };

  return (
    <Dialog open={activeModal === 'newProject'} onOpenChange={() => handleBack()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-primary" />
            {t('modals.newProject.title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('modals.newProject.form.title')}</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={t('modals.newProject.form.titlePlaceholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">{t('modals.newProject.form.author')}</Label>
            <Input 
              id="author" 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              placeholder={t('modals.newProject.form.authorPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">{t('modals.newProject.form.genre')}</Label>
            <Input 
              id="genre" 
              value={genre} 
              onChange={(e) => setGenre(e.target.value)} 
              placeholder={t('modals.newProject.form.genrePlaceholder')}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={handleBack}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {t('modals.newProject.title')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
