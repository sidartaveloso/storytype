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
      type: 'atomos',
      path: tempDir,
    };

    const result = await generateComponent(options);

    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThan(0);

    // Check that component directory was created in kebab-case under atomos folder
    const componentDir = path.join(tempDir, 'atomos', 'test-button');
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
      type: 'moleculas',
      path: atomicDir,
    };

    const result = await generateComponent(options);

    expect(result.success).toBe(true);

    const componentDir = path.join(atomicDir, 'moleculas', 'test-card');
    expect(await fs.pathExists(componentDir)).toBe(true);
  });

  it('should handle PascalCase and convert directory to kebab-case', async () => {
    const options: GenerateComponentOptions = {
      name: 'UserProfileCard',
      type: 'organismos',
      path: tempDir,
    };

    const result = await generateComponent(options);

    expect(result.success).toBe(true);

    // Directory should be in kebab-case under organismos folder
    const componentDir = path.join(tempDir, 'organismos', 'user-profile-card');
    expect(await fs.pathExists(componentDir)).toBe(true);

    // Files should be in PascalCase
    expect(await fs.pathExists(path.join(componentDir, 'UserProfileCard.vue'))).toBe(true);
  });

  it('should generate valid Vue component template', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestInput',
      type: 'atomos',
      path: tempDir,
    };

    const result = await generateComponent(options);
    expect(result.success).toBe(true);

    const componentFile = path.join(tempDir, 'atomos', 'test-input', 'TestInput.vue');
    const content = await fs.readFile(componentFile, 'utf-8');

    expect(content).toContain('<template>');
    expect(content).toContain('<script setup lang="ts">');
    expect(content).toContain('TestInputProps');
  });

  it('should generate valid TypeScript types file', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestSelect',
      type: 'atomos',
      path: tempDir,
    };

    const result = await generateComponent(options);
    expect(result.success).toBe(true);

    const typesFile = path.join(tempDir, 'atomos', 'test-select', 'TestSelect.types.ts');
    const content = await fs.readFile(typesFile, 'utf-8');

    expect(content).toContain('export interface TestSelectType');
    expect(content).toContain('export interface TestSelectProps');
    expect(content).toContain('export interface TestSelectEmits');
  });

  it('should generate valid index.ts with exports', async () => {
    const options: GenerateComponentOptions = {
      name: 'TestCheckbox',
      type: 'atomos',
      path: tempDir,
    };

    const result = await generateComponent(options);
    expect(result.success).toBe(true);

    const indexFile = path.join(tempDir, 'atomos', 'test-checkbox', 'index.ts');
    const content = await fs.readFile(indexFile, 'utf-8');

    expect(content).toContain("export * from './TestCheckbox.types'");
    expect(content).toContain("export * from './TestCheckbox.mock'");
    expect(content).toContain("export { default } from './TestCheckbox.vue'");
  });
});
