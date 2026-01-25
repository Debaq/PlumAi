import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '@/stores/useProjectStore';
import { useSettingsStore, AIProvider } from '@/stores/useSettingsStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAgenticChat } from '@/hooks/useAgenticChat';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Cpu, 
  Wand2, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  Copy,
  FilePlus,
  Trash2,
  Zap,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const AIAssistantView = () => {
  const { t } = useTranslation();
  const { activeProject } = useProjectStore();
  const settings = useSettingsStore();
  const { currentEditingChapterId } = useUIStore() as any; // Temporary cast until store is updated
  const projectActions = useProjectStore();
  const [selectedMode, setSelectedMode] = useState('continue');
  const [showContext, setShowContext] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isLoading, clearMessages } = useAgenticChat();

  const assistantModes = [
    { id: 'continue', name: 'Continuar escribiendo', icon: '✍️', prompt: '¿Qué escenas o momentos clave deberían venir a continuación?' },
    { id: 'suggest', name: 'Sugerir ideas', icon: '💡', prompt: '¿Qué ideas tienes para desarrollar la trama desde este punto? Dame varias opciones creativas.' },
    { id: 'analyze', name: 'Analizar texto', icon: '🔍', prompt: 'Analiza la estructura narrativa de mi historia hasta ahora. ¿Qué funciona bien y qué podría mejorar?' },
    { id: 'improve', name: 'Mejorar pasaje', icon: '✨', prompt: 'Sugerencias específicas para mejorar la prosa y el ritmo de lo escrito.' },
    { id: 'worldbuild', name: 'Expandir mundo', icon: '🌍', prompt: '¿Qué aspectos del worldbuilding debería expandir o profundizar? Dame sugerencias específicas.' },
    { id: 'characterize', name: 'Desarrollar personaje', icon: '🎭', prompt: 'Ayúdame a desarrollar más profundidad en mis personajes. ¿Qué motivaciones o conflictos internos podría explorar?' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, selectedMode, currentEditingChapterId || undefined);
    setInput('');
  };

  const handleQuickAction = (modeId: string) => {
    const mode = assistantModes.find(m => m.id === modeId);
    if (mode) {
      setSelectedMode(modeId);
      setInput(mode.prompt);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app we'd show a toast here
  };

  const insertInEditor = (text: string) => {
    if (!currentEditingChapterId) {
        alert('Por favor abre un capítulo en el editor primero.');
        return;
    }
    
    const chapter = activeProject?.chapters.find(c => c.id === currentEditingChapterId);
    if (chapter) {
        const wrappedText = `<span data-track-change data-type="ai-generated" data-author="ai">${text}</span>`;
        projectActions.updateChapter(currentEditingChapterId, {
            content: chapter.content + '<p></p>' + wrappedText
        });
        alert('Texto insertado con seguimiento de cambios.');
    }
  };

  const providers = [
    { id: 'anthropic', name: 'Claude (Anthropic)' },
    { id: 'openai', name: 'OpenAI (ChatGPT)' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'groq', name: 'Groq' },
    { id: 'ollama', name: 'Ollama (Local)' },
    { id: 'manual', name: 'Manual' },
  ];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 gap-6 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="text-primary" />
          {t('ai.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('ai.subtitle')}
        </p>
      </div>

      {/* Configuration & Context Panel */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs">
              <Cpu className="w-3 h-3" /> Proveedor
            </Label>
            <Select value={settings.activeProvider} onValueChange={(v: AIProvider) => settings.setActiveProvider(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs">
              <Brain className="w-3 h-3" /> Modelo
            </Label>
            <Input 
              value={settings.activeModel} 
              onChange={(e) => settings.setActiveModel(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs">
              <Wand2 className="w-3 h-3" /> Modo de Asistencia
            </Label>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assistantModes.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="mr-2">{m.icon}</span> {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-muted-foreground hover:text-foreground h-8"
            onClick={() => setShowContext(!showContext)}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Contexto del Proyecto
            </span>
            {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {showContext && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border text-xs grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <p className="font-semibold text-muted-foreground uppercase">Proyecto</p>
                <p>{activeProject?.title}</p>
                <p className="text-muted-foreground/70">{activeProject?.genre}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-muted-foreground uppercase">Entidades</p>
                <p>{activeProject?.characters.length} Personajes</p>
                <p>{activeProject?.locations.length} Ubicaciones</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-muted-foreground uppercase">Contenido</p>
                <p>{activeProject?.chapters.length} Capítulos</p>
                <p>{activeProject?.scenes.length} Escenas</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-muted-foreground uppercase">Estadísticas</p>
                <p>{activeProject?.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0)} Palabras</p>
                <p>{activeProject?.loreItems.length} Lore</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-card border rounded-xl shadow-sm overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60 px-12">
              <div className="p-4 bg-primary/10 rounded-full">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Brainstorming Creativo</h3>
                <p className="text-sm max-w-md mt-2 leading-relaxed">
                  Tengo memoria conversacional y entiendo el contexto de tu proyecto. 
                  Puedo ayudarte a expandir tu mundo o resolver dudas de la trama.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {assistantModes.slice(0, 4).map(m => (
                  <Button 
                    key={m.id} 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-3"
                    onClick={() => handleQuickAction(m.id)}
                  >
                    {m.icon} {m.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`
                shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'}
              `}>
                {m.role === 'user' ? 'U' : 'AI'}
              </div>
              <div className={`
                max-w-[80%] space-y-2
                ${m.role === 'user' ? 'items-end' : ''}
              `}>
                <div className={`
                  p-4 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted rounded-tl-none border shadow-sm text-foreground'}
                `}>
                  {m.role === 'system' ? (
                    <span className="text-destructive font-mono">{m.content}</span>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
                
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 px-1">
                    <button 
                      onClick={() => copyToClipboard(m.content)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                      title="Copiar respuesta"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {currentEditingChapterId && (
                      <button 
                        onClick={() => insertInEditor(m.content)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                        title="Insertar al final del capítulo"
                      >
                        <FilePlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto uppercase tracking-tighter opacity-50">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 animate-pulse">
              <div className="shrink-0 w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
              <div className="p-4 rounded-2xl bg-muted border rounded-tl-none w-24 flex gap-1 justify-center">
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-muted/20">
          <form onSubmit={handleSend} className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend();
                }
              }}
              placeholder={t('ai.inputPlaceholder')}
              className="flex-1 min-h-[100px] max-h-[200px] p-4 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all shadow-inner"
            />
            <div className="flex flex-col gap-2">
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="h-[100px] w-12 rounded-xl"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </form>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Ctrl + Enter para enviar
            </p>
            <button 
              onClick={() => { if(confirm('¿Limpiar historial?')) clearMessages(); }}
              className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors uppercase tracking-widest font-medium"
            >
              <Trash2 className="w-3 h-3" />
              Limpiar Chat
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-card border rounded-xl p-4 shadow-sm shrink-0">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          Consultas Rápidas
        </h3>
        <div className="flex flex-wrap gap-2">
          {assistantModes.map(m => (
            <Button 
              key={m.id} 
              variant="outline" 
              size="sm" 
              className={`text-xs h-8 ${selectedMode === m.id ? 'bg-primary/5 border-primary/50' : ''}`}
              onClick={() => handleQuickAction(m.id)}
            >
              <span className="mr-2">{m.icon}</span> {m.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
