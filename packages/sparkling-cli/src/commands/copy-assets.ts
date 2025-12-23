// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'fs-extra';
import path from 'node:path';
import { relativeTo } from '../utils/paths';
import { isVerboseEnabled, verboseLog } from '../utils/verbose';
import { ui } from '../utils/ui';

export interface CopyAssetsOptions {
  source?: string;
  androidDest?: string;
  iosDest?: string;
  cwd: string;
}

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    console.warn(ui.warn(`Skip copy: missing source ${src}`));
    return;
  }
  fs.ensureDirSync(dest);
  fs.cpSync(src, dest, { recursive: true, force: true, dereference: true });
}

export async function copyAssets(options: CopyAssetsOptions): Promise<void> {
  const source = path.resolve(options.cwd, options.source ?? 'dist');
  const androidDest = path.resolve(options.cwd, options.androidDest ?? 'android/app/src/main/assets');
  const iosDest = path.resolve(options.cwd, options.iosDest ?? 'ios/LynxResources/Assets');
  if (isVerboseEnabled()) {
    verboseLog(`Copy assets source: ${source}`);
    verboseLog(`Android assets destination: ${androidDest}`);
    verboseLog(`iOS assets destination: ${iosDest}`);
  }

  for (const dest of [androidDest, iosDest]) {
    console.log(ui.info(`Copying ${relativeTo(options.cwd, source)} -> ${relativeTo(options.cwd, dest)}`));
    copyDir(source, dest);
  }

  console.log(ui.success('Assets copied successfully.'));
}
