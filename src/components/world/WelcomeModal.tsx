import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { DEMO_PROJECT } from '@/mocks/demoProject';
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Plus,
  FolderOpen,
  Sparkles,
  Heart,
  Github
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WelcomeModal = () => {
  useTranslation();
  const { activeModal, closeModal, openModal } = useUIStore();
  const { setActiveProject } = useProjectStore();

  if (activeModal !== 'welcome') return null;

  const handleDemo = () => {
    setActiveProject(DEMO_PROJECT);
    closeModal();
  };

  const handleNew = () => {
    openModal('newProject');
  };

  return (
    <Dialog open={activeModal === 'welcome'} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-8 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <img src="/img/icon_alpha.png" alt="PlumAi Logo" className="relative w-full h-full object-contain animate-float drop-shadow-2xl" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                PlumAi <span className="text-primary text-xl font-medium tracking-normal ml-1">v2.0</span>
              </h1>
              <p className="text-white/60 text-sm max-w-[300px] mx-auto">
                Tu santuario creativo potenciado por inteligencia artificial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <WelcomeOption 
                icon={Plus} 
                title="Nuevo Proyecto" 
                description="Empieza una historia desde cero"
                onClick={handleNew}
                primary
              />
              <WelcomeOption 
                icon={Sparkles} 
                title="Solo Mirar" 
                description="Carga el proyecto de ejemplo"
                onClick={handleDemo}
              />
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-4">
              <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 text-xs gap-2">
                <FolderOpen className="w-3.5 h-3.5" />
                Cargar desde archivo (.pluma)
              </Button>
              
              <div className="flex items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                <Github className="w-5 h-5 cursor-pointer" />
                <Heart className="w-5 h-5 cursor-pointer fill-red-500 text-red-500" />
                <img src="/img/icon_alpha.png" alt="Logo" className="w-5 h-5 cursor-pointer object-contain" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WelcomeOption = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  primary = false
}: { 
  icon: any, 
  title: string, 
  description: string, 
  onClick: () => void,
  primary?: boolean
}) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center p-6 rounded-xl border transition-all duration-300 group
      ${primary 
        ? 'bg-primary text-white border-primary hover:scale-[1.02] shadow-lg shadow-primary/20' 
        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20'
      }
    `}
  >
    <Icon className={`w-8 h-8 mb-3 transition-transform duration-500 group-hover:rotate-12 ${primary ? 'text-white' : 'text-primary'}`} />
    <span className="font-bold text-sm">{title}</span>
    <span className="text-[10px] opacity-60 mt-1">{description}</span>
  </button>
);
