# Create a new Sparkling app

Create a Sparkling app using the official scaffolder, then use the bundled workflow CLI to build
Lynx bundles and run the native shells.

## Quick Start

If you want a runnable project in minutes:

```bash
npm create sparkling-app@latest my-app
cd my-app
```
Run native targets:

```bash
# Android
npm run run:android


# iOS
npm run run:ios
```

4) Add built-in methods as needed:

```bash
# npm
npm install sparkling-storage
```

5) Build bundles for release (same command regardless of package manager):

```bash
npx sparkling build
```


### What you get

- A Lynx app project (based on the default template)
- Android and iOS native shells already wired for Sparkling
- A working JS ↔ native pipe method example (router)
- Developer workflow commands (build / autolink / run)

Key folders/files created by the default template:

- `src/`: Lynx/React entry points and assets
- `android/`, `ios/`: native shells wired to Sparkling SDK
- `app.config.ts`: build + routing config consumed by `sparkling-cli`
- `package.json`: scripts (`dev`, `build`, `run:android`, `run:ios`)

### Prerequisites

- Node.js **>= 18** (repo requirement)
- A Node package manager of your choice (`pnpm`, `npm`, `yarn`, or `bun`)
- For running native shells:
  - Android Studio / Android SDK (Android)
  - Xcode + iOS Simulator (iOS)
