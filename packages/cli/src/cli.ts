#!/usr/bin/env node

/**
 * @storytype/cli
 * CLI tool for scaffolding Storytype components
 */

import { createProgram } from './program.js';

createProgram().parse();
