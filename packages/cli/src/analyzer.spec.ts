/**
 * Tests for analyzer naming validation and TypeScript detection
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { analyzeProject } from './analyzer.js';

describe('Analyzer - Naming Validation', () => {
  /**
   * Helper to extract base component name (matches analyzer.ts logic exactly)
   */
  function getComponentBaseName(file: string): string {
    const fileName = path.basename(file);
    // Remove .types.ts, .stories.ts, .spec.ts, .test.ts, etc.
    return fileName
      .replace(/\.(types|stories|story|spec|test)\.(ts|tsx|js|jsx)$/, '')
      .replace(/\.(ts|tsx|js|jsx|vue)$/, '');
  }

  /**
   * Helper to check if component name needs fixing (matches analyzer.ts logic exactly)
   */
  function checkComponentName(filePath: string): {
    needsFix: boolean;
    oldName: string;
    newName: string;
    baseName: string;
    isPascalCase: boolean;
  } {
    const oldName = path.basename(filePath);
    const baseName = getComponentBaseName(filePath);

    // index.ts é uma convenção legítima para arquivos de exportação
    if (baseName === 'index') {
      return {
        needsFix: false,
        oldName,
        newName: oldName,
        baseName,
        isPascalCase: true,
      };
    }

    // Check if PascalCase
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(baseName);

    if (isPascalCase) {
      return {
        needsFix: false,
        oldName,
        newName: oldName,
        baseName,
        isPascalCase: true,
      };
    }

    // Convert to PascalCase
    const pascalName = baseName
      .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (_, c: string) => c.toUpperCase());

    // Reconstruct the full filename with same suffixes
    const suffix = oldName.replace(
      new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      ''
    );
    const newName = `${pascalName}${suffix}`;

    return {
      needsFix: oldName !== newName,
      oldName,
      newName,
      baseName,
      isPascalCase: false,
    };
  }

  describe('PascalCase components', () => {
    it('should accept DialogoConfirmarAcao.types.ts as valid', () => {
      const result = checkComponentName('src/components/DialogoConfirmarAcao.types.ts');
      expect(result.baseName).toBe('DialogoConfirmarAcao');
      expect(result.isPascalCase).toBe(true);
      expect(result.needsFix).toBe(false);
      expect(result.oldName).toBe(result.newName);
    });

    it('should accept UserProfile.vue as valid', () => {
      const result = checkComponentName('src/components/UserProfile.vue');
      expect(result.baseName).toBe('UserProfile');
      expect(result.isPascalCase).toBe(true);
      expect(result.needsFix).toBe(false);
    });

    it('should accept ButtonComponent.stories.ts as valid', () => {
      const result = checkComponentName('src/components/ButtonComponent.stories.ts');
      expect(result.baseName).toBe('ButtonComponent');
      expect(result.isPascalCase).toBe(true);
      expect(result.needsFix).toBe(false);
    });

    it('should accept index.ts as valid (barrel export pattern)', () => {
      const result = checkComponentName('src/components/MyComponent/index.ts');
      expect(result.baseName).toBe('index');
      expect(result.isPascalCase).toBe(true);
      expect(result.needsFix).toBe(false);
      expect(result.oldName).toBe('index.ts');
      expect(result.newName).toBe('index.ts');
    });

    it('should accept index.tsx as valid (barrel export pattern)', () => {
      const result = checkComponentName('src/components/index.tsx');
      expect(result.baseName).toBe('index');
      expect(result.isPascalCase).toBe(true);
      expect(result.needsFix).toBe(false);
    });
  });

  describe('Non-PascalCase components', () => {
    it('should suggest PascalCase for kebab-case-component.vue', () => {
      const result = checkComponentName('src/components/kebab-case-component.vue');
      expect(result.baseName).toBe('kebab-case-component');
      expect(result.isPascalCase).toBe(false);
      expect(result.needsFix).toBe(true);
      expect(result.newName).toBe('KebabCaseComponent.vue');
    });

    it('should suggest PascalCase for snake_case_component.types.ts', () => {
      const result = checkComponentName('src/components/snake_case_component.types.ts');
      expect(result.baseName).toBe('snake_case_component');
      expect(result.isPascalCase).toBe(false);
      expect(result.needsFix).toBe(true);
      expect(result.newName).toBe('SnakeCaseComponent.types.ts');
    });

    it('should suggest PascalCase for lowercase.stories.ts', () => {
      const result = checkComponentName('src/components/lowercase.stories.ts');
      expect(result.baseName).toBe('lowercase');
      expect(result.isPascalCase).toBe(false);
      expect(result.needsFix).toBe(true);
      expect(result.newName).toBe('Lowercase.stories.ts');
    });
  });

  describe('Edge cases', () => {
    it('should not suggest rename when conversion results in same name', () => {
      // This is the bug: even if baseName is already PascalCase,
      // if it somehow ends up in nonPascalFiles, it should not be reported
      // as needing a fix if oldName === newName
      const testCases = [
        'DialogoConfirmarAcao.types.ts',
        'UserProfile.vue',
        'ButtonComponent.stories.ts',
      ];

      for (const testCase of testCases) {
        const result = checkComponentName(`src/components/${testCase}`);
        if (result.oldName === result.newName) {
          expect(result.needsFix).toBe(false);
        }
      }
    });

    it('should handle the real-world bug scenario: correctly named files should never need fixing', () => {
      // Simulate the exact bug scenario: A correctly named file like
      // "DialogoConfirmarAcao.types.ts" should NEVER be reported as needing a fix
      const correctlyNamedFiles = [
        'DialogoConfirmarAcao.types.ts',
        'UserProfile.vue',
        'DialogCard.stories.ts',
        'FormInput.types.ts',
        'NavigationBar.test.ts',
      ];

      for (const fileName of correctlyNamedFiles) {
        const result = checkComponentName(`/some/path/${fileName}`);

        // Assert that correctly named PascalCase files:
        // 1. Are recognized as PascalCase
        expect(result.isPascalCase).toBe(true);

        // 2. Don't need fixes
        expect(result.needsFix).toBe(false);

        // 3. The suggested name matches the original
        expect(result.newName).toBe(fileName);
        expect(result.oldName).toBe(fileName);
      }
    });
  });

  describe('Directory naming conventions', () => {
    /**
     * Helper to check if a directory follows PascalCase convention
     */
    function checkDirectoryName(dirPath: string): {
      dirName: string;
      isPascalCase: boolean;
      isValidNonComponentDir: boolean;
      suggestedName: string;
    } {
      const dirName = path.basename(dirPath);
      
      // Check if it's a component directory (should be PascalCase)
      const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(dirName);
      
      // Check if it's a valid non-component directory (camelCase or kebab-case)
      const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(dirName);
      const isKebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(dirName);
      const isValidNonComponentDir = isCamelCase || isKebabCase;
      
      // Suggest PascalCase conversion
      const suggestedName = dirName
        .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
        .replace(/^(.)/, (_, c: string) => c.toUpperCase());
      
      return {
        dirName,
        isPascalCase,
        isValidNonComponentDir,
        suggestedName,
      };
    }

    it('should accept PascalCase directory for components', () => {
      const result = checkDirectoryName('src/components/atoms/UserAvatar');
      expect(result.dirName).toBe('UserAvatar');
      expect(result.isPascalCase).toBe(true);
    });

    it('should accept PascalCase directory for complex components', () => {
      const result = checkDirectoryName('src/components/organisms/DialogoConfirmarAcao');
      expect(result.dirName).toBe('DialogoConfirmarAcao');
      expect(result.isPascalCase).toBe(true);
    });

    it('should flag kebab-case directory with PascalCase file as incorrect', () => {
      // This is the scenario: kebab-case directory but PascalCase file
      const dirResult = checkDirectoryName('src/components/atoms/user-avatar');
      const fileResult = checkComponentName('src/components/atoms/user-avatar/UserAvatar.vue');
      
      expect(dirResult.dirName).toBe('user-avatar');
      expect(dirResult.isPascalCase).toBe(false);
      expect(dirResult.isValidNonComponentDir).toBe(true); // It's valid kebab-case, but wrong context
      expect(dirResult.suggestedName).toBe('UserAvatar');
      
      // File is correct
      expect(fileResult.isPascalCase).toBe(true);
      expect(fileResult.needsFix).toBe(false);
    });

    it('should flag snake_case directory as incorrect for components', () => {
      const result = checkDirectoryName('src/components/molecules/dialog_card');
      expect(result.dirName).toBe('dialog_card');
      expect(result.isPascalCase).toBe(false);
      expect(result.suggestedName).toBe('DialogCard');
    });

    it('should accept camelCase or kebab-case for non-component directories', () => {
      const camelCase = checkDirectoryName('src/composables');
      expect(camelCase.isValidNonComponentDir).toBe(true);
      
      const kebabCase = checkDirectoryName('src/utils-helpers');
      expect(kebabCase.isValidNonComponentDir).toBe(true);
    });

    it('should correctly identify mixed-case issues: kebab directory + PascalCase file', () => {
      // Real-world scenario: developer creates kebab-case folder but PascalCase files
      const scenarios = [
        {
          dir: 'src/components/atoms/card-usuario',
          file: 'src/components/atoms/card-usuario/CardUsuario.vue',
          expectedDirFix: 'CardUsuario',
        },
        {
          dir: 'src/components/molecules/form-input',
          file: 'src/components/molecules/form-input/FormInput.vue',
          expectedDirFix: 'FormInput',
        },
        {
          dir: 'src/components/organisms/navigation-bar',
          file: 'src/components/organisms/navigation-bar/NavigationBar.vue',
          expectedDirFix: 'NavigationBar',
        },
      ];

      for (const scenario of scenarios) {
        const dirResult = checkDirectoryName(scenario.dir);
        const fileResult = checkComponentName(scenario.file);

        // Directory needs fixing
        expect(dirResult.isPascalCase).toBe(false);
        expect(dirResult.suggestedName).toBe(scenario.expectedDirFix);

        // File is already correct (PascalCase)
        expect(fileResult.isPascalCase).toBe(true);
        expect(fileResult.needsFix).toBe(false);
      }
    });
  });
});

