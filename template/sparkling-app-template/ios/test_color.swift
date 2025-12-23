// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import UIKit

let black = UIColor.black
let white = UIColor.white

print("Black components count:", black.cgColor.components?.count ?? 0)
print("White components count:", white.cgColor.components?.count ?? 0)
print("Black colorSpace model:", black.cgColor.colorSpace?.model.rawValue ?? -1)
print("White colorSpace model:", white.cgColor.colorSpace?.model.rawValue ?? -1)

// Test with RGB versions
let rgbBlack = UIColor(red: 0, green: 0, blue: 0, alpha: 1)
let rgbWhite = UIColor(red: 1, green: 1, blue: 1, alpha: 1)
print("RGB Black components:", rgbBlack.cgColor.components?.count ?? 0)
print("RGB White components:", rgbWhite.cgColor.components?.count ?? 0)

// Test hexString conversion
if let blackHex = black.cgColor.components, blackHex.count >= 3 {
    print("Black can convert to hex")
} else {
    print("Black cannot convert to hex - insufficient components")
}

if let whiteHex = white.cgColor.components, whiteHex.count >= 3 {
    print("White can convert to hex")
} else {
    print("White cannot convert to hex - insufficient components")
}