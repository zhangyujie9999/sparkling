import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { buildTypeScriptView, writeTypeScriptFiles } from '../../codegen/typescript';
import type { MethodDefinition, ModuleConfig, TypeScriptTemplateView } from '../../codegen/types';

async function withTempDir(fn: (dir: string) => Promise<void>): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ts-codegen-test-'));
  try {
    await fn(tempDir);
  } finally {
    await fs.remove(tempDir);
  }
}

const mockModuleConfig: ModuleConfig = {
  packageName: 'com.example.test',
  moduleName: 'TestModule'
};

const createMockMethod = (overrides?: Partial<MethodDefinition>): MethodDefinition => ({
  name: 'testMethod',
  description: 'Test method description',
  request: {
    kind: 'object',
    fields: [
      { name: 'message', type: { kind: 'primitive', name: 'string' }, optional: false },
      { name: 'duration', type: { kind: 'primitive', name: 'number' }, optional: true, defaultValue: { kind: 'number', value: 2000 } }
    ]
  },
  response: {
    kind: 'object',
    fields: [
      { name: 'success', type: { kind: 'primitive', name: 'boolean' }, optional: false },
      { name: 'data', type: { kind: 'primitive', name: 'any' }, optional: true }
    ]
  },
  source: 'mock-source',
  interfaces: {},
  ...overrides
});

