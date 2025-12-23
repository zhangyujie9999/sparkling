// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import path from 'node:path';

/**
 * Resolve a project path from the current working directory
 * @param cwd - Current working directory
 * @param segments - Path segments to join
 * @returns Resolved absolute path
 * @throws Error if cwd is empty
 */
export function resolveProjectPath(cwd: string, ...segments: string[]): string {
  if (!cwd || typeof cwd !== 'string') {
    throw new Error('cwd must be a non-empty string');
  }
  // Filter out empty segments
  const validSegments = segments.filter(s => s && typeof s === 'string');
  return path.resolve(cwd, ...validSegments);
}

/**
 * Convert a path to POSIX format (forward slashes)
 * @param p - Path to convert
 * @returns POSIX-style path
 */
export function toPosixPath(p: string): string {
  if (!p || typeof p !== 'string') {
    return '';
  }
  return p.split(path.sep).join('/');
}

/**
 * Get relative path from one location to another in POSIX format
 * @param from - Source path
 * @param to - Target path
 * @returns Relative path in POSIX format
 */
export function relativeTo(from: string, to: string): string {
  if (!from || typeof from !== 'string') {
    return toPosixPath(to || '');
  }
  if (!to || typeof to !== 'string') {
    return '';
  }
  return toPosixPath(path.relative(from, to));
}
