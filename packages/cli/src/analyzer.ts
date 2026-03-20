/**
 * @storytype/cli - Project Analyzer
 * Analyzes and scores projects based on Storytype best practices
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export interface AnalysisResult {
  score: number;
  maxScore: number;
  percentage: number;
  categories: CategoryResult[];
  summary: string;
}

export interface CategoryResult {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  items: CheckItem[];
}

export interface FileIssue {
  file: string;
  issue: string;
  fix: string;
}

export interface CheckItem {
  name: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  message?: string;
  fileIssues?: FileIssue[];
}

export interface DisplayOptions {
  verbose?: boolean;
}

const ATOMIC_LEVELS = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
const COMPONENT_EXTENSIONS = ['.vue', '.tsx', '.ts'];
const STORY_PATTERNS = ['.stories.ts', '.stories.tsx', '.story.ts', '.story.tsx'];
const TEST_PATTERNS = ['.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx'];

/**
 * Analyze a project directory
 */
export async function analyzeProject(projectPath: string = process.cwd()): Promise<AnalysisResult> {
  const spinner = ora('Analisando projeto...').start();

  try {
    const categories: CategoryResult[] = [];

    // 1. Estrutura de Componentes (Atomic Design)
    categories.push(await analyzeStructure(projectPath, spinner));

    // 2. TypeScript Usage
    categories.push(await analyzeTypeScript(projectPath, spinner));

    // 3. Testes e Stories
    categories.push(await analyzeTestsAndStories(projectPath, spinner));

    // 4. Nomenclatura e Organização
    categories.push(await analyzeNaming(projectPath, spinner));

    // 5. Documentação
    categories.push(await analyzeDocumentation(projectPath, spinner));

    const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
    const maxScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    spinner.succeed('Análise completa!');

    return {
      score: totalScore,
      maxScore,
      percentage,
      categories,
      summary: generateSummary(percentage),
    };
  } catch (error) {
    spinner.fail('Erro ao analisar projeto');
    throw error;
  }
}

/**
 * Analyze Atomic Design structure
 */
async function analyzeStructure(projectPath: string, spinner: Ora): Promise<CategoryResult> {
  spinner.text = 'Analisando estrutura Atomic Design...';

  const items: CheckItem[] = [];
  const componentsPath = findComponentsDirectory(projectPath);

  if (!componentsPath) {
    items.push({
      name: 'Diretório de componentes',
      passed: false,
      points: 0,
      maxPoints: 10,
      message: 'Nenhum diretório de componentes encontrado (src/components, components, etc.)',
    });

    return {
      name: 'Estrutura Atomic Design',
      score: 0,
      maxScore: 50,
      percentage: 0,
      items,
    };
  }

  // Check for Atomic Design folders
  const foundLevels = ATOMIC_LEVELS.filter(level =>
    fs.existsSync(path.join(componentsPath, level))
  );

  items.push({
    name: 'Diretório de componentes',
    passed: true as boolean,
    points: 10,
    maxPoints: 10,
    message: `Encontrado em: ${path.relative(projectPath, componentsPath)}`,
  });

  items.push({
    name: 'Níveis Atomic Design',
    passed: foundLevels.length >= 3,
    points: foundLevels.length * 5,
    maxPoints: 25,
    message: `Encontrados: ${foundLevels.join(', ') || 'nenhum'} (${foundLevels.length}/5)`,
  });

  // Check component organization
  const totalComponents = countComponents(componentsPath);
  const wellOrganized = foundLevels.length >= 3 && totalComponents >= 3;

  items.push({
    name: 'Organização de componentes',
    passed: wellOrganized,
    points: wellOrganized ? 15 : Math.min(totalComponents * 3, 15),
    maxPoints: 15,
    message: `${totalComponents} componentes encontrados`,
  });

  const score = items.reduce((sum, item) => sum + item.points, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    name: 'Estrutura Atomic Design',
    score,
    maxScore,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    items,
  };
}

/**
 * Analyze TypeScript usage
 */
