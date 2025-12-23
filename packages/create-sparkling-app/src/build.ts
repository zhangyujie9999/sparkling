// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
import path from 'path';
import { findSparklingProjectRoot } from './util';

export type BuildType = 'all' | 'frontend' | 'android' | 'ios';

const runCommand = (command: string, args: string[], cwd: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')} in ${cwd}`);
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', (error) => {
      console.error(`Error with command ${command}: ${error}`);
      reject(error);
    });
    child.on('exit', (code) => {
      if (code !== 0) {
        const errorMsg = `Command ${command} exited with code ${code}`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      } else {
        resolve();
      }
    });
  });
};

const buildFrontend = (projectDir: string) => {
  const command = 'pnpm';
  const args = ['run', 'dev'];
  return runCommand(command, args, projectDir);
};

const buildAndroid = (projectDir: string) => {
  const androidDir = path.join(projectDir, 'android');
  const command = './gradlew';
  const args = ['build'];
  return runCommand(command, args, androidDir);
};

const buildIos = async (projectDir: string) => {
  const iosDir = path.join(projectDir, 'ios');

  try {
    const scheme = 'SparklingGo';
    const workspace = 'SparklingGo.xcworkspace';
    const configuration = 'Debug';
    const build_dir = path.join(iosDir, 'build');

    console.log('Finding available simulator...');
    const { stdout: devicesOutput } = await execAsync('xcrun simctl list devices available');
    const simulatorLine = devicesOutput.split('\n').find(line => line.includes('iPhone')) ?? '';
    if (!simulatorLine) {
      throw new Error('No available iPhone simulator found.')
    }
    const simulatorName = simulatorLine.split('(')[0].trim();
    console.log(`Using simulator: ${simulatorName}`);
    const destination = `platform=iOS Simulator,name=${simulatorName},OS=latest`;

    await runCommand('xcodebuild', ['clean', '-workspace', workspace, '-scheme', scheme, '-configuration', configuration], iosDir);

    await runCommand(
      'xcodebuild',
      ['build', '-workspace', workspace, '-scheme', scheme, '-configuration', configuration, '-destination', destination, '-derivedDataPath', build_dir],
      iosDir
    );

    const { stdout: appPath } = await execAsync(`find "${build_dir}" -name "*.app" | head -n 1`);
    if (!appPath) {
      throw new Error('.app file not found.');
    }
    console.log(`App found at: ${appPath.trim()}`);

    try {
      await execAsync(`xcrun simctl boot "${simulatorName}"`);
    } catch (e) {
      console.log('Simulator already booted.');
    }

    await runCommand('xcrun', ['simctl', 'install', 'booted', appPath.trim()], projectDir);

    const { stdout: bundleId } = await execAsync(`/usr/libexec/PlistBuddy -c "Print:CFBundleIdentifier" "${appPath.trim()}/Info.plist"`);
    await runCommand('xcrun', ['simctl', 'launch', 'booted', bundleId.trim()], projectDir);

    console.log('iOS build completed successfully.');
  } catch (error: any) {
    console.error(`iOS build failed: ${error.message}`);
    throw error;
  }
};

const buildAll = async (projectDir: string) => {
  try {
    await Promise.all([
      buildFrontend(projectDir),
      buildAndroid(projectDir),
      buildIos(projectDir),
    ]);
  } catch (error) {
    console.error('A build step failed. Aborting.');
    process.exit(1);
  }
};

export default async (buildType: BuildType) => {
  console.log('Building Sparkling Lynx project...');

  const projectRoot = findSparklingProjectRoot();
  if (!projectRoot) {
    throw new Error('Failed to find Sparkling project root');
  }

  if (!buildType || buildType === 'all') {
    await buildAll(projectRoot);
  } else if (buildType === 'frontend') {
    await buildFrontend(projectRoot);
  } else if (buildType === 'android') {
    await buildAndroid(projectRoot);
  } else if (buildType === 'ios') {
    await buildIos(projectRoot);
  } else {
    throw new Error(`Invalid build type: ${buildType}`);
  }
};