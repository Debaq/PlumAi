import { create } from 'zustand';

export interface AILog {
  id: string;
  timestamp: number;
  type: 'request' | 'response' | 'error';
  provider: string;
  model: string;
  content: any;
  intent?: string;
}

interface LogState {
  logs: AILog[];
  isConsoleOpen: boolean;
  addLog: (log: Omit<AILog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setConsoleOpen: (open: boolean) => void;
  toggleConsole: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  isConsoleOpen: false,
  addLog: (log) => set((state) => ({
    logs: [
      {
        ...log,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      },
      ...state.logs
    ].slice(0, 50) // Keep last 50 logs
  })),
  clearLogs: () => set({ logs: [] }),
  setConsoleOpen: (open) => set({ isConsoleOpen: open }),
  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),
}));
