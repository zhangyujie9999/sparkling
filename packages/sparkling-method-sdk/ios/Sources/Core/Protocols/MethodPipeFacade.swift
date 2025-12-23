// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

public protocol MethodPipeFacade: AnyObject {
    func register(localMethod method: PipeMethod)
    func register(localMethods methods: [PipeMethod])
    func register(globalMethod method: PipeMethod)
    func unregister(localMethodName name: String)
    func unregister(globalMethodName name: String)
    func respondTo(methodName name: String) -> Bool
    func method(forName name: String) -> PipeMethod?
    func fireEvent(name: String, params: [String: Any]?)
}
