import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { AgenticService } from '@/lib/ai/agentic-service';
import { generateTextAI } from '@/lib/ai/client-ai';
import { 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Loader2,
  TriangleAlert,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ConsistencyInspector = () => {
  const { currentEditingChapterId } = useUIStore();
  const { activeProject } = useProjectStore();
  const { activeProvider, activeModel } = useSettingsStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!currentEditingChapterId || !activeProject) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const keys = activeProject?.apiKeys?.text[activeProvider] || [];
      const apiKeyEntry = keys.find(k => k.isDefault) || keys[0];
      const apiKey = apiKeyEntry?.key;

      if (!apiKey && activeProvider !== 'ollama' && activeProvider !== 'manual') {
        throw new Error(`No API key configured for ${activeProvider}`);
      }

      // 1. Inventory
      const inventory = AgenticService.buildContextInventory(currentEditingChapterId);
      if (!inventory) throw new Error("Project state not ready");

      // 2. Determine Context (Asking AI what it needs for consistency)
      const analysisPrompt = AgenticService.buildContextAnalysisPrompt(
        'analyze-consistency', 
        'Busca inconsistencias entre este capítulo y mi lore/personajes.', 
        inventory
      );

      const contextStream = await generateTextAI([{ role: 'user', content: analysisPrompt }], activeProvider, activeModel, apiKey || '');
      let contextResult = '';
      for await (const chunk of contextStream.textStream) contextResult += chunk;

      const jsonMatch = contextResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI failed to determine required context");
      const contextDecision = JSON.parse(jsonMatch[0]);

      // 3. Build selective context and final consistency prompt
      const context = AgenticService.buildSelectiveContext(contextDecision.contextNeeded, currentEditingChapterId);
      const finalPrompt = AgenticService.buildConsistencyCheckPrompt(context);

      // 4. Run final analysis
      const finalStream = await generateTextAI([{ role: 'user', content: finalPrompt }], activeProvider, activeModel, apiKey || '');
      let finalResult = '';
      for await (const chunk of finalStream.textStream) finalResult += chunk;

      const resultsMatch = finalResult.match(/\[[\s\S]*\]/);
      if (!resultsMatch) {
          setResults([]); // No issues found
      } else {
          setResults(JSON.parse(resultsMatch[0]));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!currentEditingChapterId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Inspector de Consistencia
        </h3>
        {!isAnalyzing && results && (
          <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setResults(null)}>
            Limpiar
          </Button>
        )}
      </div>

      {!results && !isAnalyzing && (
        <div className="bg-card border border-dashed rounded-xl p-6 text-center space-y-4">
          <div className="p-3 bg-primary/5 rounded-full w-fit mx-auto">
            <Search className="w-6 h-6 text-primary opacity-40" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold">¿Todo en orden?</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Analizaré el capítulo actual comparándolo con tu Lore y el estado de tus personajes.
            </p>
          </div>
          <Button className="w-full h-9 rounded-xl gap-2 text-xs" onClick={runAnalysis}>
            Iniciar Análisis
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center space-y-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-primary">Analizando Narrativa...</p>
            <p className="text-[10px] text-muted-foreground italic">
              Comparando con el Lore y base de datos de personajes
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-[10px] text-destructive">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {results.length === 0 ? (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
              <p className="text-xs font-bold text-green-600">¡Consistencia Perfecta!</p>
              <p className="text-[10px] text-muted-foreground">No se detectaron contradicciones con el Lore.</p>
            </div>
          ) : (
            results.map((res, i) => (
              <div key={i} className={`p-4 rounded-xl border space-y-2 shadow-sm ${
                res.type === 'error' ? 'bg-red-500/5 border-red-500/20' : 
                res.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20' : 
                'bg-blue-500/5 border-blue-500/20'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {res.type === 'error' ? <TriangleAlert className="w-3.5 h-3.5 text-red-500" /> : <Info className="w-3.5 h-3.5 text-orange-500" />}
                    <span className="text-[11px] font-black uppercase tracking-tight leading-none">{res.issue}</span>
                  </div>
                  <Badge variant="outline" className={`text-[8px] h-4 ${
                    res.severity === 'high' ? 'bg-red-500 text-white' : ''
                  }`}>
                    {res.severity}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {res.explanation}
                </p>
              </div>
            ))
          )}
          
          <Button variant="outline" className="w-full text-[10px] h-8 rounded-lg" onClick={runAnalysis}>
            Re-analizar
          </Button>
        </div>
      )}
    </div>
  );
};
