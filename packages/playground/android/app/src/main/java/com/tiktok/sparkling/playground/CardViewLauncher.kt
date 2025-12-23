// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling.playground

import android.content.Context
import android.content.Intent
import com.tiktok.sparkling.SparklingContext
import com.tiktok.sparkling.method.registry.core.utils.JsonUtils

object CardViewLauncher {
    
    /**
     * Launch CardViewActivity with the card-view.lynx.bundle
     */
    fun launchCardView(context: Context, title: String = "Card View Demo", description: String = "Sparkling Card View") {
        val intent = Intent(context, CardViewActivity::class.java).apply {
            putExtra("title", title)
            putExtra("description", description)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }
    
    /**
     * Launch CardViewActivity with custom initial data
     */
    fun launchCardViewWithData(context: Context, initialData: Map<String, Any>) {
        val intent = Intent(context, CardViewActivity::class.java).apply {
            putExtra("initial_data", JsonUtils.toJson(initialData))
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }
    
    /**
     * Create a SparklingContext for card view
     */
    fun createCardViewContext(title: String = "Card View Demo", description: String = "Sparkling Card View"): SparklingContext {
        val initData = mapOf<Any, Any>(
            "title" to title,
            "description" to description,
            "platform" to "android"
        )
        val initialData: String = JsonUtils.toJson(initData)

        return SparklingContext().apply {
            scheme = "hybrid://lynxview_card?bundle=card-view.lynx.bundle&hide_nav_bar=0&screen_orientation=portrait"
            withInitData("{ \"initial_data\":$initialData}")
        }
    }
}
