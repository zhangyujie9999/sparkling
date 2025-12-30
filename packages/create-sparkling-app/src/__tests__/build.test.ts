// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import path from 'path';
import { spawn, exec } from 'child_process';
import build, { BuildType } from '../build';
import { findSparklingProjectRoot } from '../util';
import {
  createMockChildProcess,
  createMockExecForIOS,
  createMockExecNoSimulator,
  TEST_CONSTANTS,
} from './test-utils';


jest.mock('child_process');
jest.mock('../util');

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockExec = exec as jest.MockedFunction<typeof exec>;
const mockFindSparklingProjectRoot = findSparklingProjectRoot as jest.MockedFunction<typeof findSparklingProjectRoot>;

describe('build', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    mockFindSparklingProjectRoot.mockReturnValue(TEST_CONSTANTS.MOCK_PROJECT_ROOT);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('buildType validation', () => {
    it('should throw error when project root is not found', async () => {
      mockFindSparklingProjectRoot.mockReturnValue(null);

      await expect(build('frontend')).rejects.toThrow('Failed to find Sparkling project root');
    });

    it('should throw error for invalid build type', async () => {
      await expect(build('invalid' as BuildType)).rejects.toThrow('Invalid build type: invalid');
    });
  });

  describe('frontend build', () => {
    it('should execute pnpm run dev for frontend build', async () => {
      const mockChild = createMockChildProcess(0);
      mockSpawn.mockReturnValue(mockChild as any);

      await build('frontend');

      expect(mockSpawn).toHaveBeenCalledWith('pnpm', ['run', 'dev'], {
        cwd: TEST_CONSTANTS.MOCK_PROJECT_ROOT,
        stdio: 'inherit'
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Executing: pnpm run dev')
      );
    });

    it('should handle frontend build command error', async () => {
      const mockChild = createMockChildProcess(0, true);
      mockSpawn.mockReturnValue(mockChild as any);

      await expect(build('frontend')).rejects.toThrow('Command failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error with command pnpm')
      );
    });

    it('should handle frontend build exit code error', async () => {
      const mockChild = createMockChildProcess(1);
      mockSpawn.mockReturnValue(mockChild as any);

      await expect(build('frontend')).rejects.toThrow('Command pnpm exited with code 1');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Command pnpm exited with code 1');
    });
  });

  describe('android build', () => {
    it('should execute gradlew build for android build', async () => {
      const mockChild = createMockChildProcess(0);
      mockSpawn.mockReturnValue(mockChild as any);

      await build('android');

      expect(mockSpawn).toHaveBeenCalledWith('./gradlew', ['build'], {
        cwd: path.join(TEST_CONSTANTS.MOCK_PROJECT_ROOT, 'android'),
        stdio: 'inherit'
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Executing: ./gradlew build')
      );
    });
  });

  describe('ios build', () => {
    beforeEach(() => {
      mockExec.mockImplementation(createMockExecForIOS());
    });

    it('should execute iOS build commands', async () => {
      const mockChild = createMockChildProcess(0);
      mockSpawn.mockReturnValue(mockChild as any);

      await build('ios');

      expect(consoleLogSpy).toHaveBeenCalledWith('Finding available simulator...');
      expect(consoleLogSpy).toHaveBeenCalledWith('Using simulator: iPhone 14');
      expect(mockSpawn).toHaveBeenCalledWith('xcodebuild', 
        ['clean', '-workspace', 'SparklingGo.xcworkspace', '-scheme', 'SparklingGo', '-configuration', 'Debug'],
        { cwd: path.join(TEST_CONSTANTS.MOCK_PROJECT_ROOT, 'ios'), stdio: 'inherit' }
      );
    });

    it('should handle no available simulator error', async () => {
      mockExec.mockImplementation(createMockExecNoSimulator());

      await expect(build('ios')).rejects.toThrow('No available iPhone simulator found.');
    });
  });

  describe('build all', () => {
    it('should execute all build types when buildType is "all"', async () => {
      const mockChild = createMockChildProcess(0);
      mockSpawn.mockReturnValue(mockChild as any);
      
      mockExec.mockImplementation(createMockExecForIOS());

      await build('all');


      expect(mockSpawn).toHaveBeenCalledWith('pnpm', ['run', 'dev'], expect.any(Object));
      expect(mockSpawn).toHaveBeenCalledWith('./gradlew', ['build'], expect.any(Object));
      expect(mockSpawn).toHaveBeenCalledWith('xcodebuild', expect.arrayContaining(['clean']), expect.any(Object));
    });

    it('should execute all build types when buildType is undefined', async () => {
      const mockChild = createMockChildProcess(0);
      mockSpawn.mockReturnValue(mockChild as any);
      
      mockExec.mockImplementation(createMockExecForIOS());

      await build(undefined as any);

      expect(mockSpawn).toHaveBeenCalledWith('pnpm', ['run', 'dev'], expect.any(Object));
      expect(mockSpawn).toHaveBeenCalledWith('./gradlew', ['build'], expect.any(Object));
      expect(mockSpawn).toHaveBeenCalledWith('xcodebuild', expect.arrayContaining(['clean']), expect.any(Object));
    });

    it('should exit with code 1 when a build step fails in buildAll', async () => {
      const mockChild = createMockChildProcess(1);
      mockSpawn.mockReturnValue(mockChild as any);

      await build('all');

      expect(consoleErrorSpy).toHaveBeenCalledWith('A build step failed. Aborting.');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});