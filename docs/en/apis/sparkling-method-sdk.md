# Sparkling Method SDK (Android/iOS)

Sparkling Method SDK is the native “pipe”/bridge layer that enables **JS ↔ native** method calls.
Built-in TS method packages like `sparkling-router` and `sparkling-storage` call into this layer.

## Concepts

- **Method name**: a string like `router.open` or `storage.setItem`.
- **Native implementation**: Android/iOS code that registers a handler for a method name.
- **Pipe/bridge wiring**: Sparkling containers set up the bridge automatically when you create a Lynx container.

## Android

### Register native IDL methods

Use `SparklingBridgeManager.registerIDLMethod(...)` to register implementations:

```kotlin
SparklingBridgeManager.registerIDLMethod(RouterOpenMethod::class.java)
SparklingBridgeManager.registerIDLMethod(RouterCloseMethod::class.java)
```

Key APIs:
- `SparklingBridgeManager.registerIDLMethod(clazz, scope, namespace)`
- `SparklingBridgeManager.getIDLMethodList(platformType, namespace)`

Notes:
- `scope` uses `BridgePlatformType` (`LYNX`, `WEB`, `ALL`, ...).
- `namespace` defaults to `"DEFAULT"`.

### Bridge lifecycle (container wiring)

When Sparkling creates a Lynx container, it creates a `SparklingBridge` and binds it to the container.
You generally don’t need to call these manually in host apps, but they are the key entrypoints:

- `SparklingBridge.init(view, containerId, jsBridgeProtocols)`
- `SparklingBridge.prepareLynxJSRuntime(containerId, options, context)` (background runtime)
- `SparklingBridge.bindWithBusinessNamespace(namespace)` (namespaced registrations)

## iOS

### Register methods (global or local)

The core types are:
- `MethodPipe`: executes methods and fires events
- `MethodRegistry`: holds registered methods
- `PipeMethod`: base class for method implementations

Common patterns:

1) **Auto-register all global methods** (template approach):

```swift
MethodRegistry.autoRegisterGlobalMethods()
```

2) **Manually register a method type**:

```swift
MethodRegistry.global.register(methodType: MyMethod.self)
```

3) **Register methods on a specific pipe instance**:

```swift
let pipe = MethodPipe()
pipe.register(localMethod: MyMethod())
```

### Lynx integration (container wiring)

Sparkling’s Lynx container wrapper sets up method pipe integration automatically:

- `MethodPipe.setupLynxPipe(config:)` is called during Lynx view setup.
- `MethodPipe(withLynxView:)` is created per container to handle calls/events.

## JavaScript (sparkling-method-sdk)

The JS-side `sparkling-method-sdk` provides a default pipe object (exported as `default`) with:
- `call(methodName, params, callback)`
- `callAsync(methodName, params, options?, timeout?)`
- `on(eventName, callback)` / `off(eventName, callback)`

Built-in TS method packages call method names like:
- `router.open`, `router.close`
- `storage.setItem`, `storage.getItem`

If those do nothing, it usually means the corresponding native implementations/services were not
registered. See [Built-in Sparkling methods](./built-in/README.md).


