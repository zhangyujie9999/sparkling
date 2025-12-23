// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling.hybridkit.config

import com.tiktok.sparkling.hybridkit.config.RuntimeInfo
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class RuntimeInfoTest {

    private lateinit var runtimeInfo: RuntimeInfo

    @Before
    fun setUp() {
        runtimeInfo = RuntimeInfo()
    }

    @Test
    fun testRuntimeInfoInheritsFromConcurrentHashMap() {
        assertTrue(runtimeInfo is java.util.concurrent.ConcurrentHashMap<String, Any>)
    }

    @Test
    fun testPutAndGetValues() {
        runtimeInfo[RuntimeInfo.CONTAINER_ID] = "test-container-id"
        runtimeInfo[RuntimeInfo.SCREEN_WIDTH] = 1080
        runtimeInfo[RuntimeInfo.SCREEN_HEIGHT] = 1920
        
        assertEquals("test-container-id", runtimeInfo[RuntimeInfo.CONTAINER_ID])
        assertEquals(1080, runtimeInfo[RuntimeInfo.SCREEN_WIDTH])
        assertEquals(1920, runtimeInfo[RuntimeInfo.SCREEN_HEIGHT])
    }

    @Test
    fun testConstantValues() {
        assertEquals("containerID", RuntimeInfo.CONTAINER_ID)
        assertEquals("queryItems", RuntimeInfo.QUERY_ITEMS)
        assertEquals("screenWidth", RuntimeInfo.SCREEN_WIDTH)
        assertEquals("screenHeight", RuntimeInfo.SCREEN_HEIGHT)
        assertEquals("os", RuntimeInfo.OS)
        assertEquals("osVersion", RuntimeInfo.OS_VERSION)
        assertEquals("language", RuntimeInfo.LANGUAGE)
        assertEquals("appLanguage", RuntimeInfo.APP_LANGUAGE)
        assertEquals("appLocale", RuntimeInfo.APP_LOCALE)
        assertEquals("lynxSdkVersion", RuntimeInfo.LYNX_SDK_VERSION)
        assertEquals("statusBarHeight", RuntimeInfo.STATUS_BAR_HEIGHT)
        assertEquals("safeAreaHeight", RuntimeInfo.SAFEAREA_HEIGHT)
        assertEquals("templateResData", RuntimeInfo.TEMPLATE_RES_DATA)
        assertEquals("isLowPowerMode", RuntimeInfo.IS_LOW_POWER_MODE)
        assertEquals("isAppBackground", RuntimeInfo.IS_APP_BACKGROUND)
        assertEquals("accessibleMode", RuntimeInfo.A11Y_MODE)
        assertEquals("deviceModel", RuntimeInfo.DEVICE_MODEL)
        assertEquals("env", RuntimeInfo.ENVIRONMENT)
        assertEquals("screenOrientation", RuntimeInfo.SCREEN_ORIENTATION)
        assertEquals("orientation", RuntimeInfo.ORIENTATION)
        assertEquals("hasInitDataRes", RuntimeInfo.HAS_INIT_DATA_RES)
    }

    @Test
    fun testConcurrentAccess() {
        runtimeInfo[RuntimeInfo.OS] = "Android"
        runtimeInfo[RuntimeInfo.OS_VERSION] = "13"
        runtimeInfo[RuntimeInfo.LANGUAGE] = "en"
        
        assertEquals(3, runtimeInfo.size)
        assertTrue(runtimeInfo.containsKey(RuntimeInfo.OS))
        assertTrue(runtimeInfo.containsKey(RuntimeInfo.OS_VERSION))
        assertTrue(runtimeInfo.containsKey(RuntimeInfo.LANGUAGE))
    }

    @Test
    fun testClearAndEmpty() {
        runtimeInfo[RuntimeInfo.CONTAINER_ID] = "test"
        runtimeInfo[RuntimeInfo.SCREEN_WIDTH] = 1080
        
        assertFalse(runtimeInfo.isEmpty())
        assertEquals(2, runtimeInfo.size)
        
        runtimeInfo.clear()
        
        assertTrue(runtimeInfo.isEmpty())
        assertEquals(0, runtimeInfo.size)
    }

    @Test
    fun testReplaceValues() {
        runtimeInfo[RuntimeInfo.DEVICE_MODEL] = "Pixel 6"
        assertEquals("Pixel 6", runtimeInfo[RuntimeInfo.DEVICE_MODEL])
        
        runtimeInfo[RuntimeInfo.DEVICE_MODEL] = "Galaxy S22"
        assertEquals("Galaxy S22", runtimeInfo[RuntimeInfo.DEVICE_MODEL])
    }

    @Test
    fun testNullValues() {
        runtimeInfo.remove(RuntimeInfo.ENVIRONMENT)
        
        assertFalse(runtimeInfo.containsKey(RuntimeInfo.ENVIRONMENT))
        assertNull(runtimeInfo[RuntimeInfo.ENVIRONMENT])
    }
}