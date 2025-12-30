// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export const validateContract = <T>(
  response: any,
  requiredFields: (keyof T)[]
): response is T => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return requiredFields.every((field) => Object.prototype.hasOwnProperty.call(response, field));
};

