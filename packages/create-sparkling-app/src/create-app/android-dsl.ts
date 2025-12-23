// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { ui } from '../ui';

export type AndroidDslChoice = 'kts' | 'groovy';
export const DEFAULT_ANDROID_DSL: AndroidDslChoice = 'kts';

const ANDROID_GROOVY_OVERRIDE_DIR = resolveGroovyOverrideDir();
const ANDROID_KTS_FILES = [
  'android/build.gradle.kts',
  'android/settings.gradle.kts',
  'android/app/build.gradle.kts',
  'android/sparkling-method-media/build.gradle.kts',
];
const ANDROID_GROOVY_FILES = [
  'android/build.gradle',
  'android/settings.gradle',
  'android/app/build.gradle',
  'android/sparkling-method-media/build.gradle',
];

export function applyAndroidDslChoice({
  allowGroovyOverrides,
  projectDir,
  selection,
}: {
  allowGroovyOverrides: boolean;
  projectDir: string;
  selection: AndroidDslChoice;
}): void {
  if (selection === 'kts') {
    removeFiles(projectDir, ANDROID_GROOVY_FILES);
    return;
  }

  if (!allowGroovyOverrides) {
    console.warn(ui.warn('Groovy build files requested, but the selected template does not support automatic conversion. Keeping Kotlin DSL files.'));
    return;
  }

  if (!ANDROID_GROOVY_OVERRIDE_DIR || !fs.existsSync(ANDROID_GROOVY_OVERRIDE_DIR)) {
    console.warn(ui.warn('Groovy build overrides are missing. Keeping Kotlin DSL files.'));
    return;
  }

  for (const relative of ANDROID_GROOVY_FILES) {
    const source = path.join(ANDROID_GROOVY_OVERRIDE_DIR, relative);
    if (!fs.existsSync(source)) {
      continue;
    }

    const target = path.join(projectDir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }

  removeFiles(projectDir, ANDROID_KTS_FILES);
}

function resolveGroovyOverrideDir(): string | undefined {
  try {
    const pkgRoot = path.dirname(Module.createRequire(__filename).resolve('sparkling-method/package.json'));
    return path.join(pkgRoot, 'templates', 'sparkling-app-template-android-groovy');
  } catch {
    return undefined;
  }
}

function removeFiles(baseDir: string, files: string[]): void {
  for (const relative of files) {
    const target = path.join(baseDir, relative);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { force: true });
    }
  }
}
