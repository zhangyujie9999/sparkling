// Copyright (c) 2022 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
@freestanding(declaration)
public macro spk_register(class: String) = #externalMacro(module: "SparklingMarcoMacros", type: "SparklingSectionMacro")
