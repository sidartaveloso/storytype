/**
 * Shell completion for the storytype CLI.
 *
 * The scripts are not written by hand: they are rendered from the commander
 * `program` itself - its commands, aliases, options, arguments and declared
 * conflicts - so a flag or a command added to the CLI shows up in the
 * completion with no second edit. Same single-source principle the component
 * detector follows for the Atomic levels.
 *
 * Commander knows the names of things but not what their values look like.
 * That is the one piece of knowledge this module adds, keyed by the value's
 * name in the usage string, not by command:
 *
 * - `<type>`          the Atomic level aliases the generate command accepts
 * - `<path>`/`[path]` a directory
 * - `[command]`       the program's own command names (for `help <command>`)
 *
 * An argument declared with `.choices()` completes with those choices.
 *
 * The output goes to `eval` in the user's shell profile, so the renderers
 * emit plain text only: no colour, no spinner, nothing but the script.
 */
import type { Argument, Command, Option } from 'commander';
import { ATOMIC_LEVEL_ALIASES } from '../component-detector.js';
import type {
  ArgumentSpec,
  CommandSpec,
  CompletionShell,
  OptionSpec,
  ProgramSpec,
  ValueCompletion,
} from './Completion.types.js';

/**
 * Render the completion script for one shell
 */
export function renderCompletion(program: Command, shell: CompletionShell): string {
  const spec = describeProgram(program);

  switch (shell) {
    case 'bash':
      return renderBash(spec);
    case 'zsh':
      return renderZsh(spec);
    case 'fish':
      return renderFish(spec);
  }
}

// ---------------------------------------------------------------------------
// From commander to ProgramSpec
// ---------------------------------------------------------------------------

/**
 * `conflictsWith` is filled by `Option.conflicts()` and read by commander at
 * parse time, but the typings do not expose the field
 */
type OptionWithConflicts = Option & { conflictsWith?: string[] };

/**
 * Reduce the commander program to what the shells need
 */
export function describeProgram(program: Command): ProgramSpec {
  const help = program.createHelp();

  // Includes the implicit `help` command commander adds alongside subcommands
  const commands = help.visibleCommands(program);
  const commandWords = commands.flatMap(cmd => [cmd.name(), ...cmd.aliases()]);

  return {
    name: program.name(),
    options: describeOptions(help.visibleOptions(program), program),
    commands: commands.map(cmd => ({
      name: cmd.name(),
      aliases: cmd.aliases(),
      description: cmd.description(),
      options: describeOptions(help.visibleOptions(cmd), cmd),
      arguments: cmd.registeredArguments.map(arg => describeArgument(arg, commandWords)),
    })),
  };
}

function describeOptions(options: Option[], cmd: Command): OptionSpec[] {
  const byAttribute = new Map(cmd.options.map(option => [option.attributeName(), option]));

  // Symmetric: `--dirs-only` conflicting with `--files-only` also means
  // `--files-only` must not be offered once `--dirs-only` is on the line
  const conflicts = new Map<Option, Set<Option>>();
  for (const option of cmd.options) {
    for (const attribute of (option as OptionWithConflicts).conflictsWith ?? []) {
      const other = byAttribute.get(attribute);
      if (!other) continue;
      conflicts.set(option, (conflicts.get(option) ?? new Set()).add(other));
      conflicts.set(other, (conflicts.get(other) ?? new Set()).add(option));
    }
  }

  return options
    .filter(option => option.long !== undefined)
    .map(option => {
      const long = option.long as string;
      const excludes = [
        ...spellings(option),
        ...[...(conflicts.get(option) ?? [])].flatMap(spellings),
      ];

      return {
        long,
        short: option.short,
        description: option.description,
        value: option.required || option.optional ? valueCompletion(valueName(option)) : undefined,
        excludes,
      };
    });
}

function spellings(option: Option): string[] {
  return [option.short, option.long].filter((flag): flag is string => flag !== undefined);
}

/**
 * The value's name in the flags string: `-p, --path <path>` -> `path`
 */
