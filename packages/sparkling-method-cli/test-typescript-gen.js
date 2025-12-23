// Test script for TypeScript generation
const fs = require('fs');
const path = require('path');

// Create a simple test method definition
const testMethodDefinition = {
  name: 'showToast',
  description: 'Display a toast message',
  request: {
    kind: 'object',
    fields: [
      {
        name: 'message',
        type: { kind: 'primitive', name: 'string' },
        optional: false,
        description: 'The message to display'
      },
      {
        name: 'duration',
        type: { kind: 'primitive', name: 'number' },
        optional: true,
        description: 'Duration in milliseconds',
        defaultValue: { kind: 'number', value: 2000 }
      }
    ]
  },
  response: {
    kind: 'object',
    fields: [
      {
        name: 'code',
        type: { kind: 'primitive', name: 'number' },
        optional: false
      },
      {
        name: 'msg',
        type: { kind: 'primitive', name: 'string' },
        optional: false
      },
      {
        name: 'success',
        type: { kind: 'primitive', name: 'boolean' },
        optional: true
      }
    ]
  },
  source: 'test',
  interfaces: {}
};

const testConfig = {
  packageName: 'sparkling-method-sdk',
  moduleName: 'ui'
};

console.log('Test method definition created:');
console.log('Method name:', testMethodDefinition.name);
console.log('Config module:', testConfig.moduleName);
console.log('\nThis would generate TypeScript files for the showToast method.');
console.log('Templates are ready in src/codegen/template/ts/');
console.log('\nTo test the full generation, the CLI needs to be built first.');

// Try to verify template files exist
const templateDir = path.join(__dirname, 'src/codegen/template/ts');
const templates = ['ts-idl-template', 'ts-impl-template', 'ts-index-template'];

console.log('\nVerifying template files:');
templates.forEach(template => {
  const templatePath = path.join(templateDir, template);
  if (fs.existsSync(templatePath)) {
    console.log('✓', template, 'exists');
  } else {
    console.log('✗', template, 'missing');
  }
});