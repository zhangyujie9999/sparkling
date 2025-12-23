// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import inquirer, { type QuestionCollection } from 'inquirer';
import { ui } from '../ui';

import type { ModuleConfig } from './types';
import { normalizePackageName } from './utils';

export async function promptProjectName(): Promise<string> {
  const answers = await inquirer.prompt<{ projectName: string }>([
    {
      type: 'input',
      name: 'projectName',
      message: ui.prompt('Project name (directory / package name):'),
      default: 'sparkling-method-module',
      validate: (input: string) => !!input.trim() || 'Project name is required.',
      filter: (input: string) => input.trim(),
    },
  ] as QuestionCollection);

  return normalizePackageName(answers.projectName);
}

export async function promptModuleInfo(
  defaults: { packageName: string; moduleName: string },
): Promise<Omit<ModuleConfig, 'projectName'>> {
  const questions: QuestionCollection[] = [
    {
      type: 'input',
      name: 'packageName',
      message: ui.prompt('Namespace / bundle identifier (e.g. com.example):'),
      default: defaults.packageName,
      validate: (input: string) => !!input.trim() || 'Package name is required.',
    },
    {
      type: 'input',
      name: 'moduleName',
      message: ui.prompt('Module name (PascalCase, e.g. Storage):'),
      default: defaults.moduleName,
      validate: (input: string) => /[A-Za-z]/.test(input) || 'Module name must contain letters.',
    },
  ];

  questions.push({
    type: 'list',
    name: 'androidDsl',
    message: ui.prompt('Android Gradle DSL:'),
    default: 'kts',
    choices: [
      { name: 'Kotlin (.gradle.kts)', value: 'kts' },
      { name: 'Groovy (.gradle)', value: 'groovy' },
    ],
  });

  const answers = await inquirer.prompt<{ packageName: string; moduleName: string; androidDsl: 'kts' | 'groovy' }>(questions as QuestionCollection);

  return {
    packageName: answers.packageName.trim(),
    moduleName: answers.moduleName.trim(),
    androidDsl: answers.androidDsl ?? 'kts',
  };
}
