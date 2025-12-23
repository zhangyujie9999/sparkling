// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Test utilities for sparkling-storage
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
 * Create a mock pipe response for successful storage operations
 */
export const createSuccessResponse = (data?: any) => ({
  code: 0,
  msg: 'Success',
  data,
});

/**
 * Create a mock pipe response for failed storage operations
 */
export const createErrorResponse = (code: number = -1, msg: string = 'Error', data?: any) => ({
  code,
  msg,
  data,
});

/**
 * Helper to validate storage method contract responses
 */
export const validateStorageContract = <T>(
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
  VALID_KEY: 'test-storage-key',
  INVALID_KEY_EMPTY: '',
  INVALID_KEY_WHITESPACE: '   ',
  MOCK_BIZ: 'test-business',
  VALID_STRING_DATA: 'test string value',
  VALID_NUMBER_DATA: 42,
  VALID_BOOLEAN_DATA: true,
  VALID_OBJECT_DATA: { nested: 'value', array: [1, 2, 3] },
  VALID_ARRAY_DATA: ['item1', 'item2', 'item3'],
  NULL_DATA: null,
  VALID_DURATION: 3600, // 1 hour
  INVALID_DURATION_NEGATIVE: -100,
  INVALID_DURATION_STRING: 'invalid' as any,
} as const;

/**
 * Mock storage response data shapes
 */
export const MOCK_STORAGE_RESPONSES = {
  getString: { data: TEST_CONSTANTS.VALID_STRING_DATA },
  getNumber: { data: TEST_CONSTANTS.VALID_NUMBER_DATA },
  getBoolean: { data: TEST_CONSTANTS.VALID_BOOLEAN_DATA },
  getObject: { data: TEST_CONSTANTS.VALID_OBJECT_DATA },
  getArray: { data: TEST_CONSTANTS.VALID_ARRAY_DATA },
  getNull: { data: null },
  getUndefined: { data: undefined },
  notFound: { data: undefined },
} as const;



