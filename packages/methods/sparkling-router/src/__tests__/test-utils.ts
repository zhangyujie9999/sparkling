// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import {
  createMockPipe,
  createSuccessResponseBase,
  createErrorResponseBase,
  validateContract,
} from '../../../../common/test-utils';

// Re-export shared utilities
export { createMockPipe, validateContract };
export type { MockPipe } from '../../../../common/test-utils';

/**
 * Create a mock pipe response for successful operations
 */
export const createSuccessResponse = createSuccessResponseBase;

/**
 * Create a mock pipe response for failed operations
 */
export const createErrorResponse = (code: number = -1, msg: string = 'Error') =>
  createErrorResponseBase(code, msg);

/**
 * Helper to validate method contract responses
 */
export const validateMethodContract = validateContract;

/**
 * Test constants for consistent testing
 */
export const TEST_CONSTANTS = {
  VALID_SCHEME: 'https://example.com/page',
  INVALID_SCHEME_EMPTY: '',
  INVALID_SCHEME_WHITESPACE: '   ',
  MOCK_CONTAINER_ID: 'test-container-123',
} as const;

