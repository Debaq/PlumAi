import { create } from 'zustand';
import { dbGetSetting, dbSetSetting } from '@/lib/tauri-bridge';

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
export type AppTheme = 'dark' | 'dracula' | 'light' | 'emerald' | 'parchment' | 'hell' | 'nordic' | 'midnight' | 'cyberpunk';
export type AppLanguage = 'es' | 'en';
export type AppFontFamily = 'system' | 'inter' | 'roboto' | 'nunito' | 'merriweather' | 'lora' | 'montserrat' | 'playfair' | 'jetbrains' | 'garamond';

interface SettingsState {
  activeProvider: AIProvider;
  activeModel: string;
  theme: AppTheme;
  language: AppLanguage;
  fontFamily: AppFontFamily;
  fontSize: number;
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

  // New Writing Experience
  typewriterMode: boolean;
  hemingwayMode: boolean;
  pomodoroEnabled: boolean;
  animationsEnabled: boolean;
  ragStudioEnabled: boolean;

  initializeSettings: () => Promise<void>;

  setActiveProvider: (provider: AIProvider) => void;
  setActiveModel: (model: string) => void;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (lang: AppLanguage) => void;
  setFontFamily: (font: AppFontFamily) => void;
  setFontSize: (fontSize: number) => void;
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

