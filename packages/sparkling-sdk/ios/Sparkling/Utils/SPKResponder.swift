// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

/// A utility class for navigating and analyzing the view controller hierarchy.
/// 
/// SPKResponder provides static methods to traverse the iOS view controller stack
/// and identify the currently visible (top-most) view controller. This is essential
/// for operations that need to present content or interact with the active UI context.
/// 
/// - Note: This class uses @objcMembers for Objective-C interoperability
//@objcMembers
class SPKResponder: NSObject {
    
    /// Returns the topmost visible view controller in the current app hierarchy.
    /// 
    /// This property traverses the entire view controller stack starting from the
    /// key window's root view controller to find the currently visible controller.
    /// 
    /// - Returns: The topmost UIViewController, or nil if no controller is found
    static var topViewController: UIViewController? {
        return self.topViewControllerForController(rootViewController: UIApplication.shared.keyWindow?.rootViewController)
    }
    
    /// Recursively finds the topmost view controller starting from a given root controller.
    /// 
    /// This method implements a depth-first search through the view controller hierarchy,
    /// handling various container types and presentation scenarios.
    /// 
    /// - Parameter rootViewController: The starting point for the search
    /// - Returns: The topmost visible UIViewController in the hierarchy, or nil if none found
    static func topViewControllerForController(rootViewController: UIViewController?) -> UIViewController? {
        guard rootViewController != nil else {
            return nil
        }
        
        if let navigationCotnroller = rootViewController as? UINavigationController {
            return self.topViewControllerForController(rootViewController: navigationCotnroller.viewControllers.last)
        }
        
        if let tabController = rootViewController as? UITabBarController {
            return self.topViewControllerForController(rootViewController: tabController.selectedViewController)
        }
        
        if let presentedViewController = rootViewController?.presentedViewController {
            return self.topViewControllerForController(rootViewController: presentedViewController)
        }
        return rootViewController
    }
    
    /// Finds the top view controller associated with a given viewController.
    ///
    /// This method traverses the responder chain starting from the given viewController
    /// to find the top UIViewController in the hierarchy. This is useful for
    /// determining which view controller contains a particular UI element.
    ///
    /// - Parameter viewController: The starting responder to search from.
    /// - Returns: The top UIViewController found in the UIViewController chain, or nil if none exists.
    public static func topViewController(for viewController: UIViewController) -> UIViewController? {
        if let navVC = viewController as? UINavigationController,
           let lastVC = navVC.viewControllers.last {
            return topViewController(for: lastVC)
        } else if let barVC = viewController as? UITabBarController,
                  let selectedVC = barVC.selectedViewController {
            return topViewController(for: selectedVC)
        } else if let presentedVC = viewController.presentedViewController {
            return topViewController(for: presentedVC)
        } else {
            // HostingControllerProtocol related code is removed due to crash in iOS 12.
            return viewController
        }
    }

    /// Finds the top view controller associated with a given view.
    ///
    /// This method traverses the responder chain starting from the given view
    /// to find the top UIViewController in the hierarchy. This is useful for
    /// determining which view controller contains a particular UI element.
    ///
    /// - Parameter view: The starting responder to search from.
    /// - Returns: The top UIViewController found in the UIViewController chain, or nil if none exists.
    public static func topViewController(for view: UIView) -> UIViewController? {
        var responder: UIResponder? = view
        while responder != nil, !(responder is UIViewController) {
            responder = responder?.next
        }
        guard let vc: UIViewController = (responder as? UIViewController) ?? UIWindow.spk.keyWindow?.rootViewController else { return nil }
        return topViewController(for: vc)
    }
    
    /// Finds the top view controller associated with a given responder.
    ///
    /// This method traverses the responder chain starting from the given responder
    /// to find the top UIViewController in the hierarchy. This is useful for
    /// determining which view controller contains a particular UI element.
    ///
    /// - Parameter responder: The starting responder to search from.
    /// - Returns: The top UIViewController found in the responder chain, or nil if none exists.
    public static func topViewController(for responder: UIResponder) -> UIViewController? {
        switch responder {
        case let controller as UIViewController: return topViewController(for: controller)
        case let view as UIView: return topViewController(for: view)
        default: return topViewController
        }
    }

    /// Checks if the specified view controller is currently the topmost visible controller.
    /// 
    /// - Parameter viewController: The view controller to check
    /// - Returns: true if the provided controller is the topmost visible controller, false otherwise
    static func isTopViewController(viewController: UIViewController?) -> Bool {
        guard let topViewController = topViewController else {
            return false
        }
        return self.topViewController == topViewController
    }
}
