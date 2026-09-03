/**
 * Tests for the shared component detection module.
 *
 * Both `analyze` and `normalize` read their conventions from here, so these
 * tests pin the contract the two commands agree on.
 */
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  atomicLevelDir,
  detectComponents,
  detectProjectLanguage,
  findAtomicLevelDirs,
  findComponentDirectories,
  findComponentFiles,
  findComponentsDirectory,
  getComponentBaseName,
  isAtomicLevel,
  isComponentEntry,
  isComponentFile,
  isPascalCase,
  toAtomicLevel,
  toAtomicLevelFromAlias,
  toExpectedFileName,
} from './component-detector.js';

describe('component-detector - file classification', () => {
  it('accepts component entry files', () => {
    expect(isComponentFile('Avatar.vue')).toBe(true);
    expect(isComponentFile('useAvatar.ts')).toBe(true);
    expect(isComponentFile('Avatar.tsx')).toBe(true);
  });

  it('rejects tests, stories, auxiliary files and barrels', () => {
    expect(isComponentFile('Avatar.spec.ts')).toBe(false);
    expect(isComponentFile('Avatar.test.ts')).toBe(false);
    expect(isComponentFile('Avatar.stories.ts')).toBe(false);
    expect(isComponentFile('Avatar.types.ts')).toBe(false);
    expect(isComponentFile('Avatar.mock.ts')).toBe(false);
    expect(isComponentFile('Avatar.controller.ts')).toBe(false);
    expect(isComponentFile('index.ts')).toBe(false);
  });

  it('strips every role suffix from a base name', () => {
    expect(getComponentBaseName('Avatar.vue')).toBe('Avatar');
    expect(getComponentBaseName('Avatar.types.ts')).toBe('Avatar');
    expect(getComponentBaseName('Avatar.stories.ts')).toBe('Avatar');
    expect(getComponentBaseName('Avatar.mock.ts')).toBe('Avatar');
    expect(getComponentBaseName('Avatar.controller.ts')).toBe('Avatar');
    expect(getComponentBaseName('/a/b/progressBar.spec.ts')).toBe('progressBar');
  });
});

describe('component-detector - isComponentEntry', () => {
  it('accepts .vue and .tsx anywhere', () => {
    expect(isComponentEntry('/project/Anything.vue')).toBe(true);
    expect(isComponentEntry('/project/src/Anything.tsx')).toBe(true);
  });

  it('accepts a PascalCase .ts inside the Atomic Design tree', () => {
    expect(isComponentEntry('/src/components/atoms/Badge.ts')).toBe(true);
    expect(isComponentEntry('/src/components/organisms/taskin/TaskinV1.ts')).toBe(true);
  });

  it('rejects a non-PascalCase .ts inside the Atomic Design tree', () => {
    expect(isComponentEntry('/src/components/atoms/useBadge.ts')).toBe(false);
  });

  it('rejects a controller, which belongs to a component rather than being one', () => {
    // Even in the folder named after it, where the base name now matches
    expect(isComponentEntry('/src/components/organisms/taskin/Taskin.controller.ts')).toBe(false);
    expect(isComponentEntry('/src/components/atoms/badge/Badge.controller.ts')).toBe(false);
  });

  it('rejects a PascalCase .ts outside the Atomic Design tree', () => {
    expect(isComponentEntry('/project/src/Utils.ts')).toBe(false);
  });

  it('accepts a .ts in a folder named after it', () => {
    expect(isComponentEntry('/src/taskin-effect-hearts/TaskinEffectHearts.ts')).toBe(true);
    expect(isComponentEntry('/src/my-component/my-component.ts')).toBe(true);
  });

  it('rejects a loose .ts that only happens to sit in a directory', () => {
    // Without this, `normalize` would rename vite.config.ts to Vite.config.ts
    // and generate a spec and a types file next to it
    expect(isComponentEntry('/project/vite.config.ts')).toBe(false);
    expect(isComponentEntry('/project/vitest.storybook.config.ts')).toBe(false);
    expect(isComponentEntry('/project/src/helpers.ts')).toBe(false);
  });

  it('rejects type declarations', () => {
    expect(isComponentEntry('/project/vitest.shims.d.ts')).toBe(false);
    expect(isComponentEntry('/src/components/atoms/globals.d.ts')).toBe(false);
  });

  it('rejects a helper .ts living beside a component', () => {
    expect(isComponentEntry('/src/atoms/taskin-arms/TaskinArms.ts')).toBe(true);
    expect(isComponentEntry('/src/atoms/taskin-arms/helpers.ts')).toBe(false);
  });
});

