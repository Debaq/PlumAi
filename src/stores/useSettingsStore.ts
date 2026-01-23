import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama' | 'manual';

interface SettingsState {
  apiKeys: Record<string, string>; // provider -> key
  activeProvider: AIProvider;
  activeModel: string;

  setApiKey: (provider: string, key: string) => void;
  setActiveProvider: (provider: AIProvider) => void;
  setActiveModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeys: {},
      activeProvider: 'google',
      activeModel: 'gemini-1.5-flash',

      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key }
      })),
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      setActiveModel: (model) => set({ activeModel: model }),
    }),
    {
      name: 'pluma-settings',
    }
  )
);
