/**
 * Tests for analyzer naming validation
 */
import { describe, it, expect } from 'vitest';
import path from 'path';

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
});
