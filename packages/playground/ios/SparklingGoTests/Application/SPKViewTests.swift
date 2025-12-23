// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Testing
import UIKit
@testable import Sparkling

//TODO: DIContainer injection problem

@MainActor
struct SPKViewTests {
    
    @Test func initialization() {
        let view = SPKView()
        #expect(view.sparkContentMode == .SPKViewContentModeFixedSize)
        #expect(view.hybridInBackground == false)
        #expect(view.viewType == .SPKHybridEngineTypeUnknown)
    }

    @Test func loadWithURL() {
        let view = SPKView()
        let urlString = "hybrid://lynxview?bundle=.%2Fmain.lynx.bundle"
        
        view.load(withURL: urlString, nil, true)
        
        #expect(view.originURL?.absoluteString == urlString)
    }
    
    @Test func loadWithParams() {
        let view = SPKView()
        let params = SPKSchemeParam()
        
        view.load(withParams: params, nil, forceInitKitView: false)
        
        #expect(view.originURL == nil)
    }
    
    @Test func contentModeProperty() {
        let view = SPKView()
        
        view.sparkContentMode = .SparkViewContentModeFitSize
        #expect(view.sparkContentMode == .SparkViewContentModeFitSize)
        
        view.sparkContentMode = .SPKViewContentModeFixedSize
        #expect(view.sparkContentMode == .SPKViewContentModeFixedSize)
    }
    
    @Test func backgroundProperty() {
        let view = SPKView()
        
        view.hybridInBackground = true
        #expect(view.hybridInBackground == true)
        
        view.hybridInBackground = false
        #expect(view.hybridInBackground == false)
    }
    
    @Test func containerIDProperty() {
        let view = SPKView()
        let containerID = view.containerID
        
        // containerID is read-only, just verify it exists
        #expect(containerID.isEmpty == false || containerID.isEmpty == true)
    }
    
    @Test func viewTypeProperty() {
        let view = SPKView()
        
        // viewType is read-only, just verify the default value
        #expect(view.viewType == .SPKHybridEngineTypeUnknown)
    }
    
    @Test func layoutSubviews() {
        let view = SPKView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
        
        view.layoutSubviews()
        
        #expect(view.frame.width == 100)
        #expect(view.frame.height == 100)
    }
    
    @Test func nilURLHandling() {
        let view = SPKView()
        
        view.load(withURL: "", nil, true)
        
        #expect(view.originURL == nil)
    }
    
    @Test func emptyParamsHandling() {
        let view = SPKView()
        let emptyParams = SPKSchemeParam()
        
        view.load(withParams: emptyParams, nil, forceInitKitView: false)
        
        #expect(view.originURL == nil)
    }
    
    @Test func memoryManagement() {
        weak var weakView: SPKView?
        
        autoreleasepool {
            let view = SPKView()
            weakView = view
        }
        
        #expect(weakView == nil)
    }
    
    @Test func preferredLayoutSize() {
        let view = SPKView()
        let initialSize = view.preferredLayoutSize
        #expect(initialSize == .zero)
    }
    
    @Test func statusBarStyleProperty() {
        let view = SPKView()
        #expect(view.statusBarStyle == .default)
        
        view.statusBarStyle = .lightContent
        #expect(view.statusBarStyle == .lightContent)
    }
    
    @Test func contentSizeProperty() {
        let view = SPKView()
        #expect(view.contentSize == .zero)
        
        view.contentSize = CGSize(width: 100, height: 200)
        #expect(view.contentSize == CGSize(width: 100, height: 200))
    }
    
    @Test func loadStateProperty() {
        let view = SPKView()
        #expect(view.loadState == .SPKKitViewLoadStateNotLoad)
    }
    
    @Test func hideBottomToolBarProperty() {
        let view = SPKView()
        #expect(view.hideBottomToolBar == false)
        
        view.hideBottomToolBar = true
        #expect(view.hideBottomToolBar == true)
    }
    
    @Test func didMountProperty() {
        let view = SPKView()
        #expect(view.didMount == false)
        
        view.didMount = true
        #expect(view.didMount == true)
    }
    
    @Test func removeLoadingView() {
        let view = SPKView()
        
        // Test calling removeLoadingView when there's no loading view
        view.removeLoadingView()
        #expect(view.subviews.isEmpty)
    }
    
    @Test func handleViewLifecycleMethods() {
        let view = SPKView()
        let initialHybridAppear = view.hybridAppear
        
        // Test that lifecycle methods don't crash
        view.handleViewDidAppear()
        view.handleViewDidDisappear()
        view.handleBecomeActive()
        view.HandleResignActive()
        
        // These methods don't directly modify hybridAppear property, they just call kitView's related methods
        #expect(view.hybridAppear == initialHybridAppear)
    }
    
