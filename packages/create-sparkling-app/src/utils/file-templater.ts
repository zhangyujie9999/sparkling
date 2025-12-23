// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs/promises';
import path from 'node:path';

export interface VariablesMap {
  [key: string]: boolean | number | string;
}

export class FileTemplater {
  public static async renameDirectoryContentsWithVariables(
    directoryPath: string,
    variables: VariablesMap,
  ): Promise<void> {
    if (!path.isAbsolute(directoryPath)) {
      throw new Error('Directory path must be absolute.');
    }

    let entries;
    try {
      entries = await fs.readdir(directoryPath, { withFileTypes: true });
    } catch (error: unknown) {
      throw new Error(`Failed to read directory ${directoryPath}: ${error}`);
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const originalEntryPath = path.join(directoryPath, entry.name);

        let hasPlaceholders = false;
        for (const key in variables) {
          if (Object.hasOwn(variables, key)) {
            const placeholder = `{{${key.trim()}}}`;
            if (entry.name.includes(placeholder)) {
              hasPlaceholders = true;
              break;
            }
          }
        }

        let currentEntryPath = originalEntryPath;
        if (hasPlaceholders) {
          try {
            currentEntryPath = await this.renamePathWithVariables(originalEntryPath, variables, directoryPath);
          } catch (error: unknown) {
            console.error(`Failed to rename directory ${originalEntryPath}: ${error}`);
          }
        }

        await this.renameDirectoryContentsWithVariables(currentEntryPath, variables);
      }
    }
  }

  public static async renamePathWithVariables(
    originalPath: string,
    variables: VariablesMap,
    basePath: string = process.cwd(),
  ): Promise<string> {
    if (!originalPath) {
      throw new Error('Original path cannot be empty.');
    }

    let newPathString = originalPath;
    for (const key in variables) {
      if (Object.hasOwn(variables, key)) {
        const placeholder = `{{${key.trim()}}}`;
        const regex = new RegExp(this.escapeRegExp(placeholder), 'g');
        newPathString = newPathString.replace(regex, String(variables[key]));
      }
    }

    const resolvedOriginalPath = path.isAbsolute(originalPath) ? originalPath : path.resolve(basePath, originalPath);
    const resolvedNewPath = path.isAbsolute(newPathString) ? newPathString : path.resolve(basePath, newPathString);

    if (resolvedOriginalPath === resolvedNewPath) {
      return resolvedNewPath;
    }

    try {
      await fs.access(resolvedOriginalPath);
    } catch (error: unknown) {
      throw new Error(`Error accessing original path ${resolvedOriginalPath}: ${error}`);
    }

    try {
      const newPathParentDir = path.dirname(resolvedNewPath);
      await fs.mkdir(newPathParentDir, { recursive: true });

      await fs.rename(resolvedOriginalPath, resolvedNewPath);
      return resolvedNewPath;
    } catch (error: unknown) {
      throw new Error(`Failed to rename path from ${resolvedOriginalPath} to ${resolvedNewPath}: ${error}`);
    }
  }

  public static async replaceInFile(filePath: string, variables: VariablesMap): Promise<string> {
    if (!path.isAbsolute(filePath)) {
      throw new Error('File path must be absolute.');
    }

    let fileContent: string;
    try {
      fileContent = await fs.readFile(filePath, 'utf8');
    } catch (error: unknown) {
      throw new Error(`Failed to read template file ${filePath}: ${error}`);
    }

    if (!variables || Object.keys(variables).length === 0) {
      return fileContent;
    }

    let modifiedContent = fileContent;

    for (const key in variables) {
      if (Object.hasOwn(variables, key)) {
        const placeholder = `{{${key.trim()}}}`;
        const regex = new RegExp(this.escapeRegExp(placeholder), 'g');
        modifiedContent = modifiedContent.replace(regex, String(variables[key]));
      }
    }

    return modifiedContent;
  }

  public static async replaceInFileAndUpdate(filePath: string, variables: VariablesMap): Promise<void> {
    const modifiedContent = await this.replaceInFile(filePath, variables);
    try {
      await fs.writeFile(filePath, modifiedContent, 'utf8');
    } catch (error: unknown) {
      throw new Error(`Failed to write updated content to file ${filePath}: ${error}`);
    }
  }

  private static escapeRegExp(str: string): string {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  }
}
