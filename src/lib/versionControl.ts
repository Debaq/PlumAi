/**
 * VersionControlService
 * Handles branching and versioning using JSON deltas (jsondiffpatch).
 */

import * as jsondiffpatch from 'jsondiffpatch';
import { Project } from '@/types/domain';
import { Commit, Branch, VersionControlData } from '@/types/versionControl';

const diffpatch = jsondiffpatch.create({
  objectHash: (obj: any) => obj.id || obj._id || JSON.stringify(obj),
  cloneDiffValues: true,
});

export class VersionControlService {
  /**
   * Reconstructs the project state at a specific commit
   */
  static reconstructState(data: VersionControlData, commitId: string): Project | null {
    const commit = data.commits[commitId];
    if (!commit) return null;

    const branch = data.branches[commit.branch];
    if (!branch || !branch.baseSnapshot) return null;

    // Start with the base snapshot
    let state = diffpatch.clone(branch.baseSnapshot) as Project;

    // Build the chain of commits from base to target
    const chain: Commit[] = [];
    let current: Commit | null = commit;
    while (current) {
      chain.unshift(current);
      current = current.parentId ? data.commits[current.parentId] : null;
    }

    // Apply deltas in order
    for (const c of chain) {
      if (c.delta) {
        state = diffpatch.patch(state, c.delta) as Project;
      }
    }

    return state;
  }

  /**
   * Creates a new commit
   */
  static createCommit(
    data: VersionControlData,
    project: Project,
    message: string,
    author: string = 'User'
  ): { commit: Commit; updatedBranch: Branch } | null {
    const branchName = data.currentBranch;
    const branch = data.branches[branchName];
    if (!branch) return null;

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // If it's the first commit, we might want to store the whole project as baseSnapshot
    // but usually baseSnapshot is set when branch is created.
    if (!branch.baseSnapshot) {
      const newBranch = {
        ...branch,
        baseSnapshot: diffpatch.clone(project) as Project,
        headCommitId: id
      };
      const firstCommit: Commit = {
        id,
        parentId: null,
        message,
        author,
        timestamp,
        branch: branchName,
        delta: null // First commit has no delta relative to baseSnapshot
      };
      return { commit: firstCommit, updatedBranch: newBranch };
    }

    // Reconstruct current head state to calculate delta
    const headState = branch.headCommitId 
      ? this.reconstructState(data, branch.headCommitId)
      : branch.baseSnapshot;

    if (!headState) return null;

    const delta = diffpatch.diff(headState, project);
    if (!delta) return null; // No changes

    const commit: Commit = {
      id,
      parentId: branch.headCommitId,
      message,
      author,
      timestamp,
      branch: branchName,
      delta: delta as any
    };

    const updatedBranch = {
      ...branch,
      headCommitId: id
    };

    return { commit, updatedBranch };
  }

  /**
   * Creates a new branch
   */
  static createBranch(
    newBranchName: string,
    currentProject: Project
  ): Branch {
    return {
      name: newBranchName,
      headCommitId: null,
      baseSnapshot: diffpatch.clone(currentProject) as Project
    };
  }

  /**
   * Gets history chain for a branch
   */
  static getHistory(data: VersionControlData, branchName?: string): Commit[] {
    const name = branchName || data.currentBranch;
    const branch = data.branches[name];
    if (!branch || !branch.headCommitId) return [];

    const history: Commit[] = [];
    let currentId: string | null = branch.headCommitId;

    while (currentId) {
      const commitObj: Commit = data.commits[currentId];
      if (commitObj) {
        history.push(commitObj);
        currentId = commitObj.parentId;
      } else {
        break;
      }
    }
    return history;
  }
}