async function analyzeTypeScript(projectPath: string, spinner: Ora): Promise<CategoryResult> {
  spinner.text = 'Analisando uso de TypeScript...';

  const items: CheckItem[] = [];
  const hasTsConfig = fs.existsSync(path.join(projectPath, 'tsconfig.json'));

  items.push({
    name: 'Configuração TypeScript',
    passed: hasTsConfig,
    points: hasTsConfig ? 10 : 0,
    maxPoints: 10,
    message: hasTsConfig ? 'tsconfig.json encontrado' : 'tsconfig.json não encontrado',
  });

  const componentsPath = findComponentsDirectory(projectPath);
  if (componentsPath) {
    const allComponents = findAllComponents(componentsPath);
    const tsComponents = allComponents.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    const nonTsComponents = allComponents.filter(f => !f.endsWith('.ts') && !f.endsWith('.tsx'));
    const total = allComponents.length;
    const typescript = tsComponents.length;
    const tsPercentage = total > 0 ? (typescript / total) * 100 : 0;

    items.push({
      name: 'Componentes TypeScript',
      passed: tsPercentage >= 80,
      points: Math.round((tsPercentage / 100) * 15),
      maxPoints: 15,
      message: `${typescript}/${total} componentes (${Math.round(tsPercentage)}%)`,
      fileIssues: nonTsComponents.map(f => ({
        file: f,
        issue: `Arquivo não usa TypeScript: "${path.basename(f)}"`,
        fix: `Renomeie para "${path.basename(f, path.extname(f))}.ts" e adicione tipagem`,
      })),
    });
  } else {
    items.push({
      name: 'Componentes TypeScript',
      passed: false,
      points: 0,
      maxPoints: 15,
      message: 'Diretório de componentes não encontrado',
    });
  }

  // Check for types/interfaces files
  const hasTypesDir = componentsPath && fs.existsSync(path.join(componentsPath, 'types'));
  const hasTypesFiles = componentsPath && hasFilesWithPattern(componentsPath, /types\.ts$/i);

  items.push({
    name: 'Arquivos de tipos',
    passed: Boolean(hasTypesDir || hasTypesFiles),
    points: hasTypesDir || hasTypesFiles ? 5 : 0,
    maxPoints: 5,
    message: hasTypesDir
      ? 'Diretório types/ encontrado'
      : hasTypesFiles
        ? 'Arquivos types.ts encontrados'
        : 'Nenhum arquivo de tipos dedicado',
  });

  const score = items.reduce((sum, item) => sum + item.points, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    name: 'TypeScript',
    score,
    maxScore,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    items,
  };
}

/**
 * Analyze tests and stories coverage
 */
async function analyzeTestsAndStories(projectPath: string, spinner: Ora): Promise<CategoryResult> {
  spinner.text = 'Analisando testes e stories...';

  const items: CheckItem[] = [];
  const componentsPath = findComponentsDirectory(projectPath);

  if (!componentsPath) {
    return {
      name: 'Testes e Stories',
      score: 0,
      maxScore: 30,
      percentage: 0,
      items: [
        {
          name: 'Cobertura de testes',
          passed: false,
          points: 0,
          maxPoints: 15,
          message: 'Diretório de componentes não encontrado',
        },
        {
          name: 'Cobertura de stories',
          passed: false,
          points: 0,
          maxPoints: 15,
          message: 'Diretório de componentes não encontrado',
        },
      ],
    };
  }

  const componentFiles = findAllComponents(componentsPath);
  const testFiles = findFilesByPattern(componentsPath, TEST_PATTERNS);
  const storyFiles = findFilesByPattern(componentsPath, STORY_PATTERNS);

  const testFileBases = new Set(testFiles.map(f => stripTestSuffix(f, TEST_PATTERNS)));
  const storyFileBases = new Set(storyFiles.map(f => stripTestSuffix(f, STORY_PATTERNS)));

  const componentsMissingTests = componentFiles.filter(f => !testFileBases.has(stripExt(f)));
  const componentsMissingStories = componentFiles.filter(f => !storyFileBases.has(stripExt(f)));

  const testCoverage =
    componentFiles.length > 0 ? (testFiles.length / componentFiles.length) * 100 : 0;
  const storyCoverage =
    componentFiles.length > 0 ? (storyFiles.length / componentFiles.length) * 100 : 0;

  items.push({
    name: 'Cobertura de testes',
    passed: testCoverage >= 70,
    points: Math.round((Math.min(testCoverage, 100) / 100) * 15),
    maxPoints: 15,
    message: `${testFiles.length}/${componentFiles.length} componentes (${Math.round(testCoverage)}%)`,
    fileIssues: componentsMissingTests.map(f => ({
      file: f,
      issue: 'Sem arquivo de teste',
      fix: `Crie ${path.join(path.dirname(f), path.basename(f, path.extname(f)) + '.spec.ts')}`,
    })),
  });

  items.push({
    name: 'Cobertura de stories',
    passed: storyCoverage >= 70,
    points: Math.round((Math.min(storyCoverage, 100) / 100) * 15),
    maxPoints: 15,
    message: `${storyFiles.length}/${componentFiles.length} componentes (${Math.round(storyCoverage)}%)`,
    fileIssues: componentsMissingStories.map(f => ({
      file: f,
      issue: 'Sem arquivo de story',
      fix: `Crie ${path.join(path.dirname(f), path.basename(f, path.extname(f)) + '.stories.ts')}`,
    })),
  });

  const score = items.reduce((sum, item) => sum + item.points, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    name: 'Testes e Stories',
    score,
    maxScore,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    items,
  };
}

