// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import build, { BuildType } from './build';
import help from './help';
import init from './init';
import { UserCancelledError } from './core/project-builder/template';
import { enableVerboseLogging, isVerboseEnabled, verboseLog } from './utils/verbose';

export { createSparklingApp } from './create-app';
export type { CreateAppFlags, CreateSparklingAppOptions } from './create-app';

function stripVerboseFlags(argv: string[]): { cleanArgs: string[]; verbose: boolean } {
  const cleanArgs: string[] = [];
  let verbose = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--verbose' || arg === '-v') {
      verbose = true;
      const next = argv[i + 1];
      if (next === 'true' || next === 'false') {
        i += 1;
      }
      continue;
    }
    if (arg.startsWith('--verbose=') || arg.startsWith('-v=')) {
      verbose = true;
      continue;
    }
    cleanArgs.push(arg);
  }
  return { cleanArgs, verbose };
}

export async function main() {
  const { cleanArgs, verbose } = stripVerboseFlags(process.argv.slice(2));
  if (verbose) {
    enableVerboseLogging(true);
    verboseLog('Verbose logging enabled via CLI flag.');
  } else if (isVerboseEnabled()) {
    verboseLog('Verbose logging enabled via SPARKLING_VERBOSE.');
  }

  const args = cleanArgs;
  const commandCandidate = args[0];
  const isExplicitCommand = Boolean(
    commandCandidate && ['init', 'create', 'help', 'build'].some(prefix => commandCandidate === prefix || commandCandidate.startsWith(`${prefix}:`)),
  );
  const command = isExplicitCommand ? (commandCandidate as string) : 'init';
  const commandArgs = isExplicitCommand ? args.slice(1) : args;

  if (command === 'init' || command === 'create') {
    await init(commandArgs, { verbose: isVerboseEnabled() });
    return;
  }

  if (command.startsWith('build')) {
    const buildType = (command.slice(6) || 'all') as BuildType;
    await build(buildType);
    return;
  }

  if (command === 'help') {
    await help();
    return;
  }

  console.log(`Unknown command: ${command}.`);
  await help();
  process.exit(1);
}

if (require.main === module || process.env.NODE_ENV !== 'test') {
  main().catch(error => {
    if (error instanceof UserCancelledError) {
      process.exit(0);
    }

    console.error('An error occurred:', error);
    if (isVerboseEnabled() && error instanceof Error && error.stack) {
      verboseLog(error.stack);
    }
    process.exit(1);
  });
}
