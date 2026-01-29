import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpeechStore } from '@/stores/useSpeechStore';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  Download,
  Trash2,
  Check,
  Cpu,
  HardDrive,
  Zap,
  Swords,
  Pen,
  Globe,
  Key,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { SpeechEngineType, SherpaMode, SpeechModelInfo } from '@/types/speech';

export const VoiceSettings = () => {
  const { t } = useTranslation();
  const {
    config,
    availableModels,
    installedModelIds,
    setConfig,
    downloadModel,
    deleteModel,
    loadModels,
    initialize,
  } = useSpeechStore();

  useEffect(() => {
    initialize();
  }, []);

  const engines: { id: SpeechEngineType; name: string; desc: string; recommended?: boolean }[] = [
    {
      id: 'vosk',
      name: t('settingsModal.voice.engines.vosk'),
      desc: t('settingsModal.voice.engines.voskDesc'),
    },
    {
      id: 'sherpaOnnx',
      name: t('settingsModal.voice.engines.sherpa'),
      desc: t('settingsModal.voice.engines.sherpaDesc'),
    },
    {
      id: 'whisperApi',
      name: t('settingsModal.voice.engines.whisper'),
      desc: t('settingsModal.voice.engines.whisperDesc'),
    },
  ];

  const sherpaModes: { id: SherpaMode; name: string; desc: string; icon: any }[] = [
    {
      id: 'writer',
      name: t('settingsModal.voice.modes.writerName'),
      desc: t('settingsModal.voice.modes.writerDesc'),
      icon: Pen,
    },
    {
      id: 'dungeonChaos',
      name: t('settingsModal.voice.modes.dungeonName'),
      desc: t('settingsModal.voice.modes.dungeonDesc'),
      icon: Swords,
    },
  ];

  const filteredModels = availableModels.filter(
    (m) => m.engine === config.engine
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const isModelInstalled = (model: SpeechModelInfo) => {
    return installedModelIds.some((id) => id === model.id);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-4xl mx-auto pb-20">
      {/* Engine selector */}
      <div>
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Mic className="w-4 h-4" />
          {t('settingsModal.voice.engineTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {engines.map((eng) => (
            <button
              key={eng.id}
              onClick={() => setConfig({ engine: eng.id })}
              className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                config.engine === eng.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/40 hover:bg-muted/50'
              }`}
            >
              {eng.recommended && (
                <Badge className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-lg">
                  {t('settingsModal.voice.recommended')}
                </Badge>
              )}
              <span className="text-sm font-bold block">{eng.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight block mt-1">
                {eng.desc}
              </span>
              {config.engine === eng.id && (
                <Check size={14} className="text-primary absolute bottom-3 right-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sherpa mode selector */}
      {config.engine === 'sherpaOnnx' && (
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t('settingsModal.voice.modeTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sherpaModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setConfig({ sherpaMode: mode.id })}
                  className={`p-4 rounded-xl border-2 transition-all text-left flex gap-3 ${
                    config.sherpaMode === mode.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="p-2.5 bg-primary/10 rounded-xl h-fit shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{mode.name}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight block mt-1">
                      {mode.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Models */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            {t('settingsModal.voice.modelsTitle')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => loadModels()}
          >
            <RefreshCw size={12} />
            {t('settingsModal.voice.refresh')}
          </Button>
        </div>
        {filteredModels.length === 0 ? (
          <div className="p-6 border-2 border-dashed rounded-xl text-center text-muted-foreground text-xs">
            {config.engine === 'whisperApi'
              ? t('settingsModal.voice.noModelsWhisper')
              : t('settingsModal.voice.noModels')}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredModels.map((model) => {
              const installed = isModelInstalled(model);
              return (
                <div
                  key={model.id}
                  className="p-4 border-2 rounded-xl bg-card/50 flex items-center justify-between"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate">{model.name}</span>
                      {model.isDefault && (
                        <Badge variant="outline" className="text-[9px] rounded-lg px-1.5">
                          {t('settingsModal.voice.default')}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[9px] rounded-lg px-1.5 uppercase"
                      >
                        {model.qualityTier}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe size={10} />
                        {model.language.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive size={10} />
                        {formatSize(model.sizeBytes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu size={10} />
                        {model.minRamMb} MB RAM
                      </span>
                    </div>
                    {(model as any).notes && (
                      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                        <Info size={9} />
                        {(model as any).notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {installed ? (
                      <>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 rounded-lg text-[10px]">
                          <Check size={10} className="mr-1" />
                          {t('settingsModal.voice.installed')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive"
                          onClick={() => deleteModel(model.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-8 gap-1 text-xs font-bold"
                        onClick={() => downloadModel(model.id)}
                        disabled={!model.downloadUrl}
                      >
                        <Download size={12} />
                        {t('settingsModal.voice.download')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Whisper API config */}
      {config.engine === 'whisperApi' && (
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Key className="w-4 h-4" />
            {t('settingsModal.voice.whisperTitle')}
          </h3>
          <div className="p-4 border-2 rounded-xl bg-card space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold ml-1">
                {t('settingsModal.voice.whisperApiKey')}
              </Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={config.whisperApiKey || ''}
                onChange={(e) => setConfig({ whisperApiKey: e.target.value })}
                className="h-11 rounded-xl bg-muted/20"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t('settingsModal.voice.whisperNote')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
