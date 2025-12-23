import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import Mustache from 'mustache';

describe('Template Processing (Mustache Integration)', () => {
  async function withTempDir(fn: (dir: string) => Promise<void>): Promise<void> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'template-test-'));
    try {
      await fn(tempDir);
    } finally {
      await fs.remove(tempDir);
    }
  }

  describe('basic mustache rendering', () => {
    it('should render simple templates', () => {
      const template = 'Hello {{name}}!';
      const data = { name: 'World' };
      const result = Mustache.render(template, data);

      expect(result).toBe('Hello World!');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{name}}! {{missing}}';
      const data = { name: 'World' };
      const result = Mustache.render(template, data);

      expect(result).toBe('Hello World! ');
    });

    it('should handle nested objects', () => {
      const template = 'User: {{user.name}} ({{user.id}})';
      const data = {
        user: { name: 'John Doe', id: '123' }
      };
      const result = Mustache.render(template, data);

      expect(result).toBe('User: John Doe (123)');
    });
  });

  describe('array iteration', () => {
    it('should iterate over arrays', () => {
      const template = '{{#items}}{{name}}, {{/items}}';
      const data = {
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' },
          { name: 'Item 3' }
        ]
      };
      const result = Mustache.render(template, data);

      expect(result).toBe('Item 1, Item 2, Item 3, ');
    });

    it('should handle empty arrays', () => {
      const template = '{{#items}}{{name}}{{/items}}{{^items}}No items{{/items}}';
      const data = { items: [] };
      const result = Mustache.render(template, data);

      expect(result).toBe('No items');
    });

    it('should provide array index access', () => {
      const template = '{{#items}}{{@index}}: {{name}}\n{{/items}}';
      const data = {
        items: [
          { name: 'First' },
          { name: 'Second' }
        ]
      };
      const result = Mustache.render(template, data);

      expect(result).toBe('0: First\n1: Second\n');
    });
  });

  describe('conditional rendering', () => {
    it('should render conditionally based on boolean values', () => {
      const template = '{{#isVisible}}Visible content{{/isVisible}}{{^isVisible}}Hidden{{/isVisible}}';

      const visibleResult = Mustache.render(template, { isVisible: true });
      expect(visibleResult).toBe('Visible content');

      const hiddenResult = Mustache.render(template, { isVisible: false });
      expect(hiddenResult).toBe('Hidden');
    });

    it('should handle truthy/falsy values', () => {
      const template = '{{#value}}Has value{{/value}}{{^value}}No value{{/value}}';

      expect(Mustache.render(template, { value: 'test' })).toBe('Has value');
      expect(Mustache.render(template, { value: '' })).toBe('No value');
      expect(Mustache.render(template, { value: 0 })).toBe('No value');
      expect(Mustache.render(template, { value: null })).toBe('No value');
      expect(Mustache.render(template, { value: undefined })).toBe('No value');
    });
  });

  describe('sparkling-specific template patterns', () => {
    it('should render TypeScript interface template', () => {
      const template = `export interface {{name}} {
{{#fields}}
  {{name}}: {{type}}{{#optional}}?{{/optional}};{{#description}} // {{description}}{{/description}}
{{/fields}}
}`;

      const data = {
        name: 'TestRequest',
        fields: [
          {
            name: 'message',
            type: 'string',
            optional: false,
            description: 'The message to display'
          },
          {
            name: 'duration',
            type: 'number',
            optional: true,
            description: 'Duration in milliseconds'
          }
        ]
      };

      const result = Mustache.render(template, data);

      expect(result).toContain('export interface TestRequest');
      expect(result).toContain('message: string; // The message to display');
      expect(result).toContain('duration: number?; // Duration in milliseconds');
    });

    it('should render method implementation template', () => {
      const template = `export function {{methodName}}(params: {{requestType}}, callback: (result: {{responseType}}) => void): void {
{{#validationRules}}
  if ({{condition}}) {
    callback({ code: -1, msg: '{{errorMessage}}' });
    return;
  }
{{/validationRules}}

  pipe.call('{{pipeMethod}}', {
{{#pipeParams}}
    {{.}},
{{/pipeParams}}
  }, callback);
}`;

      const data = {
        methodName: 'showToast',
        requestType: 'ShowToastRequest',
        responseType: 'ShowToastResponse',
        pipeMethod: 'toast.show',
        validationRules: [
          {
            condition: '!params.message',
            errorMessage: 'Message is required'
          }
        ],
        pipeParams: [
          'message: params.message',
          'duration: params.duration || 2000'
        ]
      };

      const result = Mustache.render(template, data);

      expect(result).toContain('export function showToast');
      expect(result).toContain('ShowToastRequest');
      expect(result).toContain('ShowToastResponse');
      expect(result).toContain('pipe.call(\'toast.show\'');
      expect(result).toContain('Message is required');
    });

    it('should render index export template', () => {
      const template = `{{#methods}}
export * from './{{methodKebab}}/{{methodKebab}}';
export type { {{requestInterface}}, {{responseInterface}}{{#extraInterfaces}}, {{.}}{{/extraInterfaces}} } from './{{methodKebab}}/{{methodKebab}}.d';
{{/methods}}`;

      const data = {
        methods: [
          {
            methodKebab: 'show-toast',
            requestInterface: 'ShowToastRequest',
            responseInterface: 'ShowToastResponse',
            extraInterfaces: ['ToastOptions', 'ToastResult']
          },
          {
            methodKebab: 'hide-toast',
            requestInterface: 'HideToastRequest',
            responseInterface: 'HideToastResponse',
            extraInterfaces: []
          }
        ]
      };

      const result = Mustache.render(template, data);

      expect(result).toContain('./show-toast/show-toast');
      expect(result).toContain('ShowToastRequest');
      expect(result).toContain('ToastOptions, ToastResult');
      expect(result).toContain('./hide-toast/hide-toast');
      expect(result).toContain('HideToastRequest');
      expect(result).not.toContain('HideToastRequest,');  // No trailing comma for empty extraInterfaces
    });
  });

  describe('file template processing', () => {
    it('should process templates from files', async () => {
      await withTempDir(async (tmpDir) => {
        const templatePath = path.join(tmpDir, 'template.mustache');
        const templateContent = `interface {{name}} {
{{#fields}}
  {{name}}: {{type}};
{{/fields}}
}`;

        await fs.writeFile(templatePath, templateContent);

        const template = await fs.readFile(templatePath, 'utf8');
        const data = {
          name: 'FileTemplate',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'count', type: 'number' }
          ]
        };

        const result = Mustache.render(template, data);

        expect(result).toContain('interface FileTemplate');
        expect(result).toContain('id: string;');
        expect(result).toContain('count: number;');
      });
    });

    it('should handle template partials', () => {
      const mainTemplate = 'Main: {{>partial}}';
      const partialTemplate = 'Partial content with {{value}}';

      const result = Mustache.render(
        mainTemplate,
        { value: 'test' },
        { partial: partialTemplate }
      );

      expect(result).toBe('Main: Partial content with test');
    });
  });

  describe('complex data structures', () => {
    it('should handle deeply nested objects', () => {
      const template = `{{#method}}
Method: {{name}}
{{#request}}
Request: {{#fields}}{{name}}:{{type}} {{/fields}}
{{/request}}
{{#response}}
Response: {{#fields}}{{name}}:{{type}} {{/fields}}
{{/response}}
{{/method}}`;

      const data = {
        method: {
          name: 'complexMethod',
          request: {
            fields: [
              { name: 'input', type: 'string' },
              { name: 'config', type: 'object' }
            ]
          },
          response: {
            fields: [
              { name: 'result', type: 'boolean' },
              { name: 'data', type: 'any' }
            ]
          }
        }
      };

      const result = Mustache.render(template, data);

      expect(result).toContain('Method: complexMethod');
      expect(result).toContain('input:string config:object');
      expect(result).toContain('result:boolean data:any');
    });

    it('should handle multiple levels of array iteration', () => {
      const template = `{{#modules}}
Module: {{name}}
{{#methods}}
  Method: {{name}}
{{#parameters}}
    Param: {{name}} ({{type}})
{{/parameters}}
{{/methods}}
{{/modules}}`;

      const data = {
        modules: [
          {
            name: 'ModuleA',
            methods: [
              {
                name: 'methodA1',
                parameters: [
                  { name: 'param1', type: 'string' },
                  { name: 'param2', type: 'number' }
                ]
              }
            ]
          }
        ]
      };

      const result = Mustache.render(template, data);

      expect(result).toContain('Module: ModuleA');
      expect(result).toContain('Method: methodA1');
      expect(result).toContain('Param: param1 (string)');
      expect(result).toContain('Param: param2 (number)');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined values gracefully', () => {
      const template = '{{#value}}{{.}}{{/value}}{{^value}}null{{/value}}';

      expect(Mustache.render(template, { value: null })).toBe('null');
      expect(Mustache.render(template, { value: undefined })).toBe('null');
      expect(Mustache.render(template, {})).toBe('null');
    });

    it('should handle circular references by avoiding them', () => {
      const template = '{{name}} {{#parent}}-> {{name}}{{/parent}}';

      // Don't create actual circular reference to avoid issues
      const data = {
        name: 'child',
        parent: {
          name: 'parent'
          // parent: data  // This would be circular
        }
      };

      expect(() => Mustache.render(template, data)).not.toThrow();
    });

    it('should handle special characters in templates', () => {
      const template = 'Special chars: {{value}} & {{other}} < {{more}} >';
      const data = {
        value: 'test&value',
        other: '<script>',
        more: '"quotes"'
      };

      const result = Mustache.render(template, data);

      expect(result).toContain('test&value');
      expect(result).toContain('<script>');
      expect(result).toContain('"quotes"');
    });

    it('should handle empty string templates', () => {
      const result = Mustache.render('', { any: 'data' });
      expect(result).toBe('');
    });

    it('should handle templates with only whitespace', () => {
      const result = Mustache.render('   \n\t   ', { any: 'data' });
      expect(result).toBe('   \n\t   ');
    });
  });

  describe('performance considerations', () => {
    it('should handle large templates efficiently', () => {
      const template = '{{#items}}Item {{index}}: {{name}}\n{{/items}}';
      const data = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          index: i,
          name: `Item ${i}`
        }))
      };

      const start = performance.now();
      const result = Mustache.render(template, data);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      expect(result.split('\n')).toHaveLength(1001); // 1000 items + empty line at end
    });

    it('should handle deeply nested data efficiently', () => {
      let deepData: any = { value: 'deep' };
      for (let i = 0; i < 100; i++) {
        deepData = { nested: deepData, level: i };
      }

      const template = '{{#nested}}{{#nested}}{{#nested}}{{value}}{{/nested}}{{/nested}}{{/nested}}';

      expect(() => Mustache.render(template, deepData)).not.toThrow();
    });
  });

  describe('snapshot testing', () => {
    it('should generate consistent template outputs', () => {
      const templateCases = [
        {
          name: 'simple-interface',
          template: 'interface {{name}} { {{#fields}}{{name}}: {{type}}; {{/fields}}}',
          data: {
            name: 'TestInterface',
            fields: [
              { name: 'id', type: 'string' },
              { name: 'value', type: 'number' }
            ]
          }
        },
        {
          name: 'conditional-rendering',
          template: '{{#hasFields}}Fields: {{fieldCount}}{{/hasFields}}{{^hasFields}}No fields{{/hasFields}}',
          data: { hasFields: true, fieldCount: 5 }
        },
        {
          name: 'array-with-conditionals',
          template: '{{#items}}{{name}}{{#isLast}}{{/isLast}}{{^isLast}}, {{/isLast}}{{/items}}',
          data: {
            items: [
              { name: 'first', isLast: false },
              { name: 'second', isLast: false },
              { name: 'third', isLast: true }
            ]
          }
        }
      ];

      const results = templateCases.map(testCase => ({
        name: testCase.name,
        output: Mustache.render(testCase.template, testCase.data)
      }));

      expect(results).toMatchSnapshot('mustache-template-outputs');
    });
  });
});