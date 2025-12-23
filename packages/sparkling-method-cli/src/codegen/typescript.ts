// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import path from 'path';
import fs from 'fs-extra';
import Mustache from 'mustache';

import {
  DefaultValue,
  FieldSummary,
  MethodDefinition,
  ModuleConfig,
  ObjectDefinition,
  PrimitiveKind,
  TypeScriptFieldView,
  TypeScriptInterfaceView,
  TypeScriptTemplateView,
  TypeScriptValidationRule,
  TypeSummary
} from './types';
import { ensureObjectDefinition } from './definition-parser';
import { toCamelCase, toKebabCase, toPascalCase, mapPrimitiveToTypeScript, mapPrimitiveToJSType } from './utils';

export function buildTypeScriptView(method: MethodDefinition, config: ModuleConfig): TypeScriptTemplateView {
  const methodPascal = toPascalCase(method.name);
  const methodCamelCase = toCamelCase(method.name);
  const requestObject = ensureObjectDefinition(method.request, `${methodPascal}Request`, method.interfaces);
  const responseObject = ensureObjectDefinition(method.response, `${methodPascal}Response`, method.interfaces);

  const tsContext: TypeScriptBuildContext = {
    methodPascal,
    interfaces: method.interfaces,
    extras: new Map()
  };

  const requestInterface = toTypeScriptInterfaceView(requestObject, `${methodPascal}Request`, tsContext, ['Request']);
  const responseInterface = toTypeScriptInterfaceView(responseObject, `${methodPascal}Response`, tsContext, ['Response']);

  // Build validation rules from request fields
  const validationRules = buildValidationRules(requestObject, methodPascal);

  // Build pipe call parameters
  const pipeParams = buildPipeCallParams(requestObject);

  return {
    moduleName: config.moduleName,
    methodName: method.name,
    methodCamelCase,
    methodPascalCase: methodPascal,
    packageName: config.packageName || 'sparkling-method-sdk',
    requestInterface,
    responseInterface,
    extraInterfaces: Array.from(tsContext.extras.values()),
    validationRules,
    pipeCall: {
      methodString: `${config.moduleName}.${method.name}`,
      params: pipeParams
    },
    hasRequestParams: requestInterface.hasFields,
    hasResponseData: responseInterface.fields.some(f => f.name === 'data')
  };
}

interface TypeScriptBuildContext {
  methodPascal: string;
  interfaces: Record<string, ObjectDefinition>;
  extras: Map<string, TypeScriptInterfaceView>;
}

function toTypeScriptInterfaceView(
  definition: ObjectDefinition,
  interfaceName: string,
  context: TypeScriptBuildContext,
  path: string[]
): TypeScriptInterfaceView {
  const fields = definition.fields.map((field, index, arr) => ({
    name: field.name,
    type: resolveTypeScriptType(field.type, context, [...path, field.name]),
    optional: field.optional,
    description: field.description,
    defaultValue: formatTypeScriptDefaultValue(field.defaultValue),
    jsType: getJSType(field.type),
    isLast: index === arr.length - 1
  }));

  return {
    name: interfaceName,
    fields,
    hasFields: fields.length > 0,
    description: definition.description
  };
}

function resolveTypeScriptType(type: TypeSummary, context: TypeScriptBuildContext, path: string[]): string {
  switch (type.kind) {
    case 'primitive':
      if (type.enumValues && type.enumValues.length > 0) {
        // Handle enum types as union types
        return type.enumValues.map(val =>
          typeof val === 'string' ? `'${val}'` : String(val)
        ).join(' | ');
      }
      return mapPrimitiveToTypeScript(type.name);
    case 'array':
      return `${resolveTypeScriptType(type.elementType, context, path)}[]`;
    case 'reference': {
      const definition = context.interfaces[type.name];
      if (definition) {
        ensureTypeScriptHelper(definition, type.name, context, [type.name]);
      }
      return type.name;
    }
    case 'object': {
      const inline: ObjectDefinition = {
        name: path.map((segment) => toPascalCase(segment)).join('') || undefined,
        fields: type.fields
      };
      const helper = ensureTypeScriptHelper(inline, inline.name || 'InlineObject', context, path);
      return helper.name;
    }
    default:
      return 'any';
  }
}

function ensureTypeScriptHelper(
  definition: ObjectDefinition,
  typeName: string,
  context: TypeScriptBuildContext,
  path: string[]
): TypeScriptInterfaceView {
  const key = definition.name ?? path.join('.');
  const cached = context.extras.get(key);
  if (cached) {
    return cached;
  }

  const interfaceView = toTypeScriptInterfaceView(definition, typeName, context, path);
  context.extras.set(key, interfaceView);
  return interfaceView;
}

