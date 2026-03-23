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
  .description('Ferramenta CLI para criar componentes Storytype')
  .version(version);

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Gerar um novo componente (atomo, molecula, organismo, template)')
  .option('-p, --path <path>', 'Caminho customizado para o componente')
  .action(async (type: string, name: string, options: { path?: string }) => {
    // Map singular to plural (folder names)
    const typeMap: Record<string, ComponentLevel> = {
      atomo: 'atomos',
      atomos: 'atomos',
      molecula: 'moleculas',
      moleculas: 'moleculas',
      organismo: 'organismos',
      organismos: 'organismos',
      template: 'templates',
      templates: 'templates',
    };

    const mappedType = typeMap[type.toLowerCase()];

    if (!mappedType) {
      console.error(chalk.red(`Tipo de componente inválido: ${type}`));
      console.log(chalk.yellow('Tipos válidos: atomo, molecula, organismo, template'));
      console.log(
        chalk.gray('(formas plurais também aceitas: atomos, moleculas, organismos, templates)')
      );
      process.exit(1);
    }

    console.log(chalk.blue(`Gerando componente ${type}: ${name}`));

    try {
      const result = await generateComponent({
        name,
        type: mappedType,
        path: options.path,
      });

      if (result.success) {
        console.log(chalk.green('✓ Componente gerado com sucesso!'));
        console.log(chalk.gray('\nArquivos criados:'));
        result.files.forEach(file => {
          console.log(chalk.gray(`  - ${file}`));
        });
      } else {
        console.error(chalk.red(`✗ Erro: ${result.error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Erro ao gerar componente:'), error);
      process.exit(1);
    }
  });

program
  .command('normalize [path]')
  .description(
    'Normalizar estrutura de componentes (diretórios em kebab-case, arquivos em PascalCase)'
  )
  .option('-d, --dry-run', 'Mostrar mudanças sem executá-las')
  .option('--dirs-only', 'Normalizar apenas nomes de diretórios')
  .option('--files-only', 'Normalizar apenas nomes de arquivos')
  .option('-v, --verbose', 'Mostrar saída detalhada')
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
        console.log(chalk.blue('Analisando estrutura de componentes...'));

        const result = await normalizeComponents({
          path: targetPath || process.cwd(),
          dryRun: options?.dryRun || false,
          dirsOnly: options?.dirsOnly || false,
          filesOnly: options?.filesOnly || false,
          verbose: options?.verbose || false,
        });

        if (result.success) {
          console.log(chalk.green('\n✓ Análise completa!'));
          console.log(chalk.gray(`\nComponentes encontrados: ${result.components.length}`));
          console.log(chalk.gray(`Diretórios a renomear: ${result.directoriesToRename}`));
          console.log(chalk.gray(`Arquivos a renomear: ${result.filesToRename}`));
          console.log(chalk.gray(`Arquivos a criar: ${result.filesToCreate}`));

          if (options?.dryRun) {
            console.log(chalk.yellow('\n⚠ Modo dry-run: nenhuma mudança foi feita'));
            console.log(chalk.gray('Execute sem --dry-run para aplicar as mudanças'));
          } else if (result.directoriesToRename + result.filesToRename + result.filesToCreate > 0) {
            console.log(chalk.green('\n✓ Normalização concluída com sucesso!'));
          } else {
            console.log(
              chalk.green('\n✓ Todos os componentes já estão estruturados corretamente!')
            );
          }

          if (options?.verbose) {
            console.log(chalk.gray('\nMudanças detalhadas:'));
            result.components.forEach(comp => {
              if (comp.needsRename || comp.missingFiles.length > 0) {
                console.log(chalk.gray(`\n  ${comp.componentName}:`));
                if (comp.needsRename) {
                  console.log(
                    chalk.yellow(`    Renomear: ${comp.currentPath} → ${comp.targetPath}`)
                  );
                }
                if (comp.missingFiles.length > 0) {
                  console.log(chalk.yellow(`    Criar: ${comp.missingFiles.join(', ')}`));
                }
              }
            });
          }
        } else {
          console.error(chalk.red(`\n✗ Erro: ${result.error}`));
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('Erro ao normalizar componentes:'), error);
        process.exit(1);
      }
    }
  );

program
  .command('init')
  .description('Inicializar Storytype no seu projeto')
  .action(() => {
    console.log('Inicializando Storytype...');
    // TODO: Implement initialization logic
  });

program
  .command('analyze [path]')
  .alias('audit')
  .description('Analisar e pontuar projeto baseado nas melhores práticas Storytype')
  .option('-v, --verbose', 'Mostrar problemas por arquivo e como corrigir cada um')
  .action(async (projectPath?: string, options?: { verbose?: boolean }) => {
    try {
      const result = await analyzeProject(projectPath);
      displayResults(result, { verbose: options?.verbose });
    } catch (error) {
      console.error('Erro ao analisar projeto:', error);
      process.exit(1);
    }
  });

program.parse();
