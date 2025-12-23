// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import pipe from 'sparkling-method-sdk';
import type { GetItemRequest, GetItemResponse } from './getStorageItem.d';

/**
 * Get an item from storage
 * @param params 
 * @param callback 
 */
export function getItem(params: GetItemRequest, callback: (v: GetItemResponse) => void): void {
    if (!params) {
        const errorResponse: GetItemResponse = {
            code: -1,
            msg: 'Invalid params: params cannot be null or undefined',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (!params.key || typeof params.key !== 'string' || !params.key.trim()) {
        const errorResponse: GetItemResponse = {
            code: -1,
            msg: 'Invalid params: key must be a non-empty string',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (typeof callback !== 'function') {
        console.error('[sparkling-storage] getItem: callback must be a function');
        return;
    }

    pipe.call('storage.getItem', {
        key: params.key.trim(),
        biz: params.biz,
    }, (v: unknown) => {
        const response = v as GetItemResponse;
        callback({
            code: response?.code ?? -1,
            msg: response?.msg ?? 'Unknown error',
            data: response?.data,
        });
    });
}
