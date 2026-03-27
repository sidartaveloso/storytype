/**
 * Component normalization utility
 * Normalizes component structure to follow Storytype conventions
 */
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type {
  ComponentDirectory,
  ComponentFile,
  NormalizeOptions,
  NormalizeReport,
} from './NormalizeComponents.types.js';

const execAsync = promisify(exec);

/**
 * Check if two paths differ only in case (case-insensitive comparison)
 */
function isCaseOnlyChange(from: string, to: string): boolean {
  return from.toLowerCase() === to.toLowerCase() && from !== to;
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
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  // If already PascalCase, return as is
  if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
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
    // Get relative paths for git commands
    const repoRoot = (await execAsync('git rev-parse --show-toplevel', { cwd })).stdout.trim();
    const relativeFrom = path.relative(repoRoot, fromPath);
    const relativeTo = path.relative(repoRoot, toPath);

    // Remove old path from Git
    await execAsync(`git rm --cached "${relativeFrom}"`, { cwd: repoRoot });

    // Add new path to Git
    await execAsync(`git add "${relativeTo}"`, { cwd: repoRoot });
  } catch (error) {
    // If git commands fail, the file was moved but not staged
    // This is acceptable - user can stage manually
    console.warn(`Aviso: Não foi possível atualizar o índice Git para ${fromPath}`);
  }
}

/**
 * Get component base name from file path
 */
function getComponentBaseName(filePath: string): string {
  const fileName = path.basename(filePath);
  return fileName
    .replace(/\.(types|stories|story|spec|test|mock)\.(ts|tsx|js|jsx)$/, '')
    .replace(/\.(ts|tsx|js|jsx|vue)$/, '');
}

/**
 * Determine file type based on name pattern
 */
function getFileType(fileName: string): ComponentFile['type'] {
  if (fileName === 'index.ts' || fileName === 'index.js') return 'index';
  if (fileName.includes('.types.')) return 'types';
  if (fileName.includes('.spec.') || fileName.includes('.test.')) return 'test';
  if (fileName.includes('.stories.') || fileName.includes('.story.')) return 'stories';
  if (fileName.includes('.mock.')) return 'mock';
  if (fileName.endsWith('.vue')) return 'component';
  return 'other';
}

/**
 * Analyze component structure in given path
 */
