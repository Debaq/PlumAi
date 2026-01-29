import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useBannerStore } from '@/stores/useBannerStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ShieldOff, ImageIcon } from 'lucide-react';

interface ContextBannerProps {
  context: string; // 'lore', 'chapters', 'scenes', etc.
}

export const ContextBanner = ({ context }: ContextBannerProps) => {
  const { activeProject, toggleRpgMode, setContextBanner } = useProjectStore();
  const { initializeBanners, getBanner } = useBannerStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    initializeBanners();
  }, [initializeBanners]);

  // Priority: Custom Project Banner > Random Session Banner
  const customBanner = activeProject?.banners?.[context];
  const defaultBanner = getBanner(context);
  const bannerUrl = customBanner || defaultBanner;

  if (!activeProject?.isRpgModeEnabled || !bannerUrl) return null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setContextBanner(context, result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className="relative w-full h-32 md:h-48 overflow-hidden shrink-0 border-b border-border transition-all duration-700 ease-in-out group"
      style={{
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Overlay for better text legibility */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-between px-8 md:px-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            {activeProject.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded shadow-sm">
                    {t('ai.settings.worldbuilder.title').replace('Modo ', '').replace(' Mode', '')}
                </span>
                <span className="text-white/90 text-xs md:text-sm font-medium drop-shadow-sm italic capitalize">
                    {context} Section
                </span>
            </div>
        </div>

        <div className="animate-in fade-in slide-in-from-right-4 duration-700 flex flex-col items-end gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm gap-2"
                onClick={() => toggleRpgMode(false)}
            >
                <ShieldOff size={14} />
                {t('common.cancel')} {t('ai.settings.worldbuilder.title')}
            </Button>

            {/* Personalize Button (Visible on Hover or if custom set) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleFileChange}
               />
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[10px] text-white/70 hover:text-white hover:bg-black/40 gap-1"
                  onClick={handleUploadClick}
               >
                  <ImageIcon size={12} />
                  {customBanner ? t('banners.change') : t('banners.personalize')}
               </Button>
            </div>
        </div>
      </div>
      
      {/* Decorative gradient at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};
