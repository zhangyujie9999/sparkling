# Sparkling App Template

React/Lynx template used by `create-sparkling-app`. It ships with router, storage, and media bridge
methods wired into the native shells.

## Getting started
```bash
pnpm install
pnpm run dev
```
Edit `src/App.tsx` or the pages under `src/pages`—the app hot reloads.

## Build/preview
```bash
pnpm run build   # bundles assets to dist/ and copies them for native shells
pnpm run preview
```

## Add another Sparkling method
1) Add the package as a dependency (workspace path or version):
   ```bash
   pnpm add ../packages/<your-method> -C .
   ```
2) Android: include the module in `android/settings.gradle.kts` and add it as an `implementation`
   dependency in `android/app/build.gradle.kts`.
3) iOS: add the module’s podspec path to `ios/Podfile`, then run `pod install`.
4) Rebuild the app (`pnpm run build`) so JavaScript and native layers pick up the new method.

Use `npx sparkling run:android` or `npx sparkling run:ios` from the repo root to launch the native demos after
adding methods.