describe('Analyzer - TypeScript Detection', () => {
  /**
   * Helper to check if a .vue file uses TypeScript
   */
  function isVueFileUsingTypeScript(content: string): boolean {
    // Check for <script setup lang="ts">
    if (/<script\s+setup\s+lang=["']ts["']/.test(content)) return true;
    // Check for <script lang="ts" setup>
    if (/<script\s+lang=["']ts["']\s+setup/.test(content)) return true;
    // Check for <script lang="ts"> (without setup)
    if (/<script\s+lang=["']ts["']/.test(content)) return true;
    
    return false;
  }

  /**
   * Helper to check if a file uses TypeScript (by extension or content)
   */
  async function checkTypeScriptUsage(filePath: string, content?: string): Promise<{
    isTypeScript: boolean;
    reason: string;
  }> {
    // Check by extension first
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      return {
        isTypeScript: true,
        reason: 'extension',
      };
    }

    // For .vue files, check content
    if (filePath.endsWith('.vue')) {
      if (!content) {
        // In real usage, we'd read the file
        return {
          isTypeScript: false,
          reason: 'no-content-provided',
        };
      }

      const usesTypeScript = isVueFileUsingTypeScript(content);
      return {
        isTypeScript: usesTypeScript,
        reason: usesTypeScript ? 'vue-lang-ts' : 'vue-no-lang-ts',
      };
    }

    return {
      isTypeScript: false,
      reason: 'not-ts-extension',
    };
  }

  describe('Vue files with TypeScript', () => {
    it('should recognize .vue file with <script setup lang="ts"> as TypeScript', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('vue-lang-ts');
    });

    it('should recognize .vue file with <script lang="ts" setup> as TypeScript', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const count = ref(0);
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('vue-lang-ts');
    });

    it('should recognize .vue file with <script lang="ts"> (without setup) as TypeScript', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script lang="ts">
export default {
  name: 'Button'
};
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('vue-lang-ts');
    });

    it('should NOT recognize .vue file without lang="ts" as TypeScript', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(false);
      expect(result.reason).toBe('vue-no-lang-ts');
    });

    it('should recognize .vue file with lang="ts" in single quotes', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script setup lang='ts'>
const message = 'Hello';
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('vue-lang-ts');
    });
  });

  describe('TypeScript files by extension', () => {
    it('should recognize .ts files as TypeScript', async () => {
      const result = await checkTypeScriptUsage('src/components/Button.ts');
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('extension');
    });

    it('should recognize .tsx files as TypeScript', async () => {
      const result = await checkTypeScriptUsage('src/components/Button.tsx');
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('extension');
    });

    it('should NOT recognize .js files as TypeScript', async () => {
      const result = await checkTypeScriptUsage('src/components/Button.js');
      expect(result.isTypeScript).toBe(false);
      expect(result.reason).toBe('not-ts-extension');
    });

    it('should NOT recognize .jsx files as TypeScript', async () => {
      const result = await checkTypeScriptUsage('src/components/Button.jsx');
      expect(result.isTypeScript).toBe(false);
      expect(result.reason).toBe('not-ts-extension');
    });
  });

  describe('Edge cases', () => {
    it('should handle .vue files with multiple script tags', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script lang="ts">
// Some global script
</script>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('vue-lang-ts');
    });

    it('should handle .vue files with extra whitespace in script tag', async () => {
      const content = `<template>
  <div>Hello</div>
</template>

<script   setup   lang="ts"  >
const message = 'Hello';
</script>`;

      const result = await checkTypeScriptUsage('src/components/Button.vue', content);
      expect(result.isTypeScript).toBe(true);
      expect(result.reason).toBe('vue-lang-ts');
    });
  });
});

