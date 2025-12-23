import type {
  CodegenOptions,
  ModuleConfig,
  PrimitiveKind,
  DefaultValue,
  TypeSummary,
  FieldSummary,
  ObjectDefinition,
  MethodDefinition,
  TypeScriptValidationRule,
  TypeScriptTemplateView
} from '../../codegen/types';

describe('TypeScript Type Definitions', () => {
  describe('CodegenOptions', () => {
    it('should accept valid codegen options', () => {
      const options: CodegenOptions = {
        src: 'src/methods'
      };

      expect(options.src).toBe('src/methods');
    });

    it('should handle undefined src option', () => {
      const options: CodegenOptions = {};

      expect(options.src).toBeUndefined();
    });
  });

  describe('ModuleConfig', () => {
    it('should define module configuration correctly', () => {
      const config: ModuleConfig = {
        packageName: 'com.example.test',
        moduleName: 'TestModule'
      };

      expect(config.packageName).toBe('com.example.test');
      expect(config.moduleName).toBe('TestModule');
    });
  });

  describe('PrimitiveKind', () => {
    it('should include all expected primitive types', () => {
      const primitives: PrimitiveKind[] = [
        'string', 'number', 'boolean', 'void', 'object', 'any'
      ];

      primitives.forEach(primitive => {
        const type: PrimitiveKind = primitive;
        expect(type).toBe(primitive);
      });
    });
  });

  describe('DefaultValue', () => {
    it('should handle string default values', () => {
      const defaultValue: DefaultValue = {
        kind: 'string',
        value: 'test string'
      };

      expect(defaultValue.kind).toBe('string');
      expect(defaultValue.value).toBe('test string');
    });

    it('should handle number default values', () => {
      const defaultValue: DefaultValue = {
        kind: 'number',
        value: 42
      };

      expect(defaultValue.kind).toBe('number');
      expect(defaultValue.value).toBe(42);
    });

    it('should handle boolean default values', () => {
      const defaultValue: DefaultValue = {
        kind: 'boolean',
        value: true
      };

      expect(defaultValue.kind).toBe('boolean');
      expect(defaultValue.value).toBe(true);
    });
  });

  describe('TypeSummary', () => {
    it('should handle primitive types', () => {
      const primitiveType: TypeSummary = {
        kind: 'primitive',
        name: 'string'
      };

      expect(primitiveType.kind).toBe('primitive');
      expect(primitiveType.name).toBe('string');
    });

    it('should handle primitive types with enum values', () => {
      const enumType: TypeSummary = {
        kind: 'primitive',
        name: 'string',
        enumValues: ['active', 'inactive', 'pending']
      };

      expect(enumType.kind).toBe('primitive');
      expect(enumType.enumValues).toEqual(['active', 'inactive', 'pending']);
    });

    it('should handle array types', () => {
      const arrayType: TypeSummary = {
        kind: 'array',
        elementType: {
          kind: 'primitive',
          name: 'string'
        }
      };

      expect(arrayType.kind).toBe('array');
      expect(arrayType.elementType.kind).toBe('primitive');
    });

    it('should handle reference types', () => {
      const referenceType: TypeSummary = {
        kind: 'reference',
        name: 'CustomType'
      };

      expect(referenceType.kind).toBe('reference');
      expect(referenceType.name).toBe('CustomType');
    });

    it('should handle object types', () => {
      const objectType: TypeSummary = {
        kind: 'object',
        fields: [
          {
            name: 'id',
            type: { kind: 'primitive', name: 'string' },
            optional: false
          }
        ]
      };

      expect(objectType.kind).toBe('object');
      expect(objectType.fields).toHaveLength(1);
    });
  });

  describe('FieldSummary', () => {
    it('should define field properties correctly', () => {
      const field: FieldSummary = {
        name: 'testField',
        optional: false,
        description: 'A test field',
        type: { kind: 'primitive', name: 'string' },
        defaultValue: { kind: 'string', value: 'default' }
      };

      expect(field.name).toBe('testField');
      expect(field.optional).toBe(false);
      expect(field.description).toBe('A test field');
      expect(field.type.kind).toBe('primitive');
      expect(field.defaultValue?.value).toBe('default');
    });

    it('should handle optional fields without default values', () => {
      const field: FieldSummary = {
        name: 'optionalField',
        optional: true,
        type: { kind: 'primitive', name: 'number' }
      };

      expect(field.name).toBe('optionalField');
      expect(field.optional).toBe(true);
      expect(field.description).toBeUndefined();
      expect(field.defaultValue).toBeUndefined();
    });
  });

  describe('ObjectDefinition', () => {
    it('should define object structure correctly', () => {
      const objectDef: ObjectDefinition = {
        name: 'TestObject',
        description: 'A test object',
        fields: [
          {
            name: 'id',
            type: { kind: 'primitive', name: 'string' },
            optional: false
          },
          {
            name: 'count',
            type: { kind: 'primitive', name: 'number' },
            optional: true
          }
        ]
      };

      expect(objectDef.name).toBe('TestObject');
      expect(objectDef.description).toBe('A test object');
      expect(objectDef.fields).toHaveLength(2);
    });

    it('should handle unnamed objects', () => {
      const objectDef: ObjectDefinition = {
        fields: [
          {
            name: 'value',
            type: { kind: 'primitive', name: 'string' },
            optional: false
          }
        ]
      };

      expect(objectDef.name).toBeUndefined();
      expect(objectDef.description).toBeUndefined();
      expect(objectDef.fields).toHaveLength(1);
    });
  });

  describe('MethodDefinition', () => {
    it('should define method structure correctly', () => {
      const method: MethodDefinition = {
        name: 'testMethod',
        description: 'A test method',
        request: {
          kind: 'object',
          fields: [
            {
              name: 'input',
              type: { kind: 'primitive', name: 'string' },
              optional: false
            }
          ]
        },
        response: {
          kind: 'object',
          fields: [
            {
              name: 'output',
              type: { kind: 'primitive', name: 'string' },
              optional: false
            }
          ]
        },
        source: 'test-source.ts',
        interfaces: {
          CustomType: {
            name: 'CustomType',
            fields: [
              {
                name: 'id',
                type: { kind: 'primitive', name: 'string' },
                optional: false
              }
            ]
          }
        }
      };

      expect(method.name).toBe('testMethod');
      expect(method.description).toBe('A test method');
      expect(method.request?.kind).toBe('object');
      expect(method.response?.kind).toBe('object');
      expect(method.source).toBe('test-source.ts');
      expect(method.interfaces.CustomType).toBeDefined();
    });

    it('should handle methods without descriptions', () => {
      const method: MethodDefinition = {
        name: 'simpleMethod',
        source: 'simple.ts',
        interfaces: {}
      };

      expect(method.name).toBe('simpleMethod');
      expect(method.description).toBeUndefined();
      expect(method.request).toBeUndefined();
      expect(method.response).toBeUndefined();
    });
  });

  describe('TypeScriptValidationRule', () => {
    it('should define validation rules correctly', () => {
      const rule: TypeScriptValidationRule = {
        field: 'testField',
        type: 'type-check',
        jsType: 'string',
        errorMessage: 'Field must be a string',
        trimValue: true,
        defaultValue: 'default'
      };

      expect(rule.field).toBe('testField');
      expect(rule.type).toBe('type-check');
      expect(rule.jsType).toBe('string');
      expect(rule.errorMessage).toBe('Field must be a string');
      expect(rule.trimValue).toBe(true);
      expect(rule.defaultValue).toBe('default');
    });

    it('should handle different validation rule types', () => {
      const types: TypeScriptValidationRule['type'][] = [
        'null-check', 'type-check', 'range-check', 'custom'
      ];

      types.forEach(type => {
        const rule: TypeScriptValidationRule = {
          field: 'test',
          type,
          errorMessage: 'Error'
        };

        expect(rule.type).toBe(type);
      });
    });
  });

  describe('TypeScriptTemplateView', () => {
    it('should define complete template view structure', () => {
      const view: TypeScriptTemplateView = {
        moduleName: 'TestModule',
        methodName: 'testMethod',
        methodCamelCase: 'testMethod',
        methodPascalCase: 'TestMethod',
        packageName: 'com.example.test',
        requestInterface: {
          name: 'TestMethodRequest',
          fields: [
            {
              name: 'input',
              type: 'string',
              optional: false,
              jsType: 'string',
              isLast: true
            }
          ],
          hasFields: true
        },
        responseInterface: {
          name: 'TestMethodResponse',
          fields: [
            {
              name: 'output',
              type: 'string',
              optional: false,
              jsType: 'string',
              isLast: true
            }
          ],
          hasFields: true
        },
        extraInterfaces: [],
        validationRules: [
          {
            field: 'input',
            type: 'type-check',
            jsType: 'string',
            errorMessage: 'Input must be a string'
          }
        ],
        pipeCall: {
          methodString: 'TestModule.testMethod',
          params: ['input: params.input']
        },
        hasRequestParams: true,
        hasResponseData: false
      };

      expect(view.moduleName).toBe('TestModule');
      expect(view.methodName).toBe('testMethod');
      expect(view.requestInterface.hasFields).toBe(true);
      expect(view.responseInterface.hasFields).toBe(true);
      expect(view.validationRules).toHaveLength(1);
      expect(view.pipeCall.methodString).toBe('TestModule.testMethod');
      expect(view.hasRequestParams).toBe(true);
      expect(view.hasResponseData).toBe(false);
    });

    it('should handle empty interfaces and rules', () => {
      const view: TypeScriptTemplateView = {
        moduleName: 'EmptyModule',
        methodName: 'emptyMethod',
        methodCamelCase: 'emptyMethod',
        methodPascalCase: 'EmptyMethod',
        packageName: 'com.example.empty',
        requestInterface: {
          name: 'EmptyMethodRequest',
          fields: [],
          hasFields: false
        },
        responseInterface: {
          name: 'EmptyMethodResponse',
          fields: [],
          hasFields: false
        },
        extraInterfaces: [],
        validationRules: [],
        pipeCall: {
          methodString: 'EmptyModule.emptyMethod',
          params: []
        },
        hasRequestParams: false,
        hasResponseData: false
      };

      expect(view.requestInterface.hasFields).toBe(false);
      expect(view.responseInterface.hasFields).toBe(false);
      expect(view.extraInterfaces).toHaveLength(0);
      expect(view.validationRules).toHaveLength(0);
      expect(view.pipeCall.params).toHaveLength(0);
      expect(view.hasRequestParams).toBe(false);
      expect(view.hasResponseData).toBe(false);
    });
  });

  describe('complex type compositions', () => {
    it('should handle nested array types', () => {
      const nestedArrayType: TypeSummary = {
        kind: 'array',
        elementType: {
          kind: 'array',
          elementType: {
            kind: 'primitive',
            name: 'string'
          }
        }
      };

      expect(nestedArrayType.kind).toBe('array');
      expect(nestedArrayType.elementType.kind).toBe('array');
      expect((nestedArrayType.elementType as any).elementType.name).toBe('string');
    });

    it('should handle object with complex field types', () => {
      const complexObject: ObjectDefinition = {
        name: 'ComplexObject',
        fields: [
          {
            name: 'simpleString',
            type: { kind: 'primitive', name: 'string' },
            optional: false
          },
          {
            name: 'arrayOfNumbers',
            type: {
              kind: 'array',
              elementType: { kind: 'primitive', name: 'number' }
            },
            optional: true
          },
          {
            name: 'referencedType',
            type: { kind: 'reference', name: 'ExternalType' },
            optional: false
          },
          {
            name: 'nestedObject',
            type: {
              kind: 'object',
              fields: [
                {
                  name: 'nested',
                  type: { kind: 'primitive', name: 'boolean' },
                  optional: false
                }
              ]
            },
            optional: true
          }
        ]
      };

      expect(complexObject.fields).toHaveLength(4);
      expect(complexObject.fields[0].type.kind).toBe('primitive');
      expect(complexObject.fields[1].type.kind).toBe('array');
      expect(complexObject.fields[2].type.kind).toBe('reference');
      expect(complexObject.fields[3].type.kind).toBe('object');
    });
  });

  describe('snapshot testing', () => {
    it('should maintain type structure consistency', () => {
      const sampleTypes = {
        primitiveType: { kind: 'primitive' as const, name: 'string' as const },
        arrayType: {
          kind: 'array' as const,
          elementType: { kind: 'primitive' as const, name: 'number' as const }
        },
        referenceType: { kind: 'reference' as const, name: 'CustomType' },
        objectType: {
          kind: 'object' as const,
          fields: [
            {
              name: 'id',
              type: { kind: 'primitive' as const, name: 'string' as const },
              optional: false
            }
          ]
        }
      };

      expect(sampleTypes).toMatchSnapshot('type-structures');
    });
  });
});