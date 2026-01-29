import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Search, 
  PenTool, 
  MessageSquare, 
  Thermometer
} from 'lucide-react';

export const RagStudioView = () => {
  const { ragConfiguration, setRagConfiguration } = useSettingsStore();
  const { t } = useTranslation();

  if (!ragConfiguration) return null;

  const handleUpdate = (section: 'analysis' | 'writing' | 'chat', field: 'temperature' | 'systemPrompt', value: any) => {
      setRagConfiguration({
          ...ragConfiguration,
          [section]: {
              ...ragConfiguration[section],
              [field]: value
          }
      });
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6 shrink-0 bg-card">
         <div className="p-2 bg-primary/10 rounded-lg mr-4">
            <Brain className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h1 className="text-lg font-bold">{t('ragStudio.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('ragStudio.subtitle')}</p>
         </div>
      </div>

      {/* Main Content - 3 Column Grid */}
      <div className="flex-1 overflow-y-auto p-6">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[600px]">
            
            {/* 1. THE LIBRARIAN (ANALYSIS) */}
            <div className="flex flex-col border border-border rounded-xl bg-card shadow-sm overflow-hidden h-full">
               <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-500">
                     <Search className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold text-sm">{t('ragStudio.librarian.title')}</h2>
                  <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('ragStudio.librarian.type')}</span>
               </div>
               
               <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                  <p className="text-xs text-muted-foreground">
                     {t('ragStudio.librarian.description')}
                  </p>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3"/> {t('ragStudio.librarian.precision')}</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ragConfiguration.analysis.temperature}</span>
                     </div>
                     <Slider 
                        defaultValue={[ragConfiguration.analysis.temperature]}
                        max={1} step={0.1}
                        onValueChange={(v) => handleUpdate('analysis', 'temperature', v[0])}
                        className="py-2"
                     />
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{t('ragStudio.librarian.logic')}</span>
                        <span>{t('ragStudio.librarian.creative')}</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <Label className="text-xs">{t('ragStudio.common.systemPrompt')}</Label>
                     <Textarea 
                        className="flex-1 font-mono text-xs bg-muted/30 leading-relaxed resize-none p-3"
                        value={ragConfiguration.analysis.systemPrompt}
                        onChange={(e) => handleUpdate('analysis', 'systemPrompt', e.target.value)}
                     />
                     <div className="text-[10px] text-muted-foreground space-x-2">
                        <span>{t('ragStudio.common.vars')}</span>
                        <code className="bg-muted px-1 rounded">{"{{PROJECT_INDEX}}"}</code>
                        <code className="bg-muted px-1 rounded">{"{{USER_INPUT}}"}</code>
                     </div>
                  </div>
               </div>
            </div>

            {/* 2. THE WRITER (GENERATION) */}
            <div className="flex flex-col border border-border rounded-xl bg-card shadow-sm overflow-hidden h-full">
               <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 rounded-md text-purple-500">
                     <PenTool className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold text-sm">{t('ragStudio.writer.title')}</h2>
                  <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('ragStudio.writer.type')}</span>
               </div>
               
               <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                  <p className="text-xs text-muted-foreground">
                     {t('ragStudio.writer.description')}
                  </p>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3"/> {t('ragStudio.writer.creativity')}</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ragConfiguration.writing.temperature}</span>
                     </div>
                     <Slider 
                        defaultValue={[ragConfiguration.writing.temperature]}
                        max={1} step={0.1}
                        onValueChange={(v) => handleUpdate('writing', 'temperature', v[0])}
                        className="py-2"
                     />
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{t('ragStudio.writer.technical')}</span>
                        <span>{t('ragStudio.writer.literary')}</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <Label className="text-xs">{t('ragStudio.common.systemPrompt')}</Label>
                     <Textarea 
                        className="flex-1 font-mono text-xs bg-muted/30 leading-relaxed resize-none p-3"
                        value={ragConfiguration.writing.systemPrompt}
                        onChange={(e) => handleUpdate('writing', 'systemPrompt', e.target.value)}
                     />
                     <div className="text-[10px] text-muted-foreground space-x-2">
                        <span>{t('ragStudio.common.vars')}</span>
                        <code className="bg-muted px-1 rounded">{"{{CONTEXT_BLOCKS}}"}</code>
                        <code className="bg-muted px-1 rounded">{"{{RPG_INSTRUCTIONS}}"}</code>
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. THE ACTOR (CHAT) */}
            <div className="flex flex-col border border-border rounded-xl bg-card shadow-sm overflow-hidden h-full">
               <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/10 rounded-md text-green-500">
                     <MessageSquare className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold text-sm">{t('ragStudio.actor.title')}</h2>
                  <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('ragStudio.actor.type')}</span>
               </div>
               
               <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                  <p className="text-xs text-muted-foreground">
                     {t('ragStudio.actor.description')}
                  </p>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3"/> {t('ragStudio.actor.improvisation')}</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ragConfiguration.chat.temperature}</span>
                     </div>
                     <Slider 
                        defaultValue={[ragConfiguration.chat.temperature]}
                        max={1} step={0.1}
                        onValueChange={(v) => handleUpdate('chat', 'temperature', v[0])}
                        className="py-2"
                     />
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{t('ragStudio.actor.robotic')}</span>
                        <span>{t('ragStudio.actor.chaotic')}</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <Label className="text-xs">{t('ragStudio.common.systemPrompt')}</Label>
                     <Textarea 
                        className="flex-1 font-mono text-xs bg-muted/30 leading-relaxed resize-none p-3"
                        value={ragConfiguration.chat.systemPrompt}
                        onChange={(e) => handleUpdate('chat', 'systemPrompt', e.target.value)}
                     />
                     <div className="text-[10px] text-muted-foreground space-x-2">
                        <span>{t('ragStudio.common.vars')}</span>
                        <code className="bg-muted px-1 rounded">{"{{CHAR_NAME}}"}</code>
                        <code className="bg-muted px-1 rounded">{"{{CHAR_PERSONALITY}}"}</code>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};
