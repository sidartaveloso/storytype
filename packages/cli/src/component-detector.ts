/**
 * Single source of truth for component detection.
 *
 * Both `analyze` and `normalize` consume this module: the conventions live here
 * once, so a component the analyzer penalizes is exactly a component the
 * normalizer knows how to fix.
 */

import fs from 'fs-extra';
import path from 'path';

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
  '.controller.ts',
  '.controller.tsx',
];

export const BARREL_FILES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];

export const DECLARATION_PATTERNS = ['.d.ts', '.d.tsx', '.d.mts', '.d.cts'];

/**
 * The Atomic Design levels, and the folder name each takes per project
 * language. The canonical key is English; a project names its folders in its
 * own language and both are recognized.
 *
 * `templates` is spelled the same in both, so it never identifies a language.
 */
export const ATOMIC_LEVELS = {
  atoms: { order: 1, dir: { en: 'atoms', pt: 'atomos' } },
  molecules: { order: 2, dir: { en: 'molecules', pt: 'moleculas' } },
  organisms: { order: 3, dir: { en: 'organisms', pt: 'organismos' } },
  templates: { order: 4, dir: { en: 'templates', pt: 'templates' } },
  pages: { order: 5, dir: { en: 'pages', pt: 'paginas' } },
} as const;

export type AtomicLevel = keyof typeof ATOMIC_LEVELS;

export type ProjectLanguage = keyof (typeof ATOMIC_LEVELS)['atoms']['dir'];

export const ATOMIC_LEVEL_KEYS = Object.keys(ATOMIC_LEVELS) as AtomicLevel[];

export const PROJECT_LANGUAGES: ProjectLanguage[] = ['en', 'pt'];

/**
 * The words a user may type to name a level on the command line: the folder
 * name in either language, plus the singular of each. Derived from
 * ATOMIC_LEVELS so a level added there is accepted here with no extra edit.
 */
export const ATOMIC_LEVEL_ALIASES: Record<string, AtomicLevel> = Object.fromEntries(
  ATOMIC_LEVEL_KEYS.flatMap(level =>
    PROJECT_LANGUAGES.flatMap(language => {
      const plural = ATOMIC_LEVELS[level].dir[language];
      const singular = plural.replace(/s$/, '');

      return [plural, singular].map(alias => [alias, level] as const);
    })
  )
);

/**
 * Resolve what a user typed for a level (`atom`, `atomos`, `MOLECULE`) to its
 * canonical key. Returns null when it names no level.
 */
export function toAtomicLevelFromAlias(input: string): AtomicLevel | null {
  return ATOMIC_LEVEL_ALIASES[stripAccents(input.toLowerCase())] ?? null;
}

/**
 * Accents are how the same word is written, not a different word: `átomo`
 * must name the same level as `atomo`.
 */
function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const IGNORED_DIRECTORIES = ['node_modules'];

export type ComponentExtension = (typeof COMPONENT_EXTENSIONS)[number];

export type ComponentFileType =
  'component' | 'types' | 'test' | 'stories' | 'mock' | 'controller' | 'index' | 'other';

/**
 * Check if a file *name* could belong to a component (not a test, story,
 * auxiliary file, barrel or type declaration).
 *
 * A `.ts` name alone is not enough to call something a component — see
 * `isComponentEntry`, which adds the directory context.
 */
export function isComponentFile(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.'));
  if (!COMPONENT_EXTENSIONS.includes(ext as ComponentExtension)) return false;

  const isTest = TEST_PATTERNS.some(p => fileName.endsWith(p));
  const isStory = STORY_PATTERNS.some(p => fileName.endsWith(p));
  const isAuxiliary = AUXILIARY_PATTERNS.some(p => fileName.endsWith(p));
  const isDeclaration = DECLARATION_PATTERNS.some(p => fileName.endsWith(p));
  const isBarrel = BARREL_FILES.includes(fileName);

  return !isTest && !isStory && !isAuxiliary && !isDeclaration && !isBarrel;
}

