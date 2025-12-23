// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


package com.tiktok.sparkling.method.registry.api

import com.lynx.react.bridge.WritableArray
import com.lynx.react.bridge.WritableMap
import com.tiktok.sparkling.method.registry.core.XReadableArray
import com.tiktok.sparkling.method.registry.core.XReadableMap
import com.tiktok.sparkling.method.registry.api.util.DataConvertUtils
import org.json.JSONArray
import org.json.JSONObject


object Utils {

    fun toStringOrJson(data: Any?): String {
        return DataConvertUtils.toStringOrJson(data)
    }

    fun mapToJSON(map: Map<String, Any?>): JSONObject {
        return DataConvertUtils.mapToJSON(map)
    }

    fun mapSupportPiperdataToJSON(map: Map<String, Any?>): JSONObject {
        return DataConvertUtils.mapSupportPiperdataToJSON(map)
    }

    fun listSupportPiperdataToJSON(list: List<Any>): JSONArray {
        return DataConvertUtils.listSupportPiperdataToJSON(list)
    }

    fun listToJSON(list: List<Any>): JSONArray {
        return DataConvertUtils.listToJSON(list)
    }

    fun jsonToMap(json: JSONObject): Map<String, Any?> {
        return DataConvertUtils.jsonToMap(json)
    }

    fun jsonToList(json: JSONArray): List<Any?> {
        return DataConvertUtils.jsonToList(json)
    }

    @JvmStatic
    fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
        return DataConvertUtils.convertJsonToMap(jsonObject)
    }

    @JvmStatic
    fun convertJsonToArray(jsonArray: JSONArray): WritableArray {
        return DataConvertUtils.convertJsonToArray(jsonArray)
    }

    @JvmStatic
    fun convertMapToReadableMap(source: Map<String, Any?>): WritableMap {
        return DataConvertUtils.convertMapToReadableMap(source)
    }

    @JvmStatic
    fun convertArrayToWritableArray(sourceArray: List<Any>): WritableArray {
        return DataConvertUtils.convertArrayToWritableArray(sourceArray)
    }

    @JvmStatic
    fun convertXReadableMapToReadableMap(source: XReadableMap): WritableMap {
        return DataConvertUtils.convertXReadableMapToReadableMap(source)
    }

    @JvmStatic
    fun convertXReadableArrayToReadableArray(source: XReadableArray): WritableArray {
        return DataConvertUtils.convertXReadableArrayToReadableArray(source)
    }

    fun getValue(value: Any?): Any? {
        return DataConvertUtils.getValue(value)
    }

}

internal fun <T> JSONArray.map(cb: (item: Any) -> T): List<T> {
    val result = mutableListOf<T>()
    for (i in 0 until this.length()) {
        result.add(cb(opt(i)))
    }
    return result
}