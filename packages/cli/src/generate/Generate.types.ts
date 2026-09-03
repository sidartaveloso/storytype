/**
 * Types for Plop-based generators
 */

import type { AtomicLevel, ProjectLanguage } from '../component-detector.js';

export type GeneratorType = 'component' | 'page' | 'package';

/**
 * The Atomic Design level of a component, by its canonical (English) key.
 * The folder it lands in follows the project's language — see
 * `atomicLevelDir` in the component detector.
 */
export type ComponentLevel = AtomicLevel;

export type PageCategory = 'autenticacao' | 'consulta' | 'lpr' | 'configuracao' | 'outras';

export type PackageLanguage = 'typescript' | 'python';

export interface GenerateComponentOptions {
  name: string;
  type: ComponentLevel;
  path?: string;
}

/**
 * Where a generated component will be written, and in which language the
 * level folder is named
 */
export interface ComponentTarget {
  componentsDir: string;
  levelDir: string;
  componentDir: string;
  language: ProjectLanguage;
}

export interface GeneratePageOptions {
  name: string;
  category: PageCategory;
  path?: string;
}

export interface GeneratePackageOptions {
  name: string;
  language: PackageLanguage;
  description?: string;
}

export type GenerateOptions =
  GenerateComponentOptions | GeneratePageOptions | GeneratePackageOptions;

export interface GenerateResult {
  success: boolean;
  files: string[];
  error?: string;
}
