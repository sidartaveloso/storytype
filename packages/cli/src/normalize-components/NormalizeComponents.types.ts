/**
 * Types for component normalization utility
 */

import type { ComponentFileType } from '../component-detector.js';

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
  /** Whether directory needs renaming */
  needsRename: boolean;
  /** Whether files are loose in an Atomic Design level and need a folder of their own */
  needsPromotion: boolean;
  /** Import references that need updating */
  importReferences: ImportReference[];
}

export interface NormalizeOptions {
  /** Target directory to analyze */
  path: string;
  /** Dry-run mode (don't execute changes) */
  dryRun?: boolean;
  /** Only normalize directories */
  dirsOnly?: boolean;
  /** Only normalize files */
  filesOnly?: boolean;
  /** Verbose output */
  verbose?: boolean;
}

export interface NormalizeReport {
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
  skippedDirectories: Array<{ path: string; reason: string }>;
  /** Executed successfully */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

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
