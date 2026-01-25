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
import { BookPlus, Book, Dices, Globe2 } from 'lucide-react';
import type { ProjectType } from '@/types/domain';

export const NewProjectModal = () => {
  const { t } = useTranslation();
  const { activeModal, closeModal, openModal } = useUIStore();
  const { createNewProject } = useProjectStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('novel');

  if (activeModal !== 'newProject') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNewProject({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      projectType
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
          {/* Project Type Selector */}
          <div className="space-y-3">
            <Label>Tipo de Proyecto</Label>
            <div className="grid grid-cols-2 gap-3">
              <ProjectTypeOption
                icon={Book}
                label="Novela"
                description="Historia narrativa"
                selected={projectType === 'novel'}
                onClick={() => setProjectType('novel')}
              />
              <ProjectTypeOption
                icon={Globe2}
                label="Worldbuilding"
                description="Construcción de mundo"
                selected={projectType === 'worldbuilding' || projectType === 'rpg'}
                onClick={() => setProjectType('worldbuilding')}
              />
            </div>
            
            {(projectType === 'worldbuilding' || projectType === 'rpg') && (
               <div className="mt-2 pl-1">
                 <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                   <input 
                     type="checkbox"
                     checked={projectType === 'rpg'}
                     onChange={(e) => setProjectType(e.target.checked ? 'rpg' : 'worldbuilding')}
                     className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                   />
                   <span className="font-medium">Es una campaña de Rol (RPG)</span>
                 </label>
                 <p className="text-xs text-muted-foreground ml-6 mt-1">
                   Activa herramientas específicas para gestión de campañas, dados y sistemas de reglas.
                 </p>
               </div>
            )}
          </div>

          {/* Info message for RPG/Worldbuilding */}
          {(projectType === 'rpg' || projectType === 'worldbuilding') && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-primary flex items-center gap-2">
                <Dices className="w-3 h-3" />
                {projectType === 'rpg' 
                  ? 'Modo RPG activo: Incluye bestiario, reglas y herramientas de campaña.' 
                  : 'Modo Worldbuilding: Incluye herramientas para crear y organizar tu mundo.'}
              </p>
            </div>
          )}

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

const ProjectTypeOption = ({
  icon: Icon,
  label,
  description,
  selected,
  onClick
}: {
  icon: any;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      p-3 rounded-lg border-2 text-left transition-all
      ${selected
        ? 'border-primary bg-primary/10'
        : 'border-border hover:border-primary/50'
      }
    `}
  >
    <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
    <div className={`font-medium text-xs ${selected ? 'text-primary' : 'text-foreground'}`}>{label}</div>
    <div className="text-[10px] text-muted-foreground mt-0.5">{description}</div>
  </button>
);