  // New Setters
  setTypewriterMode: (enabled: boolean) => void;
  setHemingwayMode: (enabled: boolean) => void;
  setPomodoroEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setRagStudioEnabled: (enabled: boolean) => void;
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

const helperSet = (key: string, value: any) => {
    dbSetSetting(key, JSON.stringify(value)).catch(e => console.error(`Failed to save setting ${key}:`, e));
};

export const useSettingsStore = create<SettingsState>((set) => ({
      activeProvider: 'google',
      activeModel: 'gemini-1.5-flash',
      theme: 'dark',
      language: 'es',
      fontFamily: 'inter',
      fontSize: 16,
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

      // New Writing Experience Defaults
      typewriterMode: false,
      hemingwayMode: false,
      pomodoroEnabled: false,
      animationsEnabled: true,
      ragStudioEnabled: true,

      initializeSettings: async () => {
        try {
            const keys: (keyof SettingsState)[] = [
                'activeProvider', 'activeModel', 'theme', 'language', 'fontFamily', 'fontSize',
                'tokenOptimizationLevel', 'useAgenticContext', 'enableLogs', 'masterPasswordHash',
                'encryptApiKeys', 'githubToken', 'githubRepo', 'dropboxToken', 'groqModelMap',
                'ragConfiguration', 'zenAmbience', 'dailyWordGoal', 'showWordCountInEditor',
                'typewriterMode', 'hemingwayMode', 'pomodoroEnabled', 'animationsEnabled', 'ragStudioEnabled'
            ];

            const updates: Partial<SettingsState> = {};
            for (const key of keys) {
                const val = await dbGetSetting(key);
                if (val !== null) {
                    try {
                        updates[key] = JSON.parse(val);
                    } catch (e) {
                        // If parse fails, assume string or ignore? Most settings are JSON safe.
                        // Simple strings might not be JSON quoted if saved raw, but helperSet uses JSON.stringify.
                        // However, legacy storage might have issues. Assuming JSON.parse works for now.
                         console.warn(`Failed to parse setting ${key}:`, e);
                    }
                }
            }
            
            set(updates);

            // Apply side effects immediately
            if (updates.theme) document.documentElement.className = updates.theme; // Tailwind dark mode uses class usually, or data-theme
            // Actually index.css uses class .dark, .dracula etc directly on html?
            // The original code used data-theme attribute in onRehydrateStorage
            // Let's check index.css again. It uses classes like .dark, .dracula.
            // But previous code: document.documentElement.setAttribute('data-theme', state.theme);
            // Let's assume the previous code was correct for the CSS setup.
            // Wait, looking at index.css: .dark { ... } .dracula { ... }
            // These are usually classes on <html> or <body>. 
            // The original onRehydrateStorage did: setAttribute('data-theme', state.theme). 
            // Let's stick to what was there, or maybe improve it. 
            // Actually, Tailwind 4 theme config suggests classes.
            // Let's apply class to documentElement for safety.
            if (updates.theme) {
                 document.documentElement.className = updates.theme;
            }

            if (updates.fontFamily) {
                document.documentElement.setAttribute('data-font', updates.fontFamily);
            }
            if (updates.fontSize) {
                document.documentElement.style.fontSize = `${updates.fontSize}px`;
            }
            
        } catch (e) {
            console.error("Failed to initialize settings:", e);
        }
      },

      setActiveProvider: (provider) => { set({ activeProvider: provider }); helperSet('activeProvider', provider); },
      setActiveModel: (activeModel) => { set({ activeModel }); helperSet('activeModel', activeModel); },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.className = theme; // Apply class immediately
        helperSet('theme', theme);
      },
      setLanguage: (language) => { set({ language }); helperSet('language', language); },
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        document.documentElement.setAttribute('data-font', fontFamily);
        helperSet('fontFamily', fontFamily);
      },
      setFontSize: (fontSize) => {
        set({ fontSize });
        document.documentElement.style.fontSize = `${fontSize}px`;
        helperSet('fontSize', fontSize);
      },
      setTokenLevel: (tokenOptimizationLevel) => { set({ tokenOptimizationLevel }); helperSet('tokenOptimizationLevel', tokenOptimizationLevel); },
      setAgenticContext: (useAgenticContext) => { set({ useAgenticContext }); helperSet('useAgenticContext', useAgenticContext); },
      setEnableLogs: (enableLogs) => { set({ enableLogs }); helperSet('enableLogs', enableLogs); },
      setMasterPassword: (masterPasswordHash) => { set({ masterPasswordHash }); helperSet('masterPasswordHash', masterPasswordHash); },
      setEncryptApiKeys: (encryptApiKeys) => { set({ encryptApiKeys }); helperSet('encryptApiKeys', encryptApiKeys); },
      setZenAmbience: (zenAmbience) => { set({ zenAmbience }); helperSet('zenAmbience', zenAmbience); },
      setDailyWordGoal: (dailyWordGoal) => { set({ dailyWordGoal }); helperSet('dailyWordGoal', dailyWordGoal); },
      setShowWordCount: (showWordCountInEditor) => { set({ showWordCountInEditor }); helperSet('showWordCountInEditor', showWordCountInEditor); },
      setGithubToken: (githubToken) => { set({ githubToken }); helperSet('githubToken', githubToken); },
      setGithubRepo: (githubRepo) => { set({ githubRepo }); helperSet('githubRepo', githubRepo); },
      setDropboxToken: (dropboxToken) => { set({ dropboxToken }); helperSet('dropboxToken', dropboxToken); },
      setGroqModelMap: (groqModelMap) => { set({ groqModelMap }); helperSet('groqModelMap', groqModelMap); },
      setRagConfiguration: (ragConfiguration) => { set({ ragConfiguration }); helperSet('ragConfiguration', ragConfiguration); },

      // New Setters
      setTypewriterMode: (typewriterMode) => { set({ typewriterMode }); helperSet('typewriterMode', typewriterMode); },
      setHemingwayMode: (hemingwayMode) => { set({ hemingwayMode }); helperSet('hemingwayMode', hemingwayMode); },
      setPomodoroEnabled: (pomodoroEnabled) => { set({ pomodoroEnabled }); helperSet('pomodoroEnabled', pomodoroEnabled); },
      setAnimationsEnabled: (animationsEnabled) => { set({ animationsEnabled }); helperSet('animationsEnabled', animationsEnabled); },
      setRagStudioEnabled: (ragStudioEnabled) => { set({ ragStudioEnabled }); helperSet('ragStudioEnabled', ragStudioEnabled); },
}));
