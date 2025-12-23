// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

@objc public protocol PipeContainer {
    var spk_containerID: String? { get set }
}

extension MethodContext {
    private static var pipeContainerKey = "spk.pipe.container.key"
    public var pipeContainer: PipeContainer? {
        get {
            return self[Self.pipeContainerKey]
        }
        set {
            self.set(newValue, forKey: Self.pipeContainerKey, weak: true)
        }
    }
}
