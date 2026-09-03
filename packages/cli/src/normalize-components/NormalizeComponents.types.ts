/**
 * Types for component normalization utility
 */

import type { ComponentAction, ComponentFileType } from '../component-detector.js';

export type { ComponentAction };

export interface ComponentFile {
  /** Current file path */
  currentPath: string;
  /** Target file path after normalization */
  targetPath: string;
  /** Whether file is tracked by Git */
  isGitTracked: boolean;
  /** File type */
  type: ComponentFileType;
}

export interface ComponentDirectory {
  /** Current directory path */
  currentPath: string;
  /** Target directory path (kebab-case) */
  targetPath: string;
  /** Component base name (PascalCase) */
  componentName: string;
  /** Files in this component */
  files: ComponentFile[];
  /** Files that need to be created */
  missingFiles: string[];
  /** What has to happen to the directory */
  action: ComponentAction;
  /** Import references that need updating */
  importReferences: ImportReference[];
}

/**
 * How much of the normalization a run performs. `dirs` and `files` are
 * opposites, so they are one field: as two flags, setting both produced a run
 * that silently did nothing and reported it as "already normalized".
 */
export type NormalizeScope =
  /** Move and rename directories, rename files, create what is missing */
  | 'all'
  /** Only move and rename directories */
  | 'dirs'
  /** Only rename files, and create what is missing */
  | 'files';

export interface NormalizeOptions {
  /** Target directory to analyze */
  path: string;
  /** Dry-run mode (don't execute changes) */
  dryRun?: boolean;
  /** What the run touches; defaults to everything */
  scope?: NormalizeScope;
  /** Verbose output */
  verbose?: boolean;
}

/** A directory the run refused to touch, and why */
export interface SkippedDirectory {
  path: string;
  reason: string;
}

/** What the run found, and what it would change */
export interface NormalizePlan {
  /** Components analyzed */
  components: ComponentDirectory[];
  /** Total directories to rename */
  directoriesToRename: number;
  /** Total components to move into a folder of their own */
  componentsToPromote: number;
  /** Total files to rename */
  filesToRename: number;
  /** Total files to create */
  filesToCreate: number;
  /** Total imports to update */
  importsToUpdate: number;
  /** Detailed import references */
  importReferences: ImportReference[];
  /** Directories skipped and the reason (e.g. a promotion target already exists) */
  skippedDirectories: SkippedDirectory[];
}

/**
 * How the run ended. Discriminated on `success`, so a failure always carries a
 * message and a success can never carry one — as two independent fields, a
 * report could claim both, and no consumer could get `error` narrowed to a
 * string.
 */
export type NormalizeOutcome = { success: true } | { success: false; error: string };

export type NormalizeReport = NormalizePlan & NormalizeOutcome;

export interface ImportReference {
  /** File containing the import */
  filePath: string;
  /** Line number */
  line: number;
  /** Current import statement */
  currentImport: string;
  /** New import statement */
  newImport: string;
}
