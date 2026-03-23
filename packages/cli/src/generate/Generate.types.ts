/**
 * Types for Plop-based generators
 */

export type GeneratorType = 'component' | 'page' | 'package';

export type ComponentLevel = 'atomos' | 'moleculas' | 'organismos' | 'templates';

export type PageCategory = 'autenticacao' | 'consulta' | 'lpr' | 'configuracao' | 'outras';

export type PackageLanguage = 'typescript' | 'python';

export interface GenerateComponentOptions {
  name: string;
  type: ComponentLevel;
  path?: string;
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
  | GenerateComponentOptions
  | GeneratePageOptions
  | GeneratePackageOptions;

export interface GenerateResult {
  success: boolean;
  files: string[];
  error?: string;
}
