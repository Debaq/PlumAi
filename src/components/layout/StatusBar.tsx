import { useProjectStore } from '@/stores/useProjectStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLogStore } from '@/stores/useLogStore';
import { useSpeechStore } from '@/stores/useSpeechStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { WorldbuilderStatusBar } from '@/components/rpg/WorldbuilderStatusBar';
import { useTranslation } from 'react-i18next';
import { Terminal, Timer, Coffee, Play, Pause, RefreshCw, Download, X, FolderOpen, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const StatusBar = () => {
  const { activeProject } = useProjectStore();
  const { language, setLanguage, enableLogs, pomodoroEnabled } = useSettingsStore();
  const { toggleConsole } = useLogStore();
  const { isRecording, activeDownloads, cancelDownload } = useSpeechStore();
  const { syncStatus, workspacePath, isInitialized: wsInitialized } = useWorkspaceStore();
  const { t, i18n } = useTranslation();
  const totalWords = activeProject?.chapters.reduce((acc, ch) => acc + (ch.wordCount || 0), 0) || 0;

  // Pomodoro Logic
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      const nextIsBreak = !isBreak;
      setIsBreak(nextIsBreak);
      setTimeLeft(nextIsBreak ? 5 * 60 : 25 * 60);
      setIsRunning(false);
      // Play a sound or notification here if possible
      alert(nextIsBreak ? t('status.pomodoro.breakTime') : t('status.pomodoro.workTime'));
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Placeholder for AI activity
  const isAIActive = false;

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <footer className="h-[22px] bg-card border-t border-border flex items-center justify-between px-4 text-[11px] text-muted-foreground shrink-0 fixed bottom-0 left-0 right-0 z-50 select-none">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1">
          <span>{totalWords.toLocaleString()} words</span>
        </div>
        {activeProject?.isRpgModeEnabled && <WorldbuilderStatusBar />}
        
        {pomodoroEnabled && (
          <div className="flex items-center gap-2 border-l border-border pl-4 h-full">
            <div className={`flex items-center gap-1.5 font-mono font-bold ${isBreak ? 'text-green-500' : isRunning ? 'text-orange-500' : ''}`}>
              {isBreak ? <Coffee size={12} /> : <Timer size={12} />}
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center">
              <button onClick={toggleTimer} className="p-1 hover:text-foreground transition-colors">
                {isRunning ? <Pause size={10} /> : <Play size={10} />}
              </button>
              <button onClick={resetTimer} className="p-1 hover:text-foreground transition-colors">
                <RefreshCw size={10} />
              </button>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="flex items-center gap-1.5 border-l border-border pl-4 h-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-500 font-bold">{t('status.recording')}</span>
          </div>
        )}

        {activeDownloads.length > 0 && (
          <div className="flex items-center gap-2 border-l border-border pl-4 h-full">
            <Download size={12} className="text-primary animate-bounce" />
            <span className="text-[10px] truncate max-w-[120px]">{activeDownloads[0].itemId}</span>
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.round(activeDownloads[0].percent)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono">{Math.round(activeDownloads[0].percent)}%</span>
            {activeDownloads.length > 1 && (
              <span className="text-[10px] text-muted-foreground">+{activeDownloads.length - 1}</span>
            )}
            <button
              onClick={() => cancelDownload()}
              className="p-0.5 hover:text-destructive transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 h-full">
        {wsInitialized && (
          <div className="flex items-center gap-1.5 border-l border-border pl-4 h-full" title={workspacePath || ''}>
            {syncStatus === 'syncing' && <Loader2 size={11} className="text-primary animate-spin" />}
            {syncStatus === 'synced' && <CheckCircle2 size={11} className="text-green-500" />}
            {syncStatus === 'error' && <AlertTriangle size={11} className="text-yellow-500" />}
            {syncStatus === 'idle' && <FolderOpen size={11} className="text-muted-foreground" />}
            {syncStatus === 'unavailable' && <AlertTriangle size={11} className="text-destructive" />}
            <span className="text-[10px] truncate max-w-[120px]">
              {syncStatus === 'syncing' ? t('workspace.status.syncing') :
               syncStatus === 'synced' ? t('workspace.status.synced') :
               syncStatus === 'error' ? t('workspace.status.error') :
               syncStatus === 'unavailable' ? t('workspace.status.unavailable') :
               t('workspace.status.ready')}
            </span>
          </div>
        )}
        {enableLogs && (
          <button 
            onClick={toggleConsole}
            className="flex items-center gap-1 hover:text-primary transition-colors h-full px-2 hover:bg-accent/50"
            title="Open AI Debug Console"
          >
            <Terminal size={12} />
            <span>AI Interactive</span>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full transition-colors ${isAIActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/50'}`}></span>
          <span>{isAIActive ? t('status.ai.active') : t('status.ai.inactive')}</span>
        </div>
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 hover:text-foreground transition-colors uppercase font-medium h-full px-2"
        >
          <span>{language === 'en' ? 'English' : 'Español'}</span>
        </button>
      </div>
    </footer>
  );
};
