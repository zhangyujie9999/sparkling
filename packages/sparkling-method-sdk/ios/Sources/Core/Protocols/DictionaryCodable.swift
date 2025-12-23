// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

public protocol DictionaryCodable {
    static func from(dict: [String: Any]) throws -> Self?
    func toDict() throws -> [String: Any]?
}
