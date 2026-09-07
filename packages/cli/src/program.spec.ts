/**
 * Tests for the command line wiring that commander enforces before any
 * action runs: conflicting flags, argument choices, and the completion
 * command writing nothing but its script.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderCompletion } from './completion/index.js';
import { createProgram } from './program.js';

/**
 * A program that throws instead of exiting, and keeps commander's own
 * messages out of the test output
 */
function testProgram() {
  const program = createProgram();
  const quiet = { writeErr: () => {}, writeOut: () => {} };
  program.exitOverride().configureOutput(quiet);
  for (const cmd of program.commands) {
    cmd.exitOverride().configureOutput(quiet);
  }
  return program;
}

describe('program', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses --dirs-only together with --files-only before running normalize', async () => {
    const program = testProgram();

    await expect(
      program.parseAsync(['normalize', '--dirs-only', '--files-only'], { from: 'user' })
    ).rejects.toMatchObject({ code: 'commander.conflictingOption' });
  });

  describe('completion', () => {
    it('writes the script to stdout and nothing else', async () => {
      const program = testProgram();
      const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});

      await program.parseAsync(['completion', 'bash'], { from: 'user' });

      expect(stdout).toHaveBeenCalledTimes(1);
      expect(stdout).toHaveBeenCalledWith(renderCompletion(program, 'bash'));
      expect(log).not.toHaveBeenCalled();
    });

    it('rejects a shell it has no script for', async () => {
      const program = testProgram();

      await expect(
        program.parseAsync(['completion', 'powershell'], { from: 'user' })
      ).rejects.toMatchObject({ code: 'commander.invalidArgument' });
    });
  });
});
