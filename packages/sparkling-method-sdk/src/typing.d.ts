// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

declare global {
  interface PipeRawResponse {
    code: number;
    msg: string;
    data?: unknown;
  }

  type PipeCallback = (response: PipeRawResponse) => void;

  type EventCallback = (event: unknown) => void;

  interface ILynxPipe {
    call: (
      methodMap: string | { module: string; method: string },
      params: unknown,
      callback: PipeCallback,
      options?: Record<string, unknown>
    ) => void;
    on: (
      eventName: string,
      callback: EventCallback
    ) => EventCallback;
    off: (
      eventName: string,
      callback: EventCallback
    ) => void;
  }

  const lynx: any;

  const NativeModules: {
    pipe: ILynxPipe;
    [key: string]: any;
  };

  // Declare process to avoid requiring @types/node in browser/Lynx builds
  const process: any;
}

export {};
