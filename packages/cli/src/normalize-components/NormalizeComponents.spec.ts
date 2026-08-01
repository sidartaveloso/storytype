/**
 * Tests for component normalization utility
 */

import { exec } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  analyzeComponentStructure,
  isGitTracked,
  normalizeComponents,
  toKebabCase,
  toPascalCase,
} from './NormalizeComponents';
import type {
  ComponentDirectory,
  ImportReference,
  NormalizeOptions,
} from './NormalizeComponents.types';

const execAsync = promisify(exec);

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

    // Critical test cases for the bug fix
    it('should handle all-uppercase acronyms correctly', () => {
      expect(toKebabCase('SRV')).toBe('srv');
      expect(toKebabCase('API')).toBe('api');
      expect(toKebabCase('HTTP')).toBe('http');
    });

    it('should handle mixed case with acronyms', () => {
      expect(toKebabCase('HTTPService')).toBe('http-service');
      expect(toKebabCase('SRVComponent')).toBe('srv-component');
    });

    it('should preserve already correct casing', () => {
      expect(toKebabCase('srv')).toBe('srv');
      expect(toKebabCase('api')).toBe('api');
    });

    it('should handle title case', () => {
      expect(toKebabCase('Srv')).toBe('srv');
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

describe('NormalizeComponents - Monorepo Support', () => {
  // Fixtures are in packages/cli/src/__fixtures__, not src/normalize-components/__fixtures__
  const fixturesDir = path.join(__dirname, '..', '__fixtures__');

  describe('Simple Project Structure', () => {
    it('should keep srv folder name intact', async () => {
      const projectPath = path.join(fixturesDir, 'simple-project', 'src', 'components');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const srvComponent = result.components.find(c => path.basename(c.currentPath) === 'srv');

      expect(srvComponent).toBeDefined();
      expect(srvComponent?.needsRename).toBe(false);
      expect(path.basename(srvComponent!.currentPath)).toBe('srv');
      expect(path.basename(srvComponent!.targetPath)).toBe('srv');
    });

    it('should normalize SRV uppercase to srv lowercase', async () => {
      // Create temp dir for case-sensitive testing (macOS filesystem issue)
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-srv-test-'));

      try {
        const componentDir = path.join(tempDir, 'SRV');
        await fs.ensureDir(componentDir);
        await fs.writeFile(
          path.join(componentDir, 'Service.vue'),
          '<template><div>Service</div></template>'
        );

        const options: NormalizeOptions = {
          path: tempDir,
          dryRun: true,
        };

        const result = await analyzeComponentStructure(options);

        const srvComponent = result.components.find(c => path.basename(c.currentPath) === 'SRV');

        expect(srvComponent).toBeDefined();
        expect(srvComponent?.needsRename).toBe(true);
        expect(path.basename(srvComponent!.currentPath)).toBe('SRV');
        expect(path.basename(srvComponent!.targetPath)).toBe('srv');
      } finally {
        await fs.remove(tempDir);
      }
    });

    it('should normalize UserProfile to user-profile', async () => {
      const projectPath = path.join(fixturesDir, 'simple-project', 'src', 'components');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const profileComponent = result.components.find(
        c => path.basename(c.currentPath) === 'UserProfile'
      );

      expect(profileComponent).toBeDefined();
      expect(profileComponent?.needsRename).toBe(true);
      expect(path.basename(profileComponent!.targetPath)).toBe('user-profile');
    });
  });

  describe('TurboRepo Structure', () => {
    it('should not rename packages folder', async () => {
      const projectPath = path.join(fixturesDir, 'turborepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      // Should find components inside packages but not try to rename packages itself
      const componentsInPackages = result.components.filter(c =>
        c.currentPath.includes('packages')
      );

      expect(componentsInPackages.length).toBeGreaterThan(0);

      // Verify packages folder name is preserved in paths
      componentsInPackages.forEach(component => {
        expect(component.currentPath).toContain('/packages/');
        expect(component.targetPath).toContain('/packages/');
      });
    });

    it('should not rename apps folder', async () => {
      const projectPath = path.join(fixturesDir, 'turborepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const componentsInApps = result.components.filter(c => c.currentPath.includes('apps'));

      expect(componentsInApps.length).toBeGreaterThan(0);

      componentsInApps.forEach(component => {
        expect(component.currentPath).toContain('/apps/');
        expect(component.targetPath).toContain('/apps/');
      });
    });

    it('should normalize component inside packages/ui/src', async () => {
      const projectPath = path.join(fixturesDir, 'turborepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const buttonComponent = result.components.find(
        c => c.currentPath.includes('packages/ui/src') && path.basename(c.currentPath) === 'Button'
      );

      expect(buttonComponent).toBeDefined();
      expect(buttonComponent?.needsRename).toBe(true);
      expect(path.basename(buttonComponent!.targetPath)).toBe('button');
    });

    it('should keep srv folder in packages/shared/components', async () => {
      const projectPath = path.join(fixturesDir, 'turborepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const srvComponent = result.components.find(
        c =>
          c.currentPath.includes('packages/shared/components') &&
          path.basename(c.currentPath) === 'srv'
      );

      expect(srvComponent).toBeDefined();
      expect(srvComponent?.needsRename).toBe(false);
      expect(path.basename(srvComponent!.targetPath)).toBe('srv');
    });

    it('should normalize Dashboard in apps/web/src', async () => {
      const projectPath = path.join(fixturesDir, 'turborepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const dashboardComponent = result.components.find(
        c => c.currentPath.includes('apps/web/src') && path.basename(c.currentPath) === 'Dashboard'
      );

      expect(dashboardComponent).toBeDefined();
      expect(dashboardComponent?.needsRename).toBe(true);
      expect(path.basename(dashboardComponent!.targetPath)).toBe('dashboard');
    });
  });

  describe('App Structure', () => {
    it('should not rename app folder itself', async () => {
      const projectPath = path.join(fixturesDir, 'app-structure');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const componentsInApp = result.components.filter(c => c.currentPath.includes('app/'));

      expect(componentsInApp.length).toBeGreaterThan(0);

      componentsInApp.forEach(component => {
        expect(component.currentPath).toContain('/app/');
        expect(component.targetPath).toContain('/app/');
      });
    });

    it('should keep srv folder in app/components', async () => {
      const projectPath = path.join(fixturesDir, 'app-structure');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const srvComponent = result.components.find(
        c => c.currentPath.includes('app/components') && path.basename(c.currentPath) === 'srv'
      );

      expect(srvComponent).toBeDefined();
      expect(srvComponent?.needsRename).toBe(false);
      expect(path.basename(srvComponent!.targetPath)).toBe('srv');
    });

    it('should normalize Header in app/components', async () => {
      const projectPath = path.join(fixturesDir, 'app-structure');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const headerComponent = result.components.find(
        c => c.currentPath.includes('app/components') && path.basename(c.currentPath) === 'Header'
      );

      expect(headerComponent).toBeDefined();
      expect(headerComponent?.needsRename).toBe(true);
      expect(path.basename(headerComponent!.targetPath)).toBe('header');
    });
  });

  describe('Nx Monorepo Structure', () => {
    it('should not rename libs folder', async () => {
      const projectPath = path.join(fixturesDir, 'nx-monorepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const componentsInLibs = result.components.filter(c => c.currentPath.includes('libs/'));

      expect(componentsInLibs.length).toBeGreaterThan(0);

      componentsInLibs.forEach(component => {
        expect(component.currentPath).toContain('/libs/');
        expect(component.targetPath).toContain('/libs/');
      });
    });

    it('should normalize Button in libs/ui/src/lib', async () => {
      const projectPath = path.join(fixturesDir, 'nx-monorepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const buttonComponent = result.components.find(
        c => c.currentPath.includes('libs/ui/src/lib') && path.basename(c.currentPath) === 'Button'
      );

      expect(buttonComponent).toBeDefined();
      expect(buttonComponent?.needsRename).toBe(true);
      expect(path.basename(buttonComponent!.targetPath)).toBe('button');
    });

    it('should normalize Header in apps/frontend/app/components', async () => {
      const projectPath = path.join(fixturesDir, 'nx-monorepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const headerComponent = result.components.find(
        c =>
          c.currentPath.includes('apps/frontend/app/components') &&
          path.basename(c.currentPath) === 'Header'
      );

      expect(headerComponent).toBeDefined();
      expect(headerComponent?.needsRename).toBe(true);
      expect(path.basename(headerComponent!.targetPath)).toBe('header');
    });

    it('should preserve app folder in apps/frontend/app path', async () => {
      const projectPath = path.join(fixturesDir, 'nx-monorepo');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      const componentsInAppFolder = result.components.filter(c =>
        c.currentPath.includes('apps/frontend/app/')
      );

      // app folder should be preserved in the path
      componentsInAppFolder.forEach(component => {
        expect(component.targetPath).toContain('/app/');
      });
    });
  });

  describe('NormalizeComponents - Monorepo Import Adjustment and Execution', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-monorepo-exec-'));
    });

    afterEach(async () => {
      await fs.remove(tempDir);
    });

    it('should execute directory rename in monorepo structure', async () => {
      const buttonDir = path.join(tempDir, 'packages', 'ui', 'src', 'UserProfile');
      await fs.ensureDir(buttonDir);
      await fs.writeFile(
        path.join(buttonDir, 'UserProfile.vue'),
        '<template><div>Profile</div></template>'
      );

      const options: NormalizeOptions = {
        path: tempDir,
        dryRun: false,
      };

      const result = await normalizeComponents(options);

      expect(result.success).toBe(true);
      expect(result.directoriesToRename).toBe(1);

      const newDir = path.join(tempDir, 'packages', 'ui', 'src', 'user-profile');
      const newExists = await fs.pathExists(newDir);
      expect(newExists).toBe(true);

      const vueExists = await fs.pathExists(path.join(newDir, 'UserProfile.vue'));
      expect(vueExists).toBe(true);
    });

    it('should adjust barrel import in monorepo component directory', async () => {
      const componentDir = path.join(tempDir, 'libs', 'ui', 'src', 'lib', 'user-profile');
      await fs.ensureDir(componentDir);
      await fs.writeFile(
        path.join(componentDir, 'userProfile.vue'),
        '<template><div>User</div></template>'
      );
      await fs.writeFile(
        path.join(componentDir, 'index.ts'),
        "export { default } from './userProfile.vue';\n"
      );

      const options: NormalizeOptions = {
        path: tempDir,
        dryRun: false,
      };

      const result = await normalizeComponents(options);

      expect(result.success).toBe(true);
      expect(result.importsToUpdate).toBeGreaterThan(0);

      const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
      expect(indexContent).toContain("'./UserProfile.vue'");
      expect(indexContent).not.toContain("'./userProfile.vue'");
    });

    it('should detect and report .ts component in monorepo structure', async () => {
      const componentDir = path.join(
        tempDir,
        'apps',
        'frontend',
        'components',
        'taskin-effect-hearts'
      );
      await fs.ensureDir(componentDir);
      await fs.writeFile(
        path.join(componentDir, 'taskin-effect-hearts.ts'),
        'export const hearts = () => {};'
      );
      await fs.writeFile(
        path.join(componentDir, 'index.ts'),
        "export * from './taskin-effect-hearts';\n"
      );

      const options: NormalizeOptions = {
        path: tempDir,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      expect(result.success).toBe(true);
      expect(result.components.length).toBeGreaterThan(0);

      const component = result.components[0];
      expect(component.componentName).toBe('TaskinEffectHearts');
      expect(result.importsToUpdate).toBeGreaterThan(0);
    });

    it('should report skipped directories in verbose dry-run on monorepo', async () => {
      const atomsDir = path.join(tempDir, 'packages', 'ui', 'src', 'atoms');
      await fs.ensureDir(atomsDir);
      await fs.writeFile(
        path.join(atomsDir, 'Button.vue'),
        '<template><div>Button</div></template>'
      );

      const options: NormalizeOptions = {
        path: tempDir,
        dryRun: true,
        verbose: true,
      };

      const result = await analyzeComponentStructure(options);

      expect(result.success).toBe(true);
      expect(result.components.length).toBe(0);
      expect(result.skippedDirectories.length).toBeGreaterThan(0);

      const atomsSkip = result.skippedDirectories.find(s => s.path.includes('atoms'));
      expect(atomsSkip).toBeDefined();
      expect(atomsSkip?.reason).toContain('Atomic Design');
    });

    it('should handle full pipeline in monorepo: rename + imports + .ts', async () => {
      const componentDir = path.join(tempDir, 'packages', 'design-system', 'src', 'my-component');
      await fs.ensureDir(componentDir);
      await fs.writeFile(
        path.join(componentDir, 'my-component.ts'),
        'export const comp = () => {};'
      );
      await fs.writeFile(path.join(componentDir, 'index.ts'), "export * from './my-component';\n");

      const options: NormalizeOptions = {
        path: tempDir,
        dryRun: false,
      };

      const result = await normalizeComponents(options);

      expect(result.success).toBe(true);
      expect(result.filesToRename).toBeGreaterThan(0);
      expect(result.importsToUpdate).toBeGreaterThan(0);

      const tsExists = await fs.pathExists(path.join(componentDir, 'MyComponent.ts'));
      expect(tsExists).toBe(true);

      const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
      expect(indexContent).toContain("'./MyComponent'");
      expect(indexContent).not.toContain("'./my-component'");
    });
  });
});

describe('NormalizeComponents - Import Adjustment', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-import-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should detect import that needs updating when file is renamed', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    expect(result.importsToUpdate).toBeGreaterThan(0);
    expect(result.importReferences.length).toBeGreaterThan(0);

    const importRef = result.importReferences[0];
    expect(importRef.filePath).toContain('index.ts');
    expect(importRef.currentImport).toContain('userProfile.vue');
    expect(importRef.newImport).toContain('UserProfile.vue');
  });

  it('should detect barrel export that needs updating when file is renamed', async () => {
    const componentDir = path.join(tempDir, 'taskin-effect-hearts');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'taskin-effect-hearts.vue'),
      '<template><div>hearts</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export * from './taskin-effect-hearts.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    const importRefs = result.importReferences.filter((r: ImportReference) =>
      r.filePath.includes('index.ts')
    );
    expect(importRefs.length).toBeGreaterThan(0);
    expect(importRefs[0].currentImport).toContain('taskin-effect-hearts');
    expect(importRefs[0].newImport).toContain('TaskinEffectHearts');
  });

  it('should detect multiple imports across sibling files', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './userProfile.vue';\n"
    );
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.stories.ts'),
      "import UserProfile from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    expect(result.importsToUpdate).toBeGreaterThanOrEqual(2);
    expect(result.importReferences.length).toBeGreaterThanOrEqual(2);
  });

  it('should not report imports when no files need renaming', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './UserProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    expect(result.importsToUpdate).toBe(0);
    expect(result.importReferences.length).toBe(0);
  });

  it('should update imports in files when normalizing', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./UserProfile.vue'");
    expect(indexContent).not.toContain("'./userProfile.vue'");

    const vueExists = await fs.pathExists(path.join(componentDir, 'UserProfile.vue'));
    expect(vueExists).toBe(true);
  });

  it('should update barrel export from kebab-case to PascalCase on normalize', async () => {
    const componentDir = path.join(tempDir, 'taskin-effect-hearts');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'taskin-effect-hearts.vue'),
      '<template><div>hearts</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './taskin-effect-hearts.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./TaskinEffectHearts.vue'");
    expect(indexContent).not.toContain("'./taskin-effect-hearts.vue'");

    const vueExists = await fs.pathExists(path.join(componentDir, 'TaskinEffectHearts.vue'));
    expect(vueExists).toBe(true);
  });

  it('should report imports in dry-run without modifying files', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(result.importsToUpdate).toBeGreaterThan(0);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./userProfile.vue'");
    expect(indexContent).not.toContain("'./UserProfile.vue'");

    const oldFileExists = await fs.pathExists(path.join(componentDir, 'userProfile.vue'));
    expect(oldFileExists).toBe(true);
  });
});

