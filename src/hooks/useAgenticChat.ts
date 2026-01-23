import { useState } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { AgenticService, ContextNeeds } from '@/lib/ai/agentic-service';

export function useAgenticChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { activeProvider, activeModel, apiKeys } = useSettingsStore();

  const sendMessage = async (userInput: string, mode: string = 'continue', chapterId?: string, selectedText?: string) => {
    setIsLoading(true);
    setError(null);

    setMessages(prev => [...prev, { role: 'user', content: userInput }]);

    try {
      const apiKey = apiKeys[activeProvider];
      if (!apiKey && activeProvider !== 'ollama' && activeProvider !== 'manual') {
        throw new Error(`No API key for ${activeProvider}. Please check settings.`);
      }

      // Step 1: Analyze Needs
      const inventory = AgenticService.buildContextInventory(chapterId);
      if (!inventory) throw new Error('No project loaded');

      const analysisPrompt = AgenticService.buildContextAnalysisPrompt(mode, userInput, inventory, selectedText);

      const analysisResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: analysisPrompt }],
          provider: activeProvider,
          model: activeModel
        })
      });

      if (!analysisResponse.ok) throw new Error('Failed to analyze context needs');

      const reader = analysisResponse.body?.getReader();
      const decoder = new TextDecoder();
      let analysisResult = '';
      if (reader) {
          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              analysisResult += chunk;
          }
      }

      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON for analysis');

      const contextNeeds: { contextNeeded: ContextNeeds } = JSON.parse(jsonMatch[0]);

      // Step 2: Build Context and Send Final Request
      const selectiveContext = AgenticService.buildSelectiveContext(contextNeeds.contextNeeded, chapterId);
      const finalPrompt = AgenticService.buildFinalPrompt(mode, userInput, selectiveContext, selectedText);

      const finalResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: finalPrompt }],
          provider: activeProvider,
          model: activeModel
        })
      });

      if (!finalResponse.ok) throw new Error('Failed to get final response');

      const finalReader = finalResponse.body?.getReader();
      let finalContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (finalReader) {
          while (true) {
              const { done, value } = await finalReader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              finalContent += chunk;

              setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { role: 'assistant', content: finalContent };
                  return newMessages;
              });
          }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${err.message}` }]);
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
