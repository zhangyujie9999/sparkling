// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
export interface SetItemRequest {
  key: string; // item key
  data: any; // value
  biz?: string; // Distinguish between different business scenarios
  validDuration?: number; // Valid duration, optional, unit: seconds
}

export interface SetItemResponse {
  code: number;
  msg: string;
  data?: any; // if the set action is success
}

declare function setItem(params: SetItemRequest, callback: (result: SetItemResponse) => void): void;
