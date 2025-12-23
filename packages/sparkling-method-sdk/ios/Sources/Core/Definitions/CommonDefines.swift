// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

public enum MethodThread: Int {
    case mainThread = 0
    case currentThread = 1
}

typealias CommonPipeCompletion = (MethodStatus, [String: Any]?) -> Void

enum DictKeys {
    static let data = "data"
    static let statusMessage = "__status_message__"
}
