// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { autolink } from './autolink';
import { buildProject } from './build';
import { runCommand } from '../utils/exec';
import { ui } from '../utils/ui';
import { isVerboseEnabled, verboseLog } from '../utils/verbose';

export interface RunIosOptions {
  cwd: string;
  skipCopy?: boolean;
  device?: string;
  skipPodInstall?: boolean;
}

interface SimulatorDevice {
  name: string;
  udid: string;
  runtime?: string;
  state?: string;
  isAvailable?: boolean;
}

function resolveWorkspacePath(cwd: string): string | null {
  const candidates = [
    path.resolve(cwd, 'ios', 'SparklingGo.xcworkspace'),
    path.resolve(cwd, 'ios', 'SparklingGo', 'SparklingGo.xcworkspace'),
  ];
  return candidates.find(p => fs.existsSync(p)) ?? null;
}

function findNearestGemfile(startDir: string): string | null {
  let current = startDir;
  const { root } = path.parse(startDir);
  while (true) {
    const gemfile = path.join(current, 'Gemfile');
    if (fs.existsSync(gemfile)) return gemfile;
    if (current === root) break;
    current = path.dirname(current);
  }
  return null;
}

async function ensureBundleInstall(gemfileDir: string): Promise<boolean> {
  console.log(ui.info('Installing Ruby gems via bundle install...'));
  try {
    await runCommand('bundle', ['install'], { cwd: gemfileDir });
    return true;
  } catch (error) {
    console.warn(
      ui.warn(
        `bundle install failed: ${String(error)}. ` +
          'Ensure Bundler is installed and Ruby is configured properly.',
      ),
    );
    return false;
  }
}

async function installPods(podfilePath: string): Promise<void> {
  const podDir = path.dirname(podfilePath);
  const gemfile = findNearestGemfile(podDir);
  if (!gemfile) {
    console.warn(
      ui.warn(
        'Gemfile not found for iOS project. Ensure a Gemfile exists in the workspace (root or template) to pin CocoaPods.',
      ),
    );
  }

  const gemfileDir = gemfile ? path.dirname(gemfile) : podDir;
  const bundled = await ensureBundleInstall(gemfileDir);
  if (!bundled) {
    throw new Error(
      'bundle install failed. Please run `bundle install` manually to set up the pinned CocoaPods version.',
    );
  }

  try {
    const env = { ...(gemfile ? { BUNDLE_GEMFILE: gemfile } : {}), RUBYOPT: '-rlogger' };
    await runCommand('bundle', ['exec', 'pod', 'install'], { cwd: podDir, env });
  } catch (error) {
    throw new Error(
      `bundle exec pod install failed: ${String(error)}. Older CocoaPods (<=1.11) cannot parse PBXFileSystemSynchronizedRootGroup; run \`bundle install\` to pick up the pinned version.`,
    );
  }
}

function listAvailableSimulators(): SimulatorDevice[] {
  try {
    const raw = execSync('xcrun simctl list devices available --json', { stdio: 'pipe' }).toString('utf8');
    const parsed = JSON.parse(raw) as { devices?: Record<string, SimulatorDevice[]> };
    const devices = Object.entries(parsed.devices ?? {})
      .filter(([runtime]) => runtime.toLowerCase().includes('ios'))
      .flatMap(([, list]) => list);
    return devices.filter(d => d.isAvailable);
  } catch (error) {
    console.warn(ui.warn(`Failed to list simulators, falling back to default: ${String(error)}`));
    return [];
  }
}

function parseRuntimeVersion(runtime?: string): number {
  if (!runtime) return 0;
  const match = runtime.match(/iOS-(\d+)-?(\d+)?/i);
  if (!match) return 0;
  const major = Number(match[1]) || 0;
  const minor = Number(match[2] ?? '0') || 0;
  return major + minor / 10;
}

function pickSimulator(preferred?: string): SimulatorDevice | null {
  const devices = listAvailableSimulators();
  if (!devices.length) {
    return null;
  }

  if (preferred) {
    const match = devices.find(d => d.name === preferred || d.udid === preferred);
    if (match) return match;
  }

  const booted = devices.filter(d => (d.state ?? '').toLowerCase() === 'booted');
  if (booted.length) {
    return booted.sort((a, b) => parseRuntimeVersion(b.runtime) - parseRuntimeVersion(a.runtime))[0] ?? null;
  }

  const preferredNames = [
    'iPhone 17 Pro',
    'iPhone 17',
    'iPhone 16 Pro',
    'iPhone 16',
    'iPhone 15 Pro',
    'iPhone 15',
    'iPhone 14 Pro',
    'iPhone 14',
    'iPhone 13',
    'iPhone SE',
  ];

  return devices
    .sort((a, b) => {
      const runtimeDiff = parseRuntimeVersion(b.runtime) - parseRuntimeVersion(a.runtime);
      if (runtimeDiff !== 0) return runtimeDiff;
      const aIdx = preferredNames.findIndex(n => a.name.includes(n));
      const bIdx = preferredNames.findIndex(n => b.name.includes(n));
      if (aIdx === -1 && bIdx === -1) return a.name.localeCompare(b.name);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    })[0] ?? null;
}

