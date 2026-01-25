import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const LoadingScreen = ({ onFinished }: { onFinished?: () => void }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = useMemo(() => [
    t('loading.messages.creative'),
    t('loading.messages.stories'),
    t('loading.messages.pen'),
    t('loading.messages.muses'),
    t('loading.messages.organizing'),
    t('loading.messages.ai'),
    t('loading.messages.inspiration'),
    t('loading.messages.stage'),
    t('loading.messages.worlds'),
    t('loading.messages.ready'),
  ], [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    const timeout = setTimeout(() => {
      const loader = document.getElementById('app-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.transform = 'scale(1.1)';
        loader.style.filter = 'blur(10px)';
      }
      setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 800);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [messages.length, onFinished]);

  if (!visible) return null;

  return (
    <>
      <div 
        id="app-loader" 
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0a0a] text-white transition-all duration-1000 ease-in-out"
      >
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="relative flex flex-col items-center max-w-[500px] px-10">
          {/* Logo Container */}
          <div className="relative mb-12 group">
            <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse-slow opacity-50" />
            <div className="relative animate-reveal">
              <img 
                src="/img/icon_alpha.png" 
                alt="PlumAi Logo" 
                className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(74,144,226,0.3)]" 
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-6 animate-fade-up">
            <div className="space-y-1">
              <h1 className="text-4xl font-light tracking-[0.2em] uppercase text-white/90">
                Plum<span className="font-bold text-primary">Ai</span>
              </h1>
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-2 opacity-50" />
            </div>

            <p className="text-sm font-light text-white/40 tracking-widest uppercase min-h-[20px] animate-subtle-fade">
              {messages[messageIndex]}
            </p>
          </div>

          {/* Elegant Progress Line */}
          <div className="w-48 h-[1px] bg-white/5 mt-12 relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-loading-line" />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes reveal {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes loadingLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes subtleFade {
          0%, 100% { opacity: 0.3; transform: translateY(2px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: reveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-fade-up {
          animation: fadeUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        .animate-loading-line {
          animation: loadingLine 3s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        .animate-subtle-fade {
          animation: subtleFade 2.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};