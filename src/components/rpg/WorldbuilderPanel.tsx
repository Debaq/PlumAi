import { useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useBannerStore } from '@/stores/useBannerStore';
import { useTranslation } from 'react-i18next';
import { DiceRoller } from './DiceRoller';
import { X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WorldbuilderPanel = () => {
  const { isRpgPanelOpen, toggleRpgPanel, editorZenMode } = useUIStore();
  const { activeProject, setContextBanner } = useProjectStore();
  const { initializeBanners, getBanner } = useBannerStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRpgPanelOpen) {
      initializeBanners();
    }
  }, [isRpgPanelOpen, initializeBanners]);

  if (!activeProject?.isRpgModeEnabled || !isRpgPanelOpen || editorZenMode) return null;

  const customBanner = activeProject.banners?.['worldbuilder'];
  const defaultBanner = getBanner('worldbuilder');
  const bannerUrl = customBanner || defaultBanner;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) setContextBanner('worldbuilder', result);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed top-[48px] bottom-[22px] right-0 w-[300px] bg-background border-l border-border z-40 shadow-xl flex flex-col">
       <div className="flex items-center justify-between p-2 border-b border-border bg-muted/40">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-2">{t('ai.settings.worldbuilder.title')}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleRpgPanel}>
             <X className="w-4 h-4" />
          </Button>
       </div>
       
       {/* Mini Banner */}
       {bannerUrl && (
         <div 
            className="w-full h-24 shrink-0 relative group border-b border-border"
            style={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
         >
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 bg-black/50 text-white hover:bg-black/70 rounded-full"
                    title="Change Banner"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon size={12} />
                </Button>
            </div>
         </div>
       )}

       <div className="flex-1 overflow-hidden">
         <DiceRoller />
       </div>
    </div>
  );
};