describe('NormalizeComponents - TS Component Detection (Phase 2)', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-ts-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should detect .ts component without .vue file', async () => {
    const componentDir = path.join(tempDir, 'taskin-effect-hearts');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'taskin-effect-hearts.ts'),
      'export const hearts = () => {};'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    expect(result.components.length).toBeGreaterThan(0);

    const component = result.components[0];
    expect(component.componentName).toBe('TaskinEffectHearts');
    expect(component.files.some(f => f.type === 'component')).toBe(true);
  });

  it('should detect .tsx component without .vue file', async () => {
    const componentDir = path.join(tempDir, 'render-function');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'render-function.tsx'),
      'export const render = () => <div/>;'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    expect(result.components.length).toBeGreaterThan(0);
  });

  it('should detect mixed .vue and .ts components in same project', async () => {
    const vueDir = path.join(tempDir, 'vue-component');
    await fs.ensureDir(vueDir);
    await fs.writeFile(
      path.join(vueDir, 'vue-component.vue'),
      '<template><div>Vue</div></template>'
    );

    const tsDir = path.join(tempDir, 'ts-component');
    await fs.ensureDir(tsDir);
    await fs.writeFile(path.join(tsDir, 'ts-component.ts'), 'export const comp = () => {};');

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    expect(result.components.length).toBe(2);
  });

  it('should rename .ts file from kebab-case to PascalCase and adjust barrel', async () => {
    const componentDir = path.join(tempDir, 'my-component');
    await fs.ensureDir(componentDir);
    await fs.writeFile(path.join(componentDir, 'my-component.ts'), 'export const comp = () => {};');
    await fs.writeFile(path.join(componentDir, 'index.ts'), "export * from './my-component';\n");

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);

    const tsExists = await fs.pathExists(path.join(componentDir, 'MyComponent.ts'));
    expect(tsExists).toBe(true);

    const oldExists = await fs.pathExists(path.join(componentDir, 'my-component.ts'));
    expect(oldExists).toBe(false);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./MyComponent'");
    expect(indexContent).not.toContain("'./my-component'");
  });

  it('should not treat Atomic Design level as component directory', async () => {
    const moleculesDir = path.join(tempDir, 'molecules');
    await fs.ensureDir(moleculesDir);
    await fs.writeFile(
      path.join(moleculesDir, 'SomeComponent.vue'),
      '<template><div>Test</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    const moleculesComponent = result.components.find(
      c => path.basename(c.currentPath) === 'molecules'
    );
    expect(moleculesComponent).toBeUndefined();
  });

  it('should not exclude non-atomic directory names', async () => {
    const componentDir = path.join(tempDir, 'user-area');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'UserArea.vue'),
      '<template><div>User Area</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    const userAreaComponent = result.components.find(
      c => path.basename(c.currentPath) === 'user-area'
    );
    expect(userAreaComponent).toBeDefined();
  });

  it('should detect atomic level with properly nested component subdirectories', async () => {
    const atomsDir = path.join(tempDir, 'atoms');
    await fs.ensureDir(atomsDir);
    const buttonDir = path.join(atomsDir, 'Button');
    await fs.ensureDir(buttonDir);
    await fs.writeFile(
      path.join(buttonDir, 'Button.vue'),
      '<template><div>Button</div></template>'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.components.length).toBe(1);
    expect(result.components[0].componentName).toBe('Button');

    const atomsAsComponent = result.components.find(c => path.basename(c.currentPath) === 'atoms');
    expect(atomsAsComponent).toBeUndefined();
  });

  it('should handle atomic level with uppercase name', async () => {
    const atomsDir = path.join(tempDir, 'Atoms');
    await fs.ensureDir(atomsDir);
    await fs.writeFile(path.join(atomsDir, 'Button.vue'), '<template><div>Button</div></template>');

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    const atomsComponent = result.components.find(c => path.basename(c.currentPath) === 'Atoms');
    expect(atomsComponent).toBeUndefined();
  });
});

