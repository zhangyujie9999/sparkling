#!/usr/bin/env node
// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
// Prefer compiled output if it exists; fall back to ts-node when developing from source.
const fs = require('fs');
const path = require('path');

const distEntry = path.join(__dirname, 'dist', 'index.js');

if (fs.existsSync(distEntry)) {
  require(distEntry);
} else {
  require('ts-node/register/transpile-only');
  require(path.join(__dirname, 'src', 'index.ts'));
}
