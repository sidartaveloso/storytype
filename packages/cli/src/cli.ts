#!/usr/bin/env node
/**
 * @storytype/cli
 * CLI tool for scaffolding Storytype components
 */

import { Command } from 'commander';
import { version } from '../package.json';
import { analyzeProject, displayResults } from './analyzer.js';

const program = new Command();

program
  .name('storytype')
  .description('CLI tool for scaffolding Storytype components')
  .version(version);

program
  .command('generate <level> <name>')
  .alias('g')
  .description('Generate a new component')
  .option('-p, --path <path>', 'Custom path for the component')
  .action((level: string, name: string, options: { path?: string }) => {
    console.log(`Generating ${level} component: ${name}`);
    if (options.path) {
      console.log(`Path: ${options.path}`);
    }
    // TODO: Implement component generation logic
  });

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