/**
 * Analyze naming conventions
 */
async function analyzeNaming(projectPath: string, spinner: Ora): Promise<CategoryResult> {
  spinner.text = 'Analisando nomenclatura...';

  const items: CheckItem[] = [];
  const componentsPath = findComponentsDirectory(projectPath);

  if (!componentsPath) {
    return {
      name: 'Nomenclatura',
      score: 0,
      maxScore: 15,
      percentage: 0,
      items: [
        {
          name: 'Convenção PascalCase',
          passed: false,
          points: 0,
          maxPoints: 10,
          message: 'Diretório de componentes não encontrado',
        },
        {
          name: 'Organização por pastas',
          passed: false,
          points: 0,
          maxPoints: 5,
          message: 'Diretório de componentes não encontrado',
        },
      ],
    };
  }

  const componentFiles = findAllComponents(componentsPath);
  
  // Helper function to get the base component name (handles .types.ts, .stories.ts, etc.)
  const getComponentBaseName = (file: string): string => {
    const fileName = path.basename(file);
    // Remove .types.ts, .stories.ts, .spec.ts, .test.ts, etc.
    return fileName
      .replace(/\.(types|stories|story|spec|test)\.(ts|tsx|js|jsx)$/, '')
      .replace(/\.(ts|tsx|js|jsx|vue)$/, '');
  };
  
  const pascalCaseFiles = componentFiles.filter(file => {
    const baseName = getComponentBaseName(file);
    return /^[A-Z][a-zA-Z0-9]*$/.test(baseName);
  });
  const nonPascalFiles = componentFiles.filter(file => {
    const baseName = getComponentBaseName(file);
    return !/^[A-Z][a-zA-Z0-9]*$/.test(baseName);
  });

  const pascalCasePercentage =
    componentFiles.length > 0 ? (pascalCaseFiles.length / componentFiles.length) * 100 : 0;

  items.push({
    name: 'Convenção PascalCase',
    passed: pascalCasePercentage >= 90,
    points: Math.round((pascalCasePercentage / 100) * 10),
    maxPoints: 10,
    message: `${pascalCaseFiles.length}/${componentFiles.length} componentes (${Math.round(pascalCasePercentage)}%)`,
    fileIssues: nonPascalFiles
      .map(f => {
        const oldName = path.basename(f);
        const baseName = getComponentBaseName(f);
        
        // Convert to PascalCase
        const pascalName = baseName
          .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
          .replace(/^(.)/, (_, c: string) => c.toUpperCase());
        
        // Reconstruct the full filename with same suffixes
        const suffix = oldName.replace(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '');
        const newName = `${pascalName}${suffix}`;
        
        return {
          file: f,
          oldName,
          newName,
        };
      })
      // Only include files where the name actually needs to change
      .filter(({ oldName, newName }) => oldName !== newName)
      .map(({ file, oldName, newName }) => ({
        file,
        issue: `Nome em formato incorreto: "${oldName}"`,
        fix: `Renomeie para "${newName}"`,
      })),
  });

  // Check if components are organized in folders (Component/Component.vue pattern)
  const folderedComponents = componentFiles.filter(file => {
    const dir = path.dirname(file);
    const fileName = path.basename(file, path.extname(file));
    const parentFolder = path.basename(dir);
    return fileName === parentFolder || fileName === 'index';
  });

  const folderOrganization =
    componentFiles.length > 0 ? (folderedComponents.length / componentFiles.length) * 100 : 0;

  items.push({
    name: 'Organização por pastas',
    passed: folderOrganization >= 60,
    points: Math.round((folderOrganization / 100) * 5),
    maxPoints: 5,
    message: `${folderedComponents.length}/${componentFiles.length} componentes (${Math.round(folderOrganization)}%)`,
  });

  const score = items.reduce((sum, item) => sum + item.points, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    name: 'Nomenclatura',
    score,
    maxScore,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    items,
  };
}

