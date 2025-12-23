// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod

/// Enumeration defining the different types of view disappearance events.
///
/// This enum categorizes the various reasons why a SPK container
/// view might disappear, enabling appropriate handling for each scenario.
@objc public enum SPKDisappearType: Int {
    /// Unknown or unspecified disappearance type.
    case SPKDisappearTypeUnknown = -1
    
    /// View disappeared because it was covered by another view.
    case SPKDisappearTypeCovered = 0
    
    /// View disappeared because it was destroyed.
    case SPKDisappearTypeDestroy
    
    /// View disappeared because the app resigned active state.
    case SPKDisappearTypeAppResignActive
}

/// Core protocol defining the interface for SPK hybrid containers.
///
/// This protocol extends SPKBaseProtocol to provide comprehensive
/// container management capabilities including lifecycle handling, view management,
/// toolbar configuration, and hybrid engine integration.
@objc
public protocol SPKContainerProtocol: SPKBaseProtocol {
    
    /// Indicates whether the hybrid content is currently in background state.
    var hybridInBackground: Bool {get}
    
    /// Indicates whether the hybrid content is currently visible/appeared.
    var hybridAppear: Bool {get}
    
    /// The original URL from which the container content was loaded.
    var originURL: URL? {get}
    
    /// The type of hybrid engine being used (e.g., Lynx, Web).
    var viewType: SPKHybridEngineType {get}
    
    /// Delegate for handling container lifecycle events.
    weak var containerLifecycleDelegate: (SPKContainerLifecycleProtocol)? {set get}
    
    /// The main hybrid view that renders the content.
    var kitView: (UIView & SPKWrapperViewProtocol)? {get}
    
    /// The bottom toolbar associated with the container, if any.
    var bottomToolBar: SPKBottomToolBarProtocol? {get}
    
    /// Flag indicating whether the bottom toolbar should be hidden.
    var hideBottomToolBar: Bool {get}
    
    /// Flag indicating whether the container has completed mounting.
    var didMount: Bool {get}
    
    /// The preferred layout size for the container.
    var preferredLayoutSize: CGSize {get}
    
    /// The status bar style to be used when this container is active.
    var statusBarStyle: UIStatusBarStyle {set get}
    
    /// Handles the view did appear lifecycle event.
    func handleViewDidAppear()
    
    /// Handles the view did disappear lifecycle event.
    func handleViewDidDisappear()
    
    /// Handles the application becoming active.
    func handleBecomeActive()
    
    /// Handles the application resigning active state.
    func HandleResignActive()
    
    /// Loads content into the container.
    // func load()
    
    /// Reloads the container with a new hybrid context.
    ///
    /// - Parameter context: The new hybrid context to use for reloading
    // func reload(_ context: SPKHybridContext)
    
    /// Called before the container is destroyed.
    ///
    /// - Returns: true if destruction should proceed, false to cancel
    @objc optional func willDestory() -> Bool
    
    /// Updates the container's title.
    ///
    /// - Parameter title: The new title to set
    @objc optional func update(_ title: String)
    
    /// Registers a custom UI component for Lynx/Web engines.
    ///
    /// - Parameters:
    ///   - ui: The UI component class to register
    ///   - name: The name to associate with the component
    @objc optional func register(_ ui: AnyClass, name: String)
    
    /// Updates data in the Lynx/Web engine.
    ///
    /// The data parameter can be NSString, NSDictionary, or TemplateData.
    ///
    /// - Parameters:
    ///   - data: The data to update (NSString, NSDictionary, or TemplateData)
    ///   - processor: The processor name to handle the data update
    @objc optional func update(_ data: AnyObject, processorName processor: String)
    
    /// Handles view disappearance with a specific disappearance type.
    ///
    /// - Parameter type: The type of disappearance that occurred
    @objc optional func handleViewDidDisappear(withType type: SPKDisappearType)
}

/// Extension providing convenient method pipe registration.
extension SPKContainerProtocol {
    /// Registers pipe methods with the container's kit view.
    ///
    /// This method provides a convenient way to register multiple pipe methods
    /// at once with the container's underlying kit view method pipe.
    ///
    /// - Parameter methods: Array of pipe methods to register, or nil
    public func register(pipeMethods methods: [PipeMethod]?) {
        if let methods = methods {
            self.kitView?.methodPipe?.register(localMethods: methods)
        }
    }
}
