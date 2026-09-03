/**
 * Component normalization utility
 * Normalizes component structure to follow Storytype conventions
 */

import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import {
  BARREL_FILES,
  componentFileSet,
  type DetectedComponent,
  detectComponents,
  isIgnoredDirectory,
  toKebabCase,
  toPascalCase,
} from '../component-detector.js';
import { renderComponentFileByName, type ScaffoldContext } from '../component-scaffold.js';
import type {
  ComponentDirectory,
  ComponentFile,
  ImportReference,
  NormalizeOptions,
  NormalizeReport,
} from './NormalizeComponents.types.js';

// Re-exported so consumers keep importing the case helpers from here, while the
// single implementation lives in the shared detector.
export { toKebabCase, toPascalCase };

const execAsync = promisify(exec);

/**
 * Check if two paths differ only in case (case-insensitive comparison)
 */
function isCaseOnlyChange(from: string, to: string): boolean {
  return from.toLowerCase() === to.toLowerCase() && from !== to;
}

/**
 * Check if file is tracked by Git
 */
export async function isGitTracked(filePath: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`git ls-files --error-unmatch "${filePath}"`, {
      cwd: path.dirname(filePath),
    });
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Rename using filesystem and update Git index manually
 * This avoids git mv conflicts on case-insensitive filesystems
 */
async function gitMoveManual(fromPath: string, toPath: string, isCaseOnly: boolean): Promise<void> {
  const cwd = path.dirname(fromPath);

  if (isCaseOnly) {
    // For case-only changes, use two-step filesystem rename
    const tempPath = `${toPath}-temp-rename`;
    await fs.move(fromPath, tempPath);
    await fs.move(tempPath, toPath);
  } else {
    // For other changes, direct rename
    await fs.move(fromPath, toPath);
  }

  // Update Git index
  try {
    // Get relative paths for git commands.
    // `git rev-parse` always reports the resolved path, so the paths we compare
    // it against must be resolved too — otherwise a repo reached through a
    // symlink (macOS `/tmp` and `/var` are symlinks to `/private/...`) yields a
    // relative path full of `../..` that Git rejects. The basename is rejoined
    // because `fromPath` no longer exists at this point: it has just been moved.
    const repoRoot = (await execAsync('git rev-parse --show-toplevel', { cwd })).stdout.trim();
    const resolve = async (target: string): Promise<string> =>
      path.join(await fs.realpath(path.dirname(target)), path.basename(target));
    const relativeFrom = path.relative(repoRoot, await resolve(fromPath));
    const relativeTo = path.relative(repoRoot, await resolve(toPath));

    // Remove old path from Git. `-r` is required when the path is a directory
    // ("fatal: not removing X recursively without -r") and is harmless for a
    // single file. Without it the index is never updated, and on a
    // case-insensitive filesystem a case-only rename becomes invisible to Git.
    await execAsync(`git rm --cached -r "${relativeFrom}"`, { cwd: repoRoot });

    // Add new path to Git
    await execAsync(`git add "${relativeTo}"`, { cwd: repoRoot });
  } catch (error) {
    // If git commands fail, the file was moved but not staged
    // This is acceptable - user can stage manually
    console.warn(`Aviso: Não foi possível atualizar o índice Git para ${fromPath}`);
  }
}

/** Extensions that can carry a relative import */
const IMPORT_BEARING_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.vue'];

/** Extensions tried when a specifier omits one */
const RESOLVABLE_EXTENSIONS = ['.vue', '.ts', '.tsx', '.js', '.jsx'];

