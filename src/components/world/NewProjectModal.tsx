import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { invoke } from '@tauri-apps/api/core';
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
import { 
  Book, 
  Dices, 
  Globe2, 
  ArrowRight, 
  Check, 
  Package, 
  Palette,
  Sparkles,
  Loader2,
  Layers,
  ChevronRight
} from 'lucide-react';
import type { ProjectType } from '@/types/domain';
import { PackageManifest } from '@/types/packages';
import { Badge } from '@/components/ui/badge';

export const NewProjectModal = () => {
  const { i18n, t } = useTranslation();
  const { activeModal, closeModal, openModal } = useUIStore();
  const { createNewProject, applyPackageIdentity } = useProjectStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('novel');
  
  // Packages State
  const [availablePackages, setAvailablePackages] = useState<PackageManifest[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'newProject') {
      setStep(1);
      loadPackages();
    }
  }, [activeModal]);

  const loadPackages = async () => {
    try {
      const pkgs: PackageManifest[] = await invoke('get_available_packages');
      setAvailablePackages(pkgs);
    } catch (err) {
      console.error('Failed to load packages for wizard:', err);
    }
  };

  if (activeModal !== 'newProject') return null;

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => {
    if (step === 1) {
      openModal('welcome');
    } else {
      setStep(s => s - 1);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);

    try {
      // 1. Create the project
      await createNewProject({
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        projectType
      });

      // We need the ID of the project we just created. 
      // Since createNewProject sets it in the store, we can try to get it.
      const activeProject = useProjectStore.getState().activeProject;
      
      if (activeProject && selectedPackageId) {
        const pkg = availablePackages.find(p => p.id === selectedPackageId);
        
        // 2. Inject Content if hybrid or content
        if (pkg?.category === 'content' || pkg?.category === 'hybrid') {
          await invoke('inject_package_content', {
            projectId: activeProject.id,
            packageId: pkg.id,
            lang: i18n.language || 'es'
          });
        }

        // 3. Apply Identity if hybrid or identity
        if (pkg?.category === 'identity' || pkg?.category === 'hybrid') {
          await applyPackageIdentity(pkg.id);
        }
      }

      closeModal();
    } catch (err) {
      console.error('Error creating project with wizard:', err);
      alert('Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={activeModal === 'newProject'} onOpenChange={() => handlePrev()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border bg-background rounded-3xl shadow-2xl">
        <div className="flex h-[500px]">
          {/* Left Panel: Progress */}
          <div className="w-1/3 bg-muted/30 border-r border-border p-6 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
                <Sparkles size={20} />
                <span>Nuevo</span>
              </div>
              
              <div className="space-y-6">
                <StepIndicator current={step} target={1} label="Fundamentos" />
                <StepIndicator current={step} target={2} label="Estructura" />
                <StepIndicator current={step} target={3} label="Contenido" />
                <StepIndicator current={step} target={4} label="Identidad" />
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">Paso {step} de 4</p>
            </div>
          </div>

          {/* Right Panel: Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                {step === 1 && "Define tu Obra"}
                {step === 2 && "¿Qué estás creando?"}
                {step === 3 && "Inspiración Inicial"}
                {step === 4 && "Toque Final"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              {/* STEP 1: BASICS */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Título del Proyecto</Label>
                    <Input 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="Ej: El Despertar del Vacío"
                      className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Autor</Label>
                    <Input 
                      value={author} 
                      onChange={e => setAuthor(e.target.value)} 
                      placeholder="Tu nombre o seudónimo"
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Género</Label>
                    <Input 
                      value={genre} 
                      onChange={e => setGenre(e.target.value)} 
                      placeholder="Fantasía, Sci-Fi, Policiaca..."
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: PROJECT TYPE */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    <TypeCard 
                      icon={Book}
                      title="Novela Narrativa"
                      desc="Enfocado en la escritura, capítulos y escenas."
                      selected={projectType === 'novel'}
                      onClick={() => setProjectType('novel')}
                    />
                    <TypeCard 
                      icon={Globe2}
                      title="Worldbuilding"
                      desc="Creación de mundos, geografía y leyes."
                      selected={projectType === 'worldbuilding'}
                      onClick={() => setProjectType('worldbuilding')}
                    />
                    <TypeCard 
                      icon={Dices}
                      title="Campaña de Rol"
                      desc="Gestión de personajes, dados y bestiario."
                      selected={projectType === 'rpg'}
                      onClick={() => setProjectType('rpg')}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: CONTENT PACKS */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-xs text-muted-foreground mb-4">Añade una base de datos predefinida para no empezar de cero.</p>
                  <div className="space-y-2">
                    <div 
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${!selectedPackageId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                      onClick={() => setSelectedPackageId(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Package size={18} /></div>
                        <div>
                          <p className="text-sm font-bold">Lienzo en Blanco</p>
                          <p className="text-[10px] text-muted-foreground">Sin contenido pre-inyectado.</p>
                        </div>
                      </div>
                      {!selectedPackageId && <Check className="text-primary" size={18} />}
                    </div>

                    {availablePackages.map(pkg => {
                      const meta = pkg.metadata[i18n.language || 'es'] || pkg.metadata['en'];
                      return (
                        <div 
                          key={pkg.id}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedPackageId === pkg.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Layers size={18} /></div>
                            <div>
                              <p className="text-sm font-bold">{meta.name}</p>
                              <p className="text-[10px] text-muted-foreground">{pkg.category.toUpperCase()} • Por {pkg.author}</p>
                            </div>
                          </div>
                          {selectedPackageId === pkg.id && <Check className="text-primary" size={18} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: IDENTITY PREVIEW */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 space-y-4 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black tracking-tight">{title || "Nuevo Proyecto"}</h4>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{projectType.toUpperCase()} • {genre || "Sin Género"}</p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="rounded-lg">{author || "Autor Anónimo"}</Badge>
                      {selectedPackageId && <Badge className="rounded-lg bg-blue-500">Con Paquete</Badge>}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/20 border border-dashed flex items-center gap-3">
                    <Palette size={20} className="text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                      Se aplicará el tema visual por defecto o el del paquete seleccionado al finalizar la creación.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 pt-2 border-t border-border/50 flex gap-2">
              <Button variant="ghost" className="rounded-xl h-11 px-6 font-bold" onClick={handlePrev} disabled={loading}>
                {step === 1 ? t('common.cancel') : "Anterior"}
              </Button>
              <div className="flex-1" />
              {step < 4 ? (
                <Button 
                  className="rounded-xl h-11 px-8 gap-2 font-bold" 
                  onClick={handleNext} 
                  disabled={step === 1 && !title.trim()}
                >
                  Continuar
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button 
                  className="rounded-xl h-11 px-10 gap-2 font-black bg-primary text-primary-foreground hover:opacity-90" 
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  ¡EMPEZAR!
                </Button>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepIndicator = ({ current, target, label }: { current: number, target: number, label: string }) => {
  const isPast = current > target;
  const isCurrent = current === target;
  
  return (
    <div className={`flex items-center gap-3 transition-opacity ${!isCurrent && !isPast ? 'opacity-40' : 'opacity-100'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
        isPast ? 'bg-primary border-primary text-primary-foreground' : 
        isCurrent ? 'border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 
        'border-muted-foreground/30 text-muted-foreground'
      }`}>
        {isPast ? <Check size={12} /> : target}
      </div>
      <span className={`text-xs font-bold tracking-tight transition-colors ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
};

const TypeCard = ({ icon: Icon, title, desc, selected, onClick }: { icon: any, title: string, desc: string, selected: boolean, onClick: () => void }) => (
  <div 
    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`}
    onClick={onClick}
  >
    <div className={`p-3 rounded-xl transition-colors ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-black tracking-tight">{title}</p>
      <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
    </div>
    {selected && <ChevronRight size={16} className="text-primary" />}
  </div>
);