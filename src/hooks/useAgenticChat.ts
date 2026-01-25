import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { AgenticService, ContextNeeds } from '@/lib/ai/agentic-service';
import { generateTextAI } from '@/lib/ai/client-ai';

export function useAgenticChat(persistenceKey: string = 'pluma_ai_messages') {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem(persistenceKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);

  const { activeProvider, activeModel, ragConfiguration } = useSettingsStore();
  const { activeProject } = useProjectStore();

  useEffect(() => {
    localStorage.setItem(persistenceKey, JSON.stringify(messages));
  }, [messages, persistenceKey]);

  const sendMessage = async (userInput: string, mode: string = 'continue', chapterId?: string, selectedText?: string, characterId?: string) => {
    setIsLoading(true);
    setError(null);

    const newUserMessage = { role: 'user', content: userInput, timestamp: new Date().toISOString(), metadata: { mode } };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const keys = activeProject?.apiKeys?.text[activeProvider] || [];
      const apiKeyEntry = keys.find(k => k.isDefault) || keys[0];
      const apiKey = apiKeyEntry?.key;

      if (!apiKey && activeProvider !== 'ollama' && activeProvider !== 'manual') {
        throw new Error(`No API key for ${activeProvider}. Please check settings.`);
      }

      // SPECIAL MODE: Character Chat
      if (mode === 'character_chat' && characterId) {
          const character = activeProject?.characters.find(c => c.id === characterId);
          if (!character) throw new Error("Character not found");

          const prompt = AgenticService.buildCharacterChatPrompt(userInput, character, activeProject?.title || 'Untitled Project');
          
          const stream = await generateTextAI(
              [{ role: 'user', content: prompt }],
              activeProvider, 
              activeModel, 
              apiKey || '',
              'fast',
              ragConfiguration?.chat?.temperature ?? 0.8
          );

          const assistantMessageId = Math.random().toString(36).substring(7);
          setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date().toISOString() }]);
          
          let finalContent = '';
          for await (const chunk of stream.textStream) {
              finalContent += chunk;
              setMessages(prev => {
                  const newMessages = [...prev];
                  const msgIndex = newMessages.findIndex(m => m.id === assistantMessageId);
                  if (msgIndex !== -1) {
                    newMessages[msgIndex] = { ...newMessages[msgIndex], content: finalContent };
                  }
                  return newMessages;
              });
          }
          setIsLoading(false);
          return;
      }

      // Step 1: Analyze Needs
      const inventory = AgenticService.buildContextInventory(chapterId);
      if (!inventory) throw new Error('No project loaded');

      const analysisPrompt = AgenticService.buildContextAnalysisPrompt(mode, userInput, inventory, selectedText);

      const analysisStream = await generateTextAI(
          [{ role: 'user', content: analysisPrompt }],
          activeProvider,
          activeModel,
          apiKey || '',
          'logical',
          ragConfiguration?.analysis?.temperature ?? 0.1
      );

      let analysisResult = '';
      for await (const chunk of analysisStream.textStream) {
          analysisResult += chunk;
      }

      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON for analysis');

      const contextDecision: { contextNeeded: ContextNeeds } = JSON.parse(jsonMatch[0]);

      // Step 2: Build Context and Send Final Request
      const selectiveContext = AgenticService.buildSelectiveContext(contextDecision.contextNeeded, chapterId);
      const finalPrompt = AgenticService.buildFinalPrompt(mode, userInput, selectiveContext, selectedText);

      const finalStream = await generateTextAI(
          [{ role: 'user', content: finalPrompt }],
          activeProvider,
          activeModel,
          apiKey || '',
          'creative',
          ragConfiguration?.writing?.temperature ?? 0.7
      );

      const assistantMessageId = Math.random().toString(36).substring(7);
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date().toISOString() }]);
      
      let finalContent = '';

      for await (const chunk of finalStream.textStream) {
          finalContent += chunk;
          setMessages(prev => {
              const newMessages = [...prev];
              const msgIndex = newMessages.findIndex(m => m.id === assistantMessageId);
              if (msgIndex !== -1) {
                newMessages[msgIndex] = { ...newMessages[msgIndex], content: finalContent };
              }
              return newMessages;
          });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${err.message}`, timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages: () => setMessages([])
  };
}
