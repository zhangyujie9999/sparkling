// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { BuiltinTemplateInfo } from './types';

export const DEFAULT_PROJECT_NAME = 'sparkling-app';
export const CUSTOM_TEMPLATE_OPTION = 'custom';
export const DEFAULT_TEMPLATE_NAME = 'sparkling-default';
export const DEFAULT_TEMPLATE_PACKAGE = 'sparkling-app-template';

const DEFAULT_TEMPLATE_INFO: BuiltinTemplateInfo = {
  canonicalName: DEFAULT_TEMPLATE_NAME,
  packageName: DEFAULT_TEMPLATE_PACKAGE,
};

const BUILTIN_TEMPLATES = new Map<string, BuiltinTemplateInfo>([
  [DEFAULT_TEMPLATE_NAME, DEFAULT_TEMPLATE_INFO],
  ['sparkling-app-template', DEFAULT_TEMPLATE_INFO],
  ['sparkling', DEFAULT_TEMPLATE_INFO],
  ['default', DEFAULT_TEMPLATE_INFO],
  ['sparkling-bare', DEFAULT_TEMPLATE_INFO],
  ['sparkling-mpa', DEFAULT_TEMPLATE_INFO],
  ['lynx-bare', DEFAULT_TEMPLATE_INFO],
  ['lynx-starter', DEFAULT_TEMPLATE_INFO],
  ['sparkling-simple', DEFAULT_TEMPLATE_INFO],
  ['sparkling-simple-template', DEFAULT_TEMPLATE_INFO],
]);

export function lookupBuiltinTemplate(template?: string): BuiltinTemplateInfo | undefined {
  if (!template) {
    return undefined;
  }

  return BUILTIN_TEMPLATES.get(template.toLowerCase());
}