function getJSType(type: TypeSummary): string {
  switch (type.kind) {
    case 'primitive':
      return mapPrimitiveToJSType(type.name);
    case 'array':
      return 'object';
    case 'reference':
    case 'object':
      return 'object';
    default:
      return 'undefined';
  }
}

function buildValidationRules(definition: ObjectDefinition, methodPascal: string): TypeScriptValidationRule[] {
  const rules: TypeScriptValidationRule[] = [];

  // Add field validation rules for required fields only
  definition.fields.forEach(field => {
    if (!field.optional) {
      const jsType = getJSType(field.type);

      // Type check rule for required fields
      if (field.type.kind === 'primitive' && field.type.name === 'string') {
        rules.push({
          field: field.name,
          type: 'type-check',
          jsType: 'string',
          errorMessage: `Invalid params: ${field.name} must be a non-empty string`,
          trimValue: true
        });
      } else if (jsType !== 'undefined') {
        rules.push({
          field: field.name,
          type: 'type-check',
          jsType,
          errorMessage: `Invalid params: ${field.name} must be of type ${jsType}`
        });
      }
    }
  });

  return rules;
}

function buildPipeCallParams(definition: ObjectDefinition): string[] {
  return definition.fields.map(field => {
    const paramAccess = `params.${field.name}`;

    // Handle string trimming
    if (field.type.kind === 'primitive' && field.type.name === 'string' && !field.optional) {
      return `${field.name}: ${paramAccess}.trim()`;
    }

    // Handle optional fields with default values
    if (field.optional && field.defaultValue) {
      const defaultVal = formatTypeScriptDefaultValue(field.defaultValue);
      return `${field.name}: ${paramAccess} ?? ${defaultVal}`;
    }

    // Handle optional fields without defaults (use nullish coalescing)
    if (field.optional) {
      return `${field.name}: ${paramAccess}`;
    }

    // Required fields
    return `${field.name}: ${paramAccess}`;
  });
}

function formatTypeScriptDefaultValue(value: DefaultValue | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  switch (value.kind) {
    case 'boolean':
      return value.value ? 'true' : 'false';
    case 'number':
      return String(value.value);
    case 'string':
      return JSON.stringify(value.value);
    default:
      return undefined;
  }
}

export async function writeTypeScriptFiles(
  root: string,
  config: ModuleConfig,
  method: MethodDefinition,
  view: TypeScriptTemplateView,
  templates: { idl: string; impl: string; index: string }
): Promise<void> {
  const methodKebab = toKebabCase(method.name);
  const methodDir = path.join(root, 'src', methodKebab);
  await fs.ensureDir(methodDir);

  // Write .d.ts file (type definitions)
  const idlPath = path.join(methodDir, `${methodKebab}.d.ts`);
  const renderedIdl = Mustache.render(templates.idl, view);
  await fs.writeFile(idlPath, renderedIdl, 'utf8');

  // Write .ts file (implementation)
  const implPath = path.join(methodDir, `${methodKebab}.ts`);
  const renderedImpl = Mustache.render(templates.impl, view);
  await fs.writeFile(implPath, renderedImpl, 'utf8');

  // Write or update index.ts (re-exports)
  const indexPath = path.join(root, 'index.ts');
  await updateIndexFile(indexPath, method, view, templates.index);
}

async function updateIndexFile(
  indexPath: string,
  method: MethodDefinition,
  view: TypeScriptTemplateView,
  template: string
): Promise<void> {
  const methodKebab = toKebabCase(method.name);
  const newExports = {
    methodKebab,
    methodCamelCase: view.methodCamelCase,
    requestInterface: view.requestInterface.name,
    responseInterface: view.responseInterface.name,
    extraInterfaces: view.extraInterfaces.map(i => i.name)
  };

  // If index.ts doesn't exist, create it with the template
  if (!await fs.pathExists(indexPath)) {
    const rendered = Mustache.render(template, { methods: [newExports] });
    await fs.writeFile(indexPath, rendered, 'utf8');
    return;
  }

  // If it exists, append the new exports
  let content = await fs.readFile(indexPath, 'utf8');

  // Add implementation export
  const implExport = `export * from './src/${methodKebab}/${methodKebab}';`;
  if (!content.includes(implExport)) {
    content += `\n${implExport}`;
  }

  // Add type exports
  const typeExportParts = [
    view.requestInterface.name,
    view.responseInterface.name,
    ...view.extraInterfaces.map(i => i.name)
  ];
  const typeExport = `export type { ${typeExportParts.join(', ')} } from './src/${methodKebab}/${methodKebab}.d';`;
  if (!content.includes(typeExport)) {
    content += `\n${typeExport}`;
  }

  await fs.writeFile(indexPath, content, 'utf8');
}