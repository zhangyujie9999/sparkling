# Scheme

Sparkling pages are opened by a `hybrid://...` URL. This document defines the **unified scheme**
format and parameters that are **applied on both Android and iOS**.

## Format

### Bundle style (recommended)

```
hybrid://lynxview?bundle=<bundlePath>[&title=<title>][&hide_nav_bar=1][&title_color=<color>][&container_bg_color=<color>][&force_theme_style=light|dark]
```

- `hybrid://lynxview`: host type for Sparkling Lynx containers (recommended canonical host).
- `bundle`: points to the `.lynx.bundle` you ship inside the app.

## Encoding rules

- Always **URL-encode** parameter values.
- If you pass hex colors, **`#` must be encoded as `%23`** (otherwise it becomes a URL fragment).
- Prefer building schemes with a query builder (`URLSearchParams`, `Uri.Builder`, etc.) instead of
  manual string concatenation.

Example with encoded colors:

```
hybrid://lynxview?bundle=main.lynx.bundle&title=Home&title_color=%23000000&container_bg_color=%23ffffff
```

## Parameters (cross-platform)

Only the following parameters are guaranteed to have an effect on **both Android and iOS**.

| Param | Type | Default | Meaning |
| --- | --- | --- | --- |
| `bundle` | `string` (required) | - | Lynx bundle path/name to load (must exist in app assets/resources). |
| `title` | `string` | platform default | Container title (usually shown in the navigation bar). |
| `hide_nav_bar` | `0`/`1` | `0` | Hide the navigation bar when set to `1`. |
| `title_color` | `#RRGGBB` (encoded) | platform default | Title text color. Use 6-digit RGB only; see “Color format”. |
| `container_bg_color` | `#RRGGBB` (encoded) | platform default | Container background color. Use 6-digit RGB only; see “Color format”. |
| `force_theme_style` | `light` \| `dark` | system default | Force light/dark theme for container-level theming and theme-dependent props. |

### Color format (cross-platform)

Use **6-digit RGB** hex colors: `#RRGGBB` (encode `#` as `%23` in a URL).

Do **not** use 8-digit hex colors for transparency in the scheme (Android and iOS interpret 8-digit
hex differently).

## Examples

Minimal:

```
hybrid://lynxview?bundle=main.lynx.bundle
```

With title:

```
hybrid://lynxview?bundle=main.lynx.bundle&title=Home
```

Hide navigation bar:

```
hybrid://lynxview?bundle=main.lynx.bundle&hide_nav_bar=1
```

Force dark theme:

```
hybrid://lynxview?bundle=main.lynx.bundle&force_theme_style=dark
```


