package com.tiktok.sparkling.debug.lynx

import android.app.Application
import com.lynx.devtool.LynxDevtoolEnv
import com.lynx.service.devtool.LynxDevToolService
import com.lynx.service.log.LynxLogService
import com.lynx.tasm.LynxEnv
import com.lynx.tasm.service.LynxServiceCenter

object SparklingLynxDebug {
    @JvmStatic
    fun enable(application: Application?) {
        LynxServiceCenter.inst().registerService(LynxLogService)
        LynxServiceCenter.inst().registerService(LynxDevToolService.INSTANCE)

        LynxEnv.inst().enableLynxDebug(true)
        LynxEnv.inst().enableLogBox(true)
        LynxEnv.inst().enableDevtool(true)
        LynxDevtoolEnv.inst().enableLongPressMenu(true)
    }
}

