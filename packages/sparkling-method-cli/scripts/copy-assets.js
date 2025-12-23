const path = require('path');
const fs = require('fs-extra');

async function copyAssets() {
  const root = __dirname;
  const distDir = path.resolve(root, '../dist');
  const templateTargets = [
    {
      from: path.resolve(root, '../src/create/template'),
      to: path.join(distDir, 'create/template'),
    },
    {
      from: path.resolve(root, '../src/codegen/template'),
      to: path.join(distDir, 'codegen/template'),
    }
  ];

  for (const entry of templateTargets) {
    if (await fs.pathExists(entry.from)) {
      await fs.copy(entry.from, entry.to, { overwrite: true });
    }
  }
}

copyAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
