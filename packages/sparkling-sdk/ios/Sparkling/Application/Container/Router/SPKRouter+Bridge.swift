// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod

/// Bridge extension for SPKRouter providing container management functionality.
/// 
/// This extension adds methods for closing containers and managing view controller
/// navigation within the SPK framework. It handles both navigation controller
/// stacks and modal presentation scenarios.
extension SPKRouter {
    /// Closes a pipe container by dismissing or popping its associated view controller.
    /// 
    /// This method attempts to close a container by finding its associated view controller
    /// and performing the appropriate dismissal action. It handles both navigation controller
    /// scenarios (pop operations) and modal presentation scenarios (dismiss operations).
    /// 
    /// - Parameter container: The pipe container to close. Must be a UIResponder.
    /// - Returns: true if the container was successfully closed, false otherwise.
    /// 
    /// - Note: The method follows this priority order:
    ///   1. Pop from navigation controller if the target is in the stack
    ///   2. Dismiss modally if the target is presented
    ///   3. Return false if no valid dismissal method is found
    public static func close(container: PipeContainer?) -> Bool {
        guard let uiResponder = container as? UIResponder else {
            return false
        }
        
        guard let targetVC = viewController(for: uiResponder) else {
            return false
        }
        
        if let naviVC = targetVC.navigationController {
            if SPKResponder.isTopViewController(viewController: targetVC) {
                if naviVC.viewControllers.count == 1 && naviVC.presentingViewController != nil {
                    naviVC.dismiss(animated: true)
                } else {
                    naviVC.popViewController(animated: true)
                }
            } else {
                var stack = naviVC.viewControllers ?? []
                if let index = stack.firstIndex(of: targetVC) {
                    stack.remove(at: index)
                    targetVC.removeFromParent()
                    targetVC.navigationController?.setViewControllers(stack, animated: true)
                }
            }
        } else {
            targetVC.dismiss(animated: true)
        }
        return true
    }
    
    /// Finds the view controller associated with a given responder.
    /// 
    /// This method traverses the responder chain starting from the given responder
    /// to find the first UIViewController in the hierarchy. This is useful for
    /// determining which view controller contains a particular UI element.
    /// 
    /// - Parameter responder: The starting responder to search from.
    /// - Returns: The first UIViewController found in the responder chain, or nil if none exists.
    public static func viewController(for responder: UIResponder) -> UIViewController? {
        var nextRepsonder: UIResponder? = responder
        while let responder = nextRepsonder {
            if let vc = responder as? UIViewController {
                return vc
            }
            nextRepsonder = responder.next
        }
        return nil
    }
}
