/**
 * Component generator: decides where a component goes and writes its canonical
 * file set. The files themselves are rendered by the shared scaffold.
 */
import fs from 'fs-extra';
import path from 'path';
import {
  type AtomicLevel,
  ATOMIC_LEVELS,
  atomicLevelDir,
  detectProjectLanguage,
  findComponentsDirectory,
  type ComponentFileType,
  componentFileSet,
  type ProjectLanguage,
  toKebabCase,
  toPascalCase,
} from '../component-detector.js';
import { renderComponentFile, type ScaffoldContext } from '../component-scaffold.js';
import type {
  ComponentTarget,
  GenerateComponentOptions,
  GenerateResult,
} from './Generate.types.js';

/** `generate` scaffolds Vue components */
const ENTRY_EXTENSION = '.vue';

/**
 * Decide where a component is written.
 *
 * `--path` wins. Otherwise the project's own components directory is located
 * and its level folder named in the project's language, so a component
 * generated into `src/components/atomos/` is one `analyze` recognizes — the
 * two commands read the same convention.
 */
function resolveTarget(options: GenerateComponentOptions): ComponentTarget {
  const componentsDir =
    options.path ??
    findComponentsDirectory(process.cwd()) ??
    path.join(process.cwd(), 'src', 'components');

  const language = detectProjectLanguage(componentsDir);
  const levelDir = path.join(componentsDir, atomicLevelDir(options.type, language));

  return {
    componentsDir,
    levelDir,
    componentDir: path.join(levelDir, toKebabCase(options.name)),
    language,
  };
}

/**
 * Name of the Storybook section a level occupies, in the project's language.
 * Keyed by level so a level added to ATOMIC_LEVELS cannot be forgotten here.
 */
const STORYBOOK_SECTIONS: Record<AtomicLevel, Record<ProjectLanguage, string>> = {
  atoms: { en: 'Atoms', pt: 'Átomos' },
  molecules: { en: 'Molecules', pt: 'Moléculas' },
  organisms: { en: 'Organisms', pt: 'Organismos' },
  templates: { en: 'Templates', pt: 'Templates' },
  pages: { en: 'Pages', pt: 'Páginas' },
};

/**
 * `01 - Atoms`: the numeric prefix is what orders the sections in Storybook's
 * sidebar, and it comes from the level's own order.
 */
function storybookSection(level: AtomicLevel, language: ProjectLanguage): string {
  const order = String(ATOMIC_LEVELS[level].order).padStart(2, '0');

  return `${order} - ${STORYBOOK_SECTIONS[level][language]}`;
}

/**
 * Generate a new component
 */
export async function generateComponent(
  options: GenerateComponentOptions
): Promise<GenerateResult> {
  try {
    const componentName = toPascalCase(options.name);
    const target = resolveTarget(options);

    await fs.ensureDir(target.componentDir);

    // A generated component gets the whole canonical set, so every role is
    // present and the barrel and the story can rely on each other
    const fileSet = componentFileSet(componentName);
    const context: ScaffoldContext = {
      componentName,
      entryExtension: ENTRY_EXTENSION,
      section: storybookSection(options.type, target.language),
      presentRoles: ['component', ...fileSet.map(spec => spec.role)],
    };

    const entryFileName = `${componentName}${ENTRY_EXTENSION}`;
    const written: { role: ComponentFileType; fileName: string }[] = [
      { role: 'component', fileName: entryFileName },
      ...fileSet.map(spec => ({ role: spec.role, fileName: spec.fileName })),
    ];

    const files: string[] = [];
    for (const { role, fileName } of written) {
      const content = await renderComponentFile(role, context);
      if (content === null) continue;

      const filePath = path.join(target.componentDir, fileName);
      await fs.writeFile(filePath, content);
      files.push(filePath);
    }

    return { success: true, files };
  } catch (error) {
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