/**
 * Check if a file is a component entry, taking its location into account.
 *
 * `.vue` and `.tsx` speak for themselves. A plain `.ts` is ambiguous: it is a
 * component when the folder is named after it, or when it is PascalCase inside
 * an Atomic Design tree — the naming convention for components. Anything else
 * is a script, so `vite.config.ts` and `helpers.ts` are left alone instead of
 * being normalized into components.
 */
export function isComponentEntry(filePath: string): boolean {
  const fileName = path.basename(filePath);
  if (!isComponentFile(fileName)) return false;

  if (!fileName.endsWith('.ts')) return true;

  const dirPath = path.dirname(filePath);
  const baseName = getComponentBaseName(fileName);

  if (toKebabCase(baseName) === toKebabCase(path.basename(dirPath))) return true;

  return isPascalCase(baseName) && findAtomicLevel(dirPath) !== null;
}

/**
 * Resolve a directory name to the Atomic Design level it denotes, in any
 * supported language. Returns null when it denotes none.
 */
export function toAtomicLevel(dirName: string): AtomicLevel | null {
  const normalized = dirName.toLowerCase();

  return (
    ATOMIC_LEVEL_KEYS.find(level =>
      PROJECT_LANGUAGES.some(language => ATOMIC_LEVELS[level].dir[language] === normalized)
    ) ?? null
  );
}

/**
 * Check if a directory name is an Atomic Design level (atoms, atomos, ...)
 */
export function isAtomicLevel(dirName: string): boolean {
  return toAtomicLevel(dirName) !== null;
}

/**
 * The folder name a level takes in a given project language
 */
export function atomicLevelDir(level: AtomicLevel, language: ProjectLanguage): string {
  return ATOMIC_LEVELS[level].dir[language];
}

/**
 * The Atomic Design levels present directly inside a components directory.
 *
 * Grouped by canonical level, so a project holding both `atoms/` and `atomos/`
 * counts one level, not two.
 */
export function findAtomicLevelDirs(
  componentsDir: string
): { level: AtomicLevel; dirName: string }[] {
  const found: { level: AtomicLevel; dirName: string }[] = [];

  for (const level of ATOMIC_LEVEL_KEYS) {
    const dirName = PROJECT_LANGUAGES.map(language => ATOMIC_LEVELS[level].dir[language]).find(
      candidate => isDirectory(path.join(componentsDir, candidate))
    );

    if (dirName) found.push({ level, dirName });
  }

  return found;
}

/**
 * Infer the language a project names its component folders in, by looking at
 * the level folders it already has. Falls back to English — the canonical form
 * — when there is nothing to go on.
 */
export function detectProjectLanguage(componentsDir: string): ProjectLanguage {
  const counts: Record<ProjectLanguage, number> = { en: 0, pt: 0 };

  for (const { level, dirName } of findAtomicLevelDirs(componentsDir)) {
    for (const language of PROJECT_LANGUAGES) {
      // A name shared by both languages, like `templates`, says nothing
      const isShared = PROJECT_LANGUAGES.every(
        other => ATOMIC_LEVELS[level].dir[other] === dirName
      );
      if (!isShared && ATOMIC_LEVELS[level].dir[language] === dirName) counts[language] += 1;
    }
  }

  return counts.pt > counts.en ? 'pt' : 'en';
}

/**
 * Locate the directory holding a project's components.
 *
 * Shared so `analyze`, `normalize` and `generate` all agree on where
 * components live, instead of each guessing.
 */
export function findComponentsDirectory(projectPath: string): string | null {
  const conventionalPaths = [
    path.join(projectPath, 'src', 'components'),
    path.join(projectPath, 'components'),
    path.join(projectPath, 'src', 'views'),
    path.join(projectPath, 'app', 'components'),
  ];

  const conventional = conventionalPaths.find(candidate => isDirectory(candidate));
  if (conventional) return conventional;

  // Nothing conventional: fall back to the project root when the tree holds
  // components at all, so a monorepo layout is still walked in full
  return findComponentDirectories(projectPath).length > 0 ? projectPath : null;
}