describe('TypeScript Code Generation', () => {
  describe('buildTypeScriptView', () => {
    it('should build view for simple method', () => {
      const method = createMockMethod();
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.moduleName).toBe('TestModule');
      expect(view.methodName).toBe('testMethod');
      expect(view.methodCamelCase).toBe('testMethod');
      expect(view.methodPascalCase).toBe('TestMethod');
      expect(view.packageName).toBe('com.example.test');
      expect(view.hasRequestParams).toBe(true);
      expect(view.hasResponseData).toBe(true);
    });

    it('should generate correct interface names', () => {
      const method = createMockMethod({ name: 'showToast' });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.requestInterface.name).toBe('ShowToastRequest');
      expect(view.responseInterface.name).toBe('ShowToastResponse');
    });

    it('should handle method without request parameters', () => {
      const method = createMockMethod({
        request: { kind: 'object', fields: [] }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.hasRequestParams).toBe(false);
      expect(view.requestInterface.hasFields).toBe(false);
    });

    it('should handle method without response data', () => {
      const method = createMockMethod({
        response: {
          kind: 'object',
          fields: [
            { name: 'success', type: { kind: 'primitive', name: 'boolean' }, optional: false }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.hasResponseData).toBe(false);
    });

    it('should generate validation rules for required fields', () => {
      const method = createMockMethod();
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.validationRules).toHaveLength(1);
      expect(view.validationRules[0]).toEqual({
        field: 'message',
        type: 'type-check',
        jsType: 'string',
        errorMessage: 'Invalid params: message must be a non-empty string',
        trimValue: true
      });
    });

    it('should generate pipe call parameters', () => {
      const method = createMockMethod();
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.pipeCall.methodString).toBe('TestModule.testMethod');
      expect(view.pipeCall.params).toEqual([
        'message: params.message.trim()',
        'duration: params.duration ?? 2000'
      ]);
    });

    it('should handle enum types', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            {
              name: 'status',
              type: {
                kind: 'primitive',
                name: 'string',
                enumValues: ['active', 'inactive', 'pending']
              },
              optional: false
            }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      const statusField = view.requestInterface.fields.find(f => f.name === 'status');
      expect(statusField?.type).toBe("'active' | 'inactive' | 'pending'");
    });

    it('should handle array types', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            {
              name: 'items',
              type: {
                kind: 'array',
                elementType: { kind: 'primitive', name: 'string' }
              },
              optional: false
            }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      const itemsField = view.requestInterface.fields.find(f => f.name === 'items');
      expect(itemsField?.type).toBe('string[]');
    });

    it('should handle nested object types', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            {
              name: 'config',
              type: {
                kind: 'object',
                fields: [
                  { name: 'enabled', type: { kind: 'primitive', name: 'boolean' }, optional: false },
                  { name: 'timeout', type: { kind: 'primitive', name: 'number' }, optional: true }
                ]
              },
              optional: false
            }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.extraInterfaces).toHaveLength(1);
      expect(view.extraInterfaces[0].name).toBe('TestMethodRequestConfig');
      expect(view.extraInterfaces[0].fields).toHaveLength(2);

      const configField = view.requestInterface.fields.find(f => f.name === 'config');
      expect(configField?.type).toBe('TestMethodRequestConfig');
    });

    it('should handle interface references', () => {
      const method = createMockMethod({
        interfaces: {
          CustomType: {
            name: 'CustomType',
            fields: [
              { name: 'id', type: { kind: 'primitive', name: 'string' }, optional: false },
              { name: 'value', type: { kind: 'primitive', name: 'number' }, optional: false }
            ]
          }
        },
        request: {
          kind: 'object',
          fields: [
            {
              name: 'custom',
              type: { kind: 'reference', name: 'CustomType' },
              optional: false
            }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.extraInterfaces).toHaveLength(1);
      expect(view.extraInterfaces[0].name).toBe('CustomType');

      const customField = view.requestInterface.fields.find(f => f.name === 'custom');
      expect(customField?.type).toBe('CustomType');
    });

    it('should handle default values correctly', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            { name: 'enabled', type: { kind: 'primitive', name: 'boolean' }, optional: true, defaultValue: { kind: 'boolean', value: true } },
            { name: 'count', type: { kind: 'primitive', name: 'number' }, optional: true, defaultValue: { kind: 'number', value: 42 } },
            { name: 'label', type: { kind: 'primitive', name: 'string' }, optional: true, defaultValue: { kind: 'string', value: 'default' } }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.pipeCall.params).toEqual([
        'enabled: params.enabled ?? true',
        'count: params.count ?? 42',
        'label: params.label ?? "default"'
      ]);
    });

    it('should generate correct field descriptions', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            {
              name: 'message',
              type: { kind: 'primitive', name: 'string' },
              optional: false,
              description: 'The message to display'
            }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      const messageField = view.requestInterface.fields.find(f => f.name === 'message');
      expect(messageField?.description).toBe('The message to display');
    });
  });

  describe('writeTypeScriptFiles', () => {
    const mockTemplates = {
      idl: 'export interface {{requestInterface.name}} { {{#requestInterface.fields}}\n  {{name}}: {{type}};{{/requestInterface.fields}}\n}',
      impl: 'export function {{methodCamelCase}}(params: {{requestInterface.name}}) { /* implementation */ }',
      index: '{{#methods}}export * from \'./src/{{methodKebab}}/{{methodKebab}}\';{{/methods}}'
    };

    it('should write TypeScript files correctly', async () => {
      await withTempDir(async (tmpDir) => {
        const method = createMockMethod({ name: 'showToast' });
        const view = buildTypeScriptView(method, mockModuleConfig);

        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);

        const methodDir = path.join(tmpDir, 'src', 'show-toast');
        expect(await fs.pathExists(methodDir)).toBe(true);

        const idlPath = path.join(methodDir, 'show-toast.d.ts');
        expect(await fs.pathExists(idlPath)).toBe(true);

        const implPath = path.join(methodDir, 'show-toast.ts');
        expect(await fs.pathExists(implPath)).toBe(true);

        const indexPath = path.join(tmpDir, 'index.ts');
        expect(await fs.pathExists(indexPath)).toBe(true);
      });
    });

    it('should render templates with correct data', async () => {
      await withTempDir(async (tmpDir) => {
        const method = createMockMethod({ name: 'testMethod' });
        const view = buildTypeScriptView(method, mockModuleConfig);

        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);

        const idlPath = path.join(tmpDir, 'src', 'test-method', 'test-method.d.ts');
        const idlContent = await fs.readFile(idlPath, 'utf8');
        expect(idlContent).toContain('TestMethodRequest');
        expect(idlContent).toContain('message: string');

        const implPath = path.join(tmpDir, 'src', 'test-method', 'test-method.ts');
        const implContent = await fs.readFile(implPath, 'utf8');
        expect(implContent).toContain('testMethod(params: TestMethodRequest)');
      });
    });

    it('should create index.ts when it doesn\'t exist', async () => {
      await withTempDir(async (tmpDir) => {
        const method = createMockMethod({ name: 'newMethod' });
        const view = buildTypeScriptView(method, mockModuleConfig);

        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);

        const indexPath = path.join(tmpDir, 'index.ts');
        const indexContent = await fs.readFile(indexPath, 'utf8');
        expect(indexContent).toContain('./src/new-method/new-method');
      });
    });

    it('should append to existing index.ts', async () => {
      await withTempDir(async (tmpDir) => {
        const indexPath = path.join(tmpDir, 'index.ts');
        await fs.writeFile(indexPath, 'export * from \'./src/existing/existing\';\n');

        const method = createMockMethod({ name: 'newMethod' });
        const view = buildTypeScriptView(method, mockModuleConfig);

        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);

        const indexContent = await fs.readFile(indexPath, 'utf8');
        expect(indexContent).toContain('./src/existing/existing');
        expect(indexContent).toContain('./src/new-method/new-method');
      });
    });

    it('should not duplicate exports in index.ts', async () => {
      await withTempDir(async (tmpDir) => {
        const method = createMockMethod({ name: 'testMethod' });
        const view = buildTypeScriptView(method, mockModuleConfig);

        // Write files twice
        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);
        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);

        const indexPath = path.join(tmpDir, 'index.ts');
        const indexContent = await fs.readFile(indexPath, 'utf8');
        const exportMatches = (indexContent.match(/\.\/src\/test-method\/test-method/g) || []).length;
        expect(exportMatches).toBe(2); // One for implementation, one for types
      });
    });

    it('should handle special characters in method names', async () => {
      await withTempDir(async (tmpDir) => {
        const method = createMockMethod({ name: 'getUser_Info' });
        const view = buildTypeScriptView(method, mockModuleConfig);

        await writeTypeScriptFiles(tmpDir, mockModuleConfig, method, view, mockTemplates);

        const methodDir = path.join(tmpDir, 'src', 'get-user-info');
        expect(await fs.pathExists(methodDir)).toBe(true);

        const idlPath = path.join(methodDir, 'get-user-info.d.ts');
        expect(await fs.pathExists(idlPath)).toBe(true);
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty field arrays', () => {
      const method = createMockMethod({
        request: { kind: 'object', fields: [] },
        response: { kind: 'object', fields: [] }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.requestInterface.fields).toHaveLength(0);
      expect(view.responseInterface.fields).toHaveLength(0);
      expect(view.hasRequestParams).toBe(false);
      expect(view.hasResponseData).toBe(false);
    });

    it('should handle undefined descriptions', () => {
      const method = createMockMethod({
        description: undefined,
        request: {
          kind: 'object',
          fields: [
            { name: 'value', type: { kind: 'primitive', name: 'string' }, optional: false }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.requestInterface.description).toBeUndefined();
    });

    it('should handle unknown primitive types', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            { name: 'unknown', type: { kind: 'primitive', name: 'unknown' as any }, optional: false }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      const unknownField = view.requestInterface.fields.find(f => f.name === 'unknown');
      expect(unknownField?.jsType).toBe('undefined');
    });

    it('should handle missing interface references', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            { name: 'missing', type: { kind: 'reference', name: 'MissingType' }, optional: false }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      const missingField = view.requestInterface.fields.find(f => f.name === 'missing');
      expect(missingField?.type).toBe('MissingType');
    });
  });

  describe('snapshot testing', () => {
    it('should generate consistent TypeScript views', () => {
      const method = createMockMethod();
      const view = buildTypeScriptView(method, mockModuleConfig);

      // Remove non-deterministic properties for snapshot testing
      const snapshot = {
        ...view,
        // Focus on the structure and logic, not implementation details
        requestInterface: view.requestInterface.fields.map(f => ({
          name: f.name,
          type: f.type,
          optional: f.optional
        })),
        responseInterface: view.responseInterface.fields.map(f => ({
          name: f.name,
          type: f.type,
          optional: f.optional
        })),
        validationRules: view.validationRules.map(r => ({
          field: r.field,
          type: r.type,
          jsType: r.jsType
        }))
      };

      expect(snapshot).toMatchSnapshot('typescript-view-generation');
    });

    it('should generate consistent validation rules for complex types', () => {
      const method = createMockMethod({
        request: {
          kind: 'object',
          fields: [
            { name: 'stringField', type: { kind: 'primitive', name: 'string' }, optional: false },
            { name: 'numberField', type: { kind: 'primitive', name: 'number' }, optional: false },
            { name: 'booleanField', type: { kind: 'primitive', name: 'boolean' }, optional: false },
            { name: 'optionalString', type: { kind: 'primitive', name: 'string' }, optional: true },
            {
              name: 'arrayField',
              type: { kind: 'array', elementType: { kind: 'primitive', name: 'string' } },
              optional: false
            }
          ]
        }
      });
      const view = buildTypeScriptView(method, mockModuleConfig);

      expect(view.validationRules).toMatchSnapshot('validation-rules-complex-types');
    });
  });
});