/** `from './x'` / `import './x'` / `export * from '../x'` */
const RELATIVE_IMPORT_PATTERN = /(from|import)(\s+)(['"])(\.[^'"]*)\3/g;

/**
 * Find every relative import invalidated by the plan.
 *
 * Either end of an import can move. Promoting a component pushes it one level
 * deeper, so even its imports of files that do not move — a stylesheet, a
 * shared type, a sibling level's barrel — need another `../`. So each specifier
 * is resolved to the file it points at today and recomputed between the two
 * final locations, and kept only when it actually changed.
 */
async function findImportReferences(
  components: ComponentDirectory[],
  rootDir: string
): Promise<Map<ComponentDirectory, ImportReference[]>> {
  const grouped = new Map<ComponentDirectory, ImportReference[]>();
  for (const component of components) {
    grouped.set(component, []);
  }

  const moveIndex = new Map<string, { targetPath: string; component: ComponentDirectory }>();
  for (const component of components) {
    for (const file of component.files) {
      if (file.currentPath !== file.targetPath) {
        moveIndex.set(file.currentPath, { targetPath: file.targetPath, component });
      }
    }
  }

  if (moveIndex.size === 0) return grouped;

  for (const filePath of await collectScannableFiles(rootDir)) {
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      // Skip files that can't be read
      continue;
    }

    const importerMove = moveIndex.get(filePath);
    // Where this file itself ends up, which is what its imports are relative to
    const importerTarget = importerMove?.targetPath ?? filePath;

    for (const match of content.matchAll(RELATIVE_IMPORT_PATTERN)) {
      const [statement, keyword, spacing, quote, specifier] = match;

      const resolved = resolveSpecifier(filePath, specifier);
      if (!resolved) continue;

      const targetMove = moveIndex.get(resolved);
      if (!importerMove && !targetMove) continue;

      const newSpecifier = buildSpecifier(
        importerTarget,
        targetMove?.targetPath ?? resolved,
        specifier,
        resolved
      );
      if (newSpecifier === specifier) continue;

      // Attributed to whichever component's move invalidated the import
      const owner = targetMove?.component ?? importerMove?.component;
      if (!owner) continue;

      grouped.get(owner)?.push({
        filePath,
        line: content.substring(0, match.index).split('\n').length,
        currentImport: statement,
        newImport: `${keyword}${spacing}${quote}${newSpecifier}${quote}`,
      });
    }
  }

  return grouped;
}

/**
 * Every file under the analyzed root that could carry a relative import.
 *
 * The whole tree is scanned, not just the component folders: a package entry
 * point reaching deep into the component tree — `export * from
 * './components/organisms/taskin/Taskin.types'` — is exactly the kind of import
 * a move breaks, and it lives nowhere near the component.
 */
async function collectScannableFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(dirPath: string): Promise<void> {
    let entries: fs.Dirent[];
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!isIgnoredDirectory(entry.name)) await walk(entryPath);
      } else if (entry.isFile() && IMPORT_BEARING_EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(entryPath);
      }
    }
  }

  await walk(rootDir);

  return files;
}

/**
 * Split a specifier from the `?query` / `#hash` a bundler may carry on it
 * (`./taskin.svg?raw`), which is not part of the path
 */
