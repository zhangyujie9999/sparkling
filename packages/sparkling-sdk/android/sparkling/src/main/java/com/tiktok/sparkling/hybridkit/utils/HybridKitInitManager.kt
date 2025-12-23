// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling.hybridkit.utils

import android.content.Context
import com.tiktok.sparkling.hybridkit.base.HybridKitInitCallback
import com.tiktok.sparkling.hybridkit.base.HybridKitInitStatus

object HybridKitInitManager {
    @Volatile
    var status = HybridKitInitStatus.INIT
    private val callbacks = mutableListOf<HybridKitInitCallback>()

    //
    fun addCallback(callback: HybridKitInitCallback) {
        callbacks.add(callback)
    }

    //
    fun removeCallback(callback: HybridKitInitCallback) {
        callbacks.remove(callback)
    }

    fun initHybridKit(context: Context?) {
        status = HybridKitInitStatus.LOADING

        status = HybridKitInitStatus.FINISHED
        for (callback in callbacks) {
            callback.isFinished()
        }
    }
}