// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import Foundation

public extension SPKKitWrapper where Base: UIWindow {
    static var keyWindow: UIWindow? {
        if #available(iOS 13, *) {
            let oldKeyWindow = UIApplication.shared.keyWindow

            // Find active key window from UIScene
            let activeWindowScenes = UIApplication.shared
                .connectedScenes
                .filter { $0.activationState == .foregroundActive }
                .compactMap { $0 as? UIWindowScene }

            var result: UIWindow?
            if let scene = activeWindowScenes.first {
                result = keyWindow(from: scene)
            }
            // If there're multiple active window scenes, get the key window from the currently focused window scene to keep the behavior consistent with [UIApplication sharedApplication].keyWindow
            if activeWindowScenes.count > 1 {
                // Although [UIApplication sharedApplication].keyWindow is deprecated for iOS 13+, it can help to find the focused one when multiple scenes in the foreground
                if let scene = oldKeyWindow?.windowScene {
                    result = keyWindow(from: scene)
                }
            }

            // Sometimes there will be no active scene in foreground, loop through the application windows for the key window
            if result == nil {
                result = UIApplication.shared.windows.first { $0.isKeyWindow }
            }

            // Check to see if the app key window is true and add protection
            if result == nil,
               let oldKeyWindows = oldKeyWindow,
               oldKeyWindows.isKeyWindow {
                result = oldKeyWindows
            }

            // Still nil ? Add protection to always fallback to the application delegate's window.
            // There's a chance when delegate doesn't respond to window, so add protection here
            if result == nil,
               let delegate = UIApplication.shared.delegate,
               delegate.responds(to: #selector(getter: UIApplicationDelegate.window)) {
                result = UIApplication.shared.delegate?.window ?? nil
            }
            return result
        } else {
            return UIApplication.shared.keyWindow
        }
    }

    @available(iOS 13, *)
    private static func keyWindow(from windowScene: UIWindowScene) -> UIWindow? {
        windowScene.windows.first { $0.isKeyWindow }
    }

    /// The default height of statusBar for key window. If the statusBar is hidden, it will also return default height in device instead of 0.
}
