// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import UIKit

public extension SPKKitWrapper where Base: UIView {
    
    /// Finds and returns the view controller that contains this view.
    /// 
    /// This property traverses the responder chain starting from the current view
    /// to find the first UIViewController in the hierarchy. This is useful for
    /// accessing the containing view controller from within a view without
    /// maintaining explicit references.
    /// 
    /// - Returns: The UIViewController that contains this view, or nil if no view controller is found
    /// 
    /// - Note: This method walks up the responder chain, so it may return nil if
    ///   the view is not currently part of a view controller's view hierarchy.
    var viewController: UIViewController? {
        var view: UIView? = base
        while view != nil {
            let nextResponsder = view?.next
            if let nextResponsder = nextResponsder as? UIViewController {
                return nextResponsder
            }
            view = view?.superview
        }
        return nil
    }
    
    /// Provides safe area insets with backward compatibility for iOS versions prior to 11.0.
    /// 
    /// This property returns the safe area insets for the view, ensuring compatibility
    /// across different iOS versions. For iOS 11.0 and later, it uses the native
    /// safeAreaInsets property. For earlier versions, it calculates safe areas manually
    /// by considering the status bar height.
    /// 
    /// - Returns: UIEdgeInsets representing the safe area margins
    /// 
    /// - Note: On pre-iOS 11 devices, only the top inset is calculated based on
    ///   status bar height. Left, right, and bottom insets remain 0.
    var safeAreaInsets: UIEdgeInsets {
        if #available(iOS 13.0, *) {
            return base.safeAreaInsets
        }

        var safeInset = UIEdgeInsets.zero

        if #available(iOS 11.0, *) {
            safeInset = base.safeAreaInsets
        }
        
        let viewFrameInWindow = base.convert(base.bounds, to: nil)

        let statusBarView = UIApplication.shared.value(forKey: "statusBar") as? UIView
        if (viewFrameInWindow.origin.y < 30 && !UIApplication.shared.isStatusBarHidden) || statusBarView?.frame.size.height ?? 0 <= 0 {
            if safeInset.top <= 0 {
                safeInset.top = UIApplication.shared.statusBarFrame.size.height - viewFrameInWindow.origin.y
            }
            if safeInset.top <= 0 {
                safeInset.top = 20 - viewFrameInWindow.origin.y
            }
        }
        return safeInset
    }
}