export async function analyzeComponentStructure(
  options: NormalizeOptions
): Promise<NormalizeReport> {
  const components: ComponentDirectory[] = [];
  const targetPath = path.resolve(options.path);

  try {
    await analyzeDirectory(targetPath, components, options);

    return {
      components,
      directoriesToRename: components.filter(c => c.needsRename).length,
      filesToRename: components.reduce(
        (sum, c) => sum + c.files.filter(f => f.currentPath !== f.targetPath).length,
        0
      ),
      filesToCreate: components.reduce((sum, c) => sum + c.missingFiles.length, 0),
      importsToUpdate: 0, // TODO: Implement import detection
      success: true,
    };
  } catch (error) {
    return {
      components: [],
      directoriesToRename: 0,
      filesToRename: 0,
      filesToCreate: 0,
      importsToUpdate: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Recursively analyze directory for components
 */
async function analyzeDirectory(
  dirPath: string,
  components: ComponentDirectory[],
  options: NormalizeOptions
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  // Check if this directory is a component directory
  const vueFiles = entries.filter(e => e.isFile() && e.name.endsWith('.vue'));

  if (vueFiles.length > 0) {
    // This is a component directory
    const componentFile = vueFiles[0];
    const componentName = getComponentBaseName(componentFile.name);
    const pascalComponentName = toPascalCase(componentName);
    const dirName = path.basename(dirPath);
    
    // CRITICAL FIX: Use directory name for kebab-case conversion, not component name
    // This ensures dirs like 'srv/' stay 'srv/', not forced to 'server/' by file name
    const expectedDirName = toKebabCase(dirName);
    const needsRename = dirName !== expectedDirName;

    const files: ComponentFile[] = [];
    const existingFileNames = new Set<string>();

    for (const entry of entries) {
      if (entry.isFile()) {
        const currentPath = path.join(dirPath, entry.name);
        const fileType = getFileType(entry.name);
        const baseName = getComponentBaseName(entry.name);
        const pascalName = toPascalCase(baseName);

        let targetName = entry.name;
        if (
          fileType === 'component' ||
          fileType === 'types' ||
          fileType === 'test' ||
          fileType === 'stories' ||
          fileType === 'mock'
        ) {
          targetName = entry.name.replace(baseName, pascalName);
        }

        const targetPath = needsRename
          ? path.join(path.dirname(dirPath), expectedDirName, targetName)
          : path.join(dirPath, targetName);

        files.push({
          currentPath,
          targetPath,
          isGitTracked: await isGitTracked(currentPath),
          type: fileType,
        });

        existingFileNames.add(entry.name);
      }
    }

    // Check for missing files
    const missingFiles: string[] = [];

    if (!existingFileNames.has('index.ts') && !existingFileNames.has('index.js')) {
      missingFiles.push('index.ts');
    }
    if (!existingFileNames.has(`${pascalComponentName}.types.ts`)) {
      missingFiles.push(`${pascalComponentName}.types.ts`);
    }
    if (
      !existingFileNames.has(`${pascalComponentName}.spec.ts`) &&
      !existingFileNames.has(`${pascalComponentName}.test.ts`)
    ) {
      missingFiles.push(`${pascalComponentName}.spec.ts`);
    }

    components.push({
      currentPath: dirPath,
      targetPath: needsRename ? path.join(path.dirname(dirPath), expectedDirName) : dirPath,
      componentName: pascalComponentName,
      files,
      missingFiles,
      needsRename,
    });
  }

  // Recursively analyze subdirectories
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      await analyzeDirectory(path.join(dirPath, entry.name), components, options);
    }
  }
}

/**
 * Generate template content for missing files
 */
function generateFileContent(fileName: string, componentName: string): string {
  if (fileName === 'index.ts') {
    return `export * from './${componentName}.types';
export { default } from './${componentName}.vue';
`;
  }

  if (fileName.endsWith('.types.ts')) {
    return `export interface ${componentName}Type {
  models: ${componentName}Models;
  props: ${componentName}Props;
  emits: ${componentName}Emits;
}

export interface ${componentName}Models {
  //TODO: Add models here
}

export interface ${componentName}Props {
  //TODO: Add props here
}

export interface ${componentName}Emits {
  //TODO: Add emits here
}
`;
  }

  if (fileName.endsWith('.spec.ts')) {
    return `import { describe, it, expect } from 'vitest';
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('should render', () => {
    // TODO: Add tests
    expect(${componentName}).toBeDefined();
  });
});
`;
  }

  return '';
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
    // Step 1: Create missing files (before renaming)
    if (!options.dirsOnly) {
      for (const component of analysis.components) {
        for (const missingFile of component.missingFiles) {
          const targetPath = component.needsRename
            ? path.join(component.targetPath, missingFile)
            : path.join(component.currentPath, missingFile);

          const content = generateFileContent(missingFile, component.componentName);

          if (component.needsRename) {
            // Will be created after directory rename
            continue;
          }

          await fs.writeFile(targetPath, content, 'utf-8');
        }
      }
    }

    // Step 2: Rename directories (if needed)
    if (!options.filesOnly) {
      for (const component of analysis.components) {
        if (component.needsRename) {
          const hasGitFiles = component.files.some(f => f.isGitTracked);
          const isCaseOnly = isCaseOnlyChange(component.currentPath, component.targetPath);

          if (hasGitFiles) {
            // Use manual Git move to avoid conflicts on case-insensitive filesystems
            await gitMoveManual(component.currentPath, component.targetPath, isCaseOnly);
          } else {
            if (isCaseOnly) {
              // Two-step rename for case-only changes
              const tempPath = `${component.targetPath}-temp-rename`;
              await fs.move(component.currentPath, tempPath);
              await fs.move(tempPath, component.targetPath);
            } else {
              // Direct rename for other changes
              await fs.move(component.currentPath, component.targetPath);
            }
          }

          // Create missing files in new location
          for (const missingFile of component.missingFiles) {
            const targetPath = path.join(component.targetPath, missingFile);
            const content = generateFileContent(missingFile, component.componentName);
            await fs.writeFile(targetPath, content, 'utf-8');
          }
        }
      }
    }

    // Step 3: Rename files (if needed)
    if (!options.dirsOnly) {
      for (const component of analysis.components) {
        // Update current path if directory was renamed
        const currentDir =
          component.needsRename && !options.filesOnly
            ? component.targetPath
            : component.currentPath;

        for (const file of component.files) {
          // Determine current file path (may have moved with directory)
          const currentFilePath =
            component.needsRename && !options.filesOnly
              ? path.join(currentDir, path.basename(file.currentPath))
              : file.currentPath;

          const targetFilePath =
            component.needsRename && !options.filesOnly
              ? file.targetPath
              : path.join(currentDir, path.basename(file.targetPath));

          // Skip if file doesn't need renaming
          if (path.basename(currentFilePath) === path.basename(targetFilePath)) {
            continue;
          }

          const isCaseOnly = isCaseOnlyChange(currentFilePath, targetFilePath);

          if (file.isGitTracked) {
            // Use manual Git move to avoid conflicts
            await gitMoveManual(currentFilePath, targetFilePath, isCaseOnly);
          } else {
            if (isCaseOnly) {
              // Two-step rename for case-only changes
              const tempPath = `${targetFilePath}-temp-rename`;
              await fs.move(currentFilePath, tempPath);
              await fs.move(tempPath, targetFilePath);
            } else {
              await fs.move(currentFilePath, targetFilePath);
            }
          }
        }
      }
    }

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
