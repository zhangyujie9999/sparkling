// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export interface MockPipe {
  call: jest.MockedFunction<(method: string, params: any, callback: any) => void>;
}

export const createMockPipe = (): MockPipe => {
  return {
    call: jest.fn(),
  };
};