function isDirectory(candidate: string): boolean {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a directory should be skipped while walking a project
 */
export function isIgnoredDirectory(dirName: string): boolean {
  return dirName.startsWith('.') || IGNORED_DIRECTORIES.includes(dirName);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // lowercase followed by uppercase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // uppercase followed by uppercase+lowercase
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Check if a string is already in PascalCase
 */
export function isPascalCase(str: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  // If already PascalCase, return as is
  if (isPascalCase(str)) {
    return str;
  }

  // Handle camelCase by inserting hyphens before capitals
  const withHyphens = str.replace(/([a-z])([A-Z])/g, '$1-$2');

  return withHyphens
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Get the component base name of a file, stripping role suffixes and extension.
 * `progressBar.stories.ts` -> `progressBar`
 */
export function getComponentBaseName(filePath: string): string {
  const fileName = path.basename(filePath);
  return fileName
    .replace(/\.(types|stories|story|spec|test|mock|mocks|controller)\.(ts|tsx|js|jsx)$/, '')
    .replace(/\.(ts|tsx|js|jsx|vue)$/, '');
}

/**
 * Determine the role a file plays inside a component directory
 */
export function getFileType(fileName: string): ComponentFileType {
  if (BARREL_FILES.includes(fileName)) return 'index';
  if (fileName.includes('.types.')) return 'types';
  if (fileName.includes('.spec.') || fileName.includes('.test.')) return 'test';
  if (fileName.includes('.stories.') || fileName.includes('.story.')) return 'stories';
  if (fileName.includes('.mock.') || fileName.includes('.mocks.')) return 'mock';
  if (fileName.includes('.controller.')) return 'controller';
  if (isComponentFile(fileName)) return 'component';
  return 'other';
}

/**
 * The file name a component file should have (PascalCase base, same suffixes).
 * Barrels and unrelated files keep their name.
 */
export function toExpectedFileName(fileName: string): string {
  const type = getFileType(fileName);
  if (type === 'index' || type === 'other') return fileName;

  const baseName = getComponentBaseName(fileName);
  return `${toPascalCase(baseName)}${fileName.slice(baseName.length)}`;
}

/**
 * Recursively collect every component entry file under `rootDir`
 */
export function findComponentFiles(rootDir: string): string[] {
  const files: string[] = [];

  walkDirectories(rootDir, (dirPath, entries) => {
    for (const entry of entries) {
      const filePath = path.join(dirPath, entry.name);
      if (entry.isFile() && isComponentEntry(filePath)) {
        files.push(filePath);
      }
    }
  });

  return files;
}

/**
 * Recursively find directories that directly contain component entry files
 */
export function findComponentDirectories(rootDir: string): string[] {
  const directories: string[] = [];

  walkDirectories(rootDir, (dirPath, entries) => {
    if (entries.some(e => e.isFile() && isComponentEntry(path.join(dirPath, e.name)))) {
      directories.push(dirPath);
      return 'skip-children';
    }
  });

  return directories;
}

export interface DetectedComponentFile {
  /** Absolute path of the file today */
  path: string;
  /** File name today */
  name: string;
  /** File name after normalization */
  targetName: string;
  /** Role of the file inside the component */
  type: ComponentFileType;
}

export interface DetectedComponent {
  /** Component name in PascalCase */
  name: string;
  /** Directory holding the files today */
  currentDir: string;
  /** Directory the component should live in */
  targetDir: string;
  /** Entry file (.vue / .ts / .tsx) */
  entryPath: string;
  /** Files belonging to this component */
  files: DetectedComponentFile[];
  /** Enclosing Atomic Design level, when there is one */
  atomicLevel: string | null;
  /** Files sit loose in an Atomic Design level and need a folder of their own */
  needsPromotion: boolean;
  /** The holding directory needs a kebab-case rename */
  needsDirRename: boolean;
}

/**
 * Build the directory-level view of every component under `rootDir`.
 *
 * A component owns a directory. A directory holds a component only when that
 * component is alone in it and the directory is not an Atomic Design level;
 * otherwise the directory is a container, and each entry in it is reported with
 * `needsPromotion` and the folder it belongs in.
 *
 * The result therefore holds exactly one component per entry file, which is why
 * `analyze` can count from it and `normalize` can act on it.
 */
export function detectComponents(rootDir: string): DetectedComponent[] {
  const components: DetectedComponent[] = [];

  walkDirectories(rootDir, (dirPath, entries) => {
    const fileNames = entries.filter(e => e.isFile()).map(e => e.name);
    const entryFiles = fileNames
      .filter(fileName => isComponentEntry(path.join(dirPath, fileName)))
      .sort();

    if (entryFiles.length === 0) return;

    const dirName = path.basename(dirPath);
    const holdsOneComponent = entryFiles.length === 1 && !isAtomicLevel(dirName);

    if (holdsOneComponent) {
      components.push(ownedComponent(dirPath, dirName, entryFiles[0], fileNames));
      return;
    }

    for (const entryFile of entryFiles) {
      components.push(promotedComponent(dirPath, entryFile, fileNames));
    }
  });

  return components;
}

/**
 * A component sharing a directory with others — an Atomic Design level, or a
 * folder holding several components. It keeps its name but gains a folder of
 * its own inside that directory.
 */
function promotedComponent(
  containerDir: string,
  entryFile: string,
  fileNames: string[]
): DetectedComponent {
  const baseName = getComponentBaseName(entryFile);
  const name = toPascalCase(baseName);

  // Only the files of this component move; those of its neighbours stay
  const ownFiles = fileNames.filter(fileName => getComponentBaseName(fileName) === baseName);

  return {
    name,
    currentDir: containerDir,
    targetDir: path.join(containerDir, toKebabCase(name)),
    entryPath: path.join(containerDir, entryFile),
    files: ownFiles.map(fileName => describeFile(containerDir, fileName)),
    atomicLevel: findAtomicLevel(containerDir),
    needsPromotion: true,
    needsDirRename: false,
  };
}

/**
 * A component that already owns its directory: the directory name may still
 * need a kebab-case rename.
 */
function ownedComponent(
  dirPath: string,
  dirName: string,
  entryFile: string,
  fileNames: string[]
): DetectedComponent {
  // The directory name drives the kebab-case target, never the file name, so a
  // directory like `srv/` stays `srv/` instead of being widened to `server/`.
  const expectedDirName = toKebabCase(dirName);

  return {
    name: toPascalCase(getComponentBaseName(entryFile)),
    currentDir: dirPath,
    targetDir:
      dirName === expectedDirName ? dirPath : path.join(path.dirname(dirPath), expectedDirName),
    entryPath: path.join(dirPath, entryFile),
    files: fileNames.map(fileName => describeFile(dirPath, fileName)),
    atomicLevel: findAtomicLevel(dirPath),
    needsPromotion: false,
    needsDirRename: dirName !== expectedDirName,
  };
}

function describeFile(dirPath: string, fileName: string): DetectedComponentFile {
  return {
    path: path.join(dirPath, fileName),
    name: fileName,
    targetName: toExpectedFileName(fileName),
    type: getFileType(fileName),
  };
}

/**
 * Nearest ancestor directory that is an Atomic Design level
 */
function findAtomicLevel(dirPath: string): string | null {
  for (const segment of dirPath.split(path.sep).reverse()) {
    if (isAtomicLevel(segment)) return segment;
  }

  return null;
}

type WalkResult = 'skip-children' | void;

/**
 * Walk a directory tree once, skipping dotfiles and ignored directories.
 * Every detection helper in this module shares this traversal.
 */
function walkDirectories(
  rootDir: string,
  visit: (dirPath: string, entries: fs.Dirent[]) => WalkResult
): void {
  if (!fs.existsSync(rootDir)) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch {
    // Skip directories we can't read
    return;
  }

  if (visit(rootDir, entries) === 'skip-children') return;

  for (const entry of entries) {
    if (entry.isDirectory() && !isIgnoredDirectory(entry.name)) {
      walkDirectories(path.join(rootDir, entry.name), visit);
    }
  }
}
