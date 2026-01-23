// src/stores/useProjectStore.ts
import { create } from 'zustand';
import type { Project } from '@/types/domain';

interface ProjectState {
  activeProject: Project | null;
  setActiveProject: (project: Project) => void;
  clearActiveProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  clearActiveProject: () => set({ activeProject: null }),
}));
