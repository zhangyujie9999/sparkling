// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export interface MockChildProcess {
  on: jest.MockedFunction<(event: string, callback: Function) => void>;
}

export const createMockChildProcess = (
  exitCode: number = 0,
  shouldError: boolean = false
): MockChildProcess => {
  const callbacks: { [key: string]: Function } = {};
  const mockChild = {
    on: jest.fn((event: string, callback: Function) => {
      callbacks[event] = callback;

      if (event === 'exit') {
        callback(exitCode);
      } else if (event === 'error' && shouldError) {
        callback(new Error('Command failed'));
      }
    }),
  };
  return mockChild as MockChildProcess;
};

export const TEST_CONSTANTS = {
  MOCK_PROJECT_ROOT: '/mock/project/root',
  MOCK_PROJECT_NAME: 'test-project',
  MOCK_TEMPLATE_PATH: '/fake/path/to/sparkling-app-template',
} as const;

export const createMockExecForIOS = () => {
  return (command: string, callback: any) => {
    if (command.includes('xcrun simctl list devices')) {
      callback(null, { stdout: 'iPhone 14 (12345678-1234-1234-1234-123456789012) (Shutdown)\n' });
    } else if (command.includes('find')) {
      callback(null, { stdout: '/path/to/app.app\n' });
    } else if (command.includes('PlistBuddy')) {
      callback(null, { stdout: 'com.example.app\n' });
    } else if (command.includes('xcrun simctl boot')) {
      callback(null, { stdout: '' });
    } else {
      callback(null, { stdout: '' });
    }
    return {} as any;
  };
};

export const createMockExecNoSimulator = () => {
  return (command: string, callback: any) => {
    if (command.includes('xcrun simctl list devices')) {
      callback(null, { stdout: 'No devices available\n' });
    }
    return {} as any;
  };
};

export const withMockArgv = (args: string[], testFn: () => void | Promise<void>) => {
  const originalArgv = process.argv;
  process.argv = ['node', 'cli', ...args];

  try {
    return testFn();
  } finally {
    process.argv = originalArgv;
  }
};



