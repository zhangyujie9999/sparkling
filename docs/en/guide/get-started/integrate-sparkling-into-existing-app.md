# Integrate Sparkling into an existing app

This guide shows how to host Sparkling in an existing Android/iOS app: initialize the runtime,
provide Lynx bundles, then open content via a `hybrid://...` scheme.

## Quick Start (Manual Embed)

Embed Sparkling containers into an established Android/iOS project without regenerating your app
from a template.

### Android

1) Include the SDK module (from npm or a workspace path):
   ```kotlin
   // settings.gradle.kts
   include(":sparkling")
   project(":sparkling").projectDir = file("../node_modules/sparkling-sdk/android/sparkling")
   ```
2) Depend on it from your app module:
   ```kotlin
   // app/build.gradle.kts
   dependencies { implementation(project(":sparkling")) }
   ```
3) Provide Lynx assets (copy with `npx sparkling build --copy` or place your own bundles under
   `app/src/main/assets`).
4) Launch a container:
   ```kotlin
   val ctx = SparklingContext().apply {
       scheme = "hybrid://lynxview?bundle=.%2Fmain.lynx.bundle"
   }
   Sparkling.build(applicationContext, ctx)?.navigate()
   ```
5) Link any pipe methods you use (e.g. `sparkling-router`, `sparkling-storage`) via additional
   `include` + `implementation` entries.

### iOS

1) Add the pod:
   ```ruby
   pod 'Sparkling', :path => '../node_modules/sparkling-sdk/ios'
   ```
2) Run `bundle exec pod install`.
3) Open a page:
   ```swift
   let url = "hybrid://lynxview?bundle=.%2Fmain.lynx.bundle&title=Home"
   SPKRouter.open(withURL: url, context: nil)
   ```
4) Add method pods you use:
   ```ruby
   pod 'Sparkling-SPKRouter',  :path => '../node_modules/sparkling-router/ios'
   pod 'Sparkling-SPKStorage', :path => '../node_modules/sparkling-storage/ios'
   ```
5) Customize navigation/loading/error views via `SPKViewController` or `SPKContainerView` as needed.

### Build & verify

- Build Lynx bundles: `npx sparkling build --copy`.
- Run platform builds (`./gradlew assembleDebug`, `xcodebuild`) and open a
  `hybrid://` URL to confirm rendering and pipe calls.

### What you need

- **Native Sparkling SDK** (container + Lynx integration)
- **Your Lynx bundles** (the compiled assets, typically under `dist/`)
- Optional: **Sparkling Method modules** (router/storage/custom) if you want JS ↔ native APIs

## Android integration

### 1) Add the Sparkling dependency

The template app uses a Maven artifact:

```kotlin
dependencies {
  implementation("com.tiktok.sparkling:sparkling:2.0.0-rc.0")
}
```

If you want to integrate from this monorepo (source-level), start from
`packages/sparkling-sdk/README.md` and mirror the module wiring used by the template’s native shells.

### 2) Initialize HybridKit (Application.onCreate)

The host must initialize HybridKit and configure Lynx before opening any containers.
The template does this in `SparklingApplication`:

```kotlin
class SparklingApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    HybridKit.init(this)

    val baseInfoConfig = BaseInfoConfig(isDebug = BuildConfig.DEBUG)
    val lynxConfig = SparklingLynxConfig.build(this) {
      // optional: add custom Lynx UI components and template provider
    }
    val hybridConfig = SparklingHybridConfig.build(baseInfoConfig) {
      setLynxConfig(lynxConfig)
    }

    HybridKit.setHybridConfig(hybridConfig, this)
    HybridKit.initLynxKit()
  }
}
```

### 3) (Optional) Register Sparkling Methods

If you use method packages (router/storage/custom), you also register the native method
implementations during initialization.

The template registers router methods:

```kotlin
SparklingBridgeManager.registerIDLMethod(RouterOpenMethod::class.java)
SparklingBridgeManager.registerIDLMethod(RouterCloseMethod::class.java)
RouterProvider.hostRouterDepend = SparklingHostRouterDepend()
```

