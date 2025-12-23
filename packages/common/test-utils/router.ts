// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Test utilities for sparkling-router
 */

export interface MockPipe {
  call: jest.MockedFunction<(method: string, params: any, callback: any) => void>;
}

/**
 * Create a mock pipe for testing method calls
 */
export const createMockPipe = (): MockPipe => {
  return {
    call: jest.fn(),
  };
};

/**
 * Create a mock pipe response for successful operations
 */
export const createSuccessResponse = (data?: any) => ({
  code: 0,
  msg: 'Success',
  ...data,
});

/**
 * Create a mock pipe response for failed operations
 */
export const createErrorResponse = (code: number = -1, msg: string = 'Error') => ({
  code,
  msg,
});

/**
 * Helper to validate method contract responses
 */
export const validateMethodContract = <T>(
  response: any,
  requiredFields: (keyof T)[]
): response is T => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return requiredFields.every((field) => response.hasOwnProperty(field));
};

/**
 * Test constants for consistent testing
 */
export const TEST_CONSTANTS = {
  VALID_SCHEME: 'https://example.com/page',
  INVALID_SCHEME_EMPTY: '',
  INVALID_SCHEME_WHITESPACE: '   ',
  MOCK_CONTAINER_ID: 'test-container-123',
} as const;