/**
 * Analyze documentation
 */
async function analyzeDocumentation(projectPath: string, spinner: Ora): Promise<CategoryResult> {
  spinner.text = 'Analisando documentação...';

  const items: CheckItem[] = [];

  const hasReadme = fs.existsSync(path.join(projectPath, 'README.md'));
  items.push({
    name: 'README.md principal',
    passed: hasReadme,
    points: hasReadme ? 5 : 0,
    maxPoints: 5,
    message: hasReadme ? 'README.md encontrado' : 'README.md não encontrado',
  });

  const hasComponentDocs =
    fs.existsSync(path.join(projectPath, 'docs')) ||
    fs.existsSync(path.join(projectPath, 'documentation'));
  items.push({
    name: 'Documentação do projeto',
    passed: hasComponentDocs as boolean,
    points: hasComponentDocs ? 5 : 0,
    maxPoints: 5,
    message: hasComponentDocs
      ? 'Diretório de documentação encontrado'
      : 'Nenhum diretório docs/ ou documentation/ encontrado',
  });

  const score = items.reduce((sum, item) => sum + item.points, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    name: 'Documentação',
    score,
    maxScore,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    items,
  };
}

/**
 * Helper: Find components directory
 */
function findComponentsDirectory(projectPath: string): string | null {
  const possiblePaths = [
    path.join(projectPath, 'src', 'components'),
    path.join(projectPath, 'components'),
    path.join(projectPath, 'src', 'views'),
    path.join(projectPath, 'app', 'components'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

/**
 * Helper: Count all components
 */
function countComponents(dir: string): number {
  return findAllComponents(dir).length;
}

/**
 * Helper: Find all component files
 */
function findAllComponents(dir: string): string[] {
  const components: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (COMPONENT_EXTENSIONS.includes(ext)) {
          // Exclude test and story files
          const isTest = TEST_PATTERNS.some(pattern => entry.name.includes(pattern));
          const isStory = STORY_PATTERNS.some(pattern => entry.name.includes(pattern));
          if (!isTest && !isStory) {
            components.push(fullPath);
          }
        }
      }
    }
  }

  walk(dir);
  return components;
}

/**
 * Helper: Count components by language
 */
function countComponentsByLanguage(dir: string): { total: number; typescript: number } {
  const components = findAllComponents(dir);
  const typescript = components.filter(
    file => file.endsWith('.ts') || file.endsWith('.tsx')
  ).length;

  return { total: components.length, typescript };
}

/**
 * Helper: Find files by pattern
 */
function findFilesByPattern(dir: string, patterns: string[]): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        if (patterns.some(pattern => entry.name.includes(pattern))) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Helper: Check if has files with pattern
 */
function hasFilesWithPattern(dir: string, pattern: RegExp): boolean {
  function walk(currentDir: string): boolean {
    if (!fs.existsSync(currentDir)) return false;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        if (walk(fullPath)) return true;
      } else if (entry.isFile()) {
        if (pattern.test(entry.name)) return true;
      }
    }

    return false;
  }

  return walk(dir);
}

/**
 * Helper: Strip extension from file path
 */
function stripExt(filePath: string): string {
  return filePath.replace(/\.[^.]+$/, '');
}

/**
 * Helper: Strip test/story suffix from file path to get base component path
 */
function stripTestSuffix(filePath: string, patterns: string[]): string {
  for (const pattern of patterns) {
    if (filePath.includes(pattern)) {
      return filePath.replace(pattern, '');
    }
  }
  return stripExt(filePath);
}