describe('Analyzer - Integration Tests', () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create a temporary directory for testing
    tempDir = path.join(os.tmpdir(), `storytype-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterAll(async () => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('TypeScript detection in .vue files', () => {
    it('should score high when all .vue files use lang="ts"', async () => {
      // Setup: Create project with all files using TypeScript
      const projectPath = path.join(tempDir, 'project-with-ts');
      await fs.ensureDir(projectPath);
      await fs.ensureDir(path.join(projectPath, 'src', 'components', 'atoms'));

      // Create tsconfig.json
      await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { strict: true } }, null, 2)
      );

      // Create .vue components WITH lang="ts"
      await fs.writeFile(
        path.join(projectPath, 'src', 'components', 'atoms', 'Button.vue'),
        `<template>
  <button>Click me</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref<number>(0);
</script>`
      );

      await fs.writeFile(
        path.join(projectPath, 'src', 'components', 'atoms', 'Input.vue'),
        `<template>
  <input />
</template>

<script setup lang="ts">
import { ref } from 'vue';
const value = ref<string>('');
</script>`
      );

      // Analyze the project
      const result = await analyzeProject(projectPath);

      // Find TypeScript category
      const tsCategory = result.categories.find(c => c.name === 'TypeScript');
      expect(tsCategory).toBeDefined();
      expect(tsCategory!.percentage).toBeGreaterThanOrEqual(80); // Good score when all use TS

      // Check the specific item about TypeScript components
      const tsComponentsItem = tsCategory!.items.find(i => i.name === 'Componentes TypeScript');
      expect(tsComponentsItem).toBeDefined();
      expect(tsComponentsItem!.passed).toBe(true);
      expect(tsComponentsItem!.message).toContain('2/2'); // All 2 components use TS
      expect(tsComponentsItem!.points).toBe(15); // Full points for 100% TypeScript
    });

    it('should score low when .vue files do NOT use lang="ts"', async () => {
      // Setup: Create project with files NOT using TypeScript
      const projectPath = path.join(tempDir, 'project-without-ts');
      await fs.ensureDir(projectPath);
      await fs.ensureDir(path.join(projectPath, 'src', 'components', 'atoms'));

      // Create tsconfig.json (exists but components don't use it)
      await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { strict: true } }, null, 2)
      );

      // Create .vue components WITHOUT lang="ts"
      await fs.writeFile(
        path.join(projectPath, 'src', 'components', 'atoms', 'Button.vue'),
        `<template>
  <button>Click me</button>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>`
      );

      await fs.writeFile(
        path.join(projectPath, 'src', 'components', 'atoms', 'Input.vue'),
        `<template>
  <input />
</template>

<script setup>
import { ref } from 'vue';
const value = ref('');
</script>`
      );

      // Analyze the project
      const result = await analyzeProject(projectPath);

      // Find TypeScript category
      const tsCategory = result.categories.find(c => c.name === 'TypeScript');
      expect(tsCategory).toBeDefined();
      expect(tsCategory!.percentage).toBeLessThan(40); // Should score low

      // Check the specific item about TypeScript components
      const tsComponentsItem = tsCategory!.items.find(i => i.name === 'Componentes TypeScript');
      expect(tsComponentsItem).toBeDefined();
      expect(tsComponentsItem!.passed).toBe(false); // Should fail
      expect(tsComponentsItem!.message).toContain('0/2'); // None of the 2 components use TS
      expect(tsComponentsItem!.points).toBe(0); // Zero points

      // Check file issues
      expect(tsComponentsItem!.fileIssues).toBeDefined();
      expect(tsComponentsItem!.fileIssues!.length).toBe(2);
      expect(tsComponentsItem!.fileIssues![0].issue).toContain('não usa TypeScript');
      expect(tsComponentsItem!.fileIssues![0].fix).toContain('lang="ts"');
    });

    it('should score medium when only some .vue files use lang="ts"', async () => {
      // Setup: Create project with mixed TypeScript usage
      const projectPath = path.join(tempDir, 'project-mixed-ts');
      await fs.ensureDir(projectPath);
      await fs.ensureDir(path.join(projectPath, 'src', 'components', 'atoms'));

      // Create tsconfig.json
      await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { strict: true } }, null, 2)
      );

      // 1 component WITH TypeScript
      await fs.writeFile(
        path.join(projectPath, 'src', 'components', 'atoms', 'Button.vue'),
        `<template>
  <button>Click me</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref<number>(0);
</script>`
      );

      // 1 component WITHOUT TypeScript
      await fs.writeFile(
        path.join(projectPath, 'src', 'components', 'atoms', 'Input.vue'),
        `<template>
  <input />
</template>

<script setup>
const value = ref('');
</script>`
      );

      // Analyze the project
      const result = await analyzeProject(projectPath);

      // Find TypeScript category
      const tsCategory = result.categories.find(c => c.name === 'TypeScript');
      expect(tsCategory).toBeDefined();

      // Check the specific item about TypeScript components
      const tsComponentsItem = tsCategory!.items.find(i => i.name === 'Componentes TypeScript');
      expect(tsComponentsItem).toBeDefined();
      expect(tsComponentsItem!.message).toContain('1/2'); // 1 of 2 uses TS (50%)
      expect(tsComponentsItem!.passed).toBe(false); // Should fail (< 80%)
      expect(tsComponentsItem!.points).toBeLessThanOrEqual(8); // ~50% of 15 points

      // Should have 1 file issue (the one without TS)
      expect(tsComponentsItem!.fileIssues).toBeDefined();
      expect(tsComponentsItem!.fileIssues!.length).toBe(1);
      expect(tsComponentsItem!.fileIssues![0].file).toContain('Input.vue');
    });
  });
});
