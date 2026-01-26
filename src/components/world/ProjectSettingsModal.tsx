import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { dbUpdateProject } from '@/lib/tauri-bridge';
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
import { Textarea } from '@/components/ui/textarea';
import { Settings2, Book, Dices, Globe2 } from 'lucide-react';
import type { Project } from '@/types/domain';

export const ProjectSettingsModal = () => {
  const { t } = useTranslation();
  const { activeModal, closeModal, modalData } = useUIStore();
  const [project, setProject] = useState<Partial<Project>>({});

  useEffect(() => {
    if (activeModal === 'projectSettings' && modalData) {
      setProject(modalData);
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'projectSettings') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.title?.trim() || !project.id) return;

    try {
      // Need to stringify complex fields for the bridge
      const payload = {
        ...project,
        banners: typeof project.banners === 'object' ? JSON.stringify(project.banners) : project.banners,
        apiKeys: typeof project.apiKeys === 'object' ? JSON.stringify(project.apiKeys) : project.apiKeys,
        creatures: typeof project.creatures === 'object' ? JSON.stringify(project.creatures) : project.creatures,
        worldRules: typeof project.worldRules === 'object' ? JSON.stringify(project.worldRules) : project.worldRules,
      };

      await dbUpdateProject(payload as any);
      closeModal();
      window.location.reload(); // Reload to refresh project list/data for now
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  return (
    <Dialog open={activeModal === 'projectSettings'} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            {t('project.projectSettings')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={project.title || ''}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={project.author || ''}
                onChange={(e) => setProject({ ...project, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-genre">Genre</Label>
              <Input
                id="edit-genre"
                value={project.genre || ''}
                onChange={(e) => setProject({ ...project, genre: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={project.description || ''}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              rows={4}
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label>Project Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <ProjectTypeOption
                icon={Book}
                label="Novela"
                selected={project.projectType === 'novel'}
                onClick={() => setProject({ ...project, projectType: 'novel' })}
              />
              <ProjectTypeOption
                icon={Dices}
                label="RPG"
                selected={project.projectType === 'rpg'}
                onClick={() => setProject({ ...project, projectType: 'rpg', isRpgModeEnabled: true })}
              />
              <ProjectTypeOption
                icon={Globe2}
                label="Worldbuilding"
                selected={project.projectType === 'worldbuilding'}
                onClick={() => setProject({ ...project, projectType: 'worldbuilding', isRpgModeEnabled: true })}
              />
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
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
  selected,
  onClick
}: {
  icon: any;
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      p-3 rounded-lg border-2 text-center transition-all flex flex-col items-center justify-center gap-1
      ${selected
        ? 'border-primary bg-primary/10'
        : 'border-border hover:border-primary/50'
      }
    `}
  >
    <Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
    <div className={`font-medium text-[10px] ${selected ? 'text-primary' : 'text-foreground'}`}>{label}</div>
  </button>
);
