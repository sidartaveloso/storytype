/**
 * Component and structure generators
 * Uses Handlebars templates to generate Storytype-compliant components
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import type { GenerateComponentOptions, GenerateResult } from './Generate.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
    return str;
  }

  const withHyphens = str.replace(/([a-z])([A-Z])/g, '$1-$2');

  return withHyphens
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Register Handlebars helpers
Handlebars.registerHelper('kebabCase', (str: string) => toKebabCase(str));
Handlebars.registerHelper('pascalCase', (str: string) => toPascalCase(str));
Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

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
async function generateStoriesFile(componentName: string, type: string): Promise<string> {
  return compileTemplate('stories.ts.hbs', { name: componentName, type });
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
    const dirName = toKebabCase(options.name);
    const basePath = options.path || process.cwd();

    // Create component directory structure
    const componentDir = path.join(basePath, options.type, dirName);
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
    await fs.writeFile(storiesFile, await generateStoriesFile(componentName, options.type));
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
