/**
 * Types for the shell completion generator.
 *
 * The generator reads the commander `program` and reduces it to this shape:
 * what each shell needs to know, and nothing commander-specific. The three
 * renderers (bash, zsh, fish) all consume the same `ProgramSpec`.
 */

export const COMPLETION_SHELLS = ['bash', 'zsh', 'fish'] as const;

export type CompletionShell = (typeof COMPLETION_SHELLS)[number];

/**
 * What to offer for the value of an argument or option
 */
export type ValueCompletion =
  /** A fixed list of words (level aliases, shell names, command names) */
  | { kind: 'words'; words: readonly string[] }
  /** Directories only */
  | { kind: 'directories' }
  /** Free text: nothing to offer (component name) */
  | { kind: 'none' };

export interface OptionSpec {
  /** Long flag, with dashes: `--dry-run` */
  long: string;
  /** Short flag, with dash: `-d` */
  short?: string;
  description: string;
  /** Set when the option takes a value (`--path <path>`) */
  value?: ValueCompletion;
  /**
   * Flags (all spellings) that must not be offered once this option is on
   * the line: the option's own other spelling plus every option it conflicts
   * with, in both directions
   */
  excludes: string[];
}

export interface ArgumentSpec {
  name: string;
  required: boolean;
  value: ValueCompletion;
}

export interface CommandSpec {
  name: string;
  aliases: string[];
  description: string;
  options: OptionSpec[];
  arguments: ArgumentSpec[];
}

export interface ProgramSpec {
  /** Executable name the completion registers for */
  name: string;
  options: OptionSpec[];
  commands: CommandSpec[];
}
