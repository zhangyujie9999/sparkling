// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import { spawn } from 'node:child_process';
import { isVerboseEnabled, verboseLog } from './verbose';

export interface RunCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  ignoreFailure?: boolean;
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {},
): Promise<void> {
  if (isVerboseEnabled()) {
    const envKeys = Object.keys(options.env ?? {});
    const cwd = options.cwd ?? process.cwd();
    const envLabel = envKeys.length ? ` env:${envKeys.join(',')}` : '';
    verboseLog(`Running "${command} ${args.join(' ')}" (cwd: ${cwd})${envLabel}`);
  }

  const child = spawn(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdio: 'inherit',
    shell: false,
  });

  await new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => {
      if (isVerboseEnabled()) {
        verboseLog(`${command} exited with code ${code ?? 0}`);
      }
      if (code && !options.ignoreFailure) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}
