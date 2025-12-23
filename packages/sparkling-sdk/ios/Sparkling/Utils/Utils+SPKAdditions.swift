// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

/// Checks if a given value is an empty string or not a string at all.
/// 
/// This function safely checks if the provided value is a non-empty string.
/// It handles nil values, non-string types, and empty strings uniformly by returning true.
/// 
/// - Parameter string: Any optional value to check
/// - Returns: true if the value is nil, not a string, or an empty string; false if it's a non-empty string
public func isEmptyString(_ string: Any?) -> Bool {
    guard let value = optionalCast(string) else {
        return true
    }
    guard let string = value as? String else {
        return true
    }
    return string.isEmpty
}

/// Checks if a given value is an empty array or not an array at all.
/// 
/// This function safely checks if the provided value is a non-empty array.
/// It handles nil values, non-array types, and empty arrays uniformly by returning true.
/// 
/// - Parameter array: Any optional value to check
/// - Returns: true if the value is nil, not an array, or an empty array; false if it's a non-empty array
public func isEmptyArray(_ array: Any?) -> Bool {
    guard let value = optionalCast(array) else {
        return true
    }
    guard let array = value as? [Any] else {
        return true
    }
    return array.isEmpty
}

/// Checks if a given value is an empty dictionary or not a dictionary at all.
/// 
/// This function safely checks if the provided value is a non-empty dictionary.
/// It handles nil values, non-dictionary types, and empty dictionaries uniformly by returning true.
/// 
/// - Parameter dictionary: Any optional value to check
/// - Returns: true if the value is nil, not a dictionary, or an empty dictionary; false if it's a non-empty dictionary
public func isEmptyDictionary(_ dictionary: Any?) -> Bool {
    guard let value = optionalCast(dictionary) else {
        return true
    }
    guard let dictionary = value as? [AnyHashable: Any] else {
        return true
    }
    return dictionary.isEmpty
}

/// Safely casts a value to an optional type, handling nil values gracefully.
/// 
/// This generic function provides a safe way to cast values while preserving nil values.
/// It converts the input to AnyObject and then attempts to cast it to the desired type,
/// returning nil if the cast fails or if the input is nil.
/// 
/// - Parameter value: The value to cast
/// - Returns: The value cast to the specified type, or nil if the cast fails
public func optionalCast<T>(_ value: T) -> T? {
    let object = value as AnyObject?
    switch object {
    case .none:
        return nil
    case .some(let castObject):
        return (castObject as? T)
    }
}
