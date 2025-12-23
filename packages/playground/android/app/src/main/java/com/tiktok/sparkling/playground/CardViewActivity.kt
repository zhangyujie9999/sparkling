// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling.playground

import android.os.Bundle
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.tiktok.sparkling.SparklingContext
import com.tiktok.sparkling.SparklingView
import com.tiktok.sparkling.method.registry.core.utils.JsonUtils

class CardViewActivity : AppCompatActivity(), ICardViewContainer {

    private lateinit var sparklingView: SparklingView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_card_view)
        
        // Initialize SparklingView
        sparklingView = SparklingView(this)
        
        // Add SparklingView to the container
        val container = findViewById<FrameLayout>(R.id.card_view_container)
        container.addView(sparklingView)
        
        // Load the card view bundle
        loadCardView()
    }

    private fun loadCardView() {
        // Get data from intent extras
        val title = intent.getStringExtra("title") ?: "Android Card View Demo"
        val description = intent.getStringExtra("description") ?: "This card view is loaded from Android using SparklingView"
        val customData = intent.getStringExtra("initial_data")
        
        val initData = if (customData != null) {
            // Parse custom data if provided
            try {
                @Suppress("UNCHECKED_CAST")
                JsonUtils.fromJson(customData, Map::class.java) as Map<Any, Any>
            } catch (e: Exception) {
                mapOf<Any, Any>(
                    "title" to title,
                    "description" to description,
                    "platform" to "android"
                )
            }
        } else {
            mapOf<Any, Any>(
                "title" to title,
                "description" to description,
                "platform" to "android"
            )
        }
        
        val initialData: String = JsonUtils.toJson(initData)

        val context = SparklingContext()
        context.scheme = "hybrid://lynxview_card?bundle=card-view.lynx.bundle&hide_nav_bar=0&screen_orientation=portrait"
        context.withInitData("{ \"initial_data\":$initialData}")
        
        sparklingView.prepare(context)
        sparklingView.loadUrl()
    }

    override fun showCardView(scheme: String) {
        // Handle card view specific scheme if needed
        val context = SparklingContext()
        context.scheme = scheme
        sparklingView.prepare(context)
        sparklingView.loadUrl()
    }

    override fun onBackPressed() {
        // Handle back button to ensure proper navigation
        if (::sparklingView.isInitialized) {
            val kitView = sparklingView.getKitView()
            if (kitView != null) {
                // Let the SparklingView handle the back navigation
                super.onBackPressed()
            } else {
                super.onBackPressed()
            }
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Clean up SparklingView resources
        if (::sparklingView.isInitialized) {
            sparklingView.getKitView()?.destroy()
        }
    }
}
