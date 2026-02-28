# PLAN.md

## Phase 1: v2 — Non-breaking improvements

Improvements that ship under the current API contract. No breaking changes. Existing consumers upgrade without code changes.

### 1A: Fix critical bugs

- **Handle white/single-color images.** When the pixel filter strips all pixels (all white, all transparent, single color), return a sensible fallback instead of `null`. `getColor()` should return the dominant remaining color (or the image's actual color if filtering removed everything). `getPalette()` should return a shorter array rather than crash.
- **Fix variable scope leak.** `src/color-thief.js:120` — `i = uInt8Array.length` is missing `let`, creating an implicit global.
- **Add input validation with clear error messages.** Throw descriptive errors for: missing/unloaded image elements, tainted canvases (CORS), invalid image sources. Currently these fail silently or throw cryptic browser errors.

### 1B: TypeScript type definitions

- Ship a `dist/color-thief.d.ts` and `dist/color-thief-node.d.ts` alongside the existing JS output.
- Add `types` field to `package.json`.
- No source rewrite — just hand-authored `.d.ts` files that match the current API.

### 1C: Accept more input types (browser)

Expand what `getColor()` and `getPalette()` accept beyond `HTMLImageElement`:

- `HTMLCanvasElement`
- `ImageData`
- `ImageBitmap`

These are additive — existing code passing `<img>` elements still works.

### 1D: Configurable pixel filtering

Expose the hardcoded thresholds as optional config:

- `ignoreWhite` (default `true`, current behavior) — with configurable RGB threshold (default 250)
- `alphaThreshold` (default 125) — pixels below this alpha are skipped
- `minSaturation` (default 0) — optional minimum saturation filter

Pass as an options object: `getColor(image, { quality: 10, ignoreWhite: false })`. The current positional args (`quality`, `colorCount`) continue to work for backward compat.

### 1E: Update dev tooling

- Upgrade ESLint v5 → v9 with flat config.
- Update `ecmaVersion` from 2018 to current.
- Add a CI workflow (GitHub Actions) for automated test runs on PRs.
- Drop the misleading `color-thief.min.js` copy — or actually minify it.

---

## Phase 2: v3 — Breaking changes and new architecture

A new major version. Different API surface, new output format, modern JS throughout. Published as a new major version with a migration guide.

### 2A: TypeScript rewrite and unified codebase

- Rewrite all source files in TypeScript.
- Merge the browser and Node implementations into a single codebase with platform-specific adapters for pixel loading. The core algorithm, pixel filtering, and output formatting are shared. Only the "get pixels from image" step differs.
- Single API surface for both platforms. No more class on browser / bare functions on Node.

### 2B: Modern async API

- Promise-based everywhere. `getColor()` and `getPalette()` return Promises on both browser and Node.
- Drop `getColorFromUrl()`, `getColorAsync()`, and `getImageData()`. Image loading is the consumer's responsibility.
- Replace `XMLHttpRequest` with `fetch()` if any internal HTTP calls remain.
- Support `AbortController` / `AbortSignal` for cancellation.

### 2C: Rich output format

Replace bare `[r, g, b]` arrays with color objects:

```
const color = await colorThief.getColor(image);
color.rgb()    // { r, g, b }
color.hex()    // '#e84d3d'
color.hsl()    // { h, s, l }
color.oklch()  // { l, c, h }
color.array()  // [r, g, b]  (backward-compat escape hatch)
color.isDark   // boolean
```

`getPalette()` returns an array of these objects.

### 2D: Semantic swatches

Add a `getSwatches()` method that classifies palette colors into UI roles:

- Vibrant, Muted, DarkVibrant, DarkMuted, LightVibrant, LightMuted
- Each swatch includes a suggested text color (title and body) for accessibility.
- Inspired by Android's Palette API / node-vibrant, but with OKLCH-based classification for better perceptual accuracy.

### 2E: Web Worker support

- Use `OffscreenCanvas` + `createImageBitmap` to move pixel reading and quantization off the main thread.
- Opt-in via config: `getColor(image, { worker: true })`.
- Fallback to synchronous main-thread processing when Workers or OffscreenCanvas are unavailable.

### 2F: Lighter Node.js dependencies

- Remove `sharp` as a hard dependency. It's heavy (native bindings, Docker/CI build issues).
- Make image decoding pluggable — consumers bring their own decoder, or use a built-in lightweight default.
- Consider `sharp` as an optional peer dependency for users who already have it.

### 2G: Optional WASM backend

- Ship a `@colorthief/wasm` package with the quantization algorithm compiled from Rust.
- Same API as the pure-JS version — drop-in replacement for the core.
- ~6x performance improvement for the compute-heavy pixel clustering step.
- The main `colorthief` package stays pure JS with zero native dependencies.

### 2H: OKLCH-native pipeline

- Option to perform quantization in OKLCH color space instead of RGB.
- Produces more perceptually distinct palettes — colors that look different to humans, not just mathematically distant in RGB.
- Default remains RGB quantization for performance and backward compat. OKLCH mode is opt-in.

### 2I: Accessibility built in

- For each color in a palette, include:
  - WCAG contrast ratios against white and black
  - `isDark` / `isLight` boolean
  - Suggested foreground text color (white or black) for AA compliance
- Make this zero-config — always included in the output, no extra method calls.

### 2J: Progressive extraction

- For large images, return an approximate palette immediately from a downsampled pass, then refine progressively.
- API: `getColor(image, { progressive: true })` returns an async iterator or observable that emits improving results.
- Useful for large images, batch processing, and perceived performance.
- No competitor currently offers this.
