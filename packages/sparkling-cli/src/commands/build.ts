// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'fs-extra';
import path from 'node:path';
import { createRequire } from 'node:module';
import { loadAppConfig } from '../config';
import { runCommand } from '../utils/exec';
import { ui } from '../utils/ui';
import { isVerboseEnabled, verboseLog } from '../utils/verbose';
import { copyAssets } from './copy-assets';

export interface BuildOptions {
  cwd: string;
  configFile?: string;
  skipCopy?: boolean;
}

function createTempLynxConfig(cwd: string, appConfigPath: string): string {
  const tempDir = path.resolve(cwd, '.sparkling');
  fs.ensureDirSync(tempDir);
  const tempConfigPath = path.join(tempDir, 'lynx.config.ts');
  const rel = path.relative(tempDir, path.resolve(appConfigPath)).split(path.sep).join('/');
  const content = [
    `import cfgModule from '${rel.startsWith('.') ? rel : './' + rel}'`,
    'const cfg: any = (cfgModule as any).default ?? cfgModule',
    'export default (cfg.lynxConfig ?? cfg) as any',
  ].join('\n');
  fs.writeFileSync(tempConfigPath, content);
  return tempConfigPath;
}

function resolveRspeedyBinary(): string {
  // Rely on the package manager to place `rspeedy` on PATH via node_modules/.bin
  return 'rspeedy';
}

export async function buildProject(options: BuildOptions): Promise<void> {
  const configPath = path.resolve(options.cwd, options.configFile ?? 'app.config.ts');
  const tempConfigPath = createTempLynxConfig(options.cwd, configPath);
  const rspeedyBin = resolveRspeedyBinary();

  if (isVerboseEnabled()) {
    verboseLog(`App config path: ${configPath}`);
    verboseLog(`Temp Lynx config: ${tempConfigPath}`);
    verboseLog(`rspeedy binary: ${rspeedyBin}`);
  }

  console.log(ui.headline(`Building Lynx bundle with config from ${path.relative(options.cwd, configPath)}`));
  await runCommand(rspeedyBin, ['build', '--config', tempConfigPath], { cwd: options.cwd });

  const shouldCopy = options.skipCopy !== true; // default to no copy
  if (shouldCopy) {
    // Read AppConfig to locate platform asset destinations if provided
    const { config } = await loadAppConfig(options.cwd, options.configFile ?? 'app.config.ts');
    await copyAssets({
      cwd: options.cwd,
      androidDest: config.paths?.androidAssets ?? 'android/app/src/main/assets',
      iosDest: config.paths?.iosAssets ?? 'ios/SparklingGo/SparklingGo/Resources/Assets',
    });
  } else if (isVerboseEnabled()) {
    verboseLog('Skipping asset copy because --skip-copy is in effect.');
  }
}