describe('component-detector - expected file names', () => {
  it('PascalCases the base and keeps the suffixes', () => {
    expect(toExpectedFileName('progressBar.vue')).toBe('ProgressBar.vue');
    expect(toExpectedFileName('progress-bar.types.ts')).toBe('ProgressBar.types.ts');
    expect(toExpectedFileName('progress_bar.stories.ts')).toBe('ProgressBar.stories.ts');
    expect(toExpectedFileName('progress-bar.controller.ts')).toBe('ProgressBar.controller.ts');
  });

  it('leaves already correct names untouched', () => {
    expect(toExpectedFileName('ProgressBar.vue')).toBe('ProgressBar.vue');
    expect(toExpectedFileName('ProgressBar.spec.ts')).toBe('ProgressBar.spec.ts');
  });

  it('never renames barrels', () => {
    expect(toExpectedFileName('index.ts')).toBe('index.ts');
    expect(toExpectedFileName('index.tsx')).toBe('index.tsx');
  });

  it('agrees with isPascalCase', () => {
    for (const name of ['Avatar.vue', 'progressBar.vue', 'progress-bar.types.ts']) {
      const unchanged = toExpectedFileName(name) === name;
      expect(unchanged).toBe(isPascalCase(getComponentBaseName(name)));
    }
  });
});

describe('component-detector - atomic levels', () => {
  it('recognizes a level folder in either language', () => {
    expect(isAtomicLevel('atoms')).toBe(true);
    expect(isAtomicLevel('atomos')).toBe(true);
    expect(isAtomicLevel('moleculas')).toBe(true);
    expect(isAtomicLevel('paginas')).toBe(true);
    expect(isAtomicLevel('ORGANISMOS')).toBe(true);
    expect(isAtomicLevel('widgets')).toBe(false);
  });

  it('resolves a folder name to its canonical level', () => {
    expect(toAtomicLevel('atomos')).toBe('atoms');
    expect(toAtomicLevel('organisms')).toBe('organisms');
    expect(toAtomicLevel('templates')).toBe('templates');
    expect(toAtomicLevel('nope')).toBeNull();
  });

  it('accepts what a user types for a level, in either language and number', () => {
    const aliases: Record<string, string> = {
      atom: 'atoms',
      atoms: 'atoms',
      atomo: 'atoms',
      atomos: 'atoms',
      Átomo: 'atoms',
      molecule: 'molecules',
      molecula: 'molecules',
      MOLÉCULAS: 'molecules',
      organismo: 'organisms',
      template: 'templates',
      page: 'pages',
      pagina: 'pages',
      páginas: 'pages',
    };

    for (const [input, expected] of Object.entries(aliases)) {
      expect(toAtomicLevelFromAlias(input), input).toBe(expected);
    }

    expect(toAtomicLevelFromAlias('widget')).toBeNull();
  });

  it('names a level folder per project language', () => {
    expect(atomicLevelDir('atoms', 'en')).toBe('atoms');
    expect(atomicLevelDir('atoms', 'pt')).toBe('atomos');
    // Spelled the same in both, which is why it never identifies a language
    expect(atomicLevelDir('templates', 'en')).toBe(atomicLevelDir('templates', 'pt'));
  });
});

