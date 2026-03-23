/**
 * Tests for component normalization utility
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import {
  analyzeComponentStructure,
  normalizeComponents,
  toKebabCase,
  toPascalCase,
  isGitTracked,
} from './NormalizeComponents';
import type { NormalizeOptions, ComponentDirectory } from './NormalizeComponents.types';

describe('NormalizeComponents - Naming Conversions', () => {
  describe('toKebabCase', () => {
    it('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('UserProfile')).toBe('user-profile');
      expect(toKebabCase('DataTable')).toBe('data-table');
      expect(toKebabCase('FormInput')).toBe('form-input');
      expect(toKebabCase('APIService')).toBe('api-service');
    });

    it('should handle already kebab-case strings', () => {
      expect(toKebabCase('user-profile')).toBe('user-profile');
      expect(toKebabCase('data-table')).toBe('data-table');
    });

    it('should handle single words', () => {
      expect(toKebabCase('Button')).toBe('button');
      expect(toKebabCase('button')).toBe('button');
    });
  });

  describe('toPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('user-profile')).toBe('UserProfile');
      expect(toPascalCase('data-table')).toBe('DataTable');
      expect(toPascalCase('form-input')).toBe('FormInput');
      expect(toPascalCase('api-service')).toBe('ApiService');
    });

    it('should handle already PascalCase strings', () => {
      expect(toPascalCase('UserProfile')).toBe('UserProfile');
      expect(toPascalCase('DataTable')).toBe('DataTable');
    });

    it('should handle camelCase conversion', () => {
      expect(toPascalCase('userProfile')).toBe('UserProfile');
      expect(toPascalCase('dataTable')).toBe('DataTable');
    });

    it('should handle single words', () => {
      expect(toPascalCase('button')).toBe('Button');
      expect(toPascalCase('Button')).toBe('Button');
    });
  });
});

describe('NormalizeComponents - Component Detection', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should detect component without proper folder structure', async () => {
    // Create a component file without dedicated folder
    const componentFile = path.join(tempDir, 'UserProfile.vue');
    await fs.writeFile(componentFile, '<template><div>Test</div></template>');

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.components.length).toBeGreaterThan(0);
  });

  it('should detect missing files in component folder', async () => {
    // Create component folder with only vue file
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await analyzeComponentStructure(options);

    const component = result.components.find((c: ComponentDirectory) =>
      c.currentPath.includes('user-profile')
    );
    expect(component).toBeDefined();
    expect(component?.missingFiles).toContain('index.ts');
    expect(component?.missingFiles).toContain('UserProfile.types.ts');
    expect(component?.missingFiles).toContain('UserProfile.spec.ts');
  });

  it('should detect directory that needs kebab-case conversion', async () => {
    // Create component folder with PascalCase name
    const componentDir = path.join(tempDir, 'UserProfile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await analyzeComponentStructure(options);

    const component = result.components.find((c: ComponentDirectory) =>
      c.currentPath.includes('UserProfile')
    );
    expect(component).toBeDefined();
    expect(component?.needsRename).toBe(true);
    expect(component?.targetPath).toContain('user-profile');
  });

  it('should not flag properly structured component', async () => {
    // Create properly structured component
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.types.ts'),
      'export interface UserProfileProps {}'
    );
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.spec.ts'),
      "describe('UserProfile', () => {})"
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './UserProfile.vue'"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await analyzeComponentStructure(options);

    const component = result.components.find((c: ComponentDirectory) =>
      c.currentPath.includes('user-profile')
    );
    expect(component?.needsRename).toBe(false);
    expect(component?.missingFiles.length).toBe(0);
  });
});

describe('NormalizeComponents - Dry Run', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should not modify files in dry-run mode', async () => {
    const componentDir = path.join(tempDir, 'UserProfile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    await normalizeComponents(options);

    // Directory should still exist with original name
    expect(await fs.pathExists(componentDir)).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'user-profile'))).toBe(false);
  });

  it('should return report with planned changes', async () => {
    const componentDir = path.join(tempDir, 'UserProfile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(result.directoriesToRename).toBeGreaterThan(0);
    expect(result.filesToCreate).toBeGreaterThan(0);
  });
});

describe('NormalizeComponents - Execution', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should rename directory to kebab-case', async () => {
    const componentDir = path.join(tempDir, 'UserProfile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(await fs.pathExists(componentDir)).toBe(false);
    expect(await fs.pathExists(path.join(tempDir, 'user-profile'))).toBe(true);
  });

  it('should create missing component files', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'UserProfile.types.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, 'UserProfile.spec.ts'))).toBe(true);
  });
});

describe('NormalizeComponents - Git Integration', () => {
  it('should detect if file is tracked by git', async () => {
    // This test will be skipped if not in a git repo
    const isInGitRepo = await fs.pathExists(path.join(process.cwd(), '.git'));
    if (!isInGitRepo) {
      console.log('Skipping git test - not in git repository');
      return;
    }

    // Test with this actual file (should be tracked)
    const thisFile = import.meta.url.replace('file://', '');
    const tracked = await isGitTracked(thisFile);
    expect(tracked).toBe(true);
  });
});

describe('NormalizeComponents - Case-Only Changes', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-case-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should handle case-only directory rename (Botao -> botao)', async () => {
    // Create a component with PascalCase directory name
    const componentDir = path.join(tempDir, 'components', 'atomos', 'Botao');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'Botao.vue'),
      '<template><div>Botão</div></template>'
    );
    await fs.writeFile(path.join(componentDir, 'Botao.types.ts'), 'export interface BotaoProps {}');
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      'export { default } from "./Botao.vue"'
    );

    // Analyze
    const options: NormalizeOptions = {
      path: path.join(tempDir, 'components'),
      dryRun: true,
    };

    const analysis = await analyzeComponentStructure(options);

    // Should detect that directory needs renaming
    expect(analysis.success).toBe(true);
    expect(analysis.components.length).toBe(1);
    expect(analysis.components[0].needsRename).toBe(true);
    expect(path.basename(analysis.components[0].currentPath)).toBe('Botao');
    expect(path.basename(analysis.components[0].targetPath)).toBe('botao');
  });

  it('should execute case-only directory rename without git', async () => {
    // Create a component with PascalCase directory name
    const componentDir = path.join(tempDir, 'components', 'atomos', 'UserProfile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>User</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      'export { default } from "./UserProfile.vue"'
    );

    // Execute normalization
    const options: NormalizeOptions = {
      path: path.join(tempDir, 'components'),
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    // Should succeed
    expect(result.success).toBe(true);

    // Check that the directory was renamed
    const expectedPath = path.join(tempDir, 'components', 'atomos', 'user-profile');
    const exists = await fs.pathExists(expectedPath);
    expect(exists).toBe(true);

    // Check that files exist in new location
    const vueFile = await fs.pathExists(path.join(expectedPath, 'UserProfile.vue'));
    expect(vueFile).toBe(true);
  });
});
