# Sparkling Method Module Template

This directory is copied when running `pnpm dlx sparkling-method init <name>`. It
contains a minimal project layout with placeholder TypeScript definitions under
`src/method.d.ts`. Feel free to remove these examples after scaffolding a new
module.

After editing the `.d.ts` declarations, run `pnpm dlx sparkling-method codegen` (or
`pnpm --filter <module> codegen` inside a workspace) to produce cross-platform implementations:

- **Kotlin IDL** sources under `android/` directories
- **Swift IDL** sources under `ios/` directories
- **TypeScript implementation** with validation and pipe integration under `src/`
- **Package exports** in `index.ts` for easy importing

The generated TypeScript code provides type-safe wrappers around the Sparkling pipe SDK,
following the same patterns used in `sparkling-router` and `sparkling-storage`.
