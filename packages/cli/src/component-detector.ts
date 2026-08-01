/**
 * Shared component detection logic used by both analyze and normalize commands.
 */

export const COMPONENT_EXTENSIONS = ['.vue', '.tsx', '.ts'] as const;

export const TEST_PATTERNS = ['.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx'];

export const STORY_PATTERNS = ['.stories.ts', '.stories.tsx', '.story.ts', '.story.tsx'];

export const AUXILIARY_PATTERNS = [
  '.types.ts',
  '.types.tsx',
  '.mock.ts',
  '.mock.tsx',
  '.mocks.ts',
  '.mocks.tsx',
];

export const BARREL_FILES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];

export const ATOMIC_LEVELS = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];

export type ComponentExtension = (typeof COMPONENT_EXTENSIONS)[number];

/**
 * Check if a file is a component file (not test, story, auxiliary, or barrel)
 */
export function isComponentFile(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.'));
  if (!COMPONENT_EXTENSIONS.includes(ext as ComponentExtension)) return false;

  const isTest = TEST_PATTERNS.some(p => fileName.endsWith(p));
  const isStory = STORY_PATTERNS.some(p => fileName.endsWith(p));
  const isAuxiliary = AUXILIARY_PATTERNS.some(p => fileName.endsWith(p));
  const isBarrel = BARREL_FILES.includes(fileName);

  return !isTest && !isStory && !isAuxiliary && !isBarrel;
}

/**
 * Check if a directory name is an Atomic Design level (atoms, molecules, etc.)
 */
export function isAtomicLevel(dirName: string): boolean {
  return ATOMIC_LEVELS.includes(dirName.toLowerCase());
}
