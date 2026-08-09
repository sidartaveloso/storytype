import { describe, it, expect } from 'vitest';
import type { ComponentStructure, StoryTypeConfig } from './Types';

describe('Types', () => {
  it('exposes the ComponentStructure interface', () => {
    const structure: ComponentStructure = {
      level: 'atom',
      name: 'Button',
      path: '/components/Button',
    };
    expect(structure.name).toBe('Button');
    expect(structure.level).toBe('atom');
  });

  it('exposes the StoryTypeConfig interface', () => {
    const config: StoryTypeConfig = { baseDir: 'src' };
    expect(config.baseDir).toBe('src');
  });
});
