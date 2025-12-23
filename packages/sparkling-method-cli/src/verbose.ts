// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

const VERBOSE_ENV = 'SPARKLING_VERBOSE';

export function isVerboseEnabled(): boolean {
  const value = process.env[VERBOSE_ENV];
  return value === '1' || value === 'true' || value === 'TRUE';
}

export function enableVerboseLogging(enabled?: boolean): void {
  if (!enabled) {
    return;
  }
  process.env[VERBOSE_ENV] = 'true';
}

export function verboseLog(message: string): void {
  if (isVerboseEnabled()) {
    console.log(`[verbose] ${message}`);
  }
}