function splitSpecifier(specifier: string): { specifierPath: string; suffix: string } {
  const suffixStart = specifier.search(/[?#]/);

  return suffixStart === -1
    ? { specifierPath: specifier, suffix: '' }
    : { specifierPath: specifier.slice(0, suffixStart), suffix: specifier.slice(suffixStart) };
}

/**
 * Resolve a relative specifier to the file it points at today
 */
function resolveSpecifier(importerPath: string, specifier: string): string | null {
  const { specifierPath } = splitSpecifier(specifier);
  const base = path.resolve(path.dirname(importerPath), specifierPath);

  const candidates = [
    base,
    ...RESOLVABLE_EXTENSIONS.map(ext => `${base}${ext}`),
    ...BARREL_FILES.map(barrel => path.join(base, barrel)),
  ];

  return candidates.find(candidate => isFile(candidate)) ?? null;
}

function isFile(candidate: string): boolean {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/**
 * Recompute a specifier for the post-normalization layout, keeping the shape
 * the author wrote: an omitted extension stays omitted, a directory import
 * stays pointed at the directory.
 */
function buildSpecifier(
  importerTarget: string,
  target: string,
  specifier: string,
  resolvedOld: string
): string {
  const { specifierPath, suffix } = splitSpecifier(specifier);

  const extension = path.extname(resolvedOld);
  const wroteExtension = extension.length > 0 && specifierPath.endsWith(extension);
  const wroteDirectory =
    (BARREL_FILES as readonly string[]).includes(path.basename(resolvedOld)) && !wroteExtension;

  let destination = target;
  if (wroteDirectory) {
    destination = path.dirname(target);
  } else if (!wroteExtension) {
    destination = target.slice(0, -extension.length);
  }

  const relative = path.relative(path.dirname(importerTarget), destination);
  const posix = relative.split(path.sep).join('/');

  return `${posix.startsWith('.') ? posix : `./${posix}`}${suffix}`;
}

/**
 * Analyze component structure in given path
 */
export async function analyzeComponentStructure(
  options: NormalizeOptions
): Promise<NormalizeReport> {
  const skippedDirectories: Array<{ path: string; reason: string }> = [];

  const rootDir = path.resolve(options.path);

  try {
    const detected = detectComponents(rootDir);

    const planned = await Promise.all(
      detected.map(async component => {
        const conflict = promotionConflict(component);
        if (conflict) {
          if (options.verbose) {
            console.warn(`[storytype] Ignorado: ${conflict.reason}`);
          }
          skippedDirectories.push(conflict);
          return null;
        }

        return planComponent(component, options);
      })
    );

    const components = planned.filter((c): c is ComponentDirectory => c !== null);

    // Imports are resolved against the whole plan: an import breaks when
    // either end of it moves, which no single component can see on its own.
    const referencesByComponent = await findImportReferences(components, rootDir);
    for (const component of components) {
      component.importReferences = referencesByComponent.get(component) ?? [];
    }

    const allImportReferences = components.flatMap(c => c.importReferences);

    return {
      components,
      directoriesToRename: components.filter(c => c.needsRename).length,
      componentsToPromote: components.filter(c => c.needsPromotion).length,
      filesToRename: components.reduce(
        (sum, c) => sum + c.files.filter(f => f.currentPath !== f.targetPath).length,
        0
      ),
      filesToCreate: components.reduce((sum, c) => sum + c.missingFiles.length, 0),
      importsToUpdate: allImportReferences.length,
      importReferences: allImportReferences,
      skippedDirectories,
      success: true,
    };
  } catch (error) {
    return {
      components: [],
      directoriesToRename: 0,
      componentsToPromote: 0,
      filesToRename: 0,
      filesToCreate: 0,
      importsToUpdate: 0,
      importReferences: [],
      skippedDirectories: [],
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Refuse to promote onto a directory that already exists — the folder is
 * either another component or a half-done move, and overwriting it would
 * destroy files.
 */
function promotionConflict(component: DetectedComponent): { path: string; reason: string } | null {
  if (!component.needsPromotion) return null;
  if (!fs.existsSync(component.targetDir)) return null;

  return {
    path: component.currentDir,
    reason:
      `"${component.name}" está solto em ${path.basename(component.currentDir)}/ mas ` +
      `${path.basename(component.targetDir)}/ já existe — mova os arquivos manualmente`,
  };
}

/**
 * Turn a detected component into an executable normalization plan.
 *
 * `--dirs-only` / `--files-only` are folded in here rather than at execution
 * time, so every path in the report — and every import computed from it — is
 * what this particular run will actually produce.
 */
async function planComponent(
  component: DetectedComponent,
  options: NormalizeOptions
): Promise<ComponentDirectory> {
  const movesDirectories = !options.filesOnly;
  const renamesFiles = !options.dirsOnly;

  const targetDir = movesDirectories ? component.targetDir : component.currentDir;

  const files: ComponentFile[] = await Promise.all(
    component.files.map(async file => ({
      currentPath: file.path,
      targetPath: path.join(targetDir, renamesFiles ? file.targetName : file.name),
      isGitTracked: await isGitTracked(file.path),
      type: file.type,
    }))
  );

  return {
    currentPath: component.currentDir,
    targetPath: targetDir,
    componentName: component.name,
    files,
    missingFiles: renamesFiles ? findMissingFiles(component) : [],
    needsRename: component.needsDirRename && movesDirectories,
    needsPromotion: component.needsPromotion && movesDirectories,
    // Filled in once every component's plan is known
    importReferences: [],
  };
}

/**
 * Files the canonical set says are missing from a component.
 *
 * Existence is checked against the *target* names, so a component whose files
 * are about to be PascalCased is not told to create a file it already has.
 */
function findMissingFiles(component: DetectedComponent): string[] {
  const targetNames = new Set(component.files.map(file => file.targetName));

  return componentFileSet(component.name)
    .filter(spec => spec.completesFolder)
    .filter(spec => !spec.accepted.some(accepted => targetNames.has(accepted)))
    .map(spec => spec.fileName);
}

/**
 * Render the files a component is missing, from the shared templates — the
 * same ones `generate` uses, so a role always produces the same file.
 */
async function writeMissingFiles(component: ComponentDirectory): Promise<void> {
  if (component.missingFiles.length === 0) return;

  const entryFile = component.files.find(file => file.type === 'component');
  const presentRoles = component.files.map(file => file.type);

  const context: ScaffoldContext = {
    componentName: component.componentName,
    entryExtension: entryFile ? path.extname(entryFile.targetPath) : '.vue',
    presentRoles,
  };

  for (const missingFile of component.missingFiles) {
    const content = await renderComponentFileByName(missingFile, context);
    if (content === null) continue;

    await fs.writeFile(path.join(component.targetPath, missingFile), content, 'utf-8');
  }
}

/**
 * Normalize components according to Storytype conventions
 */
export async function normalizeComponents(options: NormalizeOptions): Promise<NormalizeReport> {
  const analysis = await analyzeComponentStructure(options);

  if (!analysis.success || options.dryRun) {
    return analysis;
  }

  try {
    // Directory work first: a loose component gains a folder, a misnamed one is
    // renamed. Both carry their files along, so file renames come after.
    for (const component of analysis.components) {
      if (component.needsPromotion) {
        await promoteComponent(component);
      } else if (component.needsRename) {
        await moveDirectory(component);
      }
    }

    // File names, at whatever location the component now sits
    for (const component of analysis.components) {
      // A promoted component was moved file by file, already under its target name
      if (component.needsPromotion) continue;

      for (const file of component.files) {
        const currentPath = path.join(component.targetPath, path.basename(file.currentPath));

        if (path.basename(currentPath) === path.basename(file.targetPath)) continue;

        await moveFile(currentPath, file.targetPath, file.isGitTracked);
      }
    }

    // Missing conventional files, created where the component now lives
    for (const component of analysis.components) {
      await writeMissingFiles(component);
    }

    // Imports last, once every file is at its final path
    await applyImportReferences(analysis.components);

    return {
      ...analysis,
      success: true,
    };
  } catch (error) {
    return {
      ...analysis,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Move a loose component into a folder of its own inside its Atomic Design level
 */
async function promoteComponent(component: ComponentDirectory): Promise<void> {
  await fs.ensureDir(component.targetPath);

  for (const file of component.files) {
    await moveFile(file.currentPath, file.targetPath, file.isGitTracked);
  }
}

/**
 * Rename a component directory, preserving Git history when it is tracked
 */
async function moveDirectory(component: ComponentDirectory): Promise<void> {
  const isCaseOnly = isCaseOnlyChange(component.currentPath, component.targetPath);

  if (component.files.some(f => f.isGitTracked)) {
    // Manual Git move avoids conflicts on case-insensitive filesystems
    await gitMoveManual(component.currentPath, component.targetPath, isCaseOnly);
    return;
  }

  await moveOnDisk(component.currentPath, component.targetPath, isCaseOnly);
}

/**
 * Move a single file, preserving Git history when it is tracked
 */
async function moveFile(fromPath: string, toPath: string, isGitTracked: boolean): Promise<void> {
  if (fromPath === toPath) return;

  const isCaseOnly = isCaseOnlyChange(fromPath, toPath);

  if (isGitTracked) {
    await gitMoveManual(fromPath, toPath, isCaseOnly);
    return;
  }

  await moveOnDisk(fromPath, toPath, isCaseOnly);
}

/**
 * Filesystem move. Case-only renames go through a temporary path, which a
 * case-insensitive filesystem would otherwise reject as a no-op.
 */
async function moveOnDisk(fromPath: string, toPath: string, isCaseOnly: boolean): Promise<void> {
  if (!isCaseOnly) {
    await fs.move(fromPath, toPath);
    return;
  }

  const tempPath = `${toPath}-temp-rename`;
  await fs.move(fromPath, tempPath);
  await fs.move(tempPath, toPath);
}

/**
 * Rewrite the imports the plan invalidated.
 *
 * A reference was found at the importing file's *old* path, and that file may
 * itself have moved by now, so it is followed to where the plan put it.
 */
async function applyImportReferences(components: ComponentDirectory[]): Promise<void> {
  const finalPaths = new Map<string, string>();
  for (const component of components) {
    for (const file of component.files) {
      finalPaths.set(file.currentPath, file.targetPath);
    }
  }

  for (const component of components) {
    for (const reference of component.importReferences) {
      const referencePath = finalPaths.get(reference.filePath) ?? reference.filePath;

      try {
        const content = await fs.readFile(referencePath, 'utf-8');
        const updated = content.replace(reference.currentImport, reference.newImport);

        if (updated !== content) {
          await fs.writeFile(referencePath, updated, 'utf-8');
        }
      } catch {
        // Skip files that can't be read/written
      }
    }
  }
}
