// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
export interface CloseRequest {
    containerID?: string; // Container ID, leave empty to close current
    animated?: boolean; // Whether to show animation when closing, default is false
}

export interface CloseResponse {
  code: number;
  msg: string;
}

declare function close(params?: CloseRequest, callback?: (result: CloseResponse) => void): void;
