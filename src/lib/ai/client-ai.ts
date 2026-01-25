import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';
import { streamText } from 'ai';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLogStore } from '@/stores/useLogStore';

const API_URL = (import.meta as any).env?.VITE_VITE_API_URL || 'http://localhost/api';

/**
 * Generates text using either direct client-side SDKs (for Google/Ollama/Groq)
 * or a backend proxy (PHP) for providers restricted by CORS (OpenAI/Anthropic).
 */
export async function generateTextAI(
  messages: any[],
  provider: string,
  model: string,
  apiKey: string,
  intent: 'creative' | 'logical' | 'fast' = 'creative',
  temperature?: number
) {
  const settings = useSettingsStore.getState();
  const addLog = useLogStore.getState().addLog;

  if (settings.enableLogs) {
    addLog({
      type: 'request',
      provider,
      model,
      intent,
      content: { messages, temperature }
    });
  }

  // Option 1: Direct Client-Side (No Backend needed)
  if (provider === 'google') {
      const google = createGoogleGenerativeAI({ apiKey });
      const result = await streamText({
        model: google(model || 'gemini-1.5-flash'),
        messages,
        temperature
      });

      if (settings.enableLogs) {
        addLog({
          type: 'response',
          provider,
          model,
          content: "Stream started..."
        });
      }
      return result;
  } 

  if (provider === 'groq') {
      const groq = createOpenAI({
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey,
      });

      // Get model from routing map if available, otherwise fallback to passed model or hard default
      const mappedModel = settings.groqModelMap?.[intent];
      const selectedModel = mappedModel || model || 'llama-3.3-70b-versatile';

      const result = await streamText({
        model: groq(selectedModel),
        messages,
        temperature
      });

      if (settings.enableLogs) {
        addLog({
          type: 'response',
          provider,
          model: selectedModel,
          content: "Stream started..."
        });
      }
      return result;
  }
  
  if (provider === 'ollama') {
      const ollama = createOllama({ baseURL: 'http://localhost:11434/api' });
      const result = await streamText({
        model: ollama(model || 'llama3.2') as any,
        messages,
        temperature
      });

      if (settings.enableLogs) {
        addLog({
          type: 'response',
          provider,
          model,
          content: "Stream started..."
        });
      }
      return result;
  }

  // Option 2: Proxy via PHP Backend (to avoid CORS)
  if (provider === 'openai' || provider === 'anthropic') {
      return fetchViaProxy(messages, provider, model, apiKey, temperature);
  }

  throw new Error(`Provider ${provider} not supported.`);
}

async function fetchViaProxy(messages: any[], provider: string, model: string, apiKey: string, temperature?: number) {
    const settings = useSettingsStore.getState();
    const addLog = useLogStore.getState().addLog;

    try {
        const response = await fetch(`${API_URL}/chat.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ messages, provider, model, temperature })
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        if (settings.enableLogs) {
            addLog({
                type: 'response',
                provider,
                model,
                content: "Proxy request successful, starting stream..."
            });
        }

        if (!response.body) throw new Error('No response body from backend');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            textStream: (async function* () {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    yield decoder.decode(value, { stream: true });
                }
            })()
        };
    } catch (err: any) {
        if (settings.enableLogs) {
            addLog({
                type: 'error',
                provider,
                model,
                content: err.message
            });
        }
        throw err;
    }
}

export async function generateImageAI(
  prompt: string,
  provider: string,
  apiKey: string
): Promise<string> {
  // Mock implementation for now or specific provider logic
  // Real implementation would fetch from DALL-E, Stability, etc.
  
  if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
              model: "dall-e-3",
              prompt: prompt,
              n: 1,
              size: "1024x1024",
              response_format: "b64_json" 
          })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Image generation failed');
      
      return `data:image/png;base64,${data.data[0].b64_json}`;
  }
  
  // Fallback / Mock for demo if no key or other provider
  // This ensures the "how to make it work" part is at least "it works as a demo"
  // In a real app, we'd add more providers here.
  
  return new Promise((resolve) => {
      setTimeout(() => {
        // Return a placeholder or a reliable random image service for demo
        resolve(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
      }, 1500);
  });
}