### 4) Open a page (create SparklingContext + navigate)

The Android SDK provides `SparklingContext` and `Sparkling.build(...).navigate()`:

```kotlin
val context = SparklingContext()
context.scheme = "hybrid://lynxview_page?bundle=main.lynx.bundle&hide_nav_bar=1&screen_orientation=portrait"
context.withInitData("{\"initial_data\":{}}")

Sparkling.build(this, context).navigate()
```

### 5) Provide bundle assets

Your scheme must point at a bundle name that exists in the app’s assets.

The template supports two modes:

- **No-copy (default)**: Android reads bundles directly from `dist/` during development
- **Copy mode**: bundles are copied into `android/app/src/main/assets`

`sparkling run:android --copy` sets `SPARKLING_USE_NATIVE_ASSETS=true` (used by the template’s
`android/app/build.gradle.kts`).

## iOS integration

### 1) Add Sparkling via CocoaPods

Two common patterns exist in this repo:

- Local pod from the monorepo (good for development):

```ruby
pod 'Sparkling', :path => '../packages/sparkling-sdk/ios'
```

- Versioned pod (used by the template app):

```ruby
pod 'Sparkling', '2.0.0-rc.1'
pod 'SparklingMethod', '2.0.0-rc.1', :subspecs => ['Lynx', 'DIProvider', 'Debug']
```

### 2) Initialize services (App startup)

The template’s `AppDelegate` registers services and boot tasks:

```swift
SPKServiceRegister.registerAll()
SPKExecuteAllPrepareBootTask()
```

### 3) Open content

Two common hosting styles:

- **Push a Sparkling container controller** (router):

```swift
let url = "hybrid://lynxview?bundle=.%2Fmain.lynx.bundle&hide_status_bar=1"
let context = SPKContext()
let vc = SPKRouter.create(withURL: url, context: context, frame: UIScreen.main.bounds)
let naviVC = UINavigationController(rootViewController: vc)
```

- **Embed a container view**:

```swift
let view = SPKContainerView(frame: UIScreen.main.bounds)
let context = SPKContext()
view.load(withURL: "hybrid://lynxview?bundle=.%2Fmain.lynx.bundle", context)
```

### 4) Provide bundle assets

Your iOS app must bundle the Lynx output so Sparkling can resolve the `bundle=` parameter.

In the template workflow, `sparkling run:ios` will:

- Run `bundle exec pod install` (unless `--skip-pod-install`)
- Build the web assets into `dist/`
- In no-copy mode: ensure `ios/.../Resources/Assets` is a symlink to `dist/`

### Troubleshooting

- **Blank screen / failed to load**: verify the `bundle=` name exists in app assets and your scheme
  matches the host type (`lynxview_page`, `lynxview_card`, etc.). See `Scheme Params` doc for details.
- **Router methods do nothing**: ensure you registered the native IDL methods and that the JS side
  calls match the same method names (e.g. `router.open`).

### Source pointers

- Android SDK:
  - `packages/sparkling-sdk/android/sparkling/src/main/java/com/tiktok/sparkling/Sparkling.kt`
  - `packages/sparkling-sdk/android/sparkling/src/main/java/com/tiktok/sparkling/hybridkit/HybridKit.kt`
  - Template initialization: `template/sparkling-app-template/android/app/src/main/java/com/example/sparkling/go/SparklingApplication.kt`
  - Template open: `template/sparkling-app-template/android/app/src/main/java/com/example/sparkling/go/SplashActivity.kt`
- iOS SDK:
  - `packages/sparkling-sdk/ios/README.md`
  - `packages/sparkling-sdk/ios/Sparkling/Application/Container/Router/SPKRouter.swift`
  - Template app bootstrap: `template/sparkling-app-template/ios/SparklingGo/SparklingGo/SparklingGoApp.swift`
  - Template host VC: `template/sparkling-app-template/ios/SparklingGo/SparklingGo/SparklingSwiftVC.swift`
