// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.tiktok.sparkling

import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.tiktok.sparkling.Sparkling.Companion.SPARKLING_CONTEXT_CONTAINER_ID

class SparklingActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sparkling)
        val containerId = intent.getStringExtra(SPARKLING_CONTEXT_CONTAINER_ID)
        val sparklingContext = SparklingContextTransferStation.getSparklingContext(containerId)
        initToolBar(sparklingContext)
        initSparklingFragment(sparklingContext)
    }

    fun initToolBar(sparklingContext: SparklingContext?) {
        val customToolbar = sparklingContext?.sparklingUIProvider?.getToolBar(this)
        if (customToolbar != null) {
            val defaultToolbar = findViewById<Toolbar>(R.id.toolbar)
            val parent = defaultToolbar.parent as? ViewGroup
            parent?.removeView(defaultToolbar)
            parent?.addView(customToolbar, 0)
            setSupportActionBar(customToolbar)
        } else {
            val toolbar = findViewById<Toolbar>(R.id.toolbar)
            setSupportActionBar(toolbar)
        }

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = sparklingContext?.hybridSchemeParam?.title ?: getString(R.string.sparkling_page_title)
        
        val titleColorStr = sparklingContext?.hybridSchemeParam?.titleColor
        if (!titleColorStr.isNullOrEmpty()) {
            try {
                val titleColor = Color.parseColor(titleColorStr)
                val toolbar = (supportActionBar?.customView ?: findViewById<Toolbar>(R.id.toolbar)) as Toolbar
                toolbar.setTitleTextColor(titleColor)
                
                val customToolbar = sparklingContext?.sparklingUIProvider?.getToolBar(this)
                customToolbar?.setTitleTextColor(titleColor)
            } catch (e: IllegalArgumentException) {
            }
        }
        
        ((supportActionBar?.customView ?: findViewById<Toolbar>(R.id.toolbar)) as Toolbar).setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    fun initSparklingFragment(sparklingContext: SparklingContext?) {
        sparklingContext?.hybridSchemeParam?.let {
            if (it.hideNavBar) {
                supportActionBar?.hide()
            }
            requestedOrientation = when (it.screenOrientation) {
                "portrait" -> android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                "landscape" -> android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                else -> android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            }
        }

        val fragment = SparklingFragment.newInstance()
        supportFragmentManager.beginTransaction()
            .replace(R.id.main_view_container, fragment)
            .commit()

    }

    override fun onResume() {
        super.onResume()
    }

    private var lastBackPressedTime: Long = 0
    private val DOUBLE_CLICK_EXIT_INTERVAL = 2000

    override fun onBackPressed() {
        if (isTaskRoot) {
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastBackPressedTime < DOUBLE_CLICK_EXIT_INTERVAL) {
                super.onBackPressed()
            } else {
                Toast.makeText(this, getString(R.string.click_again_to_exit), Toast.LENGTH_SHORT).show()
                lastBackPressedTime = currentTime
            }
        } else {
            super.onBackPressed()
        }
    }
}