// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling.utils

import androidx.core.net.toUri
import com.tiktok.sparkling.hybridkit.base.HybridContainerType
import com.tiktok.sparkling.hybridkit.base.HybridKitType
import com.tiktok.sparkling.hybridkit.scheme.HybridSchemeParam
import com.tiktok.sparkling.hybridkit.scheme.SchemeConstants
import com.tiktok.sparkling.hybridkit.utils.safeGetQueryParameter

object SchemeParser {
    fun interface CustomSchemeParser {
        fun parseScheme(scheme: String): HybridSchemeParam?
    }

    @Volatile
    private var customSchemeParser: CustomSchemeParser? = null

    @JvmStatic
    fun setCustomSchemeParser(parser: CustomSchemeParser?) {
        customSchemeParser = parser
    }

    fun parseScheme(scheme: String): HybridSchemeParam? {
        customSchemeParser?.parseScheme(scheme)?.let { return it }
        return parseDefaultScheme(scheme)
    }

    @JvmStatic
    fun parseDefaultScheme(scheme: String): HybridSchemeParam? {
        if (!scheme.startsWith(SchemeConstants.Scheme.PREFIX)) {
            return null
        }

        val uri = scheme.toUri()
        val viewTypeString = uri.host?.lowercase()
        val engineType = when {
            viewTypeString == SchemeConstants.Host.WEB_VIEW -> HybridKitType.WEB
            viewTypeString?.startsWith(SchemeConstants.Host.LYNX_VIEW) == true -> HybridKitType.LYNX
            else -> HybridKitType.UNKNOWN
        }

        val containerType = when (viewTypeString) {
            SchemeConstants.Host.LYNX_VIEW_CARD -> HybridContainerType.CARD
            SchemeConstants.Host.LYNX_VIEW_PAGE,
            SchemeConstants.Host.LYNX_VIEW -> HybridContainerType.PAGE
            else -> HybridContainerType.UNKNOWN
        }

        if (engineType == HybridKitType.UNKNOWN) {
            return null
        }

        val params = HybridSchemeParam()
        params.engineType = engineType
        params.containerType = containerType
        params.bundle = uri.safeGetQueryParameter(SchemeConstants.Param.BUNDLE)
        params.title = uri.safeGetQueryParameter(SchemeConstants.Param.TITLE)
//        params.fallbackUrl = uri.safeGetQueryParameter(SchemeConstants.Param.FALLBACK_URL)
        params.titleColor = uri.safeGetQueryParameter(SchemeConstants.Param.TITLE_COLOR)
        params.hideNavBar = uri.safeGetQueryParameter(SchemeConstants.Param.HIDE_NAV_BAR) == SchemeConstants.Value.ENABLED
        params.navBarColor = uri.safeGetQueryParameter(SchemeConstants.Param.NAV_BAR_COLOR)
        params.screenOrientation = uri.safeGetQueryParameter(SchemeConstants.Param.SCREEN_ORIENTATION)
        params.hideStatusBar = uri.safeGetQueryParameter(SchemeConstants.Param.HIDE_STATUS_BAR) == SchemeConstants.Value.ENABLED
        params.transStatusBar = uri.safeGetQueryParameter(SchemeConstants.Param.TRANS_STATUS_BAR) == SchemeConstants.Value.ENABLED
        params.hideLoading = uri.safeGetQueryParameter(SchemeConstants.Param.HIDE_LOADING) == SchemeConstants.Value.ENABLED
        params.loadingBgColor = uri.safeGetQueryParameter(SchemeConstants.Param.LOADING_BG_COLOR)
        params.containerBgColor = uri.safeGetQueryParameter(SchemeConstants.Param.CONTAINER_BG_COLOR)
        params.hideError = uri.safeGetQueryParameter(SchemeConstants.Param.HIDE_ERROR) == SchemeConstants.Value.ENABLED
        params.forceThemeStyle = uri.safeGetQueryParameter(SchemeConstants.Param.FORCE_THEME_STYLE)

        return params
    }
}
