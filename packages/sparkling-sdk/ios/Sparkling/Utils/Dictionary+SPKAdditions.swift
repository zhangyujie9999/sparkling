// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

public protocol DictionaryProtocol: Collection {
    associatedtype Key: Hashable
    associatedtype Value
}

extension Dictionary: DictionaryProtocol {
    public typealias Key = Key
    public typealias Value = Value
}

extension Dictionary: SPKKitCompatibleValue {}

public extension SPKKitWrapper where Base: DictionaryProtocol {
    
    /// Converts the dictionary to a URL query string format.
    /// 
    /// This property generates a URL-encoded query string from the dictionary's key-value pairs.
    /// Keys and values are percent-encoded to ensure URL safety. Nil values are automatically filtered out.
    /// 
    /// - Returns: A URL query string (e.g., "key1=value1&key2=value2"), or an empty string if the dictionary is empty.
    ///   Returns `nil` if the base cannot be cast to a dictionary type.
    /// 
    /// - Example:
    ///   ```swift
    ///   let dict = ["name": "John Doe", "age": 25]
    ///   let queryString = dict.spk.urlQueryString // "name=John%20Doe&age=25"
    ///   ```
    var urlQueryString: String? {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return nil
        }
        var items: [String] = []
        items.reserveCapacity(dictionary.count)
        
