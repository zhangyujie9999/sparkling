// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import { ModuleConfig } from './types';

export function buildPackageSegments(config: ModuleConfig, methodName: string): string[] {
  const base = config.packageName.split('.').filter(Boolean);
  const moduleSegment = sanitizePackageSegment(config.moduleName);
  const methodSegment = sanitizePackageSegment(methodName);
  return [...base, moduleSegment, methodSegment];
}

export function sanitizePackageSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'method';
}

export function toPascalCase(value: string): string {
  const parts = splitIntoWords(value);
  if (parts.length === 0) {
    return 'Method';
  }
  return parts.map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase()).join('');
}

export function splitIntoWords(value: string): string[] {
  if (!value) {
    return [];
  }
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
}

export function toCamelCase(value: string): string {
  const parts = splitIntoWords(value);
  if (parts.length === 0) {
    return 'method';
  }
  return parts[0].toLowerCase() + parts.slice(1).map((chunk) =>
    chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase()
  ).join('');
}

export function toKebabCase(value: string): string {
  const parts = splitIntoWords(value);
  return parts.map(part => part.toLowerCase()).join('-');
}

export function mapPrimitiveToTypeScript(kind: string): string {
  switch (kind) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'void':
      return 'void';
    case 'object':
      return 'Record<string, any>';
    case 'any':
      return 'any';
    default:
      return 'any';
  }
}

export function mapPrimitiveToJSType(kind: string): string {
  switch (kind) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'void':
      return 'undefined';
    case 'object':
      return 'object';
    case 'any':
      return 'undefined';
    default:
      return 'undefined';
  }
}
