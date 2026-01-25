import { useLogStore } from '@/stores/useLogStore';
import { Terminal, X, Trash2, Copy, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const AIConsole = () => {
  const { logs, isConsoleOpen, toggleConsole, clearLogs } = useLogStore();
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  if (!isConsoleOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyRaw = (content: any) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
  };

  return (
    <div className="fixed bottom-[22px] right-0 w-[450px] h-[600px] bg-card border-l border-t border-border shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Debug Console</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearLogs}
            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
            title="Clear Logs"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={toggleConsole}
            className="p-1.5 hover:bg-accent rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-[10px] bg-background/50">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <Terminal size={32} className="mb-2" />
            <p>No logs yet. AI activity will appear here.</p>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className={`border rounded p-2 ${
            log.type === 'error' ? 'border-destructive/30 bg-destructive/5' : 
            log.type === 'request' ? 'border-primary/20 bg-primary/5' : 'border-border bg-card/50'
          }`}>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(log.id)}
            >
              <div className="flex items-center gap-2">
                {expandedLogs[log.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span className={`font-bold uppercase ${
                  log.type === 'error' ? 'text-destructive' : 
                  log.type === 'request' ? 'text-primary' : 'text-green-500'
                }`}>
                  {log.type}
                </span>
                <span className="text-muted-foreground">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className="bg-muted px-1.5 py-0.5 rounded text-[9px]">
                  {log.provider} / {log.model}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); copyRaw(log.content); }}
                className="p-1 hover:bg-accent rounded"
                title="Copy Raw JSON"
              >
                <Copy size={12} />
              </button>
            </div>

            {expandedLogs[log.id] && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <pre className="whitespace-pre-wrap break-all bg-black/20 p-2 rounded max-h-60 overflow-y-auto overflow-x-hidden">
                  {JSON.stringify(log.content, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
