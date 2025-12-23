// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

/// A navigation bar button item that provides customizable button functionality for SPKNavigationBar.
/// 
/// This class implements the SPKNavigationBarButtonProtocol and serves as a data model
/// for navigation bar buttons, containing the button's visual representation and action handler.
/// The @objcMembers attribute ensures Objective-C compatibility for all properties and methods.
@objcMembers
public class SPKNavigationBarButtonItem: NSObject, SPKNavigationBarButtonProtocol {
    
    /// The icon image displayed on the navigation bar button.
    /// 
    /// This property defines the visual representation of the button.
    /// Defaults to an empty UIImage if not explicitly set.
    public var icon: UIImage = UIImage()
    
    /// The handler responsible for processing navigation bar button actions.
    /// 
    /// This optional property contains the logic that executes when the button is tapped.
    /// It follows the SPKNavBarHandler protocol for consistent action handling.
    public var navBarHandler: SPKNavBarHandler?
}
