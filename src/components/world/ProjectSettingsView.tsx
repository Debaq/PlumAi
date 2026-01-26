import { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useTranslation } from 'react-i18next';
import { 
  Settings, 
  Palette, 
  Package, 
  Trash2, 
  Save, 
  ChevronLeft,
  ChevronRight,
  Layout,
  Globe2,
  Book,
  Dices,
  Sparkles,
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageManager } from '@/components/layout/PackageManager';
import { Badge } from '@/components/ui/badge';

type SettingsTab = 'general' | 'identity' | 'packages' | 'danger';

export const ProjectSettingsView = () => {
  const { t } = useTranslation();
  const { activeProject, updateProject } = useProjectStore();
  const { setActiveView } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [title, setTitle] = useState(activeProject?.title || '');
  const [author, setAuthor] = useState(activeProject?.author || '');
  const [genre, setGenre] = useState(activeProject?.genre || '');

  if (!activeProject) return null;

  const handleSave = () => {
    updateProject({
      ...activeProject,
      title,
      author,
      genre
    });
    alert('Configuración guardada');
  };

  const TabButton = ({ id, icon: Icon, label }: { id: SettingsTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setActiveView('lore')} className="rounded-full">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase">Ajustes del Proyecto</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{activeProject.title}</p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2 rounded-xl px-6 font-black h-10 shadow-lg shadow-primary/20">
          <Save size={16} />
          Guardar Cambios
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-border p-4 flex flex-col gap-2 bg-muted/10">
          <TabButton id="general" icon={Settings} label={t('common.general')} />
          <TabButton id="identity" icon={Palette} label={t('common.identityAndStyle')} />
          <TabButton id="packages" icon={Package} label={t('common.packageStorage')} />
          <div className="mt-auto">
            <TabButton id="danger" icon={ShieldAlert} label={t('common.dangerZone')} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layout size={20} /></div>
                  <h3 className="text-xl font-black tracking-tight">Fundamentos</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Título de la Obra</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Autor / Seudónimo</Label>
                    <Input value={author} onChange={e => setAuthor(e.target.value)} className="h-12 rounded-xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Género Principal</Label>
                    <Input value={genre} onChange={e => setGenre(e.target.value)} className="h-12 rounded-xl border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tipo de Proyecto</Label>
                    <div className="h-12 flex items-center px-4 bg-muted/30 border-2 border-border rounded-xl">
                      <span className="text-sm font-bold flex items-center gap-2">
                        {activeProject.projectType === 'rpg' ? <Dices size={16} className="text-primary" /> : <Book size={16} className="text-primary" />}
                        {activeProject.projectType?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold flex items-center gap-2">
                    <Globe2 size={18} className="text-primary" />
                    Modo Worldbuilder Activo
                  </h4>
                  <p className="text-xs text-muted-foreground">Habilita herramientas de construcción de mundos, mapas y cronologías.</p>
                </div>
                <Badge className="bg-primary px-4 py-1 rounded-full font-black">HABILITADO</Badge>
              </section>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Palette size={20} /></div>
                <h3 className="text-xl font-black tracking-tight">Personalización Visual</h3>
              </div>

              <section className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Banners del Proyecto</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-muted/30 transition-all">
                    <ImageIcon size={24} className="text-muted-foreground group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Banner Sidebar</span>
                  </div>
                  <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-muted/30 transition-all">
                    <ImageIcon size={24} className="text-muted-foreground group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Banner Capítulos</span>
                  </div>
                </div>
              </section>

              <section className="p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <span className="font-black uppercase text-xs">Identidad por Paquete</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Actualmente este proyecto utiliza el estilo visual del paquete: 
                  <span className="text-foreground font-bold ml-1">
                    {activeProject.activeIdentityPackage || "Estilo por defecto de PlumAi"}
                  </span>
                </p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('packages')} className="rounded-xl h-9 text-xs font-bold gap-2">
                  Cambiar en el Almacén
                  <ChevronRight size={14} />
                </Button>
              </section>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 pb-20">
              <PackageManager />
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><ShieldAlert size={20} /></div>
                <h3 className="text-xl font-black tracking-tight text-destructive">Acciones Críticas</h3>
              </div>

              <section className="p-6 rounded-3xl border-2 border-destructive/20 bg-destructive/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Borrar Proyecto</h4>
                    <p className="text-xs text-muted-foreground">Esta acción es irreversible y eliminará todos los capítulos, personajes y assets.</p>
                  </div>
                  <Button variant="destructive" className="rounded-xl h-10 px-6 font-bold gap-2 shadow-lg shadow-destructive/20">
                    <Trash2 size={16} />
                    Borrar Permanentemente
                  </Button>
                </div>
                
                <hr className="border-destructive/10" />

                <div className="flex items-center justify-between opacity-60 grayscale cursor-not-allowed">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">{t('common.clearPackageCache')}</h4>
                    <p className="text-xs text-muted-foreground">{t('common.clearPackageCacheDesc')}</p>
                  </div>
                  <Button variant="outline" disabled className="rounded-xl h-10 px-6 font-bold">Limpiar</Button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
