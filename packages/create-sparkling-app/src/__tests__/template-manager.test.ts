// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import * as templateManager from '../create-app/template-manager';
import { DEFAULT_TEMPLATE_PACKAGE } from '../create-app/constants';

describe('template-manager', () => {
  const originalCwd = process.cwd();
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sparkling-template-'));
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('resolves npm templates when prefixed with npm:', async () => {
    const packageName = '@scope/sparkling-template';
    const version = '1.2.3';
    const templateDir = path.join(tempDir, '.temp-templates', templateManager.sanitizeCacheKey(packageName, version));

    fs.mkdirSync(templateDir, { recursive: true });

    const resolved = await templateManager.resolveCustomTemplate(`npm:${packageName}`, version);

    expect(fs.realpathSync(resolved)).toBe(fs.realpathSync(templateDir));
  });

  it('throws when npm prefix is missing a package name', async () => {
    await expect(templateManager.resolveCustomTemplate('npm:')).rejects.toThrow('npm template');
  });

  it('refreshes default template to latest even when cache exists', async () => {
    process.env.SPK_TEMPLATE_SKIP_INSTALL = '1';
    const cacheDir = path.join(
      tempDir,
      '.temp-templates',
      templateManager.sanitizeCacheKey(DEFAULT_TEMPLATE_PACKAGE, 'latest'),
    );
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'old.txt'), 'old');

    const packageRoot = path.join(tempDir, '.temp-templates', 'node_modules', DEFAULT_TEMPLATE_PACKAGE, 'template');
    fs.mkdirSync(packageRoot, { recursive: true });
    fs.writeFileSync(path.join(packageRoot, 'new.txt'), 'new');

    const resolved = await templateManager.resolveDefaultTemplate();

    expect(fs.existsSync(path.join(resolved, 'new.txt'))).toBe(true);
    expect(fs.existsSync(path.join(resolved, 'old.txt'))).toBe(false);
    delete process.env.SPK_TEMPLATE_SKIP_INSTALL;
  });
});