describe('component-detector - project language and components directory', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-lang-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('finds the levels a project has, whatever language they are in', async () => {
    await fs.ensureDir(path.join(tempDir, 'atomos'));
    await fs.ensureDir(path.join(tempDir, 'moleculas'));
    await fs.ensureDir(path.join(tempDir, 'templates'));

    const found = findAtomicLevelDirs(tempDir);

    expect(found.map(f => f.level)).toEqual(['atoms', 'molecules', 'templates']);
    expect(found.map(f => f.dirName)).toEqual(['atomos', 'moleculas', 'templates']);
  });

  it('counts a level once even when both spellings exist', async () => {
    await fs.ensureDir(path.join(tempDir, 'atoms'));
    await fs.ensureDir(path.join(tempDir, 'atomos'));

    expect(findAtomicLevelDirs(tempDir)).toHaveLength(1);
  });

  it('ignores a file that happens to be named like a level', async () => {
    await fs.writeFile(path.join(tempDir, 'atoms'), 'not a directory');

    expect(findAtomicLevelDirs(tempDir)).toEqual([]);
  });

  it('infers the project language from its level folders', async () => {
    await fs.ensureDir(path.join(tempDir, 'atomos'));
    await fs.ensureDir(path.join(tempDir, 'organismos'));

    expect(detectProjectLanguage(tempDir)).toBe('pt');
  });

  it('falls back to English when there is nothing to go on', async () => {
    expect(detectProjectLanguage(tempDir)).toBe('en');

    // `templates` is spelled the same in both, so it decides nothing
    await fs.ensureDir(path.join(tempDir, 'templates'));
    expect(detectProjectLanguage(tempDir)).toBe('en');
  });

  it('locates a conventional components directory', async () => {
    const componentsDir = path.join(tempDir, 'src', 'components');
    await fs.ensureDir(componentsDir);

    expect(findComponentsDirectory(tempDir)).toBe(componentsDir);
  });

  it('falls back to the project root for a monorepo layout', async () => {
    const nested = path.join(tempDir, 'packages', 'ui', 'src', 'atoms', 'badge');
    await fs.ensureDir(nested);
    await fs.writeFile(path.join(nested, 'Badge.vue'), '<template />');

    expect(findComponentsDirectory(tempDir)).toBe(tempDir);
  });

  it('returns null when a project holds no components at all', async () => {
    await fs.ensureDir(path.join(tempDir, 'docs'));

    expect(findComponentsDirectory(tempDir)).toBeNull();
  });
});

