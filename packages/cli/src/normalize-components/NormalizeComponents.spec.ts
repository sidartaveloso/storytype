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
      verbose: false,
    };

    const result = await analyzeComponentStructure(options);

    const component = result.components.find((c: ComponentDirectory) =>
      c.currentPath.includes('UserProfile')
    );
    expect(component).toBeDefined();
    expect(component?.action).toBe('rename');
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
      verbose: false,
    };

    const result = await analyzeComponentStructure(options);

    const component = result.components.find((c: ComponentDirectory) =>
      c.currentPath.includes('user-profile')
    );
    expect(component?.action).not.toBe('rename');
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
    expect(analysis.components[0].action).toBe('rename');
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
      const srvDir = path.join(projectPath, 'srv');

      const options: NormalizeOptions = {
        path: projectPath,
        dryRun: true,
      };

      const result = await analyzeComponentStructure(options);

      // srv/ holds two components, so it is a container: the folder keeps its
      // name — it is never widened to `server/` by a file inside it — and each
      // component gets a folder of its own within it
      const srvComponents = result.components.filter(c => c.currentPath === srvDir);

      expect(srvComponents.map(c => c.componentName)).toEqual(['Server', 'Service']);
      expect(srvComponents.every(c => c.action === 'promote')).toBe(true);
      expect(srvComponents.map(c => c.targetPath)).toEqual([
        path.join(srvDir, 'server'),
        path.join(srvDir, 'service'),
      ]);
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
        expect(srvComponent?.action).toBe('rename');
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
      expect(profileComponent?.action).toBe('rename');
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
      expect(buttonComponent?.action).toBe('rename');
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
      expect(srvComponent?.action).not.toBe('rename');
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
      expect(dashboardComponent?.action).toBe('rename');
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
      expect(srvComponent?.action).not.toBe('rename');
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
      expect(headerComponent?.action).toBe('rename');
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
      expect(buttonComponent?.action).toBe('rename');
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
      expect(headerComponent?.action).toBe('rename');
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

    it('should promote a loose component in an atomic level on monorepo', async () => {
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
      expect(result.components.length).toBe(1);
      expect(result.skippedDirectories.length).toBe(0);

      const button = result.components[0];
      expect(button.componentName).toBe('Button');
      expect(button.action).toBe('promote');
      expect(button.action).not.toBe('rename');
      expect(button.currentPath).toBe(atomsDir);
      expect(button.targetPath).toBe(path.join(atomsDir, 'button'));
      expect(result.componentsToPromote).toBe(1);
    });

    it('should skip promotion when the target folder already exists', async () => {
      const atomsDir = path.join(tempDir, 'packages', 'ui', 'src', 'atoms');
      await fs.ensureDir(path.join(atomsDir, 'button'));
      await fs.writeFile(
        path.join(atomsDir, 'Button.vue'),
        '<template><div>Loose</div></template>'
      );
      await fs.writeFile(
        path.join(atomsDir, 'button', 'Button.vue'),
        '<template><div>Nested</div></template>'
      );

      const options: NormalizeOptions = {
        path: tempDir,
        dryRun: true,
        verbose: true,
      };

      const result = await analyzeComponentStructure(options);

      expect(result.success).toBe(true);
      expect(result.componentsToPromote).toBe(0);

      const skip = result.skippedDirectories.find(s => s.path === atomsDir);
      expect(skip).toBeDefined();
      expect(skip?.reason).toContain('já existe');
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

    // The level itself is never renamed; its loose files get promoted instead
    const renamedLevel = result.components.find(c => c.action === 'rename');
    expect(renamedLevel).toBeUndefined();

    const someComponent = result.components.find(c => c.componentName === 'SomeComponent');
    expect(someComponent?.action).toBe('promote');
    expect(someComponent?.targetPath).toBe(path.join(moleculesDir, 'some-component'));
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

    // `Atoms/` is recognized as a level despite the casing, so it is not
    // renamed to a component name — the loose Button is promoted inside it
    const renamedLevel = result.components.find(c => c.action === 'rename');
    expect(renamedLevel).toBeUndefined();

    const button = result.components.find(c => c.componentName === 'Button');
    expect(button?.action).toBe('promote');
    expect(button?.targetPath).toBe(path.join(atomsDir, 'button'));
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

describe('NormalizeComponents - Promotion of loose components', () => {
  let tempDir: string;
  let atomsDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-promote-test-'));
    atomsDir = path.join(tempDir, 'atoms');
    await fs.ensureDir(atomsDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('moves a loose component into its own folder with the conventional files', async () => {
    await fs.writeFile(
      path.join(atomsDir, 'ProgressBar.vue'),
      '<template><div>ProgressBar</div></template>'
    );
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.stories.ts'), 'export default {};');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(result.componentsToPromote).toBe(1);

    const progressBarDir = path.join(atomsDir, 'progress-bar');
    expect(await fs.pathExists(path.join(progressBarDir, 'ProgressBar.vue'))).toBe(true);
    expect(await fs.pathExists(path.join(progressBarDir, 'ProgressBar.stories.ts'))).toBe(true);

    // The files the component was missing are created in the new folder
    expect(await fs.pathExists(path.join(progressBarDir, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(progressBarDir, 'ProgressBar.types.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(progressBarDir, 'ProgressBar.spec.ts'))).toBe(true);

    // Nothing is left behind in the level
    expect(await fs.pathExists(path.join(atomsDir, 'ProgressBar.vue'))).toBe(false);
    expect(await fs.pathExists(path.join(atomsDir, 'ProgressBar.stories.ts'))).toBe(false);
  });

  it('rewrites the level barrel to point at the new folder', async () => {
    await fs.writeFile(path.join(atomsDir, 'Avatar.vue'), '<template><div>Avatar</div></template>');
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template><div>Badge</div></template>');
    await fs.writeFile(
      path.join(atomsDir, 'index.ts'),
      "export { default as Avatar } from './Avatar.vue';\n" +
        "export { default as Badge } from './Badge.vue';\n"
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(result.componentsToPromote).toBe(2);

    const barrel = await fs.readFile(path.join(atomsDir, 'index.ts'), 'utf-8');
    expect(barrel).toContain("from './avatar/Avatar.vue'");
    expect(barrel).toContain("from './badge/Badge.vue'");
    expect(barrel).not.toContain("from './Avatar.vue'");
    expect(barrel).not.toContain("from './Badge.vue'");
  });

  it('rewrites a sibling that imported the promoted one, following both moves', async () => {
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template><div>Badge</div></template>');
    await fs.writeFile(
      path.join(atomsDir, 'TaskHeader.vue'),
      '<script setup lang="ts">\nimport Badge from \'./Badge.vue\';\n</script>\n'
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    // Both components moved into folders of their own, so the import has to
    // climb out of task-header/ and back down into badge/
    const taskHeader = await fs.readFile(
      path.join(atomsDir, 'task-header', 'TaskHeader.vue'),
      'utf-8'
    );
    expect(taskHeader).toContain("from '../badge/Badge.vue'");
  });

  it('rewrites an importer that stays put when only the target moves', async () => {
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template><div>Badge</div></template>');
    await fs.ensureDir(path.join(atomsDir, 'task-header'));
    await fs.writeFile(
      path.join(atomsDir, 'task-header', 'TaskHeader.vue'),
      '<script setup lang="ts">\nimport Badge from \'../Badge.vue\';\n</script>\n'
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const taskHeader = await fs.readFile(
      path.join(atomsDir, 'task-header', 'TaskHeader.vue'),
      'utf-8'
    );
    expect(taskHeader).toContain("from '../badge/Badge.vue'");
  });

  it('keeps imports among the promoted component own files untouched', async () => {
    await fs.writeFile(
      path.join(atomsDir, 'Avatar.vue'),
      '<script setup lang="ts">\nimport type { AvatarProps } from \'./Avatar.types\';\n</script>\n'
    );
    await fs.writeFile(path.join(atomsDir, 'Avatar.types.ts'), 'export interface AvatarProps {}');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const avatarDir = path.join(atomsDir, 'avatar');
    const avatar = await fs.readFile(path.join(avatarDir, 'Avatar.vue'), 'utf-8');
    expect(avatar).toContain("from './Avatar.types'");
    expect(avatar).not.toContain('avatar/Avatar.types');
  });

  it('PascalCases a loose component while promoting it', async () => {
    await fs.writeFile(
      path.join(atomsDir, 'progressBar.vue'),
      '<template><div>ProgressBar</div></template>'
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'progress-bar', 'ProgressBar.vue'))).toBe(true);
  });

  it('does not recognize an existing .test.ts as missing', async () => {
    await fs.writeFile(path.join(atomsDir, 'Avatar.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'Avatar.test.ts'), 'export {};');

    const result = await analyzeComponentStructure({ path: tempDir, dryRun: true });

    const avatar = result.components.find(c => c.componentName === 'Avatar');
    expect(avatar?.missingFiles).not.toContain('Avatar.spec.ts');
    expect(avatar?.missingFiles).toContain('index.ts');
  });

  it('leaves an orphan story with no component behind in the level', async () => {
    await fs.writeFile(path.join(atomsDir, 'Avatar.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'EffectsOverview.stories.ts'), 'export default {};');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'EffectsOverview.stories.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'avatar', 'Avatar.vue'))).toBe(true);
  });

  it('deepens the promoted component own outward imports', async () => {
    // Promotion pushes the component one level down, so imports of files that
    // never move still need another `../`
    await fs.ensureDir(path.join(tempDir, 'types'));
    await fs.writeFile(path.join(tempDir, 'types', 'index.ts'), 'export type User = {};');
    await fs.ensureDir(path.join(tempDir, 'styles'));
    await fs.writeFile(path.join(tempDir, 'styles', 'variables.css'), ':root {}');

    // atoms/ sits directly under tempDir, so the shared folders are one hop up
    await fs.writeFile(
      path.join(atomsDir, 'Avatar.vue'),
      '<script setup lang="ts">\n' +
        "import type { User } from '../types';\n" +
        '</script>\n' +
        "<style>@import '../styles/variables.css';</style>\n"
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const avatar = await fs.readFile(path.join(atomsDir, 'avatar', 'Avatar.vue'), 'utf-8');
    expect(avatar).toContain("from '../../types'");
    expect(avatar).toContain("'../../styles/variables.css'");
  });

  it('keeps a directory import pointed at the directory', async () => {
    const moleculesDir = path.join(tempDir, 'molecules');
    await fs.ensureDir(moleculesDir);
    await fs.writeFile(path.join(atomsDir, 'index.ts'), 'export const atoms = 1;');
    await fs.writeFile(
      path.join(moleculesDir, 'TaskHeader.vue'),
      '<script setup lang="ts">\nimport { atoms } from \'../atoms\';\n</script>\n'
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const taskHeader = await fs.readFile(
      path.join(moleculesDir, 'task-header', 'TaskHeader.vue'),
      'utf-8'
    );
    expect(taskHeader).toContain("from '../../atoms'");
  });

  it('preserves a bundler query suffix on a specifier', async () => {
    await fs.writeFile(path.join(atomsDir, 'icon.svg'), '<svg />');
    await fs.writeFile(
      path.join(atomsDir, 'Avatar.vue'),
      '<script setup lang="ts">\nimport raw from \'./icon.svg?raw\';\n</script>\n'
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    // The svg is not a component file, so it stays in the level
    const avatar = await fs.readFile(path.join(atomsDir, 'avatar', 'Avatar.vue'), 'utf-8');
    expect(avatar).toContain("from '../icon.svg?raw'");
  });

  it('leaves an import alone when neither end moves', async () => {
    const buttonDir = path.join(atomsDir, 'button');
    await fs.ensureDir(buttonDir);
    await fs.writeFile(
      path.join(buttonDir, 'Button.vue'),
      '<script setup lang="ts">\nimport type { ButtonProps } from \'./Button.types\';\n</script>\n'
    );
    await fs.writeFile(path.join(buttonDir, 'Button.types.ts'), 'export interface ButtonProps {}');
    await fs.writeFile(path.join(buttonDir, 'Button.spec.ts'), 'export {};');
    await fs.writeFile(path.join(buttonDir, 'index.ts'), "export { default } from './Button.vue';");

    const result = await normalizeComponents({ path: tempDir, dryRun: true });

    expect(result.importsToUpdate).toBe(0);
    expect(result.filesToRename).toBe(0);
    expect(result.componentsToPromote).toBe(0);
  });

  it('breaks a container folder into one folder per component', async () => {
    // The real organisms/taskin/ shape: several components sharing a folder,
    // one of which the folder is named after, plus files that belong to none
    const taskinDir = path.join(tempDir, 'organisms', 'taskin');
    await fs.ensureDir(taskinDir);
    await fs.writeFile(
      path.join(taskinDir, 'Taskin.ts'),
      "import { control } from './Taskin.controller';\nexport default control;\n"
    );
    await fs.writeFile(path.join(taskinDir, 'Taskin.types.ts'), 'export interface Taskin {}');
    await fs.writeFile(path.join(taskinDir, 'Taskin.controller.ts'), 'export const control = 1;');
    await fs.writeFile(path.join(taskinDir, 'TaskinWithShhh.vue'), '<template />');
    await fs.writeFile(path.join(taskinDir, 'TaskinWithShhh.spec.ts'), 'export {};');
    await fs.writeFile(
      path.join(taskinDir, 'index.ts'),
      "export { default as Taskin } from './Taskin';\n" +
        "export * from './Taskin.controller';\n" +
        "export * from './Taskin.types';\n" +
        "export { default as TaskinWithShhh } from './TaskinWithShhh.vue';\n"
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(result.componentsToPromote).toBe(2);

    // Each component now owns a folder, the one naming the container included
    expect(await fs.pathExists(path.join(taskinDir, 'taskin', 'Taskin.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(taskinDir, 'taskin', 'Taskin.types.ts'))).toBe(true);
    expect(
      await fs.pathExists(path.join(taskinDir, 'taskin-with-shhh', 'TaskinWithShhh.vue'))
    ).toBe(true);

    // `.controller` is a component suffix, so it travels with its component
    expect(await fs.pathExists(path.join(taskinDir, 'taskin', 'Taskin.controller.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(taskinDir, 'Taskin.controller.ts'))).toBe(false);

    // Files belonging to no component stay in the container
    expect(await fs.pathExists(path.join(taskinDir, 'index.ts'))).toBe(true);

    // The container barrel keeps exporting the same names, through the new folders
    const barrel = await fs.readFile(path.join(taskinDir, 'index.ts'), 'utf-8');
    expect(barrel).toContain("from './taskin/Taskin'");
    expect(barrel).toContain("from './taskin/Taskin.types'");
    expect(barrel).toContain("from './taskin/Taskin.controller'");
    expect(barrel).toContain("from './taskin-with-shhh/TaskinWithShhh.vue'");

    // The controller moved alongside its component, so that import is untouched
    const taskin = await fs.readFile(path.join(taskinDir, 'taskin', 'Taskin.ts'), 'utf-8');
    expect(taskin).toContain("from './Taskin.controller'");
  });

  it('treats a controller as part of its component, never as a component', async () => {
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'Badge.controller.ts'), 'export const c = 1;');
    // A controller with no component of its own is left alone entirely
    await fs.writeFile(path.join(atomsDir, 'Orphan.controller.ts'), 'export const o = 1;');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(result.componentsToPromote).toBe(1);

    expect(await fs.pathExists(path.join(atomsDir, 'badge', 'Badge.controller.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'Orphan.controller.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'orphan'))).toBe(false);
  });

  it('PascalCases a controller along with its component', async () => {
    await fs.writeFile(path.join(atomsDir, 'badge.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'badge.controller.ts'), 'export const c = 1;');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'badge', 'Badge.vue'))).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'badge', 'Badge.controller.ts'))).toBe(true);
  });

  it('is idempotent on a container it already split', async () => {
    const taskinDir = path.join(tempDir, 'organisms', 'taskin');
    await fs.ensureDir(taskinDir);
    await fs.writeFile(path.join(taskinDir, 'Taskin.ts'), 'export default {};');
    await fs.writeFile(path.join(taskinDir, 'TaskinWithShhh.vue'), '<template />');

    await normalizeComponents({ path: tempDir, dryRun: false });
    const second = await normalizeComponents({ path: tempDir, dryRun: true });

    expect(second.componentsToPromote).toBe(0);
    expect(second.filesToRename).toBe(0);
    expect(second.filesToCreate).toBe(0);
    expect(second.importsToUpdate).toBe(0);
  });

  it('generates a barrel that imports a .ts entry without an extension', async () => {
    await fs.writeFile(path.join(atomsDir, 'Badge.ts'), 'export default {};');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const badgeDir = path.join(atomsDir, 'badge');
    const barrel = await fs.readFile(path.join(badgeDir, 'index.ts'), 'utf-8');
    expect(barrel).toContain("export { default } from './Badge';");
    expect(barrel).not.toContain('Badge.vue');

    const spec = await fs.readFile(path.join(badgeDir, 'Badge.spec.ts'), 'utf-8');
    expect(spec).toContain("from './Badge';");
    expect(spec).not.toContain('Badge.vue');
  });

  it('generates a barrel that imports a .vue entry with its extension', async () => {
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template />');

    await normalizeComponents({ path: tempDir, dryRun: false });

    const barrel = await fs.readFile(path.join(atomsDir, 'badge', 'index.ts'), 'utf-8');
    expect(barrel).toContain("export { default } from './Badge.vue';");
  });

  it('rewrites a deep import from outside the component tree', async () => {
    // A package entry point reaching past the level barrel straight into a
    // component file — nowhere near the component that moves
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'Badge.types.ts'), 'export interface BadgeProps {}');
    await fs.writeFile(
      path.join(tempDir, 'index.ts'),
      "export { default as Badge } from './atoms/Badge.vue';\n" +
        "export * from './atoms/Badge.types';\n"
    );

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const entry = await fs.readFile(path.join(tempDir, 'index.ts'), 'utf-8');
    expect(entry).toContain("from './atoms/badge/Badge.vue'");
    expect(entry).toContain("from './atoms/badge/Badge.types'");
  });

  it('completes a component with the canonical files, and only those', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const dir = path.join(atomsDir, 'progress-bar');
    expect((await fs.readdir(dir)).sort()).toEqual([
      'ProgressBar.spec.ts',
      'ProgressBar.types.ts',
      'ProgressBar.vue',
      'index.ts',
    ]);

    // A story and a mock are the person's to write, so normalize leaves them out
    expect(await fs.pathExists(path.join(dir, 'ProgressBar.stories.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(dir, 'ProgressBar.mock.ts'))).toBe(false);
  });

  it('renders the completed files from the shared templates', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');

    await normalizeComponents({ path: tempDir, dryRun: false });

    const dir = path.join(atomsDir, 'progress-bar');

    // The barrel exports only what exists: no mock, no stories
    const barrel = await fs.readFile(path.join(dir, 'index.ts'), 'utf-8');
    expect(barrel).toContain("export * from './ProgressBar.types'");
    expect(barrel).toContain("export { default } from './ProgressBar.vue'");
    expect(barrel).not.toContain('.mock');
    expect(barrel).not.toContain('.stories');

    // The generated spec mounts a .vue component and does not reach for a mock
    const spec = await fs.readFile(path.join(dir, 'ProgressBar.spec.ts'), 'utf-8');
    expect(spec).toContain("import { mount } from '@vue/test-utils'");
    expect(spec).toContain('mount(ProgressBar)');
    expect(spec).not.toContain('generateMockData');
  });

  it('exports an existing mock and story from a barrel it creates', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.mock.ts'), 'export const m = 1;');
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.stories.ts'), 'export default {};');

    await normalizeComponents({ path: tempDir, dryRun: false });

    const barrel = await fs.readFile(path.join(atomsDir, 'progress-bar', 'index.ts'), 'utf-8');
    expect(barrel).toContain("export * from './ProgressBar.mock'");
    expect(barrel).toContain("export * as Stories from './ProgressBar.stories'");
  });

  it('completes a .ts component without assuming Vue', async () => {
    const dir = path.join(tempDir, 'organisms', 'taskin');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'Taskin.ts'), 'export default {};');

    const result = await normalizeComponents({ path: tempDir, dryRun: false });

    expect(result.success).toBe(true);

    const barrel = await fs.readFile(path.join(dir, 'index.ts'), 'utf-8');
    expect(barrel).toContain("export { default } from './Taskin'");
    expect(barrel).not.toContain('Taskin.vue');

    const spec = await fs.readFile(path.join(dir, 'Taskin.spec.ts'), 'utf-8');
    expect(spec).not.toContain('@vue/test-utils');
    expect(spec).toContain('expect(Taskin).toBeDefined()');
  });

  it('reports one action per component, never two', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');
    const renamed = path.join(tempDir, 'organisms', 'TaskCard');
    await fs.ensureDir(renamed);
    await fs.writeFile(path.join(renamed, 'TaskCard.vue'), '<template />');

    const result = await analyzeComponentStructure({ path: tempDir, dryRun: true });

    const actions = result.components.map(c => c.action).sort();
    expect(actions).toEqual(['promote', 'rename']);
  });

  it('scope dirs moves the folder without creating files', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');

    const result = await normalizeComponents({ path: tempDir, dryRun: false, scope: 'dirs' });

    expect(result.success).toBe(true);
    expect(result.filesToCreate).toBe(0);
    expect(await fs.pathExists(path.join(atomsDir, 'progress-bar', 'ProgressBar.vue'))).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'progress-bar', 'index.ts'))).toBe(false);
  });

  it('scope files renames in place without moving the folder', async () => {
    await fs.writeFile(path.join(atomsDir, 'progressBar.vue'), '<template />');

    const result = await normalizeComponents({ path: tempDir, dryRun: false, scope: 'files' });

    expect(result.success).toBe(true);
    expect(result.componentsToPromote).toBe(0);
    expect(await fs.pathExists(path.join(atomsDir, 'ProgressBar.vue'))).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'progress-bar'))).toBe(false);
  });

  it('carries a message on every failure', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');
    // Read-only, so creating the component folder inside it fails
    await fs.chmod(atomsDir, 0o500);

    try {
      const result = await normalizeComponents({ path: tempDir, dryRun: false });

      expect(result.success).toBe(false);
      if (result.success) return;

      // The union guarantees a string here, not string | undefined
      expect(result.error).toBeTypeOf('string');
      expect(result.error.length).toBeGreaterThan(0);
      // And the plan is still there, so the caller sees what was attempted
      expect(result.components).toHaveLength(1);
    } finally {
      await fs.chmod(atomsDir, 0o700);
    }
  });

  it('reports an empty plan for a path with nothing in it', async () => {
    const result = await analyzeComponentStructure({ path: path.join(tempDir, 'vazio') });

    expect(result.success).toBe(true);
    expect(result.components).toEqual([]);
  });

  it('changes nothing in dry-run', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');

    const result = await normalizeComponents({ path: tempDir, dryRun: true });

    expect(result.componentsToPromote).toBe(1);
    expect(await fs.pathExists(path.join(atomsDir, 'progress-bar'))).toBe(false);
    expect(await fs.pathExists(path.join(atomsDir, 'ProgressBar.vue'))).toBe(true);
  });

  it('skips promotion under --files-only', async () => {
    await fs.writeFile(path.join(atomsDir, 'progressBar.vue'), '<template />');

    const result = await normalizeComponents({ path: tempDir, dryRun: false, scope: 'files' });

    expect(result.success).toBe(true);
    expect(await fs.pathExists(path.join(atomsDir, 'progress-bar'))).toBe(false);
    // The file is still PascalCased in place
    expect(await fs.pathExists(path.join(atomsDir, 'ProgressBar.vue'))).toBe(true);
  });

  it('promotes without creating files under --dirs-only', async () => {
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');

    const result = await normalizeComponents({ path: tempDir, dryRun: false, scope: 'dirs' });

    expect(result.success).toBe(true);

    const progressBarDir = path.join(atomsDir, 'progress-bar');
    expect(await fs.pathExists(path.join(progressBarDir, 'ProgressBar.vue'))).toBe(true);
    expect(await fs.pathExists(path.join(progressBarDir, 'index.ts'))).toBe(false);
  });
});
