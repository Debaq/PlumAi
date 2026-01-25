import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { CryptoService } from '@/lib/crypto';
import { Lock, Unlock, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AppLock = () => {
  const { isLocked, setLocked } = useUIStore();
  const { masterPasswordHash } = useSettingsStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-lock logic: Detect inactivity
  useEffect(() => {
    if (!masterPasswordHash) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      // 5 minutes of inactivity = 300,000 ms
      timeout = setTimeout(() => {
        setLocked(true);
      }, 300000); 
    };

    // Events that reset the inactivity timer
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timeout) clearTimeout(timeout);
    };
  }, [masterPasswordHash, setLocked]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) return;

    setIsVerifying(true);
    setError(false);

    try {
      const hash = await CryptoService.hashPassword(password);
      if (hash === masterPasswordHash) {
        setLocked(false);
        setPassword('');
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isLocked || !masterPasswordHash) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Aplicación Bloqueada</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu contraseña maestra para continuar.</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="Contraseña Maestra"
              className={`h-12 bg-card border-2 text-center text-lg rounded-2xl transition-all ${error ? 'border-destructive animate-shake' : 'focus:border-primary'}`}
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1 text-destructive text-[10px] font-bold uppercase tracking-widest">
                <ShieldAlert size={12} />
                Contraseña Incorrecta
              </div>
            )}
          </div>

          <Button 
            className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20" 
            disabled={isVerifying || !password}
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Unlock size={18} />
                Desbloquear
              </>
            )}
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground/50 uppercase font-black tracking-widest">
          Seguridad de Nivel Militar • PlumAi
        </p>
      </div>
    </div>
  );
};
