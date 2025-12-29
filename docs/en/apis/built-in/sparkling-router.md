# `sparkling-router`

Router helper APIs for opening/closing Sparkling pages from Lynx/JS.

## Install

```bash
npm install sparkling-router
```

## Exports

### `open(params, callback)`

Open a page/route by `scheme`.

- **Request**: `{ scheme: string; options?: OpenOptions }`
- **Response**: `{ code: number; msg: string }`

Example:

```ts
import { open } from 'sparkling-router';

open(
  { scheme: 'hybrid://lynxview?bundle=main.lynx.bundle&title=Home' },
  (res) => {
    console.log(res.code, res.msg);
  }
);
```

`OpenOptions`:
- `interceptor?: string`
- `extra?: object`

### `close(params?, callback?)`

Close the current page (or a specific container by ID).

Example:

```ts
import { close } from 'sparkling-router';

close(); // close current
```

### `navigate(params, callback)`

Build a `hybrid://...` scheme from a bundle path and optional params, then open it.

- **Request**: `{ path: string; options?: NavigateOptions; baseScheme?: string }`
- `path` must be a **relative bundle path**, e.g. `main.lynx.bundle` (not a full scheme).
- `baseScheme` defaults to `hybrid://lynxview_page` in the implementation.

Example:

```ts
import { navigate } from 'sparkling-router';

navigate(
  {
    path: 'main.lynx.bundle',
    options: {
      params: {
        title: 'Home',
        hide_nav_bar: 1,
      },
    },
  },
  (res) => {
    console.log(res.code, res.msg);
  }
);
```

Notes:
- `navigate(...).options.params` supports many keys (e.g. `title`, `hide_nav_bar`, `container_bg_color`, ...).
  Whether a key has an effect depends on native support. For the cross-platform subset, see [Scheme](../scheme.md).

## Native method names

This package calls:
- `router.open`
- `router.close`

Your host app must register native implementations for these methods. See
[Sparkling Method SDK](../sparkling-method-sdk.md).