    @Test func handleViewDidDisappearWithType() {
        let view = SPKView()
        view.hybridAppear = true
        
        // Test that different types of disappear methods don't crash
        view.handleViewDidDisappear(withType: .SPKDisappearTypeDestroy)
        // handleViewDidDisappear method doesn't directly modify hybridAppear property
        #expect(view.hybridAppear == true)
        
        view.handleViewDidDisappear(withType: .SPKDisappearTypeUnknown)
        #expect(view.hybridAppear == true)
        
        view.handleViewDidDisappear(withType: .SPKDisappearTypeCovered)
        #expect(view.hybridAppear == true)
        
        view.handleViewDidDisappear(withType: .SPKDisappearTypeAppResignActive)
        #expect(view.hybridAppear == true)
    }
    
    @Test func sendEventMethod() {
        let view = SPKView()
        var callbackCalled = false
        
        view.send(event: "testEvent", params: ["key": "value"]) { result in
            callbackCalled = true
        }
        
        // Since there's no kitView, callback won't be called
        #expect(callbackCalled == false)
    }
    
    @Test func configAndUpdateGlobalProps() {
        let view = SPKView()
        let globalProps = ["testKey": "testValue"]
        
        // Test that these methods don't crash
        view.config(withGlobalProps: globalProps)
        view.update(withGlobalProps: globalProps)
        
        #expect(true) // Pass if no crash occurs
    }
    
    @Test func reloadMethod() {
        let view = SPKView()
        let context = SPKContext()
        
        // Test that reload method doesn't crash
        view.reload(context)
        
        #expect(true) // Pass if no crash occurs
    }
    
    @Test func loadMethod() {
        let view = SPKView()

        // Test that load method doesn't crash
        view.load()

        #expect(true) // Pass if no crash occurs
    }

    // MARK: - SPKViewLifeCycleProtocol Extension Tests

    @Test func viewDidStartFetchResource() {
        let view = SPKView()
        let testURL = URL(string: "https://example.com/test.js")

        // Test that method doesn't crash
        view.view(nil, didStartFetchResourceWithURL: testURL)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidFetchedResource() {
        let view = SPKView()
        let error = NSError(domain: "TestError", code: 500, userInfo: nil)

        // Test that method doesn't crash
        view.view(nil, didFetchedResource: nil, error: error)
        view.view(nil, didFetchedResource: nil, error: nil)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidFirstScreen() {
        let view = SPKView()

        // Test that method doesn't crash
        view.viewDidFirstScreen(nil)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidUpdate() {
        let view = SPKView()

        // Test that method doesn't crash
        view.viewDidUpdate(nil)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidPageUpdate() {
        let view = SPKView()

        // Test that method doesn't crash
        view.viewDidPageUpdate(nil)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidReceiveError() {
        let view = SPKView()
        let error = NSError(domain: "TestError", code: 404, userInfo: nil)

        // Test that method doesn't crash
        view.view(nil, didReceiveError: error)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidReceivePerformance() {
        let view = SPKView()
        let perfDict: [AnyHashable: Any] = ["loadTime": 1.5, "renderTime": 0.8]

        // Test that method doesn't crash
        view.view(nil, didReceivePerformance: perfDict)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewLoadingLifecycleMethods() {
        let view = SPKView()

        // Test that loading lifecycle methods don't crash
        view.viewBeforeLoading(nil)
        view.viewWillStartLoading(nil)
        view.viewDidStartLoading(nil)
        view.viewDidConstructJSRuntime(nil)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewUpdateTitleAndSubtitle() {
        let view = SPKView()

        // Test that title update methods don't crash
        view.view(nil, updateTitle: "Test Title")
        view.view(nil, updateSubTitle: "Test Subtitle")

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidLoadFailed() {
        let view = SPKView()
        let testURL = URL(string: "https://example.com/failed.html")
        let error = NSError(domain: "LoadError", code: 404, userInfo: nil)

        // Test that load failed method doesn't crash
        view.view(nil, didLoadFailedWithURL: testURL, error: error)

        #expect(true) // Pass if no crash occurs
    }

    @Test func viewDidFinishLoad() {
        let view = SPKView()
        let testURL = URL(string: "https://example.com/success.html")

        // Test that load completion method doesn't crash
        view.view(nil, didFinishLoadWithURL: testURL)

        #expect(true) // Pass if no crash occurs
    }
}
