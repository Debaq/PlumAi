import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';
import { streamText } from 'ai';
import { useSettingsStore } from '@/stores/useSettingsStore';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost/api';

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
  // Option 1: Direct Client-Side (No Backend needed)
  if (provider === 'google') {
      const google = createGoogleGenerativeAI({ apiKey });
      return streamText({
        model: google(model || 'gemini-1.5-flash'),
        messages,
        temperature
      });
  } 

  if (provider === 'groq') {
      const groq = createOpenAI({
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey,
      });

      // Get model from routing map if available, otherwise fallback to passed model or hard default
      const settings = useSettingsStore.getState();
      const mappedModel = settings.groqModelMap?.[intent];
      const selectedModel = mappedModel || model || 'llama-3.3-70b-versatile';

      return streamText({
        model: groq(selectedModel),
        messages,
        temperature
      });
  }
  
  if (provider === 'ollama') {
      const ollama = createOllama({ baseURL: 'http://localhost:11434/api' });
      return streamText({
        model: ollama(model || 'llama3.2') as any,
        messages,
        temperature
      });
  }

  // Option 2: Proxy via PHP Backend (to avoid CORS)
  if (provider === 'openai' || provider === 'anthropic') {
      // We return a "stream-like" object that mimics the ai-sdk result 
      // but fetches from our PHP proxy.
      // Note: This requires the PHP backend to implement streaming or we just await full response.
      // For this implementation, we'll assume the PHP backend returns a JSON with 'text' or streams text.
      
      return fetchViaProxy(messages, provider, model, apiKey, temperature);
  }

  throw new Error(`Provider ${provider} not supported.`);
}

async function fetchViaProxy(messages: any[], provider: string, model: string, apiKey: string, temperature?: number) {
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

    // If the backend streams, we can use response.body
    // Here we wrap it in a structure compatible with useAgenticChat's expectation
    // which iterates over .textStream
    
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