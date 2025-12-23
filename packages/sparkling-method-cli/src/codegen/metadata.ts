// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import path from 'path';
import fs from 'fs-extra';

import { DefaultValue, MethodDefinition, ModuleConfig, ObjectDefinition, TypeSummary } from './types';

export function buildMetadataFileName(name: string, usage: Record<string, number>): string {
  const count = usage[name] ?? 0;
  usage[name] = count + 1;
  return count === 0 ? `${name}.json` : `${name}-${count}.json`;
}

export async function writeMetadataFile(
  metadataDir: string,
  fileName: string,
  method: MethodDefinition,
  config: ModuleConfig,
  projectRoot: string
): Promise<void> {
  const outputPath = path.join(metadataDir, fileName);
  const payload = {
    name: method.name,
    description: method.description,
    moduleName: config.moduleName,
    packageName: config.packageName,
    source: path.relative(projectRoot, method.source),
    request: serializeTypeSummary(method.request),
    response: serializeTypeSummary(method.response),
    interfaces: Object.fromEntries(
      Object.entries(method.interfaces).map(([key, value]) => [key, serializeObjectDefinition(value)])
    ),
    generatedAt: new Date().toISOString()
  };
  await fs.writeJson(outputPath, payload, { spaces: 2 });
}

function serializeTypeSummary(summary: TypeSummary | undefined): unknown {
  if (!summary) {
    return null;
  }
  switch (summary.kind) {
    case 'primitive':
      return { kind: 'primitive', name: summary.name, text: summary.text, enumValues: summary.enumValues };
    case 'array':
      return { kind: 'array', elementType: serializeTypeSummary(summary.elementType) };
    case 'reference':
      return { kind: 'reference', name: summary.name };
    case 'object':
      return {
        kind: 'object',
        fields: summary.fields.map((field) => ({
          name: field.name,
          optional: field.optional,
          description: field.description,
          defaultValue: serializeDefaultValue(field.defaultValue),
          type: serializeTypeSummary(field.type)
        }))
      };
    default:
      return summary;
  }
}

function serializeDefaultValue(value: DefaultValue | undefined): unknown {
  if (!value) {
    return undefined;
  }
  return { kind: value.kind, value: value.value };
}

function serializeObjectDefinition(def: ObjectDefinition): unknown {
  return {
    name: def.name,
    description: def.description,
    fields: def.fields.map((field) => ({
      name: field.name,
      optional: field.optional,
      description: field.description,
      defaultValue: serializeDefaultValue(field.defaultValue),
      type: serializeTypeSummary(field.type)
    }))
  };
}
