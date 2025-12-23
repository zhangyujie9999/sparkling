// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
export interface Logger {
  clear(): void;
  end?(): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
  log?(level: string, ...args: unknown[]): void;
  logFile: string | null;
  message(...args: unknown[]): void;
  on?(...args: unknown[]): void;
  warn(...args: unknown[]): void;
}

const consoleLogger: Logger = {
  clear() {},
  error(...args: unknown[]) {
    console.error(String(args.join(' ')));
  },
  info(...args: unknown[]) {
    console.log(String(args.join(' ')));
  },
  log(level: string, ...args: unknown[]) {
    switch (level) {
      case 'error':
        this.error(...args);
        break;
      case 'warn':
        this.warn(...args);
        break;
      default:
        this.info(...args);
        break;
    }
  },
  logFile: null,
  message(...args: unknown[]) {
    console.log(String(args.join(' ')));
  },
  warn(...args: unknown[]) {
    console.warn(String(args.join(' ')));
  },
};

export const defaultLogger: Logger = consoleLogger;
