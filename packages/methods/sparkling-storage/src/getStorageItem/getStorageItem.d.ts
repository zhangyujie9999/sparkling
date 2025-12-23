// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
export interface GetItemRequest {
  key: string; // item key
  biz?: string; // Distinguish between different business scenarios
}

export interface GetItemResponse {
  code: number;
  msg: string;
  data?: {
    data?: any; // value
  };
}

declare function getItem(params: GetItemRequest, callback: (result: GetItemResponse) => void): void;
