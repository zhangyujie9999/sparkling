// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import UIKit

extension UIApplication: SPKKitCompatible {}

public extension SPKKitWrapper where Base == UIApplication {
    
    /// Returns the main window of the application with fallback logic.
    /// 
    /// This property attempts to find the main window using multiple strategies:
    /// 1. First tries to get the window from the application delegate
    /// 2. Falls back to the key window if delegate window is not available
    /// 3. Finally uses the first window from the windows array as last resort
    /// 
    /// This approach ensures compatibility across different iOS versions and app configurations.
    /// 
    /// - Returns: The main UIWindow instance, or nil if no window is available.
    /// 
    /// - Example:
    ///   ```swift
    ///   if let mainWindow = UIApplication.spk.mainWindow {
    ///       // Use the main window for UI operations
    ///       print("Main window bounds: \(mainWindow.bounds)")
    ///   }
    ///   ```
    static var mainWindow: UIWindow? {
        var window: UIWindow? = nil
        window = UIApplication.shared.delegate?.window ?? nil
        if !(window is UIView) {
            window = UIApplication.shared.keyWindow
        }
        if window == nil {
            window = UIApplication.shared.windows.first
        }
        return window
    }
    
}
