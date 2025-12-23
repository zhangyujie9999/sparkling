// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import path from 'node:path';

export async function readJSON(filePath: string): Promise<unknown> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(content) as unknown;
}

export async function readPackageJson(dir: string): Promise<{ version?: string }> {
  const packagePath = path.join(dir, 'package.json');
  const pkg = await readJSON(packagePath) as { version?: string };
  return pkg;
}

export function isEmptyDir(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return true;
  }

  const entries = fs.readdirSync(dir);
  return entries.length === 0 || (entries.length === 1 && entries[0] === '.git');
}

export function mergeJsonFiles(targetPath: string, extraPath: string): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf8')) as Record<string, unknown>;
  const extraJson = JSON.parse(fs.readFileSync(extraPath, 'utf8')) as Record<string, unknown>;

  const merged = { ...extraJson, ...targetJson } as Record<string, unknown>;

  fs.writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`);
}
