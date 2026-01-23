import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';

export async function POST(req: Request) {
  const { messages, provider, model } = await req.json();

  // Get API key from header
  const apiKey = req.headers.get('x-api-key');

  let aiModel;

  try {
    switch (provider) {
      case 'openai':
        if (!apiKey) throw new Error('API key required for OpenAI');
        const openai = createOpenAI({ apiKey: apiKey });
        aiModel = openai(model || 'gpt-4o');
        break;
      case 'anthropic':
        if (!apiKey) throw new Error('API key required for Anthropic');
        const anthropic = createAnthropic({ apiKey: apiKey });
        aiModel = anthropic(model || 'claude-3-5-sonnet-20241022');
        break;
      case 'google':
        if (!apiKey) throw new Error('API key required for Google');
        const google = createGoogleGenerativeAI({ apiKey: apiKey });
        aiModel = google(model || 'gemini-1.5-flash');
        break;
      case 'ollama':
        const ollama = createOllama({ baseURL: 'http://localhost:11434/api' });
        aiModel = ollama(model || 'llama3.2');
        break;
      default:
        // Default to Google if key is present, otherwise error
        if (apiKey) {
           const google = createGoogleGenerativeAI({ apiKey: apiKey });
           aiModel = google('gemini-1.5-flash');
        } else {
           throw new Error('Invalid provider or missing API key');
        }
    }

    const result = streamText({
      model: aiModel as any,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