function valueName(option: Option): string {
  const match = option.flags.match(/[<[]([^>\]]+)[>\]]/);
  return match?.[1] ?? '';
}

function describeArgument(arg: Argument, commandWords: readonly string[]): ArgumentSpec {
  return {
    name: arg.name(),
    required: arg.required,
    value: arg.argChoices
      ? { kind: 'words', words: arg.argChoices }
      : valueCompletion(arg.name(), commandWords),
  };
}

/**
 * What a value named `name` in a usage string looks like
 */
function valueCompletion(name: string, commandWords: readonly string[] = []): ValueCompletion {
  switch (name) {
    case 'type':
      return { kind: 'words', words: Object.keys(ATOMIC_LEVEL_ALIASES) };
    case 'path':
      return { kind: 'directories' };
    case 'command':
      return { kind: 'words', words: commandWords };
    default:
      return { kind: 'none' };
  }
}

function commandWords(command: CommandSpec): string[] {
  return [command.name, ...command.aliases];
}

function optionWords(options: readonly OptionSpec[]): string[] {
  return options.flatMap(option => (option.short ? [option.short, option.long] : [option.long]));
}

/**
 * Descriptions travel inside single quotes in all three shells
 */
function plainText(text: string): string {
  return text.replace(/['\\]/g, '');
}

// ---------------------------------------------------------------------------
// bash
// ---------------------------------------------------------------------------

/**
 * Written for bash 3.2 (the one macOS ships): no `mapfile`, no `compopt`
 * without a guard, no associative arrays
 */
function renderBash(spec: ProgramSpec): string {
  const fn = `_${spec.name}`;
  const commandCases = spec.commands.map(command => renderBashCommandCase(fn, command)).join('\n');

  return `# ${spec.name} bash completion - generated by \`${spec.name} completion bash\`
# Activate with: eval "$(${spec.name} completion bash)"

${fn}_dirs() {
  local IFS=$'\\n'
  COMPREPLY=( $(compgen -d -- "$1") )
  type compopt >/dev/null 2>&1 && compopt -o filenames
}

${fn}_words() {
  COMPREPLY=( $(compgen -W "$1" -- "$2") )
}

# Offer the words in $1 that are not yet on the line and not excluded by
# one that is. $2 holds "flag:excluded" pairs.
${fn}_options() {
  local offered='' word pair used seen
  for word in $1; do
    seen=''
    for used in "\${COMP_WORDS[@]:1:COMP_CWORD-1}"; do
      [[ "$used" == "$word" ]] && seen=1
      for pair in $2; do
        [[ "$pair" == "$used:$word" ]] && seen=1
      done
    done
    [[ -z "$seen" ]] && offered="$offered $word"
  done
  COMPREPLY=( $(compgen -W "$offered" -- "$3") )
}

${fn}() {
  local cur prev
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  # The subcommand is the first word that is not an option
  local i cmd=''
  for ((i = 1; i < COMP_CWORD; i++)); do
    case "\${COMP_WORDS[i]}" in
      -*) ;;
      *) cmd="\${COMP_WORDS[i]}"; break ;;
    esac
  done

  if [[ -z "$cmd" ]]; then
    if [[ "$cur" == -* ]]; then
      ${fn}_options '${optionWords(spec.options).join(' ')}' '${bashExcludePairs(spec.options)}' "$cur"
    else
      ${fn}_words '${spec.commands.flatMap(commandWords).join(' ')}' "$cur"
    fi
    return 0
  fi

  # Per command: its flags, the flags that take a value, the exclusion pairs
  # and what each positional argument completes with
  local opts='' valopts='' excludes=''
  local -a args
  args=()
  case "$cmd" in
${commandCases}
    *) return 0 ;;
  esac

  if [[ "$cur" == -* ]]; then
    ${fn}_options "$opts" "$excludes" "$cur"
    return 0
  fi

  # Positional index of the word being completed: skip options and their values
  local pos=0 j
  for ((j = i + 1; j < COMP_CWORD; j++)); do
    case "\${COMP_WORDS[j]}" in
      -*) ;;
      *)
        case " $valopts " in
          *" \${COMP_WORDS[j-1]} "*) ;;
          *) pos=$((pos + 1)) ;;
        esac
        ;;
    esac
  done

  ${fn}_value "\${args[pos]}" "$cur"
  return 0
}

# $1 is "directories", "words:<space separated list>" or empty
${fn}_value() {
  case "$1" in
    directories) ${fn}_dirs "$2" ;;
    words:*) ${fn}_words "\${1#words:}" "$2" ;;
    *) ;;
  esac
}

complete -F ${fn} ${spec.name}
`;
}

function renderBashCommandCase(fn: string, command: CommandSpec): string {
  const valueOptions = command.options.filter(option => option.value !== undefined);
  const valueCases = valueOptions
    .map(
      option =>
        `        ${optionWords([option]).join('|')}) ${fn}_value '${bashValue(option.value as ValueCompletion)}' "$cur"; return 0 ;;`
    )
    .join('\n');
  const prevCase =
    valueOptions.length > 0 ? `      case "$prev" in\n${valueCases}\n      esac\n` : '';

  return `    ${commandWords(command).join('|')})
${prevCase}      opts='${optionWords(command.options).join(' ')}'
      valopts='${optionWords(valueOptions).join(' ')}'
      excludes='${bashExcludePairs(command.options)}'
      args=(${command.arguments.map(arg => `'${bashValue(arg.value)}'`).join(' ')})
      ;;`;
}

function bashValue(value: ValueCompletion): string {
  switch (value.kind) {
    case 'directories':
      return 'directories';
    case 'words':
      return `words:${value.words.join(' ')}`;
    case 'none':
      return '';
  }
}

/**
 * "used:excluded" pairs: once `used` is on the line, `excluded` is not offered
 */
function bashExcludePairs(options: readonly OptionSpec[]): string {
  return options
    .flatMap(option =>
      optionWords([option]).flatMap(word =>
        option.excludes.filter(excluded => excluded !== word).map(excluded => `${word}:${excluded}`)
      )
    )
    .join(' ');
}

// ---------------------------------------------------------------------------
// zsh
// ---------------------------------------------------------------------------

function renderZsh(spec: ProgramSpec): string {
  const fn = `_${spec.name}`;
  const commandCases = spec.commands
    .map(
      command => `        ${commandWords(command).join('|')})
          _arguments \\
${[
  ...zshOptionSpecs(command.options),
  ...command.arguments.map(
    (arg, index) => `            '${index + 1}:${zshText(arg.name)}:${zshAction(arg.value)}'`
  ),
].join(' \\\n')} && ret=0
          ;;`
    )
    .join('\n');
  const commandList = spec.commands
    .flatMap(command =>
      commandWords(command).map(word => `    '${word}:${zshText(command.description)}'`)
    )
    .join('\n');

  return `#compdef ${spec.name}
# ${spec.name} zsh completion - generated by \`${spec.name} completion zsh\`
# Activate with: eval "$(${spec.name} completion zsh)" (after compinit)

${fn}_commands() {
  local -a commands
  commands=(
${commandList}
  )
  _describe -t commands '${spec.name} command' commands
}

${fn}() {
  local curcontext="$curcontext" state line ret=1
  typeset -A opt_args

  _arguments -C \\
${[...zshOptionSpecs(spec.options), `            '1: :${fn}_commands'`, `            '*:: :->args'`].join(' \\\n')} && ret=0

  case $state in
    args)
      case $words[1] in
${commandCases}
      esac
      ;;
  esac

  return ret
}

compdef ${fn} ${spec.name}
`;
}

function zshOptionSpecs(options: readonly OptionSpec[]): string[] {
  return options.flatMap(option =>
    optionWords([option]).map(word => {
      const exclusion = [...new Set([word, ...option.excludes])].join(' ');
      const value = option.value
        ? `:${zshText(valueLabel(option))}:${zshAction(option.value)}`
        : '';
      return `            '(${exclusion})${word}[${zshText(option.description)}]${value}'`;
    })
  );
}

function valueLabel(option: OptionSpec): string {
  return option.long.replace(/^--/, '');
}

function zshAction(value: ValueCompletion): string {
  switch (value.kind) {
    case 'directories':
      return '_directories';
    case 'words':
      return `(${value.words.join(' ')})`;
    case 'none':
      return '( )';
  }
}

/**
 * Inside an `_arguments` spec, brackets and colons are structure
 */
function zshText(text: string): string {
  return plainText(text).replace(/\[/g, '(').replace(/\]/g, ')').replace(/:/g, ' -');
}

// ---------------------------------------------------------------------------
// fish
// ---------------------------------------------------------------------------

function renderFish(spec: ProgramSpec): string {
  const name = spec.name;
  const lines: string[] = [];
  const complete = (condition: string, rest: string) =>
    lines.push(`complete -c ${name} -n '${condition}' ${rest}`);

  for (const command of spec.commands) {
    for (const word of commandWords(command)) {
      complete(`__${name}_needs_command`, `-a ${word} -d '${fishText(command.description)}'`);
    }
  }
  for (const option of spec.options) {
    complete(`__${name}_needs_command`, fishOption(option));
  }

  for (const command of spec.commands) {
    const using = `__${name}_using_command ${commandWords(command).join(' ')}`;
    const valueOptions = optionWords(command.options.filter(option => option.value !== undefined));

    for (const option of command.options) {
      const notSeen = option.excludes
        .filter(flag => flag !== option.long && flag !== option.short)
        .map(flag => `; and not __fish_seen_argument ${fishFlag(flag)}`)
        .join('');
      complete(`${using}${notSeen}`, fishOption(option));
    }

    command.arguments.forEach((arg, index) => {
      const values = fishValues(arg.value);
      if (!values) return;
      complete(`${using}; and __${name}_positional ${[index, ...valueOptions].join(' ')}`, values);
    });
  }

  return `# ${name} fish completion - generated by \`${name} completion fish\`
# Activate with: ${name} completion fish > ~/.config/fish/completions/${name}.fish

# True while no subcommand has been typed yet
function __${name}_needs_command
    set -l tokens (commandline -opc)
    set -e tokens[1]
    for token in $tokens
        string match -q -- '-*' $token; or return 1
    end
    return 0
end

# True when the subcommand on the line is one of the given names
function __${name}_using_command
    set -l tokens (commandline -opc)
    set -e tokens[1]
    for token in $tokens
        string match -q -- '-*' $token; and continue
        contains -- $token $argv
        return $status
    end
    return 1
end

# True when the word being completed is the positional argument at INDEX
# (zero-based) of the subcommand. The remaining arguments name the flags that
# take a value, so their values are not counted as positionals.
function __${name}_positional
    set -l index $argv[1]
    set -e argv[1]
    set -l tokens (commandline -opc)
    set -e tokens[1]
    set -l count 0
    set -l previous ''
    set -l in_command 0
    for token in $tokens
        if test $in_command -eq 0
            string match -q -- '-*' $token; or set in_command 1
        else if string match -q -- '-*' $token
        else if not contains -- $previous $argv
            set count (math $count + 1)
        end
        set previous $token
    end
    test $count -eq $index
end

complete -c ${name} -f
${lines.join('\n')}
`;
}

function fishOption(option: OptionSpec): string {
  const flags = [option.short ? `-s ${option.short.slice(1)}` : '', `-l ${option.long.slice(2)}`]
    .filter(Boolean)
    .join(' ');
  const values = option.value ? fishValues(option.value) : '';
  const value = option.value ? ` -r${values ? ` ${values}` : ''}` : '';

  return `${flags}${value} -d '${fishText(option.description)}'`;
}

function fishValues(value: ValueCompletion): string {
  switch (value.kind) {
    case 'directories':
      return "-a '(__fish_complete_directories)'";
    case 'words':
      return `-a '${value.words.join(' ')}'`;
    case 'none':
      return '';
  }
}

function fishFlag(flag: string): string {
  return flag.startsWith('--') ? `-l ${flag.slice(2)}` : `-s ${flag.slice(1)}`;
}

function fishText(text: string): string {
  return plainText(text);
}
