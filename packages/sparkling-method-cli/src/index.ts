#!/usr/bin/env node
// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { Command } from 'commander';
import packageJson from '../package.json';
import { runInit } from './create';
import { runCodegen } from './codegen';
import { ui } from './ui';
import { enableVerboseLogging, isVerboseEnabled, verboseLog } from './verbose';

const program = new Command();

program
  .name('sparkling-method')
  .description('Sparkling method utilities')
  .version(packageJson.version);
program.option('-v, --verbose', 'Enable verbose logging for debugging');
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.optsWithGlobals<{ verbose?: boolean }>();
  enableVerboseLogging(opts.verbose);
  if (isVerboseEnabled()) {
    verboseLog('Verbose logging enabled');
  }
});

program
  .command('init [name]')
  .description('Create a new sparkling-method workspace from the bundled template')
  .option('-f, --force', 'Overwrite the target directory if it already exists', false)
  .option('-t, --template <path>', 'Use a custom template directory')
  .action(async (name: string | undefined, options: { force?: boolean; template?: string }) => {
    try {
      await runInit(name, options);
    } catch (error) {
      console.error(ui.error(error instanceof Error ? error.message : String(error)));
      process.exitCode = 1;
    }
  });

program
  .command('codegen')
  .description('Generate metadata and native IDL code from local method definitions')
  .option('--src <dir>', 'Directory containing .d.ts definitions', 'src')
  .action(async (options: { src?: string }) => {
    try {
      await runCodegen(options);
    } catch (error) {
      console.error(ui.error(error instanceof Error ? error.message : String(error)));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(ui.error(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
