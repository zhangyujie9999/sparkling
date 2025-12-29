# Integrate Sparkling into an existing app

This guide shows how to host Sparkling in an existing Android/iOS app: initialize the runtime,
provide Lynx bundles, then open content via a hybrid scheme.

## Quick Start (Manual Embed)

Embed Sparkling containers into an established Android/iOS project without regenerating your app
from a template.

### Android

1) Add the published Sparkling SDK dependency:

   ```kotlin
   // app/build.gradle.kts
   dependencies {
     implementation("com.tiktok.sparkling:sparkling:2.0.0")
   }
   ```

2) Build your Lynx bundles in your JS project, then copy the generated `.lynx.bundle` files (and any
   referenced assets) into the Android assets directory you want to load from (commonly
   `app/src/main/assets`).
3) Launch a container:

   ```kotlin
   val ctx = SparklingContext().apply {
       scheme = "hybrid://lynxview?bundle=main.lynx.bundle"
   }
   Sparkling.build(applicationContext, ctx).navigate()
   ```

### iOS

1) Add the published pods:

   ```ruby
   pod 'Sparkling', '2.0.0'
   # Optional: only if you use Sparkling Method modules
   pod 'SparklingMethod', '2.0.0', :subspecs => ['Lynx', 'DIProvider', 'Debug']
   ```

2) Run `pod install` (or `bundle exec pod install` if you use Bundler).
3) Open a page:

   ```swift
   let url = "hybrid://lynxview?bundle=main.lynx.bundle&title=Home"
   SPKRouter.open(withURL: url, context: nil)
   ```

4) Customize navigation/loading/error views via `SPKViewController` or `SPKContainerView` as needed.

### Build & verify

- Build your Lynx bundles by compiling your JS project (produce the `.lynx.bundle` files).
- Copy the bundles into your app’s Android/iOS assets/resources directories.
- Run platform builds (`./gradlew assembleDebug`, `xcodebuild`) and open a `hybrid://` URL to confirm
  rendering and pipe calls.

### What you need

- **Native Sparkling SDK** (container + Lynx integration)
- **Your Lynx bundles** (the compiled assets, typically under `dist/`)
- Optional: **Sparkling Method modules** (router/storage/custom) if you want JS ↔ native APIs

## Android integration

### 1) Add the Sparkling dependency

The template app uses a Maven artifact:

```kotlin
dependencies {
  implementation("com.tiktok.sparkling:sparkling:2.0.0")
}
```

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
context.scheme = "hybrid://lynxview?bundle=main.lynx.bundle&title=Home&hide_nav_bar=1"
context.withInitData("{\"initial_data\":{}}")

Sparkling.build(this, context).navigate()
```

### 5) Provide bundle assets

Your scheme must point at a bundle name that exists in the app’s assets.

Build your Lynx bundles in your JS project, then copy the generated `.lynx.bundle` files into your
Android assets (commonly `app/src/main/assets`). The `bundle=` parameter in your `hybrid://...`
scheme must match the asset path/name you copy into the app.

## iOS integration

### 1) Add Sparkling via CocoaPods

Use the published pods:

```ruby
pod 'Sparkling', '2.0.0'
pod 'SparklingMethod', '2.0.0', :subspecs => ['Lynx', 'DIProvider', 'Debug']
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
let url = "hybrid://lynxview?bundle=main.lynx.bundle"
let context = SPKContext()
let vc = SPKRouter.create(withURL: url, context: context, frame: UIScreen.main.bounds)
let naviVC = UINavigationController(rootViewController: vc)
```

- **Embed a container view**:

```swift
let view = SPKContainerView(frame: UIScreen.main.bounds)
let context = SPKContext()
view.load(withURL: "hybrid://lynxview?bundle=main.lynx.bundle", context)
```

### 4) Provide bundle assets

Your iOS app must bundle the Lynx output so Sparkling can resolve the `bundle=` parameter.

Build your Lynx bundles in your JS project, then add/copy the generated `.lynx.bundle` files into
your Xcode target resources so they’re included in the final app bundle. The `bundle=` parameter in
your `hybrid://...` URL must match the bundled resource path/name.

### Troubleshooting

- **Blank screen / failed to load**: verify the `bundle=` name exists in app assets and your scheme
  matches the host type (`lynxview_page`, `lynxview_card`, etc.). See [Scheme](../../apis/scheme.md) for details.
- **Router methods do nothing**: ensure you registered the native IDL methods and that the JS side
  calls match the same method names (e.g. `router.open`).
