// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import Lynx

/// Utility class providing Lynx-specific helper methods for SPK Kit operations.
/// 
/// This class extends SPKKitUtils to provide specialized functionality
/// for Lynx rendering engine, including parameter conversion, global properties
/// management, and template data handling.
@objcMembers
open class SPKLynxKitUtils: SPKKitUtils {
    
    /// Creates Lynx kit parameters from a hybrid context.
    /// 
    /// This method converts a SPKHybridContext into SPKLynxKitParams,
    /// extracting and configuring all necessary parameters for Lynx view creation.
    /// It handles resource loading preferences (bundle over URL), dynamic data loading,
    /// and provider configurations.
    /// 
    /// - Parameter context: The hybrid context containing configuration data.
    /// - Returns: Configured SPKLynxKitParams ready for Lynx view creation.
    /// 
    /// - Note: The method prioritizes bundle resources over URL resources for loading.
    ///         It also supports dynamic data loading via 'durl' parameter.
    static func lynxKitParams(withContext context: SPKHybridContext?) -> SPKLynxKitParams {
        var schemeParams = context?.schemeParams
        var lynxKitParams = SPKLynxKitParams()
        let extraParams = context?.schemeParams?.extra
        lynxKitParams.globalPropos = context?.globalProps
        lynxKitParams.context = context
        lynxKitParams.widthMode = context?.widthMode != nil ? context?.widthMode?.intValue as? LynxViewSizeMode : LynxViewSizeMode.exact
        lynxKitParams.heightMode = context?.heightMode != nil ? context?.heightMode?.intValue as? LynxViewSizeMode : LynxViewSizeMode.exact
        lynxKitParams.imageFetcher = context?.imageFetcher
        lynxKitParams.loadMeta = context?.loadData
        lynxKitParams.templateProvider = context?.templateProvider
        lynxKitParams.dynamicComponentFetcher = context?.dynamicComponentFetcher
        
        // for LynxView, we default use bundle as the resource to load, and use url as fallback.
        lynxKitParams.sourceUrl = extraParams?.spk.string(forKey: "bundle") ?? extraParams?.spk.string(forKey: "url")
        
        var initialProps = context?.initialData ?? [:]
        
        let dUrl = extraParams?.spk.string(forKey: "durl")
        if !isEmptyString(dUrl),
           let url = URL.spk.url(string: dUrl!),
           let data = try? Data(contentsOf: url),
           let jsonObject = try? JSONSerialization.jsonObject(with: data),
           let dict = jsonObject as? [String: Any] {
            initialProps.merge(dict) { _, new in new }
        }
        lynxKitParams.initialProperties = initialProps
        lynxKitParams.queryItems = context?.schemeParams?.extra
        return lynxKitParams
    }
    
    /// Generates global properties dictionary from Lynx kit parameters.
    /// 
    /// This is a convenience method that calls the full globalProps method
    /// and converts the result to a dictionary format.
    /// 
    /// - Parameter params: The Lynx kit parameters containing configuration data.
    /// - Returns: Dictionary representation of global properties, or nil if conversion fails.
    static func globalProps(withParams params: SPKLynxKitParams) -> [AnyHashable: Any]? {
        return self.globalProps(withParams: params, onDictionaryParamsCreated: nil)?.dictionary()
    }
    
    /// Generates global properties as LynxTemplateData from Lynx kit parameters.
    /// 
    /// This method creates comprehensive global properties by combining default
    /// global properties with parameter-specific data. It supports both dictionary
    /// and LynxTemplateData formats for global properties merging.
    /// 
    /// - Parameters:
    ///   - params: The Lynx kit parameters containing configuration data.
    ///   - rawParamsBlock: Optional callback executed with raw dictionary parameters
    ///                     before final LynxTemplateData creation.
    /// - Returns: LynxTemplateData containing merged global properties.
    static func globalProps(withParams params: SPKLynxKitParams, onDictionaryParamsCreated rawParamsBlock: (([AnyHashable: Any]?) -> Void)? = nil) -> LynxTemplateData? {
        var globalPropos = self.defaultGlobalProps(withParams: params)
        if let rawParamsBlock = rawParamsBlock {
            rawParamsBlock(globalPropos)
        }
        var _globalProps = LynxTemplateData.init(dictionary: globalPropos)
        if let tempPropos = params.globalPropos as? [AnyHashable: Any] {
            var dict = _globalProps?.dictionary()
            dict?.merge(tempPropos, uniquingKeysWith: { _, new in new})
            _globalProps = LynxTemplateData.init(dictionary: dict)
        } else if let tempProps = params.globalPropos as? LynxTemplateData {
            _globalProps?.update(with: tempProps)
        }
        return _globalProps
    }
    
    /// Creates default global properties for Lynx kit parameters.
    /// 
    /// This private method generates the base set of global properties including
    /// default system properties, Lynx SDK version, query items, and origin URL.
    /// It merges custom query items from the context if available.
    /// 
    /// - Parameter params: The Lynx kit parameters containing context and query data.
    /// - Returns: Dictionary containing default global properties with Lynx-specific additions.
    private static func defaultGlobalProps(withParams params: SPKLynxKitParams) -> [AnyHashable: Any]? {
        var globalPropos = SPKGlobalPropsUtils.defaultGlobalProps()
        var queryItems = params.queryItems ?? [:]
        let customQueryItem = params.context?.queryItems
        
        if let customQueryItem = customQueryItem,
            customQueryItem.count > 0 {
            queryItems.merge(customQueryItem) { _, new in new }
        }
        
        globalPropos.updateValue(LynxVersion.versionString() ?? "", forKey: "lynxSdkVersion")
        globalPropos.updateValue(queryItems ?? [:], forKey: "queryItems")
        globalPropos.updateValue(params.context?.originURL ?? "" ?? [:], forKey: "originUrl")

        return globalPropos
    }
    
}