/**
 * Generate summary message based on score
 */
function generateSummary(percentage: number): string {
  if (percentage >= 90) return 'Excelente! Projeto muito bem estruturado! 🏆';
  if (percentage >= 75) return 'Muito bom! Algumas melhorias podem ser feitas. 🎯';
  if (percentage >= 60) return 'Bom começo! Há espaço para melhorias. 💪';
  if (percentage >= 40) return 'Projeto precisa de melhorias significativas. ⚠️';
  return 'Projeto precisa de reestruturação para seguir as melhores práticas. 🔧';
}

/**
 * Display analysis results
 */
export function displayResults(result: AnalysisResult, options: DisplayOptions = {}): void {
  const { verbose = false } = options;
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('📊 ANÁLISE DO PROJETO STORYTYPE'));
  console.log('='.repeat(60) + '\n');

  // Overall score
  const scoreColor =
    result.percentage >= 75 ? chalk.green : result.percentage >= 60 ? chalk.yellow : chalk.red;

  console.log(
    chalk.bold('Score Geral: ') +
      scoreColor.bold(`${result.score}/${result.maxScore}`) +
      ' ' +
      scoreColor.bold(`(${result.percentage}%)`)
  );
  console.log(chalk.italic(result.summary) + '\n');

  // Category breakdown
  for (const category of result.categories) {
    const catColor =
      category.percentage >= 75
        ? chalk.green
        : category.percentage >= 60
          ? chalk.yellow
          : chalk.red;

    console.log(
      chalk.bold(`\n${category.name}: `) +
        catColor(`${category.score}/${category.maxScore}`) +
        catColor(` (${category.percentage}%)`)
    );

    for (const item of category.items) {
      const icon = item.passed ? chalk.green('✓') : chalk.red('✗');
      const points = item.passed ? chalk.green : chalk.gray;
      console.log(`  ${icon} ${item.name}: ${points(`${item.points}/${item.maxPoints} pts`)}`);
      if (item.message) {
        console.log(chalk.gray(`     ${item.message}`));
      }
      if (verbose && !item.passed && item.fileIssues && item.fileIssues.length > 0) {
        const MAX_SHOWN = 20;
        const shown = item.fileIssues.slice(0, MAX_SHOWN);
        for (const fi of shown) {
          console.log(chalk.red(`       ✗ ${fi.file}`));
          console.log(chalk.gray(`         Problema: ${fi.issue}`));
          console.log(chalk.cyan(`         Como corrigir: ${fi.fix}`));
        }
        if (item.fileIssues.length > MAX_SHOWN) {
          console.log(
            chalk.gray(`       ... e mais ${item.fileIssues.length - MAX_SHOWN} arquivos`)
          );
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Recommendations
  const recommendations = generateRecommendations(result);
  if (recommendations.length > 0) {
    console.log(chalk.bold.yellow('💡 Recomendações:\n'));
    recommendations.forEach((rec, index) => {
      console.log(chalk.yellow(`${index + 1}. ${rec}`));
    });
    console.log();
  }
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(result: AnalysisResult): string[] {
  const recommendations: string[] = [];

  for (const category of result.categories) {
    if (category.percentage < 60) {
      for (const item of category.items) {
        if (!item.passed) {
          if (item.name === 'Níveis Atomic Design') {
            recommendations.push(
              'Organize seus componentes em níveis Atomic Design (atoms, molecules, organisms, templates, pages)'
            );
          } else if (item.name === 'Componentes TypeScript') {
            recommendations.push('Migre mais componentes para TypeScript para melhor type safety');
          } else if (item.name === 'Cobertura de testes') {
            recommendations.push(
              'Adicione mais testes unitários para seus componentes (meta: 70%+)'
            );
          } else if (item.name === 'Cobertura de stories') {
            recommendations.push('Crie stories no Storybook para mais componentes (meta: 70%+)');
          } else if (item.name === 'Convenção PascalCase') {
            recommendations.push('Use PascalCase para nomes de componentes (ex: MyComponent.vue)');
          } else if (item.name === 'README.md principal') {
            recommendations.push('Adicione um arquivo README.md na raiz do projeto');
          }
        }
      }
    }
  }

  return recommendations.slice(0, 5); // Top 5 recommendations
}
