

import { useState, useRef, useEffect } from 'react';
import { useAgenticChat } from '@/hooks/useAgenticChat';
import { confirm } from '@/stores/useConfirmStore';
import { Send, X, Sparkles, Loader2, Settings, Trash2 } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isLoading, clearMessages } = useAgenticChat();
  const [input, setInput] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('assistant');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openModal, activeView } = useUIStore();
  const { activeProject } = useProjectStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (selectedCharacterId === 'assistant') {
        sendMessage(input);
    } else {
        sendMessage(input, 'character_chat', undefined, undefined, selectedCharacterId);
    }
    setInput('');
  };

  if (activeView === 'projects') return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-4 h-12 w-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-10 right-4 w-96 h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden text-card-foreground">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-muted/40 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
           <select 
             className="h-8 text-xs bg-transparent border border-border rounded px-2 font-bold max-w-[150px] truncate outline-none focus:ring-1 focus:ring-primary text-foreground"
             value={selectedCharacterId}
             onChange={(e) => setSelectedCharacterId(e.target.value)}
           >
             <option value="assistant" className="bg-popover text-popover-foreground">🤖 AI Assistant</option>
             {activeProject?.characters.map(c => (
               <option key={c.id} value={c.id} className="bg-popover text-popover-foreground">👤 {c.name}</option>
             ))}
           </select>
        </div>
        <div className="flex items-center gap-1 shrink-0">
            <button 
                onClick={async () => { if(await confirm('¿Limpiar historial?', { confirmText: 'Limpiar' })) clearMessages(); }} 
                className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                title="Clear History"
            >
                <Trash2 className="h-4 w-4" />
            </button>
            <button
                onClick={() => openModal('settings')}
                className="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                title="AI Settings"
            >
                <Settings className="h-4 w-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" title="Close Chat">
                <X className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50" ref={scrollRef}>
          {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 opacity-50">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">
                {selectedCharacterId === 'assistant' 
                  ? "How can I help you with your story today?" 
                  : "Ask me anything. I'm in character."}
              </p>
          </div>
          )}
          {messages.map((m, i) => (
          <div
              key={i}
              className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
              <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted border border-border text-foreground rounded-bl-none'
              }`}
              >
              {m.role === 'system' ? <span className="text-destructive font-bold text-xs uppercase block mb-1">System Error</span> : null}
              {m.content}
              </div>
          </div>
          ))}
          {isLoading && (
              <div className="flex justify-start w-full animate-pulse">
                  <div className="bg-muted border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
              </div>
          )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
          <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedCharacterId === 'assistant' ? "Type a message..." : "Talk to character..."}
              className="flex-1 text-sm bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
          />
          <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
              <Send className="h-4 w-4" />
          </button>
          </div>
      </form>
    </div>
  );
}
