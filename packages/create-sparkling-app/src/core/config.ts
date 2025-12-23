// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';

export interface ToolingChoices {
  biome?: boolean;
  eslint?: boolean;
  prettier?: boolean;
  testing?: boolean;
}

export interface CreateAppConfig {
  description: string;
  name: string;
  type: 'app';
  template: string;
  customTemplatePath?: string;
  packageManager: string;
  tools: ToolingChoices;
  androidGradleDsl: 'kts' | 'groovy';
}

export type Config = CreateAppConfig;

export function saveConfig(filePath: string, config: Config): void {
  fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}
