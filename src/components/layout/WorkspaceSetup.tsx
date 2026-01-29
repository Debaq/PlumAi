import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Check, Loader2, AlertTriangle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WorkspaceSetupProps {
  onComplete: () => void;
}

export const WorkspaceSetup = ({ onComplete }: WorkspaceSetupProps) => {
  const { t } = useTranslation();
  const { initializeWorkspace, getDefaultPath, validatePath, migrateExistingData } = useWorkspaceStore();

  const [path, setPath] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [migratedCount, setMigratedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'path' | 'migrating' | 'done'>('path');

  useEffect(() => {
    getDefaultPath().then((defaultPath) => {
      setPath(defaultPath);
      validatePath(defaultPath).then(setIsValid);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (path) {
      validatePath(path).then(setIsValid).catch(() => setIsValid(false));
    }
  }, [path]);

  const handleBrowse = async () => {
    try {
      const dialogModule = await import('@tauri-apps/plugin-dialog');
      const selected = await dialogModule.open({
        directory: true,
        title: t('workspace.setup.selectFolder'),
      });
      if (selected) {
        setPath(selected as string);
      }
    } catch (err) {
      console.error('Browse error:', err);
    }
  };

  const handleInitialize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await initializeWorkspace(path);
      setStep('migrating');

      // Migrate existing data
      try {
        const count = await migrateExistingData();
        setMigratedCount(count);
      } catch (migErr) {
        console.warn('Migration warning:', migErr);
        setMigratedCount(0);
      }

      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="max-w-md w-full mx-4 space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-black">{t('workspace.setup.ready')}</h2>
          <p className="text-sm text-muted-foreground">
            {migratedCount !== null && migratedCount > 0
              ? t('workspace.setup.migratedCount', { count: migratedCount })
              : t('workspace.setup.readyDesc')}
          </p>
          <Button onClick={onComplete} className="w-full h-12 rounded-xl font-bold text-md">
            {t('workspace.setup.start')}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'migrating') {
    return (
      <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="max-w-md w-full mx-4 space-y-6 text-center animate-in fade-in duration-200">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <Database className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black">{t('workspace.setup.migrating')}</h2>
          <p className="text-sm text-muted-foreground">{t('workspace.setup.migratingDesc')}</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center">
      <div className="max-w-lg w-full mx-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">{t('workspace.setup.title')}</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {t('workspace.setup.description')}
          </p>
        </div>

        <div className="space-y-4 p-6 border-2 rounded-2xl bg-card">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t('workspace.setup.pathLabel')}
          </label>
          <div className="flex gap-2">
            <Input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/home/user/Documents/PlumAi"
              className="flex-1 h-12 rounded-xl border-2"
            />
            <Button variant="outline" onClick={handleBrowse} className="h-12 rounded-xl border-2 px-4">
              <FolderOpen className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            {t('workspace.setup.pathHint')}
          </p>
        </div>

        <Button
          onClick={handleInitialize}
          disabled={!isValid || isLoading}
          className="w-full h-12 rounded-xl font-bold text-md gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {t('workspace.setup.confirm')}
        </Button>
      </div>
    </div>
  );
};
