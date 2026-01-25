import { useSettingsStore } from '@/stores/useSettingsStore';
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
            <h1 className="text-lg font-bold">RAG Studio</h1>
            <p className="text-xs text-muted-foreground">Laboratorio de Ingeniería de Prompts y Ajuste Cognitivo</p>
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
                  <h2 className="font-semibold text-sm">El Bibliotecario</h2>
                  <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Análisis</span>
               </div>
               
               <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                  <p className="text-xs text-muted-foreground">
                     Este agente recibe tu pregunta y el índice del proyecto. Su trabajo es decidir qué capítulos o fichas leer.
                  </p>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3"/> Precisión</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ragConfiguration.analysis.temperature}</span>
                     </div>
                     <Slider 
                        defaultValue={[ragConfiguration.analysis.temperature]}
                        max={1} step={0.1}
                        onValueChange={(v) => handleUpdate('analysis', 'temperature', v[0])}
                        className="py-2"
                     />
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Lógica Estricta (0.0)</span>
                        <span>Creativo (1.0)</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <Label className="text-xs">System Prompt</Label>
                     <Textarea 
                        className="flex-1 font-mono text-xs bg-muted/30 leading-relaxed resize-none p-3"
                        value={ragConfiguration.analysis.systemPrompt}
                        onChange={(e) => handleUpdate('analysis', 'systemPrompt', e.target.value)}
                     />
                     <div className="text-[10px] text-muted-foreground space-x-2">
                        <span>Vars:</span>
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
                  <h2 className="font-semibold text-sm">El Escritor</h2>
                  <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Generación</span>
               </div>
               
               <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                  <p className="text-xs text-muted-foreground">
                     Este agente redacta la respuesta final utilizando el contexto recuperado por el bibliotecario.
                  </p>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3"/> Creatividad</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ragConfiguration.writing.temperature}</span>
                     </div>
                     <Slider 
                        defaultValue={[ragConfiguration.writing.temperature]}
                        max={1} step={0.1}
                        onValueChange={(v) => handleUpdate('writing', 'temperature', v[0])}
                        className="py-2"
                     />
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Técnico (0.0)</span>
                        <span>Literario (1.0)</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <Label className="text-xs">System Prompt</Label>
                     <Textarea 
                        className="flex-1 font-mono text-xs bg-muted/30 leading-relaxed resize-none p-3"
                        value={ragConfiguration.writing.systemPrompt}
                        onChange={(e) => handleUpdate('writing', 'systemPrompt', e.target.value)}
                     />
                     <div className="text-[10px] text-muted-foreground space-x-2">
                        <span>Vars:</span>
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
                  <h2 className="font-semibold text-sm">El Actor</h2>
                  <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground tracking-wider">NPCs</span>
               </div>
               
               <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                  <p className="text-xs text-muted-foreground">
                     Este agente simula la personalidad de los personajes para chats rápidos e interacciones directas.
                  </p>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3"/> Improvisación</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ragConfiguration.chat.temperature}</span>
                     </div>
                     <Slider 
                        defaultValue={[ragConfiguration.chat.temperature]}
                        max={1} step={0.1}
                        onValueChange={(v) => handleUpdate('chat', 'temperature', v[0])}
                        className="py-2"
                     />
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Robótico (0.0)</span>
                        <span>Caótico (1.0)</span>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                     <Label className="text-xs">System Prompt</Label>
                     <Textarea 
                        className="flex-1 font-mono text-xs bg-muted/30 leading-relaxed resize-none p-3"
                        value={ragConfiguration.chat.systemPrompt}
                        onChange={(e) => handleUpdate('chat', 'systemPrompt', e.target.value)}
                     />
                     <div className="text-[10px] text-muted-foreground space-x-2">
                        <span>Vars:</span>
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
