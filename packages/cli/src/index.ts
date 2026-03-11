/**
 * @storytype/cli
 * Programmatic API for the Storytype CLI
 */

// Component types
export type ComponentLevel = 'atom' | 'molecule' | 'organism' | 'template' | 'page';

export interface GenerateOptions {
  level: ComponentLevel;
  name: string;
  path?: string;
}

/**
 * Generate a new component programmatically
 */
export async function generateComponent(options: GenerateOptions): Promise<void> {
  console.log(`Generating ${options.level}: ${options.name}`);
  // TODO: Implement component generation logic
}

/**
 * Initialize Storytype in a project
 */
export async function initStorytype(projectPath?: string): Promise<void> {
  console.log('Initializing Storytype...');
  // TODO: Implement initialization logic
}

// Export analyzer functions
export { analyzeProject, displayResults } from './analyzer.js';
export type { AnalysisResult, CategoryResult, CheckItem } from './analyzer.js';
