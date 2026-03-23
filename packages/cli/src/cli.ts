#!/usr/bin/env node
/**
 * @storytype/cli
 * CLI tool for scaffolding Storytype components
 */

import { Command } from 'commander';
import { version } from '../package.json';
import { analyzeProject, displayResults } from './analyzer.js';
import { generateComponent } from './generate/index.js';
import { normalizeComponents } from './normalize-components/index.js';
import type { ComponentLevel } from './generate/Generate.types.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('storytype')
  .description('CLI tool for scaffolding Storytype components')
  .version(version);

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate a new component (atomos, moleculas, organismos, templates)')
  .option('-p, --path <path>', 'Custom path for the component')
  .action(async (type: string, name: string, options: { path?: string }) => {
    const validTypes: ComponentLevel[] = ['atomos', 'moleculas', 'organismos', 'templates'];

    if (!validTypes.includes(type as ComponentLevel)) {
      console.error(chalk.red(`Invalid component type: ${type}`));
      console.log(chalk.yellow(`Valid types: ${validTypes.join(', ')}`));
      process.exit(1);
    }

    console.log(chalk.blue(`Generating ${type} component: ${name}`));

    try {
      const result = await generateComponent({
        name,
        type: type as ComponentLevel,
        path: options.path,
      });

      if (result.success) {
        console.log(chalk.green('✓ Component generated successfully!'));
        console.log(chalk.gray('\nCreated files:'));
        result.files.forEach(file => {
          console.log(chalk.gray(`  - ${file}`));
        });
      } else {
        console.error(chalk.red(`✗ Error: ${result.error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error generating component:'), error);
      process.exit(1);
    }
  });

program
  .command('normalize [path]')
  .description('Normalize component structure (kebab-case dirs, PascalCase files)')
  .option('-d, --dry-run', 'Show changes without executing them')
  .option('--dirs-only', 'Only normalize directory names')
  .option('--files-only', 'Only normalize file names')
  .option('-v, --verbose', 'Show detailed output')
  .action(
    async (
      targetPath?: string,
      options?: {
        dryRun?: boolean;
        dirsOnly?: boolean;
        filesOnly?: boolean;
        verbose?: boolean;
      }
    ) => {
      try {
        console.log(chalk.blue('Analyzing component structure...'));

        const result = await normalizeComponents({
          path: targetPath || process.cwd(),
          dryRun: options?.dryRun || false,
          dirsOnly: options?.dirsOnly || false,
          filesOnly: options?.filesOnly || false,
          verbose: options?.verbose || false,
        });

        if (result.success) {
          console.log(chalk.green('\n✓ Analysis complete!'));
          console.log(chalk.gray(`\nComponents found: ${result.components.length}`));
          console.log(chalk.gray(`Directories to rename: ${result.directoriesToRename}`));
          console.log(chalk.gray(`Files to rename: ${result.filesToRename}`));
          console.log(chalk.gray(`Files to create: ${result.filesToCreate}`));

          if (options?.dryRun) {
            console.log(chalk.yellow('\n⚠ Dry-run mode: no changes were made'));
            console.log(chalk.gray('Run without --dry-run to apply changes'));
          } else if (result.directoriesToRename + result.filesToRename + result.filesToCreate > 0) {
            console.log(chalk.green('\n✓ Normalization completed successfully!'));
          } else {
            console.log(chalk.green('\n✓ All components are already properly structured!'));
          }

          if (options?.verbose) {
            console.log(chalk.gray('\nDetailed changes:'));
            result.components.forEach(comp => {
              if (comp.needsRename || comp.missingFiles.length > 0) {
                console.log(chalk.gray(`\n  ${comp.componentName}:`));
                if (comp.needsRename) {
                  console.log(chalk.yellow(`    Rename: ${comp.currentPath} → ${comp.targetPath}`));
                }
                if (comp.missingFiles.length > 0) {
                  console.log(chalk.yellow(`    Create: ${comp.missingFiles.join(', ')}`));
                }
              }
            });
          }
        } else {
          console.error(chalk.red(`\n✗ Error: ${result.error}`));
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('Error normalizing components:'), error);
        process.exit(1);
      }
    }
  );

program
  .command('init')
  .description('Initialize Storytype in your project')
  .action(() => {
    console.log('Initializing Storytype...');
    // TODO: Implement initialization logic
  });

program
  .command('analyze [path]')
  .alias('audit')
  .description('Analyze and score project based on Storytype best practices')
  .option('-v, --verbose', 'Show per-file issues and how to fix each one')
  .action(async (projectPath?: string, options?: { verbose?: boolean }) => {
    try {
      const result = await analyzeProject(projectPath);
      displayResults(result, { verbose: options?.verbose });
    } catch (error) {
      console.error('Error analyzing project:', error);
      process.exit(1);
    }
  });

program.parse();
