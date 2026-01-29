import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTranslation } from 'react-i18next';
import { 
  Settings, 
  Palette, 
  Package, 
  Save, 
  Book, 
  Dices, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageManager } from '@/components/layout/PackageManager';
import type { Project } from '@/types/domain';

type SettingsTab = 'general' | 'identity' | 'packages' | 'danger';

interface Props {
  project: Project;
  onSave?: () => void;
  hideSidebar?: boolean;
}

export const ProjectConfigContent = ({ project, onSave }: Props) => {
  const { t } = useTranslation();
  const { updateProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [title, setTitle] = useState(project.title);
  const [author, setAuthor] = useState(project.author || '');
  const [genre, setGenre] = useState(project.genre || '');

  // Update local state if project prop changes
  useEffect(() => {
    setTitle(project.title);
    setAuthor(project.author || '');
    setGenre(project.genre || '');
  }, [project.id]);

  const handleSave = () => {
    updateProject({
      ...project,
      title,
      author,
      genre
    });
    if (onSave) onSave();
  };

  const TabButton = ({ id, icon: Icon, label }: { id: SettingsTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        activeTab === id 
          ? 'bg-primary text-primary-foreground font-bold shadow-sm' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
      }`}
    >
      <Icon size={16} />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Internal Nav */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/20">
        <TabButton id="general" icon={Settings} label={t('common.general')} />
        <TabButton id="identity" icon={Palette} label={t('common.identity')} />
        <TabButton id="packages" icon={Package} label={t('modals.packages')} />
        <TabButton id="danger" icon={ShieldAlert} label={t('common.danger')} />
        
        <div className="ml-auto">
          <Button size="sm" onClick={handleSave} className="gap-2 h-8 font-black rounded-lg">
            <Save size={14} />
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-8">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">{t('projectSettings.labels.title')}</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="h-10 rounded-lg border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">{t('projectSettings.labels.author')}</Label>
                <Input value={author} onChange={e => setAuthor(e.target.value)} className="h-10 rounded-lg border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">{t('projectSettings.labels.genre')}</Label>
                <Input value={genre} onChange={e => setGenre(e.target.value)} className="h-10 rounded-lg border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">{t('projectSettings.labels.type')}</Label>
                <div className="h-10 flex items-center px-3 bg-muted/30 border-2 border-border rounded-lg text-xs font-bold gap-2">
                  {project.projectType === 'rpg' ? <Dices size={14} className="text-primary" /> : <Book size={14} className="text-primary" />}
                  {project.projectType?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="font-black uppercase text-[10px] tracking-widest">{t('projectSettings.visual.title')}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('projectSettings.visual.currentPackage')} 
                <span className="text-foreground font-bold ml-1">
                  {project.activeIdentityPackage || t('projectSettings.visual.defaultStyle')}
                </span>
              </p>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('packages')} className="rounded-lg h-8 text-[10px] font-black gap-2">
                {t('projectSettings.visual.change')} <ChevronRight size={12} />
              </Button>
            </section>

            <div className="grid grid-cols-2 gap-4">
               <div className="aspect-video rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                  <ImageIcon size={20} className="opacity-20" />
                  <span className="text-[9px] font-bold uppercase opacity-40">{t('projectSettings.visual.bannerSidebar')}</span>
               </div>
               <div className="aspect-video rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                  <ImageIcon size={20} className="opacity-20" />
                  <span className="text-[9px] font-bold uppercase opacity-40">{t('projectSettings.visual.bannerChapters')}</span>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="animate-in fade-in duration-300">
            <PackageManager />
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-5 rounded-2xl border-2 border-destructive/20 bg-destructive/5 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-xs">{t('projectSettings.danger.delete')}</h4>
                <p className="text-[10px] text-muted-foreground">{t('projectSettings.danger.deleteWarning')}</p>
              </div>
              <Button variant="destructive" size="sm" className="rounded-lg font-bold">{t('common.delete')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
