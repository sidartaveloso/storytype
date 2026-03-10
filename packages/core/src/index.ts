/**
 * @storytype/core
 * Core pattern documentation and guidelines for Storytype
 */

// Component classification types
export type ComponentLevel = 'atom' | 'molecule' | 'organism' | 'template' | 'page';

// Component metadata
export interface StoryTypeMetadata {
  level: ComponentLevel;
  name: string;
  description?: string;
}

// Re-export for convenience
export * from './types';
export * from './utils';
