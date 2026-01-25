import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/types/domain';
import { Commit, Branch, VersionControlData } from '@/types/versionControl';
import { VersionControlService } from '@/lib/versionControl';

interface VersionControlStore extends VersionControlData {
  init: (initialProject?: Project) => void;
  createCommit: (project: Project, message: string, author?: string) => string | null;
  createBranch: (name: string, currentProject: Project) => void;
  checkoutBranch: (name: string) => Project | null;
  restoreCommit: (id: string) => Project | null;
  getHistory: () => Commit[];
}

export const useVersionControlStore = create<VersionControlStore>()(
  persist(
    (set, get) => ({
      version: '2.0',
      commits: {},
      branches: {},
      currentBranch: 'main',

      init: (initialProject?: Project) => {
        const state = get();
        if (Object.keys(state.branches).length === 0) {
          const mainBranch: Branch = {
            name: 'main',
            headCommitId: null,
            baseSnapshot: initialProject ? JSON.parse(JSON.stringify(initialProject)) : null
          };
          set({
            branches: { 'main': mainBranch },
            currentBranch: 'main'
          });
        }
      },

      createCommit: (project: Project, message: string, author = 'User') => {
        const state = get();
        const result = VersionControlService.createCommit(state, project, message, author);
        
        if (!result) return null;

        const { commit, updatedBranch } = result;

        set((state) => ({
          commits: { ...state.commits, [commit.id]: commit },
          branches: {
            ...state.branches,
            [state.currentBranch]: updatedBranch
          }
        }));

        return commit.id;
      },

      createBranch: (name: string, currentProject: Project) => {
        const state = get();
        if (state.branches[name]) {
          throw new Error('Branch already exists');
        }

        const newBranch = VersionControlService.createBranch(name, currentProject);

        set((state) => ({
          branches: {
            ...state.branches,
            [name]: newBranch
          }
        }));
      },

      checkoutBranch: (name: string) => {
        const state = get();
        const branch = state.branches[name];
        if (!branch) throw new Error('Branch not found');

        set({ currentBranch: name });

        if (branch.headCommitId) {
          return VersionControlService.reconstructState(get(), branch.headCommitId);
        }
        return branch.baseSnapshot;
      },

      restoreCommit: (id: string) => {
        return VersionControlService.reconstructState(get(), id);
      },

      getHistory: () => {
        return VersionControlService.getHistory(get());
      }
    }),
    {
      name: 'plum-version-control-v2',
    }
  )
);
