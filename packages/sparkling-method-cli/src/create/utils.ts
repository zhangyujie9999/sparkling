// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
 export function normalizePackageName(name: string): string {
  const sanitized = name.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').toLowerCase();
  return sanitized || 'sparkling-method-module';
}

export function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join('');
}
