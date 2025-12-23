// Copyright (c) 2023 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


package com.tiktok.sparkling.hybridkit.utils

import android.app.Activity
import android.content.Context
import android.graphics.Rect
import kotlin.math.roundToInt

operator fun Number.times(context: Context) = (toDouble() * context.resources.displayMetrics.density).roundToInt()
operator fun Number.div(context: Context) = toDouble() / context.resources.displayMetrics.density
operator fun Number.rem(context: Context) = (this / context).roundToInt()

val Context.statusBarHeight get() = DevicesUtil.getStatusBarHeight(this)
val Context.statusBarHeightDp get() = statusBarHeight / this

fun Activity.safeAreaHeight(statusBarHeightDp: Number = this.statusBarHeightDp): Double {
    val bottom = try {
        window?.run { Rect().also(decorView::getWindowVisibleDisplayFrame).bottom }
    } catch (e: NullPointerException) {
        null
    } ?: resources.displayMetrics.heightPixels
    return bottom / this - statusBarHeightDp.toDouble()
}