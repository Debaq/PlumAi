import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 
  | 'anthropic' 
  | 'openai' 
  | 'google' 
  | 'groq' 
  | 'together' 
  | 'huggingface' 
  | 'ollama' 
  | 'manual';

export type TokenOptimizationLevel = 'minimal' | 'normal' | 'complete' | 'unlimited';
export type AppTheme = 'dark' | 'dracula' | 'light';
export type AppLanguage = 'es' | 'en';

interface SettingsState {
  activeProvider: AIProvider;
  activeModel: string;
  theme: AppTheme;
  language: AppLanguage;
  tokenOptimizationLevel: TokenOptimizationLevel;
  useAgenticContext: boolean;
  enableLogs: boolean;
  masterPasswordHash: string | null;
  encryptApiKeys: boolean;
  
  // Integrations
  githubToken: string | null;
  githubRepo: string | null;
  dropboxToken: string | null;

  // Groq Model Routing
  groqModelMap: {
    creative: string;
    logical: string;
    fast: string;
  };
  
  ragConfiguration: RagConfiguration;

  // New: Inmersive and Motivation Settings
  zenAmbience: string | null; // 'rain', 'forest', 'lofi', etc.
  dailyWordGoal: number;
  showWordCountInEditor: boolean;

  setActiveProvider: (provider: AIProvider) => void;
  setActiveModel: (model: string) => void;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (lang: AppLanguage) => void;
  setTokenLevel: (level: TokenOptimizationLevel) => void;
  setAgenticContext: (enabled: boolean) => void;
  setEnableLogs: (enabled: boolean) => void;
  setMasterPassword: (hash: string | null) => void;
  setEncryptApiKeys: (enabled: boolean) => void;
  setZenAmbience: (ambience: string | null) => void;
  setDailyWordGoal: (goal: number) => void;
  setShowWordCount: (show: boolean) => void;
  setGithubToken: (token: string | null) => void;
  setGithubRepo: (repo: string | null) => void;
  setDropboxToken: (token: string | null) => void;
  setGroqModelMap: (map: { creative: string; logical: string; fast: string }) => void;
  setRagConfiguration: (config: RagConfiguration) => void;
}

export interface RagConfigEntry {
  model: string | null; // null means 'use default provider mapping'
  temperature: number;
  systemPrompt: string;
}

export interface RagConfiguration {
  analysis: RagConfigEntry;
  writing: RagConfigEntry;
  chat: RagConfigEntry;
}

// Default Prompts (Templates)
const DEFAULT_ANALYSIS_PROMPT = `Estás actuando como el **Investigador** de un sistema de IA. Tu objetivo NO es responder al usuario, sino **decidir qué documentos necesitamos leer** para poder responderle después.

## ÍNDICE DEL PROYECTO
{{PROJECT_INDEX}}

## TAREA
"{{USER_INPUT}}"

Analiza la pregunta y selecciona **SOLO** los elementos críticos.
Responde ÚNICAMENTE con JSON:
{ "contextNeeded": { "characters": [], "chaptersToRead": [], "lore": [], "locations": [], "timeline": [], "reasoning": "..." } }`;

const DEFAULT_WRITING_PROMPT = `# PROYECTO: {{PROJECT_TITLE}}

{{CONTEXT_BLOCKS}}

---

## INSTRUCCIÓN
{{USER_INPUT}}

## MODO: {{MODE}}
{{RPG_INSTRUCTIONS}}`;

const DEFAULT_CHAT_PROMPT = `# INTERACCIÓN CON PERSONAJE: {{CHAR_NAME}}

## DATOS
Rol: {{CHAR_ROLE}}
Personalidad: {{CHAR_PERSONALITY}}
Estado: {{CHAR_STATUS}}

## CONTEXTO
Proyecto: {{PROJECT_TITLE}}

## INSTRUCCIONES
1. Adopta la voz, tono y vocabulario de {{CHAR_NAME}}.
2. NO rompas la cuarta pared.
3. Sé creativo y profundo.

Autor: {{USER_INPUT}}
{{CHAR_NAME}}:`;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activeProvider: 'google',
      activeModel: 'gemini-1.5-flash',
      theme: 'dark',
      language: 'es',
      tokenOptimizationLevel: 'normal',
      useAgenticContext: true,
      enableLogs: true,
      masterPasswordHash: null,
      encryptApiKeys: false,
      githubToken: null,
      githubRepo: null,
      dropboxToken: null,
      
      // Default Groq Map (High performance defaults)
      groqModelMap: {
        creative: 'llama-3.3-70b-versatile', // Best for storytelling
        logical: 'mixtral-8x7b-32768',      // Good context window and logic
        fast: 'llama-3.1-8b-instant'         // Super fast for chat/UI
      },

      ragConfiguration: {
        analysis: {
          model: null,
          temperature: 0.1,
          systemPrompt: DEFAULT_ANALYSIS_PROMPT
        },
        writing: {
          model: null,
          temperature: 0.7,
          systemPrompt: DEFAULT_WRITING_PROMPT
        },
        chat: {
          model: null,
          temperature: 0.8,
          systemPrompt: DEFAULT_CHAT_PROMPT
        }
      },

      zenAmbience: null,
      dailyWordGoal: 500,
      showWordCountInEditor: true,

      setActiveProvider: (provider) => set({ activeProvider: provider }),
      setActiveModel: (activeModel) => set({ activeModel }),
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      setLanguage: (language) => set({ language }),
      setTokenLevel: (tokenOptimizationLevel) => set({ tokenOptimizationLevel }),
      setAgenticContext: (useAgenticContext) => set({ useAgenticContext }),
      setEnableLogs: (enableLogs) => set({ enableLogs }),
      setMasterPassword: (masterPasswordHash) => set({ masterPasswordHash }),
      setEncryptApiKeys: (encryptApiKeys) => set({ encryptApiKeys }),
      setZenAmbience: (zenAmbience) => set({ zenAmbience }),
      setDailyWordGoal: (dailyWordGoal) => set({ dailyWordGoal }),
      setShowWordCount: (showWordCountInEditor) => set({ showWordCountInEditor }),
      setGithubToken: (githubToken) => set({ githubToken }),
      setGithubRepo: (githubRepo) => set({ githubRepo }),
      setDropboxToken: (dropboxToken) => set({ dropboxToken }),
      setGroqModelMap: (groqModelMap) => set({ groqModelMap }),
      setRagConfiguration: (ragConfiguration) => set({ ragConfiguration }),
    }),
    {
      name: 'pluma-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);