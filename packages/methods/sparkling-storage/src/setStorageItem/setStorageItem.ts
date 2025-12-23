// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import pipe from 'sparkling-method-sdk';
import type { SetItemRequest, SetItemResponse } from './setStorageItem.d';

/**
 * Set an item in storage
 * @param params
 * @param callback
 */
export function setItem(params: SetItemRequest, callback: (v: SetItemResponse) => void): void {
    if (!params) {
        const errorResponse: SetItemResponse = {
            code: -1,
            msg: 'Invalid params: params cannot be null or undefined',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (!params.key || typeof params.key !== 'string' || !params.key.trim()) {
        const errorResponse: SetItemResponse = {
            code: -1,
            msg: 'Invalid params: key must be a non-empty string',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (params.data === undefined) {
        const errorResponse: SetItemResponse = {
            code: -1,
            msg: 'Invalid params: data cannot be undefined',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (params.validDuration !== undefined && (typeof params.validDuration !== 'number' || params.validDuration < 0)) {
        const errorResponse: SetItemResponse = {
            code: -1,
            msg: 'Invalid params: validDuration must be a non-negative number',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (typeof callback !== 'function') {
        console.error('[sparkling-storage] setItem: callback must be a function');
        return;
    }

    pipe.call('storage.setItem', {
        key: params.key.trim(),
        data: params.data,
        biz: params.biz,
        validDuration: params.validDuration,
    }, (v: unknown) => {
        const response = v as SetItemResponse;
        callback({
            code: response?.code ?? -1,
            msg: response?.msg ?? 'Unknown error',
            data: response?.data,
        });
    });
}
