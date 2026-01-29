import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type {
  SpeechConfig,
  SpeechModelInfo,
  DownloadProgress,
  SpeechEngineType,
} from '@/types/speech';
import {
  speechGetAvailableModels,
  speechGetInstalledModels,
  speechGetConfig,
  speechSetConfig,
  speechDownloadModel,
  speechCancelDownload,
  speechDeleteModel,
} from '@/lib/tauri-bridge';

interface SpeechState {
  isRecording: boolean;
  config: SpeechConfig;
  availableModels: SpeechModelInfo[];
  installedModelIds: string[];
  activeDownloads: DownloadProgress[];
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setConfig: (config: Partial<SpeechConfig>) => Promise<void>;
  startDictation: () => Promise<void>;
  stopDictation: () => Promise<void>;
  loadModels: () => Promise<void>;
  downloadModel: (modelId: string) => Promise<void>;
  cancelDownload: () => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  updateDownloadProgress: (progress: DownloadProgress) => void;
}

export const useSpeechStore = create<SpeechState>((set, get) => ({
  isRecording: false,
  config: { engine: 'vosk' as SpeechEngineType, language: 'es' },
  availableModels: [],
  installedModelIds: [],
  activeDownloads: [],
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    try {
      const [config, models, installed] = await Promise.all([
        speechGetConfig(),
        speechGetAvailableModels(),
        speechGetInstalledModels(),
      ]);
      set({
        config,
        availableModels: models,
        installedModelIds: installed,
        initialized: true,
      });

      // Listen for download progress events
      listen<DownloadProgress>('download-progress', (event) => {
        get().updateDownloadProgress(event.payload);
      });
    } catch (err) {
      console.error('Failed to initialize speech store:', err);
      set({ initialized: true });
    }
  },

  setConfig: async (partial) => {
    const currentConfig = get().config;
    const newConfig = { ...currentConfig, ...partial };
    set({ config: newConfig });
    try {
      await speechSetConfig(newConfig);
    } catch (err) {
      console.error('Failed to save speech config:', err);
    }
  },

  startDictation: async () => {
    try {
      const config = get().config;
      await invoke('start_dictation', { config });
      set({ isRecording: true });
    } catch (error) {
      console.error('Dictation failed:', error);
      set({ isRecording: false });
      throw error;
    }
  },

  stopDictation: async () => {
    try {
      await invoke('stop_dictation');
    } catch (_) {
      // ignore
    }
    set({ isRecording: false });
  },

  loadModels: async () => {
    try {
      const [models, installed] = await Promise.all([
        speechGetAvailableModels(),
        speechGetInstalledModels(),
      ]);
      set({ availableModels: models, installedModelIds: installed });
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  },

  downloadModel: async (modelId: string) => {
    try {
      await speechDownloadModel(modelId);
      // Refresh installed models after download
      const installed = await speechGetInstalledModels();
      set({ installedModelIds: installed });
    } catch (err) {
      console.error('Failed to download model:', err);
      throw err;
    }
  },

  cancelDownload: async () => {
    try {
      await speechCancelDownload();
    } catch (err) {
      console.error('Failed to cancel download:', err);
    }
  },

  deleteModel: async (modelId: string) => {
    try {
      await speechDeleteModel(modelId);
      const installed = await speechGetInstalledModels();
      set({ installedModelIds: installed });
    } catch (err) {
      console.error('Failed to delete model:', err);
      throw err;
    }
  },

  updateDownloadProgress: (progress: DownloadProgress) => {
    set((state) => {
      const downloads = [...state.activeDownloads];
      const idx = downloads.findIndex((d) => d.itemId === progress.itemId);

      if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'cancelled') {
        // Remove completed/failed downloads after a short delay
        if (idx >= 0) {
          downloads.splice(idx, 1);
        }
        return { activeDownloads: downloads };
      }

      if (idx >= 0) {
        downloads[idx] = progress;
      } else {
        downloads.push(progress);
      }
      return { activeDownloads: downloads };
    });
  },
}));
