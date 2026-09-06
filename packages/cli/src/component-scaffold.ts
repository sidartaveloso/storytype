/**
 * Renders the files of a component from the Handlebars templates.
 *
 * Shared by `generate`, which writes a whole component, and `normalize`, which
 * completes an existing one — so the same role always produces the same file,
 * whichever command created it.
 */

import fs from 'fs-extra';
import Handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  type ComponentFileSpec,
  type ComponentFileType,
  componentFileSet,
  toKebabCase,
  toPascalCase,
} from './component-detector.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

Handlebars.registerHelper('kebabCase', (value: string) => toKebabCase(value));
Handlebars.registerHelper('pascalCase', (value: string) => toPascalCase(value));

/** The template that renders each role */
const ROLE_TEMPLATES: Partial<Record<ComponentFileType, string>> = {
  component: 'component.vue.hbs',
  types: 'types.ts.hbs',
  test: 'spec.ts.hbs',
  stories: 'stories.ts.hbs',
  mock: 'mock.ts.hbs',
  index: 'index.ts.hbs',
};

export interface ScaffoldContext {
  /** Component name, in PascalCase */
  componentName: string;
  /** Extension of the entry file, which decides how the others import it */
  entryExtension: string;
  /** Storybook section the component belongs to, e.g. `01 - Atoms` */
  section?: string;
  /** Roles the component already has or is getting, so barrels only export what exists */
  presentRoles: ComponentFileType[];
}

/**
 * Locate the template directory, which sits beside the sources in development
 * and beside the bundle after a build.
 */
function templateDir(): string {
  const candidates = [
    path.join(currentDir, 'templates', 'component'),
    path.join(currentDir, '..', 'templates', 'component'),
    path.join(currentDir, '..', '..', 'templates', 'component'),
    path.join(currentDir, '..', '..', 'src', 'templates', 'component'),
  ];

  const found = candidates.find(candidate => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Template directory not found. Searched: ${candidates.join(', ')}`);
  }

  return found;
}

/**
 * How the entry file is imported from inside the component's own folder: a
 * `.vue` keeps its extension, a `.ts` is imported without one.
 */
function entrySpecifier(componentName: string, entryExtension: string): string {
  return entryExtension === '.vue' ? `./${componentName}.vue` : `./${componentName}`;
}

/**
 * Render the file for one role. Returns null for a role with no template.
 */
export async function renderComponentFile(
  role: ComponentFileType,
  context: ScaffoldContext
): Promise<string | null> {
  const templateName = ROLE_TEMPLATES[role];
  if (!templateName) return null;

  const templatePath = path.join(templateDir(), templateName);
  const template = Handlebars.compile(await fs.readFile(templatePath, 'utf-8'));

  return template({
    name: context.componentName,
    entry: entrySpecifier(context.componentName, context.entryExtension),
    section: context.section ?? '',
    hasMock: context.presentRoles.includes('mock'),
    hasStories: context.presentRoles.includes('stories'),
    isVue: context.entryExtension === '.vue',
  });
}

/**
 * Render a file by name, resolving its role from the canonical set.
 * Returns null when the name plays no role a template covers.
 */
export async function renderComponentFileByName(
  fileName: string,
  context: ScaffoldContext
): Promise<string | null> {
  const spec = componentFileSet(context.componentName).find((candidate: ComponentFileSpec) =>
    candidate.accepted.includes(fileName)
  );

  return spec ? renderComponentFile(spec.role, context) : null;
}
