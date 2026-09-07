/**
 * Tests for the shell completion generator.
 *
 * The scripts are derived from the real `program`, so most tests walk the
 * program and check that everything it declares is in the output: that is
 * the property that keeps a new flag or command from needing a second edit.
 */
import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { afterAll, describe, expect, it } from 'vitest';
import { ATOMIC_LEVEL_ALIASES } from '../component-detector.js';
import { createProgram } from '../program.js';
import { COMPLETION_SHELLS, describeProgram, renderCompletion } from './index.js';
import type { CompletionShell } from './index.js';

const ESCAPE = '';

const program = createProgram();
const scripts = Object.fromEntries(
  COMPLETION_SHELLS.map(shell => [shell, renderCompletion(program, shell)])
) as Record<CompletionShell, string>;

function hasShell(shell: string): boolean {
  try {
    execFileSync('sh', ['-c', `command -v ${shell}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

describe('describeProgram', () => {
  const spec = describeProgram(program);

  it('names the executable both binaries share', () => {
    expect(spec.name).toBe('storytype');
  });

  it('lists every command with its aliases, from the program itself', () => {
    const declared = program.commands.map(cmd => [cmd.name(), cmd.aliases()] as const);

    for (const [name, aliases] of declared) {
      const command = spec.commands.find(cmd => cmd.name === name);
      expect(command, `command ${name}`).toBeDefined();
      expect(command?.aliases).toEqual(aliases);
    }
  });

  it('includes the help command commander adds implicitly', () => {
    expect(spec.commands.map(cmd => cmd.name)).toContain('help');
  });

  it('completes the type of generate with the level aliases', () => {
    const generate = spec.commands.find(cmd => cmd.name === 'generate');
    const type = generate?.arguments.find(arg => arg.name === 'type');

    expect(type?.value).toEqual({ kind: 'words', words: Object.keys(ATOMIC_LEVEL_ALIASES) });
  });

  it('completes path arguments and path option values with directories only', () => {
    const normalize = spec.commands.find(cmd => cmd.name === 'normalize');
    const analyze = spec.commands.find(cmd => cmd.name === 'analyze');
    const generate = spec.commands.find(cmd => cmd.name === 'generate');

    expect(normalize?.arguments[0].value).toEqual({ kind: 'directories' });
    expect(analyze?.arguments[0].value).toEqual({ kind: 'directories' });
    expect(generate?.options.find(option => option.long === '--path')?.value).toEqual({
      kind: 'directories',
    });
  });

  it('completes the shell of completion with the declared choices', () => {
    const completion = spec.commands.find(cmd => cmd.name === 'completion');

    expect(completion?.arguments[0].value).toEqual({
      kind: 'words',
      words: [...COMPLETION_SHELLS],
    });
  });

  it('reads the conflict between --dirs-only and --files-only in both directions', () => {
    const normalize = spec.commands.find(cmd => cmd.name === 'normalize');
    const dirsOnly = normalize?.options.find(option => option.long === '--dirs-only');
    const filesOnly = normalize?.options.find(option => option.long === '--files-only');

    expect(dirsOnly?.excludes).toContain('--files-only');
    expect(filesOnly?.excludes).toContain('--dirs-only');
  });

  it('excludes the other spelling of the same option', () => {
    const normalize = spec.commands.find(cmd => cmd.name === 'normalize');
    const dryRun = normalize?.options.find(option => option.long === '--dry-run');

    expect(dryRun?.short).toBe('-d');
    expect(dryRun?.excludes).toEqual(expect.arrayContaining(['-d', '--dry-run']));
  });
});

/**
 * How a flag is spelled in the script: fish declares `--dry-run` as `-l dry-run`
 */
function flagIn(shell: CompletionShell, flag: string): string {
  if (shell !== 'fish') return flag;
  return flag.startsWith('--') ? `-l ${flag.slice(2)}` : `-s ${flag.slice(1)}`;
}

describe.each(COMPLETION_SHELLS)('renderCompletion(%s)', shell => {
  const script = scripts[shell];

  it('is plain text: no colour codes, ends with a newline', () => {
    expect(script).not.toContain(ESCAPE);
    expect(script.endsWith('\n')).toBe(true);
  });

  it('registers for the storytype executable', () => {
    const registration = {
      bash: 'complete -F _storytype storytype',
      zsh: 'compdef _storytype storytype',
      fish: 'complete -c storytype',
    }[shell];

    expect(script).toContain(registration);
  });

  it('offers every command and alias the program declares', () => {
    for (const cmd of program.commands) {
      for (const word of [cmd.name(), ...cmd.aliases()]) {
        expect(script, `command ${word}`).toContain(word);
      }
    }
    expect(script).toContain('completion');
  });

  it('offers every option of every command, long and short', () => {
    for (const cmd of [program, ...program.commands]) {
      for (const option of cmd.options) {
        for (const flag of [option.long, option.short]) {
          if (flag) expect(script, `${cmd.name()} ${flag}`).toContain(flagIn(shell, flag));
        }
      }
    }
  });

  it('offers the level aliases for the type of generate', () => {
    for (const alias of Object.keys(ATOMIC_LEVEL_ALIASES)) {
      expect(script).toContain(alias);
    }
    expect(Object.keys(ATOMIC_LEVEL_ALIASES)).toHaveLength(18);
  });

  it('picks up a flag added to a command without any other edit', () => {
    const fresh = createProgram();
    fresh.commands.find(cmd => cmd.name() === 'normalize')?.option('--brand-new-flag', 'test only');

    expect(renderCompletion(fresh, shell)).toContain(flagIn(shell, '--brand-new-flag'));
    expect(script).not.toContain('brand-new-flag');
  });

  it('strips characters that would break the quoting of a description', () => {
    const fresh = createProgram();
    fresh.command('odd').description("it's [odd]: yes\\no");

    expect(renderCompletion(fresh, shell)).not.toMatch(/it's|yes\\no/);
  });
});

describe('mutual exclusion in the rendered scripts', () => {
  it('zsh: --dirs-only and --files-only exclude each other', () => {
    expect(scripts.zsh).toContain("'(--dirs-only --files-only)--dirs-only[");
    expect(scripts.zsh).toContain("'(--files-only --dirs-only)--files-only[");
  });

  it('fish: --dirs-only is offered only while --files-only is not on the line', () => {
    expect(scripts.fish).toMatch(/not __fish_seen_argument -l files-only' -l dirs-only/);
    expect(scripts.fish).toMatch(/not __fish_seen_argument -l dirs-only' -l files-only/);
  });
});

describe('scripts on disk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'storytype-completion-'));
  const file = (shell: CompletionShell) => {
    const target = path.join(dir, `storytype.${shell}`);
    fs.writeFileSync(target, scripts[shell]);
    return target;
  };

  afterAll(() => fs.removeSync(dir));

  describe.each(COMPLETION_SHELLS)('%s -n accepts the script', shell => {
    it.skipIf(!hasShell(shell))('parses without error', () => {
      expect(() => execFileSync(shell, ['-n', file(shell)], { stdio: 'pipe' })).not.toThrow();
    });
  });

  describe.skipIf(!hasShell('bash'))('bash completion function', () => {
    /**
     * Source the script and call the completion function the way readline
     * would: COMP_WORDS holds the line, the last word is the one being completed
     */
    function complete(...words: string[]): string[] {
      const line = words.map(word => `'${word}'`).join(' ');
      const output = execFileSync(
        'bash',
        [
          '-c',
          `source "$1"; COMP_WORDS=(${line}); COMP_CWORD=$((\${#COMP_WORDS[@]} - 1)); ` +
            `_storytype; printf '%s\\n' "\${COMPREPLY[@]}"`,
          'bash',
          file('bash'),
        ],
        { encoding: 'utf8', cwd: dir }
      );
      return output.split('\n').filter(Boolean);
    }

    it('offers the commands after storytype', () => {
      expect(complete('storytype', '')).toEqual(
        expect.arrayContaining(['generate', 'g', 'normalize', 'analyze', 'completion'])
      );
    });

    it('offers the flags of normalize', () => {
      expect(complete('storytype', 'normalize', '--')).toEqual(
        expect.arrayContaining(['--dry-run', '--dirs-only', '--files-only', '--verbose'])
      );
    });

    it('stops offering --files-only once --dirs-only is on the line', () => {
      const offered = complete('storytype', 'normalize', '--dirs-only', '--');

      expect(offered).not.toContain('--files-only');
      expect(offered).not.toContain('--dirs-only');
      expect(offered).toContain('--dry-run');
    });

    it('stops offering the long spelling once the short one is on the line', () => {
      expect(complete('storytype', 'normalize', '-d', '--')).not.toContain('--dry-run');
    });

    it('offers the 18 level aliases for the type of generate', () => {
      const offered = complete('storytype', 'generate', '');

      expect(offered).toHaveLength(18);
      expect(offered.sort()).toEqual(Object.keys(ATOMIC_LEVEL_ALIASES).sort());
    });

    it('still offers the level aliases after a --path value', () => {
      expect(complete('storytype', 'g', '-p', 'src', '')).toHaveLength(18);
    });

    it('offers nothing for the component name', () => {
      expect(complete('storytype', 'generate', 'atom', '')).toEqual([]);
    });

    it('offers only directories for the path of normalize', () => {
      fs.mkdirSync(path.join(dir, 'components'));
      fs.writeFileSync(path.join(dir, 'a-file.ts'), '');

      const offered = complete('storytype', 'normalize', '');

      expect(offered).toContain('components');
      expect(offered).not.toContain('a-file.ts');
    });

    it('offers the shells for completion', () => {
      expect(complete('storytype', 'completion', '').sort()).toEqual([...COMPLETION_SHELLS].sort());
    });
  });
});
