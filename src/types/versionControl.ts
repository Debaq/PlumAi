// src/types/versionControl.ts
import { Project } from './domain';
import { Delta } from 'jsondiffpatch';

export interface Commit {
  id: string;
  parentId: string | null;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  delta: Delta | null; // Delta relative to parent
}

export interface Branch {
  name: string;
  headCommitId: string | null;
  baseSnapshot: Project | null; // The initial state for this branch (or the root base)
}

export interface VersionControlData {
  version: string;
  branches: Record<string, Branch>;
  commits: Record<string, Commit>;
  currentBranch: string;
}