describe('NormalizeComponents - Edge Cases', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-edge-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should detect and update import without file extension', async () => {
    const componentDir = path.join(tempDir, 'my-component');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'my-component.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './my-component';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./MyComponent'");
  });

  it('should detect and update double-quoted import', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      'export { default } from "./userProfile.vue";\n'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain('"./UserProfile.vue"');
    expect(indexContent).not.toContain('"./userProfile.vue"');
  });

  it('should detect import type syntax', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'user-profile.types.ts'),
      'export interface UserProfileProps { name: string }'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "import type { UserProfileProps } from './user-profile.types';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);

    const importRefs = result.importReferences.filter(r => r.filePath.includes('index.ts'));
    expect(importRefs.length).toBeGreaterThan(0);
    expect(importRefs[0].currentImport).toContain('user-profile.types');
    expect(importRefs[0].newImport).toContain('UserProfile.types');
  });

  it('should detect named re-exports', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default as UserProfileComponent } from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./UserProfile.vue'");
    expect(indexContent).toContain('default as UserProfileComponent');
  });

  it('should handle full pipeline: camelCase file in kebab-case dir with barrel', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './userProfile.vue';\n"
    );
    await fs.writeFile(
      path.join(componentDir, 'UserProfile.stories.ts'),
      "import UserProfile from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(result.filesToRename).toBeGreaterThanOrEqual(1);
    expect(result.importsToUpdate).toBeGreaterThanOrEqual(2);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./UserProfile.vue'");

    const storiesContent = await fs.readFile(
      path.join(componentDir, 'UserProfile.stories.ts'),
      'utf-8'
    );
    expect(storiesContent).toContain("'./UserProfile.vue'");

    const vueExists = await fs.pathExists(path.join(componentDir, 'UserProfile.vue'));
    expect(vueExists).toBe(true);
  });

  it('should categorize .mocks.ts (plural) as mock type', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'user-profile.mocks.ts'),
      'export const mocks = [];'
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: true,
    };

    const result = await analyzeComponentStructure(options);

    expect(result.success).toBe(true);
    const component = result.components[0];
    const mockFile = component.files.find(f => f.currentPath.includes('.mocks.'));
    expect(mockFile).toBeDefined();
    expect(mockFile?.type).toBe('mock');
    expect(mockFile?.targetPath).toContain('UserProfile.mocks.ts');
  });

  it('should handle special regex characters in component name', async () => {
    const componentDir = path.join(tempDir, 'my-component');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'my+component.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './my+component.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(result.importsToUpdate).toBeGreaterThan(0);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./My+component.vue'");
  });

  it('should handle cross-referencing files both being renamed', async () => {
    const componentDir = path.join(tempDir, 'user-profile');
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, 'userProfile.vue'),
      '<template><div>Test</div></template>'
    );
    await fs.writeFile(
      path.join(componentDir, 'index.ts'),
      "export { default } from './userProfile.vue';\n"
    );
    await fs.writeFile(
      path.join(componentDir, 'userProfile.stories.ts'),
      "import UserProfile from './userProfile.vue';\n"
    );

    const options: NormalizeOptions = {
      path: tempDir,
      dryRun: false,
    };

    const result = await normalizeComponents(options);

    expect(result.success).toBe(true);
    expect(result.importsToUpdate).toBeGreaterThanOrEqual(2);

    const indexContent = await fs.readFile(path.join(componentDir, 'index.ts'), 'utf-8');
    expect(indexContent).toContain("'./UserProfile.vue'");

    const storiesPath = path.join(componentDir, 'UserProfile.stories.ts');
    const storiesExists = await fs.pathExists(storiesPath);
    expect(storiesExists).toBe(true);

    const storiesContent = await fs.readFile(storiesPath, 'utf-8');
    expect(storiesContent).toContain("'./UserProfile.vue'");
  });
});

