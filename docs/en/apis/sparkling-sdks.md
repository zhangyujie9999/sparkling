# Sparkling SDKs (Android/iOS)

This page documents the native SDK APIs for hosting Sparkling content.
For the `hybrid://...` URL format, see [Scheme](./scheme.md).

## Android

### Dependency

```kotlin
dependencies {
  implementation("com.tiktok.sparkling:sparkling:2.0.0")
}
```

### Initialization (Application.onCreate)

Sparkling containers require HybridKit to be initialized before opening any pages:

```kotlin
HybridKit.init(this)

val baseInfoConfig = BaseInfoConfig(isDebug = BuildConfig.DEBUG)
val lynxConfig = SparklingLynxConfig.build(this) {
  // optional: add global Lynx behaviors/modules, template provider, etc.
}
val hybridConfig = SparklingHybridConfig.build(baseInfoConfig) {
  setLynxConfig(lynxConfig)
}

HybridKit.setHybridConfig(hybridConfig, this)
HybridKit.initLynxKit()
```

### Open a page (full-screen Activity)

Create a `SparklingContext`, set a scheme, then navigate:

```kotlin
val context = SparklingContext().apply {
  scheme = "hybrid://lynxview?bundle=main.lynx.bundle&title=Home"
  // optional initial data for the page:
  // withInitData("{\"initial_data\":{}}")
}

Sparkling.build(this, context).navigate()
```

Key APIs:
- `Sparkling.build(context, sparklingContext)`: constructs a Sparkling instance.
- `Sparkling.navigate()`: starts `SparklingActivity` and loads the scheme.

### Embed a container view

Instead of starting an Activity, you can create a `SparklingView`:

```kotlin
val ctx = SparklingContext().apply {
  scheme = "hybrid://lynxview?bundle=main.lynx.bundle"
}

val view = Sparkling.build(this, ctx).createView()
// add `view` into your layout, then:
view?.loadUrl()
```

### Customize loading/error/toolbars

Implement `SparklingUIProvider` and attach it to `SparklingContext`:

- `getLoadingView(context)`: loading UI
- `getErrorView(context)`: error UI
- `getToolBar(context)`: optional custom `Toolbar` used by `SparklingActivity`

## iOS

### Dependency (CocoaPods)

```ruby
pod 'Sparkling', '2.0.0'
```

### Initialization (App startup)

The template app registers services and executes boot tasks during startup:

```swift
SPKServiceRegister.registerAll()
SPKExecuteAllPrepareBootTask()
```

Notes:
- `SPKServiceRegister` is typically defined in your app target (see the template under
  `template/sparkling-app-template/ios/.../MethodServices/SPKServiceRegistrar.swift`).

### Open a page (router)

```swift
let url = "hybrid://lynxview?bundle=main.lynx.bundle&title=Home"
SPKRouter.open(withURL: url, context: nil)
```

### Embed a container view

```swift
let view = SPKContainerView(frame: UIScreen.main.bounds)
let context = SPKContext()
view.load(withURL: "hybrid://lynxview?bundle=main.lynx.bundle", context)
```

### Customize loading/error/navigation/theme

Use `SPKContext` to customize container behavior, for example:
- loading/error view builders (`loadingViewBuilder`, `failedViewBuilder`)
- navigation bar (`naviBar`)
- theme (`appTheme`)
- lifecycle callbacks (`containerLifecycleDelegate`)


