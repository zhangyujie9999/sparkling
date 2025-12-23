// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import pipe from 'sparkling-method-sdk';
import type { OpenRequest, OpenResponse } from './open.d';

/**
 * Open a new page or route
 * @param params |
 * @param callback
 */
export function open(params: OpenRequest, callback: (result: OpenResponse) => void): void {
    if (!params) {
        const errorResponse: OpenResponse = {
            code: -1,
            msg: 'Invalid params: params cannot be null or undefined',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (!params.scheme || typeof params.scheme !== 'string' || !params.scheme.trim()) {
        const errorResponse: OpenResponse = {
            code: -1,
            msg: 'Invalid params: scheme must be a non-empty string',
        };
        if (typeof callback === 'function') {
            callback(errorResponse);
        }
        return;
    }

    if (typeof callback !== 'function') {
        console.error('[sparkling-router] open: callback must be a function');
        return;
    }

    pipe.call('router.open', {
        scheme: params.scheme.trim(),
        ...params.options,
    }, (v: unknown) => {
        const response = v as OpenResponse;
        callback({
            code: response?.code ?? -1,
            msg: response?.msg ?? 'Unknown error',
        });
    });
}