        dictionary.forEach { key, value in
            guard let unwrappedValue = value as? Any,
                  String(describing: unwrappedValue) != "nil" else {
                return
            }
            
            let encodedKey = "\(key)".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "\(key)"
            let encodedValue = "\(unwrappedValue)".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "\(unwrappedValue)"
            let item = "\(encodedKey)=\(encodedValue)"
            items.append(item)
        }
        return items.isEmpty ? "" : items.joined(separator: "&")
    }
    
    /// Retrieves a Boolean value for the specified key.
    /// 
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or conversion fails. Defaults to `false`.
    /// - Returns: The Boolean value associated with the key, or the default value if not found or conversion fails.
    func bool(forKey key: Base.Key, default defaultValue: Bool = false) -> Bool {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let number = value as? NSNumber {
            return number.boolValue
        } else if let string = value as? NSString {
            return string.boolValue
        } else {
            return defaultValue
        }
    }

    /// Retrieves an Integer value for the specified key.
    /// 
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or conversion fails. Defaults to `0`.
    /// - Returns: The Integer value associated with the key, or the default value if not found or conversion fails.
    func int(forKey key: Base.Key, default defaultValue: Int = 0) -> Int {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let number = value as? NSNumber {
            return number.intValue
        } else if let string = value as? NSString {
            return string.integerValue
        } else {
            return defaultValue
        }
    }

    /// Retrieves a Float value for the specified key.
    /// 
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or conversion fails. Defaults to `0.0`.
    /// - Returns: The Float value associated with the key, or the default value if not found or conversion fails.
    func float(forKey key: Base.Key, default defaultValue: Float = 0.0) -> Float {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let number = value as? NSNumber {
            return number.floatValue
        } else if let string = value as? NSString {
            return string.floatValue
        } else {
            return defaultValue
        }
    }

    /// Retrieves a Double value for the specified key.
    /// 
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or conversion fails. Defaults to `0.0`.
    /// - Returns: The Double value associated with the key, or the default value if not found or conversion fails.
    func double(forKey key: Base.Key, default defaultValue: Double = 0.0) -> Double {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let number = value as? NSNumber {
            return number.doubleValue
        } else if let string = value as? NSString {
            return string.doubleValue
        } else {
            return defaultValue
        }
    }
    
    /// Retrieves an optional String value for the specified key.
    /// 
    /// - Parameter key: The key to look up in the dictionary.
    /// - Returns: The String value associated with the key, or `nil` if not found or conversion fails.
    func string(forKey key: Base.Key) -> String? {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return nil
        }
        guard let value = dictionary[key] else {
            return nil
        }
        if let string = value as? String {
            return string
        } else if let number = value as? NSNumber {
            return number.stringValue
        } else {
            return nil
        }
    }

    /// Returns the `String` value for key, or default value when not found.
    /// - Parameters:
    ///   - key: The key.
    ///   - defaultValue: The default value when not found.
    /// - Returns: The return value.
    func string(forKey key: Base.Key, default defaultValue: String) -> String {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let string = value as? String {
            return string
        } else if let number = value as? NSNumber {
            return number.stringValue
        } else {
            return defaultValue
        }
    }

    /// Retrieves an optional Array value for the specified key.
    /// 
    /// - Parameter key: The key to look up in the dictionary.
    /// - Returns: The Array value associated with the key, or `nil` if not found or type casting fails.
    func array<T>(forKey key: Base.Key) -> [T]? {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return nil
        }
        guard let value = dictionary[key] else {
            return nil
        }
        if let array = value as? [T] {
            return array
        } else {
            return nil
        }
    }

    /// Retrieves an Array value for the specified key with a default fallback.
    /// 
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or type casting fails.
    /// - Returns: The Array value associated with the key, or the default value if not found or type casting fails.
    func array<T>(forKey key: Base.Key, default defaultValue: [T]) -> [T] {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let array = value as? [T] {
            return array
        } else {
            return defaultValue
        }
    }

    /// Retrieves an optional Dictionary value for the specified key.
    /// 
    /// - Parameter key: The key to look up in the dictionary.
    /// - Returns: The Dictionary value associated with the key, or `nil` if not found or type casting fails.
    func dictionary<K, V>(forKey key: Base.Key) -> [K: V]? {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return nil
        }
        guard let value = dictionary[key] else {
            return nil
        }
        if let dictionary = value as? [K: V] {
            return dictionary
        } else {
            return nil
        }
    }

    /// Retrieves a Dictionary value for the specified key with a default fallback.
    /// 
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or type casting fails.
    /// - Returns: The Dictionary value associated with the key, or the default value if not found or type casting fails.
    func dictionary<K, V>(forKey key: Base.Key, default defaultValue: [K: V]) -> [K: V] {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let dictionary = value as? [K: V] {
            return dictionary
        } else {
            return defaultValue
        }
    }
    
    /// Retrieves an optional value of any type for the specified key.
    /// 
    /// - Parameter key: The key to look up in the dictionary.
    /// - Returns: The value associated with the key, or `nil` if not found.
    func object(forKey key: Base.Key) -> Any? {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return nil
        }
        guard let value = dictionary[key] else {
            return nil
        }
        return value
    }

    /// Retrieves an optional value of a specific type for the specified key.
    /// 
    /// - Parameter key: The key to look up in the dictionary.
    /// - Returns: The value cast to type `T`, or `nil` if not found or type casting fails.
    func object<T>(forKey key: Base.Key) -> T? {
        return object(forKey: key) as? T
    }
    
    /// Returns the value associated with `key` cast to type `T`.
    /// - Note: The type of `defaultValue` should match the expected type `T`
    ///   and be consistent with the type of values stored in the dictionary (`Base.Value`).
    ///   Otherwise, the function will return `defaultValue` when type casting fails.
    ///
    /// - Parameters:
    ///   - key: The key to look up in the dictionary.
    ///   - defaultValue: The default value to return if the key is not found or the value cannot be cast to `T`.
    /// - Returns: The value cast to type `T` if found and cast succeeds; otherwise, `defaultValue`.
    func object<T>(forKey key: Base.Key, default defaultValue: T) -> T {
        guard let dictionary = base as? [Base.Key: Base.Value] else {
            return defaultValue
        }
        guard let value = dictionary[key] else {
            return defaultValue
        }
        if let object = value as? T {
            return object
        } else {
            return defaultValue
        }
    }
}
