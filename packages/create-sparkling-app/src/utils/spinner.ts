// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import { ui } from '../ui';

export interface SimpleSpinner {
  message(message?: string): void;
  start(message?: string): void;
  stop(message?: string, code?: number): void;
}

export function createSpinner(): SimpleSpinner {
  let activeMessage: string | null = null;

  return {
    message(message?: string) {
      if (message) {
        console.log(ui.info(message));
      }
    },
    start(message?: string) {
      activeMessage = message ?? null;
      if (message) {
        console.log(ui.info(message));
      }
    },
    stop(message?: string, _code?: number) {
      const finalMessage = message ?? activeMessage;
      if (finalMessage) {
        console.log(ui.info(finalMessage));
      }
      activeMessage = null;
    },
  };
}