export async function runIos(options: RunIosOptions): Promise<void> {
  if (isVerboseEnabled()) {
    verboseLog(`run:ios options -> skipCopy: ${options.skipCopy === true}, device: ${options.device ?? '(auto)'}, skipPodInstall: ${options.skipPodInstall === true}`);
  }
  const preferredDevice = options.device ?? process.env.SPARKLING_IOS_SIMULATOR;
  const device = pickSimulator(preferredDevice);
  if (!device) {
    throw new Error('No available iOS simulators found. Install Xcode CLT / Simulator and try again.');
  }
  console.log(ui.headline(`Using simulator: ${device.name} (${device.udid})${device.runtime ? ` [${device.runtime}]` : ''}`));

  const bundleId = process.env.SPARKLING_IOS_BUNDLE_ID ?? 'com.example.sparkling.go';
  const podfilePath = path.resolve(options.cwd, 'ios', 'Podfile');
  const hasPodfile = fs.existsSync(podfilePath);
  if (isVerboseEnabled()) {
    verboseLog(`Podfile path: ${podfilePath} (exists: ${hasPodfile})`);
  }

  await autolink({ cwd: options.cwd, platform: 'ios' });

  if (hasPodfile) {
    if (options.skipPodInstall) {
      console.log(ui.tip('Skipping pod install (per flag). Run it manually if pods are out of date.'));
    } else {
      console.log(ui.info('Running bundle exec pod install...'));
      await installPods(podfilePath);
    }
  }

  await buildProject({ cwd: options.cwd, skipCopy: options.skipCopy });

  // If skipping copy, ensure Resources/Assets is a symlink to dist
  if (options.skipCopy) {
    const distPath = path.resolve(options.cwd, 'dist');
    const assetsDir = path.resolve(options.cwd, 'ios/SparklingGo/SparklingGo/Resources/Assets');
    const assetsParent = path.dirname(assetsDir);
    if (isVerboseEnabled()) {
      verboseLog(`Ensuring Assets symlink points to ${distPath}`);
    }
    try {
      fs.mkdirSync(distPath, { recursive: true });
      fs.mkdirSync(assetsParent, { recursive: true });
      if (fs.existsSync(assetsDir)) {
        const stat = fs.lstatSync(assetsDir);
        if (stat.isSymbolicLink()) {
          const target = fs.readlinkSync(assetsDir);
          const resolved = path.resolve(path.dirname(assetsDir), target);
          if (resolved !== distPath) {
            fs.unlinkSync(assetsDir);
            fs.symlinkSync(distPath, assetsDir);
          }
        } else {
          // remove real directory to avoid duplicate assets; .gitignore already excludes it
          fs.rmSync(assetsDir, { recursive: true, force: true });
          fs.symlinkSync(distPath, assetsDir);
        }
      } else {
        fs.symlinkSync(distPath, assetsDir);
      }
    } catch (error) {
      console.warn(ui.warn(`Failed to link iOS Assets directory to dist: ${String(error)}`));
    }
  }

  let workspacePath = resolveWorkspacePath(options.cwd);
  if (!workspacePath && hasPodfile && !options.skipPodInstall) {
    console.log(ui.info('Installing iOS pods to generate workspace...'));
    await installPods(podfilePath);
    workspacePath = resolveWorkspacePath(options.cwd);
  }

  if (!workspacePath) {
    throw new Error('iOS workspace not found (expected SparklingGo.xcworkspace). Run `bundle exec pod install` inside the ios directory.');
  }
  if (isVerboseEnabled()) {
    verboseLog(`Using workspace at ${workspacePath}`);
  }

  await runCommand('xcrun', ['simctl', 'boot', device.udid], { cwd: options.cwd, ignoreFailure: true });
  await runCommand('xcrun', ['simctl', 'bootstatus', device.udid, '-b'], { cwd: options.cwd, ignoreFailure: true });
  // Focus the chosen simulator only so we don't spawn the default device alongside it
  await runCommand('open', ['-a', 'Simulator', '--args', '-CurrentDeviceUDID', device.udid], { cwd: options.cwd, ignoreFailure: true });

  const destination = `id=${device.udid}`;
  await runCommand('xcodebuild', [
    '-workspace',
    workspacePath,
    '-scheme',
    'SparklingGo',
    '-configuration',
    'Debug',
    '-sdk',
    'iphonesimulator',
    '-destination',
    destination,
    'CODE_SIGN_IDENTITY=',
    'CODE_SIGNING_ALLOWED=NO',
    'CODE_SIGNING_REQUIRED=NO',
    'CODE_SIGN_ENTITLEMENTS=',
    'build',
  ], { cwd: options.cwd });

  const appPath = path.resolve(options.cwd, 'ios/build/Build/Products/Debug-iphonesimulator/SparklingGo.app');
  if (fs.existsSync(appPath)) {
    await runCommand('xcrun', ['simctl', 'install', device.udid, appPath], { cwd: options.cwd, ignoreFailure: true });
    await runCommand('xcrun', ['simctl', 'launch', device.udid, bundleId], { cwd: options.cwd, ignoreFailure: true });
  } else {
    console.warn(ui.warn(`Built app not found at ${appPath}, skipped simulator install/launch.`));
  }
}
