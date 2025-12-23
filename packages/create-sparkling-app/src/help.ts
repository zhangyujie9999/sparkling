// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export default async () => {
  console.log(`Sparkling CLI Usage: sparkling [command]

Commands:
  init [options]  Scaffold a new Sparkling project (alias: create)
  build[:type]  Builds the current Sparkling project
  help          Displays this help message
Options:
  -v, --verbose  Enable verbose logging for debugging

 Quick start:
   npx create-sparkling-app <dir> [options] (defaults to init)`);
};
