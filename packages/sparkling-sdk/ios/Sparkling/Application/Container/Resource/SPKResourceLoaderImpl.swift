// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

/// Type alias for network response completion handlers.
/// 
/// - Parameters:
///   - Data?: The response data, if any.
///   - URLResponse?: The URL response object containing metadata.
///   - Error?: Any error that occurred during the request.
public typealias SPKResponseCompletion = (Data?, URLResponse?, Error?) -> Void


/// Extension to make URLSessionDataTask conform to SPKResourceLoaderTaskProtocol.
/// 
/// This extension allows URLSessionDataTask to be used as a resource loading task
/// within the SPK framework's resource management system.
extension URLSessionDataTask: SPKResourceLoaderTaskProtocol {

}

/// A resource provider that encapsulates resource data for the SPK framework.
/// 
/// This class implements SPKResourceProtocol and serves as a container
/// for resource data loaded from various sources (network, bundle, etc.).
/// The @objcMembers attribute ensures Objective-C compatibility.
@objcMembers
open class SPKResourceProvider: SPKResourceProtocol {
    /// The actual resource data.
    /// 
    /// This property holds the loaded resource data, which can be nil if loading failed.
    public var resourceData: Data?
    
    /// Initializes a resource provider with optional data.
    /// 
    /// - Parameter resourceData: The resource data to encapsulate. Defaults to nil.
    init(resourceData: Data? = nil) {
        self.resourceData = resourceData
    }
}

#spk_register(class: "SPKResourceLoaderImpl")

/// Implementation of the SPKResourceLoaderProtocol for loading resources.
/// 
/// This class provides functionality to load resources from both network URLs and local bundles.
/// It implements a singleton pattern and handles both remote and local resource loading scenarios.
/// The @objcMembers attribute ensures Objective-C compatibility for all properties and methods.
@objcMembers
open class SPKResourceLoaderImpl: NSObject, SPKResourceLoaderProtocol {
    
    static func executePrepareServiceTask() {
        SPKKit.DIContainer.register(SPKResourceLoaderProtocol.self, scope: .transient) {
            SPKResourceLoaderImpl()
        }
    }
    
    /// Shared singleton instance of the resource loader.
    /// 
    /// This static property provides a globally accessible instance of the resource loader,
    /// following the singleton design pattern for consistent resource management.
    static var shared: SPKResourceLoaderImpl = SPKResourceLoaderImpl()
    
    /// Loads a resource from the specified URL.
    /// 
    /// This method first attempts to load the resource from the local bundle.
    /// If not found locally, it initiates a network request to fetch the resource.
    /// 
    /// - Parameters:
    ///   - url: The URL of the resource to load.
    ///   - completion: Completion handler called when loading finishes.
    /// - Returns: A task protocol object for network requests, or nil for bundle resources.
    public func loadResource(withURL url: URL?, completion: @escaping SPKResourceCompletionHandler) -> (any SPKResourceLoaderTaskProtocol)? {
        guard let url = url else {
            return nil
        }
        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5)
        
        if let resource = self.loadBundleResource(withURL: url) {
            completion(resource, nil)
            return nil
        }
        
        var task = self.dataTask(withRequest: request) { data, response, error in
            let resouce = SPKResourceProvider(resourceData: data)
            completion(resouce, error)
        }
        return task
    }
    
    public func loadImage(withURL url: URL?, completion: @escaping SPKResourceImageCompletionHandler) -> (any SPKResourceLoaderTaskProtocol)? {
        guard let url = url else {
            return nil
        }
        if url.scheme == "asset" {
            var newUrl = URL.spk.url(string: ".\(url.path)")
            if let result = self.loadBundleResource(withURL: newUrl),
               let data = result.resourceData {
                if let image = UIImage(data: data) {
                    completion(image, nil)
                } else {
                    completion(nil, nil)
                }
            }
        }
        return nil
    }
    
    /// Attempts to load a resource from the local application bundle.
    /// 
    /// This method constructs a bundle path from the provided URL and attempts to load
    /// the corresponding resource from the main bundle. It handles path normalization
    /// and bundle resource lookup.
    /// 
    /// - Parameter url: The URL representing the resource path.
    /// - Returns: A SPKResourceProvider containing the loaded data, or nil if not found.
    private func loadBundleResource(withURL url: URL?) -> SPKResourceProvider? {
        guard let url = url else {
            return nil
        }
        guard let relativeUrl = URL.spk.url(string: url.path, relativeTo: URL.spk.url(string: "/LynxResources/Assets/")) else {
            return nil
        }
        
        let pathExtension = relativeUrl.pathExtension
        let pathUrl = relativeUrl.deletingPathExtension()
        
        var resourceUrl = pathUrl.path
        if pathUrl.pathComponents.first == "/" {
            let result = Array(pathUrl.pathComponents.dropFirst())
            resourceUrl = result.joined(separator: "/")
        }
        
        let bundleUrl = URL.spk.url(string: Bundle.main.path(forResource: resourceUrl, ofType: pathExtension) ?? "")
        guard let bundleUrl = bundleUrl else {
            return nil
        }

        let data = try? Data(NSData(contentsOfFile: bundleUrl.absoluteString))
        return SPKResourceProvider(resourceData: data)
    }
    
    /// Creates and starts a data task for the given URL request.
    /// 
    /// This method creates a URLSessionDataTask using the shared URLSession,
    /// configures it with the provided response handler, and immediately starts the task.
    /// 
    /// - Parameters:
    ///   - request: The URL request to execute.
    ///   - responseHandler: Optional completion handler for the network response.
    /// - Returns: A task protocol object representing the running network task.
    func dataTask(withRequest request: URLRequest, responseHandler: SPKResponseCompletion? = nil) -> SPKResourceLoaderTaskProtocol? {
        var task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard let responseHandler = responseHandler else {
                return
            }
            responseHandler(data, response, error)
        }
        task.resume()
        return task
    }
}

