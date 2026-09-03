/**
 * Component and structure generators
 * Uses Handlebars templates to generate Storytype-compliant components
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import {
  type AtomicLevel,
  ATOMIC_LEVELS,
  atomicLevelDir,
  detectProjectLanguage,
  findComponentsDirectory,
  type ProjectLanguage,
  toKebabCase,
  toPascalCase,
} from '../component-detector.js';
import type {
  ComponentTarget,
  GenerateComponentOptions,
  GenerateResult,
} from './Generate.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Handlebars.registerHelper('kebabCase', (str: string) => toKebabCase(str));
Handlebars.registerHelper('pascalCase', (str: string) => toPascalCase(str));
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

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
 * Get template directory path
 */
function getTemplateDir(): string {
  // Possible template locations (in order of preference):
  // 1. Development: packages/cli/src/templates/component
  // 2. Production build: packages/cli/dist/templates/component
  // 3. Global install: node_modules/storytype/dist/templates/component
  // 4. Linked development: follow symlink to src/templates/component

  const possiblePaths = [
    // Development (from dist/generate to src/templates)
    path.join(__dirname, '..', 'templates', 'component'),
    // Production build (dist/templates adjacent to dist/)
    path.join(__dirname, '..', '..', 'templates', 'component'),
    // From src/generate to src/templates
    path.join(__dirname, '..', '..', 'src', 'templates', 'component'),
    // Global install
    path.join(__dirname, 'templates', 'component'),
  ];

  for (const templatePath of possiblePaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }
  }

  throw new Error(`Template directory not found. Searched paths: ${possiblePaths.join(', ')}`);
}

/**
 * Load and compile a Handlebars template
 */
async function compileTemplate(templateName: string, data: any): Promise<string> {
  const templateDir = getTemplateDir();
  const templatePath = path.join(templateDir, templateName);
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);
  return template(data);
}

/**
 * Generate Vue component template
 */
async function generateVueTemplate(componentName: string, type: string): Promise<string> {
  return compileTemplate('component.vue.hbs', { name: componentName, type });
}

/**
 * Generate TypeScript types file
 */
async function generateTypesFile(componentName: string): Promise<string> {
  return compileTemplate('types.ts.hbs', { name: componentName });
}

/**
 * Generate Storybook stories file
 */
async function generateStoriesFile(
  componentName: string,
  level: AtomicLevel,
  language: ProjectLanguage
): Promise<string> {
  return compileTemplate('stories.ts.hbs', {
    name: componentName,
    section: storybookSection(level, language),
  });
}

/**
 * Generate mock data file
 */
async function generateMockFile(componentName: string): Promise<string> {
  return compileTemplate('mock.ts.hbs', { name: componentName });
}

/**
 * Generate index.ts file
 */
async function generateIndexFile(componentName: string): Promise<string> {
  return compileTemplate('index.ts.hbs', { name: componentName });
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
    const componentDir = target.componentDir;

    await fs.ensureDir(componentDir);

    const files: string[] = [];

    // Generate component file
    const vueFile = path.join(componentDir, `${componentName}.vue`);
    await fs.writeFile(vueFile, await generateVueTemplate(componentName, options.type));
    files.push(vueFile);

    // Generate types file
    const typesFile = path.join(componentDir, `${componentName}.types.ts`);
    await fs.writeFile(typesFile, await generateTypesFile(componentName));
    files.push(typesFile);

    // Generate stories file
    const storiesFile = path.join(componentDir, `${componentName}.stories.ts`);
    await fs.writeFile(
      storiesFile,
      await generateStoriesFile(componentName, options.type, target.language)
    );
    files.push(storiesFile);

    // Generate mock file
    const mockFile = path.join(componentDir, `${componentName}.mock.ts`);
    await fs.writeFile(mockFile, await generateMockFile(componentName));
    files.push(mockFile);

    // Generate index file
    const indexFile = path.join(componentDir, 'index.ts');
    await fs.writeFile(indexFile, await generateIndexFile(componentName));
    files.push(indexFile);

    return {
      success: true,
      files,
    };
  } catch (error) {
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
