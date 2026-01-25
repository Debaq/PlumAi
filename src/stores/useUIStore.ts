// src/stores/useUIStore.ts
import { create } from 'zustand';

type ModalType = 'newProject' | 'welcome' | 'editCharacter' | 'newChapter' | 'editChapter' | 'newScene' | 'editScene' | 'loreItem' | 'timelineEvent' | 'editLocation' | 'editRelationship' | 'settings' | null;
type ViewType = 'editor' | 'relations' | 'timeline' | 'stats' | 'entities' | 'lore' | 'chapters' | 'scenes' | 'images' | 'publishing' | 'aiAssistant' | 'versionControl' | 'rpgTools' | 'ragStudio';
type EditorSaveStatus = 'saved' | 'saving' | 'unsaved';
type LoreTab = 'summary' | 'characters' | 'relations' | 'events' | 'locations' | 'scenes' | 'map';

interface UIState {
  isSidebarOpen: boolean;
  activeModal: ModalType;
  modalData: any;
  activeView: ViewType;
  editorSaveStatus: EditorSaveStatus;
  currentEditingChapterId: string | null;
  editorZenMode: boolean;
  isCommandPaletteOpen: boolean;
  activeLoreTab: LoreTab;
  isLocked: boolean;
  isRpgPanelOpen: boolean;
  
  toggleSidebar: () => void;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  setActiveView: (view: ViewType) => void;
  setEditorSaveStatus: (status: EditorSaveStatus) => void;
  setCurrentEditingChapterId: (id: string | null) => void;
  toggleEditorZenMode: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveLoreTab: (tab: LoreTab) => void;
  setLocked: (locked: boolean) => void;
  toggleRpgPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  activeModal: null,
  modalData: null,
  activeView: 'lore',
  editorSaveStatus: 'saved',
  currentEditingChapterId: null,
  editorZenMode: false,
  isCommandPaletteOpen: false,
  activeLoreTab: 'summary',
  isLocked: false,
  isRpgPanelOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setActiveView: (view) => set({ activeView: view }),
  setEditorSaveStatus: (status) => set({ editorSaveStatus: status }),
  setCurrentEditingChapterId: (id) => set({ currentEditingChapterId: id }),
  toggleEditorZenMode: () => set((state) => ({ editorZenMode: !state.editorZenMode })),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setActiveLoreTab: (tab) => set({ activeLoreTab: tab }),
  setLocked: (isLocked) => set({ isLocked }),
  toggleRpgPanel: () => set((state) => ({ isRpgPanelOpen: !state.isRpgPanelOpen })),
}));
