// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { findSparklingProjectRoot } from '../util';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('util', () => {
  describe('findSparklingProjectRoot', () => {
    let tempDir: string;
    let projectRoot: string;
    let nestedDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sparkling-test-'));
      projectRoot = path.join(tempDir, 'my-project');
      nestedDir = path.join(projectRoot, 'src', 'components', 'ui');
      
      fs.mkdirSync(nestedDir, { recursive: true });
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should find project root when package.json exists in current directory', () => {
      fs.writeFileSync(path.join(projectRoot, 'package.json'), '{}');

      const result = findSparklingProjectRoot(projectRoot);
      expect(result).toBe(projectRoot);
    });

    it('should find project root when package.json exists in parent directory', () => {
      fs.writeFileSync(path.join(projectRoot, 'package.json'), '{}');
      
      const srcDir = path.join(projectRoot, 'src');
      const result = findSparklingProjectRoot(srcDir);
      expect(result).toBe(projectRoot);
    });

    it('should find project root when package.json exists multiple levels up', () => {
      fs.writeFileSync(path.join(projectRoot, 'package.json'), '{}');
      
      const result = findSparklingProjectRoot(nestedDir);
      expect(result).toBe(projectRoot);
    });

    it('should return null when no package.json is found', () => {
      const result = findSparklingProjectRoot(nestedDir);
      expect(result).toBeNull();
    });

    it('should return null when starting from root directory without package.json', () => {
      const result = findSparklingProjectRoot(nestedDir);
      expect(result).toBeNull();
    });

    it('should use current working directory when no startDir is provided', () => {
      const originalCwd = process.cwd();
      
      try {
        process.chdir(projectRoot);
        fs.writeFileSync(path.join(projectRoot, 'package.json'), '{}');

        const result = findSparklingProjectRoot();
        expect(fs.realpathSync(result!)).toBe(fs.realpathSync(projectRoot));
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should find the closest package.json when multiple exist in hierarchy', () => {
      const outerProject = projectRoot;
      const innerProject = path.join(projectRoot, 'inner');
      const deepDir = path.join(innerProject, 'src', 'components');
      
      fs.mkdirSync(deepDir, { recursive: true });
      fs.writeFileSync(path.join(outerProject, 'package.json'), '{}');
      fs.writeFileSync(path.join(innerProject, 'package.json'), '{}');

      const result = findSparklingProjectRoot(deepDir);
      expect(result).toBe(innerProject);
    });

    it('should handle edge case of starting from filesystem root', () => {
      const result = findSparklingProjectRoot('/');
      expect(result).toBeNull();
    });
  });
});