'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgenticChat } from '@/hooks/useAgenticChat';
import { Send, X, MessageSquare, Loader2, Settings } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'settings'>('chat');
  const { messages, sendMessage, isLoading } = useAgenticChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeProvider, setActiveProvider, apiKeys, setApiKey } = useSettingsStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border rounded-lg shadow-xl flex flex-col z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
           <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
            <button
                onClick={() => setView(view === 'chat' ? 'settings' : 'chat')}
                className="p-1 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
                title="Settings"
            >
                {view === 'chat' ? <Settings className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded dark:hover:bg-gray-700">
                <X className="h-4 w-4" />
            </button>
        </div>
      </div>

      {view === 'settings' ? (
        <div className="p-4 space-y-4">
            <h3 className="font-medium text-sm">AI Settings</h3>
            <div>
                <label className="block text-xs font-medium mb-1">Provider</label>
                <select
                    value={activeProvider}
                    onChange={(e) => setActiveProvider(e.target.value as any)}
                    className="w-full text-sm border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                >
                    <option value="google">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama (Local)</option>
                </select>
            </div>
            {activeProvider !== 'ollama' && (
                <div>
                    <label className="block text-xs font-medium mb-1">API Key for {activeProvider}</label>
                    <input
                        type="password"
                        value={apiKeys[activeProvider] || ''}
                        onChange={(e) => setApiKey(activeProvider, e.target.value)}
                        className="w-full text-sm border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                        placeholder={`Enter ${activeProvider} key`}
                    />
                </div>
            )}
            <div className="pt-4 text-xs text-gray-500">
                Your API keys are stored locally in your browser.
            </div>
        </div>
      ) : (
        <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-10">
                    How can I help you with your story today?
                </div>
                )}
                {messages.map((m, i) => (
                <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        m.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    }`}
                    >
                    {m.role === 'system' ? <span className="text-red-500">{m.content}</span> : m.content}
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 dark:bg-gray-800">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    <Send className="h-4 w-4" />
                </button>
                </div>
            </form>
        </>
      )}
    </div>
  );
}
