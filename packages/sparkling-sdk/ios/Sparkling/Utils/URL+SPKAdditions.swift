// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

extension URL: SPKKitCompatibleValue {}

public extension SPKKitWrapper where Base == URL {
    
    /// Creates a URL from a string with optional relative URL support.
    /// 
    /// This method provides enhanced URL creation with automatic encoding and error recovery.
    /// If the initial URL creation fails, it attempts to fix common issues like unencoded characters.
    /// 
    /// - Parameters:
    ///   - string: The URL string to parse.
    ///   - url: An optional base URL for relative URL resolution.
    /// - Returns: A valid URL object, or `nil` if the string cannot be converted to a URL.
    /// 
    /// - Example:
    ///   ```swift
    ///   let baseURL = URL.spk.url(string: "https://example.com")
    ///   let relativeURL = URL.spk.url(string: "/path/to/resource", relativeTo: baseURL)
    ///   ```
    static func url(string: String, relativeTo url: URL? = nil) -> URL? {
        return _url(string: string, relativeTo: url)
    }

    /// Creates a URL from a string with optional query parameters and fragment.
    /// 
    /// This method constructs a URL by combining a base string with query parameters and an optional fragment.
    /// Query parameters are automatically URL-encoded for safety.
    /// 
    /// - Parameters:
    ///   - string: The base URL string.
    ///   - queryItems: Optional dictionary of query parameters to append.
    ///   - fragment: Optional fragment identifier to append after '#'.
    /// - Returns: A valid URL object with the specified components, or `nil` if construction fails.
    /// 
    /// - Example:
    ///   ```swift
    ///   let url = URL.spk.url(
    ///       string: "https://example.com/search",
    ///       queryItems: ["q": "swift programming", "page": 1],
    ///       fragment: "results"
    ///   )
    ///   // Result: "https://example.com/search?q=swift%20programming&page=1#results"
    ///   ```
    static func url(string: String, queryItems: [AnyHashable: Any]? = nil, fragment: String? = nil) -> URL? {
        return _url(string: string, queryItems: queryItems, fragment: fragment)
    }

    /// A comprehensive character set that includes all valid URL characters.
    internal static let urlValid: CharacterSet = CharacterSet.urlUserAllowed
        .union(.urlPathAllowed)
        .union(.urlHostAllowed)
        .union(.urlQueryAllowed)
        .union(.urlFragmentAllowed)
        .union(.urlPasswordAllowed)

    private static func _url(string str: String, relativeTo url: URL?) -> URL? {
        if isEmptyString(str) {
            return nil
        }
        let fixStr = str.trimmingCharacters(in: .whitespacesAndNewlines)
        var u: URL?
        if let url = url {
            u = URL(string: fixStr, relativeTo: url)
        } else {
            u = URL(string: fixStr)
        }
        if u == nil {
            //
            // Fail to construct a URL directly. Try to construct a URL with a encodedQuery.
            var sourceString = fixStr
            let fragmentRange = fixStr.range(of: "#")
            var fragment: String?
            if let fragmentRange = fragmentRange {
                sourceString = String(fixStr[..<fragmentRange.lowerBound])
                fragment = String(fixStr[fragmentRange.lowerBound...])
            }
            let substrings = sourceString.components(separatedBy: "?")
            if substrings.count > 1 {
                let beforeQuery = substrings[0]
                let queryString = substrings[1]
                let paramsList = queryString.components(separatedBy: "&")
                var encodedQueryParams: [AnyHashable: Any] = [:]
                paramsList.forEach { param in
                    let keyAndValue = param.components(separatedBy: "=")
                    if keyAndValue.count > 1 {
                        let key = keyAndValue[0]
                        var value = keyAndValue[1]

                        if value.range(of: "%") != nil {
                            value = value.removingPercentEncoding ?? value
                        }
                        let allowedCharacterSet = urlValid.subtracting(.init(charactersIn: ":/?#@!$&'(){}*+="))
                        let encodedValue = value.addingPercentEncoding(withAllowedCharacters: allowedCharacterSet)
                        encodedQueryParams[key] = encodedValue
                    }
                }

                let encodedQuery = encodedQueryParams.spk.urlQueryString
                let encodedURLString = beforeQuery.appending("?").appending(encodedQuery ?? "").appending(fragment ?? "")

                if let url = url {
                    u = URL(string: encodedURLString, relativeTo: url)
                } else {
                    u = URL(string: encodedURLString)
                }
            }

            if u == nil {
                let fixStr2 = fixStr.addingPercentEncoding(withAllowedCharacters: urlValid) ?? ""
                if let url = url {
                    u = URL(string: fixStr2, relativeTo: url)
                } else {
                    u = URL(string: fixStr2)
                }
            }
            assert(u != nil, "Fail to construct a URL.Please be sure that url is legal and contact with the professionals.")
        }
        return u
    }

    private static func _url(string str: String, queryItems: [AnyHashable: Any]? = nil, fragment: String? = nil) -> URL? {
        if isEmptyString(str) {
            return nil
        }
        var querys: String = ""
        if let queryItems = queryItems, queryItems.count > 0 {
            queryItems.forEach { key, value in
                guard value != nil else { return }
                let encodedKey = "\(key)".spk.urlEncoded
                let encodedValue = "\(value)".spk.urlEncoded
                if let encodedKey = encodedKey, let encodedValue = encodedValue {
                    querys.append("\(encodedKey)=\(encodedValue)")
                    querys.append("&")
                }
            }
            if querys.hasSuffix("&") {
                querys.removeLast()
            }
        }

        var resultURL: String = str
        if querys.count > 0 {
            if resultURL.range(of: "?") == nil {
                resultURL.append("?")
            } else if !resultURL.hasSuffix("?") && !resultURL.hasSuffix("&") {
                resultURL.append("&")
            }
            resultURL.append(querys)
        }

        if let fragment = fragment, fragment.count > 0 {
            resultURL.append("#\(fragment)")
        }

        let url = self.url(string: resultURL)
        return url
    }
    
