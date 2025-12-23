// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
export type AndroidDsl = 'kts' | 'groovy';

export interface InitOptions {
  template?: string;
  force?: boolean;
}

export interface ModuleConfig {
  packageName: string;
  moduleName: string;
  projectName: string;
  androidDsl: AndroidDsl;
}
