// src/stores/useUIStore.ts
import { create } from 'zustand';

type ModalType = 'newProject' | 'editCharacter' | 'settings' | null;
type ViewType = 'editor' | 'relations' | 'timeline' | 'stats' | 'entities' | 'lore' | 'chapters' | 'scenes' | 'images' | 'publishing' | 'aiAssistant';
type EditorSaveStatus = 'saved' | 'saving' | 'unsaved';
type LoreTab = 'summary' | 'characters' | 'relations' | 'events' | 'locations';

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'dracula';
  activeModal: ModalType;
  activeView: ViewType;
  editorSaveStatus: EditorSaveStatus;
  currentEditingChapterId: string | null;
  editorZenMode: boolean;
  activeLoreTab: LoreTab;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'dracula') => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setActiveView: (view: ViewType) => void;
  setEditorSaveStatus: (status: EditorSaveStatus) => void;
  setCurrentEditingChapterId: (id: string | null) => void;
  toggleEditorZenMode: () => void;
  setActiveLoreTab: (tab: LoreTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: 'dark',
  activeModal: null,
  activeView: 'editor',
  editorSaveStatus: 'saved',
  currentEditingChapterId: null,
  editorZenMode: false,
  activeLoreTab: 'summary',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveView: (view) => set({ activeView: view }),
  setEditorSaveStatus: (status) => set({ editorSaveStatus: status }),
  setCurrentEditingChapterId: (id) => set({ currentEditingChapterId: id }),
  toggleEditorZenMode: () => set((state) => ({ editorZenMode: !state.editorZenMode })),
  setActiveLoreTab: (tab) => set({ activeLoreTab: tab }),
}));