describe('component-detector - detectComponents', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storytype-detector-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('promotes each loose component in an Atomic Design level', async () => {
    const atomsDir = path.join(tempDir, 'atoms');
    await fs.ensureDir(atomsDir);
    await fs.writeFile(path.join(atomsDir, 'Badge.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.vue'), '<template />');
    await fs.writeFile(path.join(atomsDir, 'ProgressBar.stories.ts'), 'export default {};');
    await fs.writeFile(path.join(atomsDir, 'index.ts'), "export * from './Badge.vue';");

    const components = detectComponents(tempDir);

    expect(components.map(c => c.name)).toEqual(['Badge', 'ProgressBar']);
    expect(components.every(c => c.needsPromotion)).toBe(true);
    expect(components.every(c => c.atomicLevel === 'atoms')).toBe(true);

    const progressBar = components.find(c => c.name === 'ProgressBar');
    expect(progressBar?.targetDir).toBe(path.join(atomsDir, 'progress-bar'));

    // Only the component's own files travel; the level barrel stays behind
    expect(progressBar?.files.map(f => f.name).sort()).toEqual([
      'ProgressBar.stories.ts',
      'ProgressBar.vue',
    ]);
  });

  it('reports a component that already owns its folder as needing nothing', async () => {
    const dir = path.join(tempDir, 'atoms', 'taskin-arms');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'TaskinArms.vue'), '<template />');
    await fs.writeFile(path.join(dir, 'index.ts'), "export { default } from './TaskinArms.vue';");

    const [component] = detectComponents(tempDir);

    expect(component.name).toBe('TaskinArms');
    expect(component.needsPromotion).toBe(false);
    expect(component.needsDirRename).toBe(false);
    expect(component.targetDir).toBe(dir);
    expect(component.atomicLevel).toBe('atoms');
  });

  it('derives the target folder from the directory name, not the file name', async () => {
    const dir = path.join(tempDir, 'Srv');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'Server.vue'), '<template />');

    const [component] = detectComponents(tempDir);

    expect(component.needsDirRename).toBe(true);
    expect(component.targetDir).toBe(path.join(tempDir, 'srv'));
  });

  it('gives every component of a multi-entry folder its own, whatever the read order', async () => {
    const dir = path.join(tempDir, 'taskin');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'ZTaskinHelper.vue'), '<template />');
    await fs.writeFile(path.join(dir, 'Taskin.vue'), '<template />');

    const components = detectComponents(tempDir);

    expect(components.map(c => c.name)).toEqual(['Taskin', 'ZTaskinHelper']);
    expect(components.map(c => c.targetDir)).toEqual([
      path.join(dir, 'taskin'),
      path.join(dir, 'z-taskin-helper'),
    ]);
  });

  it('ignores node_modules and dot directories', async () => {
    await fs.ensureDir(path.join(tempDir, 'node_modules', 'pkg'));
    await fs.writeFile(path.join(tempDir, 'node_modules', 'pkg', 'Vendor.vue'), '<template />');
    await fs.ensureDir(path.join(tempDir, '.cache'));
    await fs.writeFile(path.join(tempDir, '.cache', 'Cached.vue'), '<template />');

    expect(detectComponents(tempDir)).toEqual([]);
    expect(findComponentFiles(tempDir)).toEqual([]);
    expect(findComponentDirectories(tempDir)).toEqual([]);
  });

  it('leaves project-root config files alone', async () => {
    await fs.writeFile(path.join(tempDir, 'vite.config.ts'), 'export default {};');
    await fs.writeFile(path.join(tempDir, 'vitest.shims.d.ts'), 'export {};');
    await fs.ensureDir(path.join(tempDir, 'src'));
    await fs.writeFile(path.join(tempDir, 'src', 'ui-sense-mocks.d.ts'), 'export {};');
    await fs.writeFile(path.join(tempDir, 'src', 'index.ts'), 'export {};');

    expect(detectComponents(tempDir)).toEqual([]);
    expect(findComponentFiles(tempDir)).toEqual([]);
  });

  it('reports one component per entry file, matching the flat file scan', async () => {
    const dir = path.join(tempDir, 'organisms', 'taskin');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'Taskin.vue'), '<template />');
    await fs.writeFile(path.join(dir, 'TaskinFace.vue'), '<template />');
    await fs.ensureDir(path.join(tempDir, 'atoms', 'badge'));
    await fs.writeFile(path.join(tempDir, 'atoms', 'badge', 'Badge.vue'), '<template />');

    // This invariant is what lets `analyze` count from the flat scan while
    // scoring folder organization from the plan
    expect(detectComponents(tempDir).length).toBe(findComponentFiles(tempDir).length);
  });

  it('treats a folder holding several components as a container', async () => {
    // Option B: every component gets a folder, including the one the container
    // is currently named after
    const dir = path.join(tempDir, 'organisms', 'taskin');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'Taskin.ts'), 'export default {};');
    await fs.writeFile(path.join(dir, 'Taskin.controller.ts'), 'export const c = 1;');
    await fs.writeFile(path.join(dir, 'TaskinWithShhh.vue'), '<template />');
    await fs.writeFile(path.join(dir, 'index.ts'), "export * from './Taskin';");

    const components = detectComponents(tempDir);

    // The controller is a file of Taskin, not a third component
    expect(components.map(c => c.name)).toEqual(['Taskin', 'TaskinWithShhh']);
    expect(
      components
        .find(c => c.name === 'Taskin')
        ?.files.map(f => f.name)
        .sort()
    ).toEqual(['Taskin.controller.ts', 'Taskin.ts']);
    expect(components.every(c => c.needsPromotion)).toBe(true);
    expect(components.find(c => c.name === 'Taskin')?.targetDir).toBe(path.join(dir, 'taskin'));
    expect(components.find(c => c.name === 'TaskinWithShhh')?.targetDir).toBe(
      path.join(dir, 'taskin-with-shhh')
    );
    expect(components.every(c => c.atomicLevel === 'organisms')).toBe(true);
  });

  it('leaves a folder holding a single component alone', async () => {
    const dir = path.join(tempDir, 'organisms', 'taskin');
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'Taskin.ts'), 'export default {};');
    await fs.writeFile(path.join(dir, 'Taskin.stories.ts'), 'export default {};');
    await fs.writeFile(path.join(dir, 'index.ts'), "export * from './Taskin';");

    const [component] = detectComponents(tempDir);

    expect(component.name).toBe('Taskin');
    expect(component.needsPromotion).toBe(false);
    expect(component.needsDirRename).toBe(false);
  });
});
