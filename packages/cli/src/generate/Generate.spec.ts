/**
 * Tests for Plop-based generators
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { generateComponent } from './Generate';
import type { GenerateComponentOptions } from './Generate.types';

describe('Generate - Component', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-gen-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should generate component with all required files', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestButton',
      type: 'atoms',
      path: tempDir,
    };

    const result = await generateComponent(options);

    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThan(0);

    // Check that component directory was created in kebab-case under atoms folder
    const componentDir = path.join(tempDir, 'atoms', 'test-button');
    expect(await fs.pathExists(componentDir)).toBe(true);

    // Check that all required files exist
    expect(await fs.pathExists(path.join(componentDir, 'TestButton.vue'))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'TestButton.types.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'TestButton.stories.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'TestButton.mock.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'index.ts'))).toBe(true);
  });

  it('should create component in correct atomic design folder', async () => {
    const atomicDir = path.join(tempDir, 'src', 'components');
    await fs.ensureDir(atomicDir);

    const options: GenerateComponentOptions = {
      name: 'TestCard',
      type: 'molecules',
      path: atomicDir,
    };

    const result = await generateComponent(options);

    expect(result.success).toBe(true);

    const componentDir = path.join(atomicDir, 'molecules', 'test-card');
    expect(await fs.pathExists(componentDir)).toBe(true);
  });

  it('should handle PascalCase and convert directory to kebab-case', async () => {
    const options: GenerateComponentOptions = {
      name: 'UserProfileCard',
      type: 'organisms',
      path: tempDir,
    };

    const result = await generateComponent(options);

    expect(result.success).toBe(true);

    // Directory should be in kebab-case under organisms folder
    const componentDir = path.join(tempDir, 'organisms', 'user-profile-card');
    expect(await fs.pathExists(componentDir)).toBe(true);

    // Files should be in PascalCase
    expect(await fs.pathExists(path.join(componentDir, 'UserProfileCard.vue'))).toBe(true);
  });

  it('should generate valid Vue component template', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestInput',
      type: 'atoms',
      path: tempDir,
    };

    const result = await generateComponent(options);
    expect(result.success).toBe(true);

    const componentFile = path.join(tempDir, 'atoms', 'test-input', 'TestInput.vue');
    const content = await fs.readFile(componentFile, 'utf-8');

    expect(content).toContain('<template>');
    expect(content).toContain('<script setup lang="ts">');
    expect(content).toContain('TestInputProps');
  });

  it('should generate valid TypeScript types file', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestSelect',
      type: 'atoms',
      path: tempDir,
    };

    const result = await generateComponent(options);
    expect(result.success).toBe(true);

    const typesFile = path.join(tempDir, 'atoms', 'test-select', 'TestSelect.types.ts');
    const content = await fs.readFile(typesFile, 'utf-8');

    expect(content).toContain('export interface TestSelectType');
    expect(content).toContain('export interface TestSelectProps');
    expect(content).toContain('export interface TestSelectEmits');
  });

  it('names the level folder in English when the project has no level yet', async () => {
    const result = await generateComponent({ name: 'Badge', type: 'atoms', path: tempDir });

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'atoms', 'badge'))).toBe(true);
  });

  it('names the level folder in Portuguese when the project already does', async () => {
    // The project's own folders are what declare its language
    await fs.ensureDir(path.join(tempDir, 'atomos'));
    await fs.ensureDir(path.join(tempDir, 'moleculas'));

    const result = await generateComponent({ name: 'Badge', type: 'atoms', path: tempDir });

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'atomos', 'badge'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'atoms'))).toBe(false);
  });

  it('titles the Storybook section in the project language', async () => {
    await fs.ensureDir(path.join(tempDir, 'atomos'));
    await generateComponent({ name: 'Badge', type: 'atoms', path: tempDir });

    const pt = await fs.readFile(
      path.join(tempDir, 'atomos', 'badge', 'Badge.stories.ts'),
      'utf-8'
    );
    expect(pt).toContain("title: '01 - Átomos/Badge'");

    const englishDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-gen-en-'));
    await generateComponent({ name: 'Badge', type: 'atoms', path: englishDir });

    const en = await fs.readFile(
      path.join(englishDir, 'atoms', 'badge', 'Badge.stories.ts'),
      'utf-8'
    );
    expect(en).toContain("title: '01 - Atoms/Badge'");
    await fs.remove(englishDir);
  });

  it('writes into the project components directory when no path is given', async () => {
    const componentsDir = path.join(tempDir, 'src', 'components');
    await fs.ensureDir(componentsDir);

    const cwd = process.cwd();
    process.chdir(tempDir);
    try {
      const result = await generateComponent({ name: 'Badge', type: 'atoms' });

      expect(result.success).toBe(true);
      // Not at the project root, which is where it used to land
      expect(await fs.pathExists(path.join(componentsDir, 'atoms', 'badge'))).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'atoms'))).toBe(false);
    } finally {
      process.chdir(cwd);
    }
  });

  it('should generate valid index.ts with exports', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestCheckbox',
      type: 'atoms',
      path: tempDir,
    };

    const result = await generateComponent(options);
    expect(result.success).toBe(true);

    const indexFile = path.join(tempDir, 'atoms', 'test-checkbox', 'index.ts');
    const content = await fs.readFile(indexFile, 'utf-8');

    expect(content).toContain("export * from './TestCheckbox.types'");
    expect(content).toContain("export * from './TestCheckbox.mock'");
    expect(content).toContain("export { default } from './TestCheckbox.vue'");
  });
});