    /// Returns the query parameters as a dictionary of key-value pairs.
    /// 
    /// This property extracts query parameters from the URL and returns them as a dictionary.
    /// The values are returned as-is without URL decoding.
    /// 
    /// - Returns: A dictionary containing the query parameters, or `nil` if no query string exists.
    /// 
    /// - Example:
    ///   ```swift
    ///   let url = URL(string: "https://example.com?name=John&age=25")!
    ///   let params = url.spk.queryItems
    ///   // ["name": "John", "age": "25"]
    ///   ```
    var queryItems: [String: String]? {
        guard let query = base.query, query.count > 0 else {
            return nil
        }
        var queries: [String: String] = [:]
        let params = query.components(separatedBy: "&")
        params.forEach { param in
            let keyAndValue = param.components(separatedBy: "=")
            if keyAndValue.count > 1 {
                let key = keyAndValue[0]
                let value = keyAndValue[1]
                queries[key] = value
            }
        }
        return queries
    }
    
    /// Returns the query parameters as a dictionary with URL-decoded values.
    /// 
    /// This property extracts query parameters from the URL using URLComponents,
    /// which automatically handles URL decoding of parameter values.
    /// 
    /// - Returns: A dictionary containing the decoded query parameters, or `nil` if no query string exists.
    /// 
    /// - Example:
    ///   ```swift
    ///   let url = URL(string: "https://example.com?name=John%20Doe&city=New%20York")!
    ///   let params = url.spk.decodedQueryItems
    ///   // ["name": "John Doe", "city": "New York"]
    ///   ```
    var decodedQueryItems: [String: String]? {
        let components = URLComponents(string: base.absoluteString)
        guard let queryItems = components?.queryItems, queryItems.count > 0 else {
            return nil
        }
        var queries: [String: String] = [:]
        queryItems.forEach { queryItem in
            queries[queryItem.name] = queryItem.value
        }
        return queries
    }
    
    /// Creates a new URL by adding or updating a single query parameter.
    /// 
    /// This method merges a single key-value pair into the existing query parameters of the URL.
    /// 
    /// - Parameters:
    ///   - key: The query parameter key to add or update.
    ///   - value: The value for the query parameter.
    ///   - encode: Whether to manually encode the query parameters. Default is `false`.
    /// - Returns: A new URL with the merged query parameter.
    /// 
    /// - Example:
    ///   ```swift
    ///   let url = URL(string: "https://example.com?page=1")!
    ///   let newURL = url.spk.merging(query: "sort", value: "name")
    ///   // Result: "https://example.com?page=1&sort=name"
    ///   ```
    func merging(query key: String, value: String, encode: Bool = false) -> URL {
        return merging(queries: [key: value], encode: encode)
    }

    /// Creates a new URL by merging multiple query parameters with existing ones.
    /// 
    /// This method combines the provided query parameters with the existing ones in the URL.
    /// If a parameter already exists, it will be updated with the new value.
    /// The order of existing parameters is preserved, with new parameters appended at the end.
    /// 
    /// - Parameters:
    ///   - queries: A dictionary of query parameters to merge.
    ///   - encode: Whether to manually encode the query parameters. Default is `false`.
    /// - Returns: A new URL with the merged query parameters.
    /// 
    /// - Example:
    ///   ```swift
    ///   let url = URL(string: "https://example.com?page=1&sort=date")!
    ///   let newURL = url.spk.merging(queries: ["page": "2", "filter": "active"])
    ///   // Result: "https://example.com?page=2&sort=date&filter=active"
    ///   ```
    func merging(queries: [String: String], encode: Bool = false) -> URL {
        guard var components = URLComponents(string: base.absoluteString) else { return base }
        let oldPairs = decodedQueryItems ?? [:]
        let newPairs = queries
        let mergeQueries = mergeOrderedPairs(oldPairs, newPairs)
        if encode {
            let encodedQueryArray = mergeQueries.map { "\($0.spk.urlEncoded ?? $0)=\($1.spk.urlEncoded ?? $1)" }
            let encodedQuery = encodedQueryArray.joined(separator: "&")
            components.percentEncodedQuery = encodedQuery
        } else {
            let queryItems = mergeQueries.map { URLQueryItem(name: $0, value: $1) }
            components.queryItems = queryItems
        }
        return components.url ?? base
    }
    
    internal func mergeOrderedPairs<K: Hashable, V>(_ oldPairs: [K: V], _ newPairs: [K: V]) -> [(K, V)] {
        var newPairs = newPairs
        var mergePairs: [(K, V)] = []
        for oldPair in oldPairs {
            if let newValue = newPairs[oldPair.key] {
                mergePairs.append((oldPair.key, newValue))
                newPairs[oldPair.key] = nil
            } else {
                mergePairs.append((oldPair.key, oldPair.value))
            }
        }
        for newPair in newPairs {
            mergePairs.append((newPair.key, newPair.value))
        }
        return mergePairs
    }
}
