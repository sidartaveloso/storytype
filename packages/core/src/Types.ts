/**
 * Core types for Storytype pattern
 */

export interface ComponentStructure {
  level: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  name: string;
  path: string;
}

export interface StoryTypeConfig {
  baseDir?: string;
  levels?: string[];
}
