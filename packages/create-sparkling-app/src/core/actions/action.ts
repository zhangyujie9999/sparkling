// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import type { Logger } from '../../logger';

export interface Spinner {
  message: (msg?: string | undefined) => void;
  start: (msg?: string | undefined) => void;
  stop: (msg?: string | undefined, code?: number | undefined) => void;
}

export interface ActionContext {
  devMode: boolean;
  environment: 'development' | 'production';
  projectRoot: string;
  logger: Logger;
  spinner?: Spinner;
  [key: string]: unknown;
}

export interface ActionResult<T = void> {
  result: T;
  crucialOutputPaths?: string[];
  outputPaths?: string[];
}

export interface Action<T = void, P = unknown> {
  name: string;
  description?: string;
  execute(context: ActionContext, previousResult?: ActionResult<P>): Promise<ActionResult<T>>;
}
