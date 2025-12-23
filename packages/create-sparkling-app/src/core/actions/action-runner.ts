// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import path from 'node:path';

import { defaultLogger } from '../../logger';
import { ui } from '../../ui';
import { createSpinner } from '../../utils/spinner';
import type { Action, ActionContext, ActionResult } from './action';

export class ActionRunner {
  private readonly actions: Action<unknown, unknown>[] = [];
  private readonly context: ActionContext;

  constructor(context: ActionContext) {
    this.context = { ...context, logger: context.logger ?? defaultLogger };
  }

  addAction<T, P>(action: Action<T, P>): void {
    this.actions.push(action);
  }

  async run(): Promise<void> {
    let previousResult: ActionResult<unknown> | undefined;
    this.context.logger = defaultLogger;
    this.context.logger.info('Running create-app actions...');

    for (const action of this.actions) {
      const spin = createSpinner();
      this.context.spinner = spin;

      spin.start(`Run action: ${action.name}`);
      const startTime = Date.now();

      try {
        const currentResult = await action.execute(this.context, previousResult);
        const endTime = Date.now();
        spin.stop(`Finished action: ${action.name} (took ${endTime - startTime}ms)`);

        if (currentResult.crucialOutputPaths && currentResult.crucialOutputPaths.length > 0) {
          console.log('');
          console.log(ui.info('Output paths:'));
          for (const outputPath of currentResult.crucialOutputPaths) {
            console.log(ui.info(`  - ${path.resolve(outputPath)}`));
          }
          console.log('');
        }

        previousResult = currentResult;
      } catch (error) {
        spin.stop(`Action failed: ${action.name}`);
        console.error(ui.error(String(error)));
        if (this.context.logger.logFile) {
          console.log(ui.info(`See log at ${this.context.logger.logFile}`));
        }
        throw error;
      }
    }

    console.log(ui.success('All actions completed.'));
    this.context.logger.clear();
  }
}

export async function executeAndLogAction<T>(
  action: Action<T, unknown>,
  context: ActionContext,
  previousResult?: ActionResult<unknown>,
): Promise<ActionResult<T>> {
  context.logger.info(`Starting action: ${action.name}`);
  const startTime = Date.now();
  const result = await action.execute(context, previousResult);
  const endTime = Date.now();
  context.logger.info(`Finished action: ${action.name} (took ${endTime - startTime}ms)`);

  if (result.outputPaths && result.outputPaths.length > 0) {
    context.logger.info('Output paths:');
    for (const outputPath of result.outputPaths) {
      context.logger.info(`  - ${outputPath}`);
    }
  }

  return result;
}
