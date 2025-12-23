// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import path from 'path';

import { promptModuleInfo, promptProjectName } from './prompts';
import {
  copyTemplateDirectory,
  createPackageJson,
  ensurePlatformScaffolds,
  resolveTemplateDir,
  writeAndroidConfigs,
  writeIosConfigs,
  writeModuleConfig,
} from './scaffold';
import type { InitOptions, ModuleConfig } from './types';
import { toPascalCase } from './utils';
import { ui } from '../ui';
import { isVerboseEnabled, verboseLog } from '../verbose';

export async function runInit(projectName: string | undefined, options: InitOptions): Promise<void> {
  const normalizedProjectName = projectName?.trim() || await promptProjectName();
  const templateDir = await resolveTemplateDir(options.template);
  const targetDir = path.resolve(process.cwd(), normalizedProjectName);

  if (isVerboseEnabled()) {
    verboseLog(`init -> project: ${normalizedProjectName}, targetDir: ${targetDir}`);
    verboseLog(`init -> templateDir: ${templateDir}, force: ${options.force === true}`);
  }

  const moduleDefaults = {
    packageName: 'org.sparkling',
    moduleName: toPascalCase(normalizedProjectName),
  };
  const moduleConfig = await promptModuleInfo(moduleDefaults);
  if (isVerboseEnabled()) {
    verboseLog(`init -> module config: package=${moduleConfig.packageName}, name=${moduleConfig.moduleName}, dsl=${moduleConfig.androidDsl}`);
  }

  console.log(ui.headline(`\n✨ Initializing sparkling method project in ${targetDir}`));
  await copyTemplateDirectory(templateDir, targetDir, options.force);
  await createPackageJson(normalizedProjectName, targetDir);

  const persisted: ModuleConfig = await writeModuleConfig(normalizedProjectName, moduleConfig, targetDir);
  await ensurePlatformScaffolds(persisted, targetDir);
  await writeAndroidConfigs(persisted, targetDir);
  await writeIosConfigs(persisted, targetDir);

  console.log(ui.success('\n✅ Project created successfully.'));
  console.log(ui.tip(`cd ${normalizedProjectName}`));
  console.log(ui.tip('Edit and rename src/method.d.ts to describe your APIs.'));
  console.log(ui.tip('Run `npm run codegen` to generate native stubs.'));
}
