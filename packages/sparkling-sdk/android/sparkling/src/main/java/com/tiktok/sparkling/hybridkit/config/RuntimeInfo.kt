// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling.hybridkit.config

import java.util.concurrent.ConcurrentHashMap

/**
 */
open class RuntimeInfo() : ConcurrentHashMap<String, Any>() {
    companion object {
        const val CONTAINER_ID = "containerID"
        const val QUERY_ITEMS = "queryItems"
        const val SCREEN_WIDTH = "screenWidth"
        const val SCREEN_HEIGHT = "screenHeight"
        const val OS = "os"
        const val OS_VERSION = "osVersion"
        const val LANGUAGE = "language"
        const val APP_LANGUAGE = "appLanguage"
        const val APP_LOCALE = "appLocale"
        const val LYNX_SDK_VERSION = "lynxSdkVersion"
        const val STATUS_BAR_HEIGHT = "statusBarHeight"
        const val SAFEAREA_HEIGHT = "safeAreaHeight"
        const val TEMPLATE_RES_DATA = "templateResData"
        const val IS_LOW_POWER_MODE = "isLowPowerMode"
        const val IS_APP_BACKGROUND = "isAppBackground"
        const val A11Y_MODE = "accessibleMode"
        const val DEVICE_MODEL = "deviceModel"
        const val ENVIRONMENT = "env"
        const val SCREEN_ORIENTATION = "screenOrientation"
        const val ORIENTATION = "orientation"
        const val HAS_INIT_DATA_RES = "hasInitDataRes"
    }

}