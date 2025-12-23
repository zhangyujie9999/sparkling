// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ANDROID_NAMESPACE = 'com.tiktok.sparkling.go';
const DEFAULT_ANDROID_TEST_PACKAGE = 'com.tiktok.sparkling.app';
const DEFAULT_IOS_BUNDLE_ID = 'com.sparkling.app.SparklingGo';
const DEFAULT_IOS_TEST_BUNDLE_ID = 'com.sparkling.app.SparklingGoTests';
const DEFAULT_IOS_UITEST_BUNDLE_ID = 'com.sparkling.app.SparklingGoUITests';
const DEFAULT_IOS_METHOD_TEST_BUNDLE_ID = 'com.sparkling.app.SparklingMethodTests';

export function deriveDefaultNamespace(packageName: string): string {
  const sanitized = packageName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.+/g, '.');

  const finalName = sanitized.length > 0 ? sanitized : 'sparkling.app';
  return finalName.startsWith('com.') ? finalName : `com.${finalName}`;
}

export function isValidNamespace(namespace: string): boolean {
  return /^[a-zA-Z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(namespace);
}

function replaceInTree(targetPath: string, replacements: Record<string, string>): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      replaceInTree(path.join(targetPath, entry), replacements);
    }
    return;
  }

  let content = fs.readFileSync(targetPath, 'utf8');
  let updated = content;

  for (const [from, to] of Object.entries(replacements)) {
    if (!from) continue;
    updated = updated.split(from).join(to);
  }

  if (updated !== content) {
    fs.writeFileSync(targetPath, updated, 'utf8');
  }
}

function moveAndroidPackageDirs(appDir: string, oldNamespace: string, newNamespace: string): void {
  const oldParts = oldNamespace.split('.');
  const newParts = newNamespace.split('.');
  const srcRoots = ['main', 'androidTest', 'test'];

  for (const root of srcRoots) {
    const oldPath = path.join(appDir, 'src', root, 'java', ...oldParts);
    const newPath = path.join(appDir, 'src', root, 'java', ...newParts);

    if (!fs.existsSync(oldPath)) {
      continue;
    }

    if (oldPath === newPath) {
      continue;
    }

    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.renameSync(oldPath, newPath);
  }
}

function applyAndroidNamespace(projectDir: string, namespace: string): void {
  const appDir = path.join(projectDir, 'android', 'app');
  if (!fs.existsSync(appDir)) {
    return;
  }

  const replacements: Record<string, string> = {
    [DEFAULT_ANDROID_NAMESPACE]: namespace,
    [DEFAULT_ANDROID_TEST_PACKAGE]: namespace,
  };

  replaceInTree(appDir, replacements);
  moveAndroidPackageDirs(appDir, DEFAULT_ANDROID_NAMESPACE, namespace);
}

function applyIosBundleIdentifiers(projectDir: string, namespace: string): void {
  const pbxproj = path.join(projectDir, 'ios', 'SparklingGo.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(pbxproj)) {
    return;
  }

  const replacements: Record<string, string> = {
    [DEFAULT_IOS_BUNDLE_ID]: namespace,
    [DEFAULT_IOS_TEST_BUNDLE_ID]: `${namespace}.tests`,
    [DEFAULT_IOS_UITEST_BUNDLE_ID]: `${namespace}.uitests`,
    [DEFAULT_IOS_METHOD_TEST_BUNDLE_ID]: `${namespace}.methodtests`,
  };

  replaceInTree(pbxproj, replacements);
}

export function applyPackageNamespace(projectDir: string, namespace: string): void {
  applyAndroidNamespace(projectDir, namespace);
  applyIosBundleIdentifiers(projectDir, namespace);
}
