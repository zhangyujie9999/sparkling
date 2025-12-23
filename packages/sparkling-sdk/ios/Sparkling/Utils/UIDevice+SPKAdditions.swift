// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

extension UIDevice: SPKKitCompatible {}

public extension SPKKitWrapper where Base: UIDevice {
    
    /// Returns the hardware model identifier of the current device.
    /// 
    /// This property provides the internal hardware model string used by Apple
    /// to identify different device variants. This is more specific than the
    /// user-facing model name and includes information about the device generation,
    /// storage capacity, and cellular capabilities.
    /// 
    /// - Returns: A string containing the hardware model identifier (e.g., "iPhone14,2", "iPad13,1")
    /// 
    /// - Note: This identifier is useful for device-specific optimizations,
    ///   analytics, and debugging purposes. The format is typically
    ///   "DeviceType" followed by generation and variant numbers.
    static var hwModel: String? {
        return self.getSysInfoByName("hw.model")
    }
    
    /// Retrieves system information using the specified system name.
    /// 
    /// This method provides a Swift wrapper around the POSIX `uname` system call,
    /// allowing access to various system information fields. It's primarily used
    /// internally to get hardware model information but can be used for other
    /// system queries as well.
    /// 
    /// - Parameter typeSpecifier: The system information name to query (e.g., "hw.machine" for hardware model)
    /// - Returns: The system information string, or nil if the query fails
    /// 
    /// - Note: This method uses `sysctlbyname` internally to retrieve system information.
    ///   Common system names include "hw.machine", "kern.version", and "kern.hostname".
    private static func getSysInfoByName(_ typeSpecifier: String) -> String? {
        var size: size_t = 0
        if sysctlbyname(typeSpecifier, nil, &size, nil, 0) != 0 {
            return nil
        }

        var answer = [CChar](repeating: 0, count: size)
        if sysctlbyname(typeSpecifier, &answer, &size, nil, 0) != 0 {
            return nil
        }
        return String(cString: answer)
    }
    
    /// Determines whether the current device belongs to the iPhone X series or later.
    /// 
    /// This property identifies devices that feature the "notch" design and Face ID,
    /// which affects UI layout considerations such as safe area handling, status bar
    /// behavior, and home indicator placement. It's particularly useful for adapting
    /// UI layouts to accommodate the unique screen characteristics of these devices.
    /// 
    /// The detection is based on the device's safe area insets, specifically checking
    /// for a non-zero bottom safe area inset which indicates the presence of a home
    /// indicator area.
    /// 
    /// - Returns: `true` if the device is iPhone X series or later, `false` otherwise
    /// 
    /// - Note: This method requires the app to have a key window with a root view controller
    ///   to accurately determine safe area insets. It may return `false` during app launch
    ///   before the UI is fully initialized.
    static var isIPhoneXSeries: Bool {
        // First try to use safe area insets for accurate detection
        if #available(iOS 11.0, *) {
            if let window = UIApplication.shared.windows.first {
                return window.safeAreaInsets.bottom > 0
            }
        }
        
        // Fallback to device model detection for cases where UI is not available
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let platform = machineMirror.children.reduce("") { identifier, element in
            guard let value = element.value as? Int8, value != 0 else { return identifier }
            return identifier + String(UnicodeScalar(UInt8(value)))
        }
        
        // Check for iPhone X series models (iPhone X, XS, XS Max, XR, 11, 12, 13, 14, 15, etc.)
        // iPhone X series starts from iPhone10,x and continues with iPhone11,x, iPhone12,x, etc.
        // Use regex pattern to match iPhone{10+},x format for future compatibility
        let xSeriesRegex = try? NSRegularExpression(pattern: "^iPhone(1[0-9]|[2-9][0-9]),", options: [])
        let isXSeriesModel = xSeriesRegex?.firstMatch(in: platform, options: [], range: NSRange(location: 0, length: platform.count)) != nil
        
        // Handle simulator case - check if it's an iPhone simulator
        if platform.contains("x86_64") || platform.contains("arm64") {
            // For simulator, we can check the simulated device type
            let deviceName = UIDevice.current.name
            let modelName = UIDevice.current.model
            
            // If it's iPhone simulator, assume it's X series for modern simulators
            if modelName.contains("iPhone") && self.isScreenHeightLarge736() {
                return true // Most modern iPhone simulators are X series
            }
        }
        
        return isXSeriesModel
    }
    
    private static func isScreenHeightLarge736() -> Bool {
        let size = UIScreen.main.bounds.size
        let len = max(size.height, size.width)
        return len > 736;
    }
}
