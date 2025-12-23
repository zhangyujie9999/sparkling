// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

extension NSObject: SPKKitCompatible {}

public extension SPKKitWrapper where Base: NSObject {
    
    /// Associates an object with the receiver using a string key.
    /// 
    /// This method provides a Swift-friendly interface for Objective-C associated objects,
    /// allowing you to attach additional data to any NSObject instance. The association
    /// can be either strong (default) or weak based on your memory management needs.
    /// 
    /// - Parameters:
    ///   - key: A unique string identifier for the associated object
    ///   - object: The object to associate with the receiver. Can be nil to remove association
    ///   - weak: Whether to use weak reference (true) or strong reference (false, default)
    /// 
    /// - Note: This method uses Objective-C runtime associated objects internally.
    ///   Weak references are implemented using blocks to avoid direct weak association limitations.
    func setAttachedObject<T>(key: String, object: T?, weak: Bool = false) {
        base.spk_attach(object, forKey: key, isWeak: weak)
    }

    /// Retrieves an associated object for the specified key.
    /// 
    /// This method retrieves objects that were previously associated with the receiver
    /// using `setAttachedObject(key:object:weak:)`. The method is type-safe and will
    /// return nil if the stored object cannot be cast to the expected type.
    /// 
    /// - Parameters:
    ///   - key: The string identifier used when setting the associated object
    ///   - weak: Whether the association was stored as weak (true) or strong (false, default)
    /// 
    /// - Returns: The associated object cast to the expected type, or nil if not found or type mismatch
    /// 
    /// - Important: The `weak` parameter must match the value used when setting the object.
    func getAttachedObject<T>(key: String, weak: Bool = false) -> T? {
        guard let object = base.spk_getAttachedObject(forKey: key, isWeak: weak) as? T else {
            return nil
        }
        return object
    }
}