describe('NormalizeComponents - Git History Preservation', () => {
  let repoDir: string;

  beforeEach(async () => {
    repoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-git-history-'));
    await execAsync('git init -q', { cwd: repoDir });
    await execAsync('git config user.email test@storytype.dev', {
      cwd: repoDir,
    });
    await execAsync('git config user.name "Storytype Test"', { cwd: repoDir });
    await execAsync('git config commit.gpgsign false', { cwd: repoDir });
  });

  afterEach(async () => {
    await fs.remove(repoDir);
  });

  async function commitAll(message: string): Promise<void> {
    await execAsync('git add -A', { cwd: repoDir });
    await execAsync(`git commit -q -m "${message}"`, { cwd: repoDir });
  }

  /** Assuntos dos commits alcançáveis a partir do arquivo, seguindo renomeações. */
  async function historyOf(relativePath: string): Promise<string[]> {
    const { stdout } = await execAsync(`git log --follow --format=%s -- "${relativePath}"`, {
      cwd: repoDir,
    });
    return stdout.trim().split('\n').filter(Boolean);
  }

  /** Cria um componente versionado com dois commits de historico. */
  async function seedTrackedComponent(dirName: string): Promise<string> {
    const componentDir = path.join(repoDir, 'components', 'atomos', dirName);
    await fs.ensureDir(componentDir);
    const vuePath = path.join(componentDir, `${dirName}.vue`);

    await fs.writeFile(vuePath, '<template><div>v1</div></template>');
    await commitAll('c1: cria componente');

    await fs.writeFile(vuePath, '<template><div>v2</div></template>');
    await commitAll('c2: altera componente');

    return componentDir;
  }

  async function runNormalize(): Promise<void> {
    const options: NormalizeOptions = {
      path: path.join(repoDir, 'components'),
      dryRun: false,
      dirsOnly: false,
      filesOnly: false,
      verbose: false,
    };
    const result = await normalizeComponents(options);
    expect(result.success).toBe(true);
  }

  it('should stage the move as a rename in the Git index', async () => {
    // Esta e a garantia mais forte: o indice do Git precisa enxergar uma
    // renomeacao (R), nao um delete seguido de um add sem relacao. E o que
    // `gitMoveManual` reconcilia com `git rm --cached` + `git add`.
    await seedTrackedComponent('UserProfile');

    await runNormalize();

    const { stdout } = await execAsync('git status --porcelain', {
      cwd: repoDir,
    });
    const renameEntry = stdout.split('\n').find(line => line.startsWith('R'));

    expect(renameEntry).toBeDefined();
    expect(renameEntry).toContain('UserProfile/UserProfile.vue');
    expect(renameEntry).toContain('user-profile/UserProfile.vue');
  });

  it('should keep history reachable after a directory rename', async () => {
    await seedTrackedComponent('UserProfile');

    await runNormalize();
    await commitAll('normalize: UserProfile -> user-profile');

    const history = await historyOf('components/atomos/user-profile/UserProfile.vue');

    expect(history).toContain('c1: cria componente');
    expect(history).toContain('c2: altera componente');
  });

  it('should keep history reachable after a case-only rename', async () => {
    // Caminho mais arriscado: em filesystem case-insensitive (macOS) a
    // renomeacao passa por um arquivo temporario em dois passos.
    await seedTrackedComponent('Botao');

    await runNormalize();
    await commitAll('normalize: Botao -> botao');

    const history = await historyOf('components/atomos/botao/Botao.vue');

    expect(history).toContain('c1: cria componente');
    expect(history).toContain('c2: altera componente');
  });

  it('should record the change as a rename in the commit itself', async () => {
    // Complementa o teste do indice: garante que o commit gravado tem status
    // R, e nao A+D. Se cair para add+delete o `--follow` ainda pode funcionar
    // por similaridade, mas ferramentas que leem o diff cru perdem o vinculo.
    await seedTrackedComponent('UserProfile');

    await runNormalize();
    await commitAll('normalize: UserProfile -> user-profile');

    const { stdout } = await execAsync('git show --name-status --find-renames --format= HEAD', {
      cwd: repoDir,
    });

    expect(stdout).toMatch(/^R\d*\s/m);
    expect(stdout).toContain('user-profile/UserProfile.vue');
  });
});
