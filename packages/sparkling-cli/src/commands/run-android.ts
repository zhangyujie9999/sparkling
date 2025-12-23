// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import path from 'node:path';
import { autolink } from './autolink';
import { buildProject } from './build';
import { runCommand } from '../utils/exec';
import { ui } from '../utils/ui';
import { isVerboseEnabled, verboseLog } from '../utils/verbose';

export interface RunAndroidOptions {
  cwd: string;
  skipCopy?: boolean;
}

function resolveAndroidAppGradle(cwd: string): string | null {
  const kts = path.resolve(cwd, 'android/app/build.gradle.kts');
  const groovy = path.resolve(cwd, 'android/app/build.gradle');
  if (fs.existsSync(kts)) return kts;
  if (fs.existsSync(groovy)) return groovy;
  return null;
}

function resolveGradle(cwd: string): string {
  const gradlew = path.resolve(cwd, 'android/gradlew');
  const gradleBat = path.resolve(cwd, 'android/gradlew.bat');
  if (process.platform === 'win32' && fs.existsSync(gradleBat)) {
    return gradleBat;
  }
  if (fs.existsSync(gradlew)) {
    return gradlew;
  }
  return 'gradlew';
}

function resolveAndroidPackageId(cwd: string): string {
  const gradlePath = resolveAndroidAppGradle(cwd);
  try {
    if (gradlePath && fs.existsSync(gradlePath)) {
      const content = fs.readFileSync(gradlePath, 'utf8');
      const m = content.match(/applicationId\s*=?\s*["']([^"']+)["']/);
      if (m) return m[1];
    }
  } catch {}
  return 'com.example.sparkling.go';
}

function resolveAndroidLaunchActivity(cwd: string, pkg: string): string {
  const manifestPath = path.resolve(cwd, 'android/app/src/main/AndroidManifest.xml');
  try {
    if (fs.existsSync(manifestPath)) {
      const xml = fs.readFileSync(manifestPath, 'utf8');
      const m = xml.match(/<activity[^>]*android:name="([^"]+)"[\s\S]*?<intent-filter>[\s\S]*?LAUNCHER[\s\S]*?<\/intent-filter>/);
      if (m) return m[1];
      const mAny = xml.match(/<activity[^>]*android:name="([^"]+)"/);
      if (mAny) return mAny[1];
    }
  } catch {}
  return `${pkg}.MainActivity`;
}

export async function runAndroid(options: RunAndroidOptions): Promise<void> {
  await autolink({ cwd: options.cwd, platform: 'android' });
  await buildProject({ cwd: options.cwd, skipCopy: options.skipCopy });

  const gradleCmd = resolveGradle(options.cwd);
  const androidDir = path.resolve(options.cwd, 'android');
  const env = { SPARKLING_USE_NATIVE_ASSETS: options.skipCopy ? 'false' : 'true' };
  if (isVerboseEnabled()) {
    verboseLog(`Resolved Gradle command: ${gradleCmd}`);
    verboseLog(`Android project directory: ${androidDir}`);
    verboseLog(`Env overrides: ${JSON.stringify(env)}`);
  }
  // Always build first so artifacts exist even when no device is connected
  await runCommand(gradleCmd, ['assembleDebug'], { cwd: androidDir, env });
  // Try to install if a device is connected; ignore failure so CI/headless environments are not blocked
  console.log(ui.tip('Attempting device install (if any devices are connected)...'));
  await runCommand(gradleCmd, ['installDebug'], { cwd: androidDir, ignoreFailure: true, env });
  // Attempt to launch the app on a connected device
  const pkg = resolveAndroidPackageId(options.cwd);
  const activity = resolveAndroidLaunchActivity(options.cwd, pkg);
  if (isVerboseEnabled()) {
    verboseLog(`Resolved Android package: ${pkg}`);
    verboseLog(`Resolved launch activity: ${activity}`);
  }
  console.log(ui.tip(`Attempting to launch ${pkg}/${activity} on device (if connected)...`));
  await runCommand('adb', ['shell', 'am', 'start', '-n', `${pkg}/${activity}`], { cwd: options.cwd, ignoreFailure: true });
  console.log(ui.success('Android debug build ready. If no device, manually install via `adb install` on the built APK.'));
}
