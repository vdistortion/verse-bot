# Changelog

All notable changes to `@verse-bot/miniapp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-06-23

### Breaking Changes

- **Angular peer dependencies**: removed `@angular/common`, `@angular/router`, `rxjs`. Now only `@angular/core` >=16.0.0 is required.
- **Angular service injection**: `TelegramApiService` is no longer provided in `'root'`. Use the new `provideTelegramApi(config?)` function in your providers.
- **Reactive state**: replaced the `isMiniApp$` BehaviorSubject with an Angular signal `isApp` (readonly signal).
- **API for buttons**: replaced individual methods (`showMainButton`, `hideMainButton`, `onMainButtonClick`, etc.) with **controller objects** (`mainButton`, `secondaryButton`, `backButton`, `settingsButton`, `miniApp`). Each controller exposes `show()`, `hide()` (where applicable) and `onClick()`.
- **Automatic secondary button behavior removed**: clicking the secondary button no longer closes the Mini App by default. Attach `miniApp.close()` explicitly if needed.
- **`init()` idempotent**: subsequent calls to `init()` after successful initialization return `true` immediately without re-initializing.

### Added

- `provideTelegramApi(config?)` function to configure and provide the Angular service.
- `TELEGRAM_API_CONFIG` injection token for default init options.
- `isApp` signal in `TelegramApiService` reflecting the Mini App state.
- `MiniAppController` with `close()` method.
- Idempotency guard in `init()`.

### Changed

- **Base class**: uses `#cleanupSdk` instead of separate `#isMiniApp` flag; all public methods check `this.isMiniApp` getter.
- **SDK cleanup**: removed manual `unmount` calls; now relies solely on the SDK’s cleanup function returned by `init()`.
- **TypeScript config**: removed `"types": []` from `tsconfig.lib.json` to resolve type errors with `@tma.js/sdk`.

### Fixed

- Recursive calls in button methods (already fixed in 0.2.1).
- Type error `Property unmount does not exist on type Viewport` resolved by removing manual unmount.
- ESLint `Unsafe call of a type that could not be resolved` mitigated by allowing type resolution.

## [0.2.1] - 2026-05-30

### Added

- Angular entry point `@verse-bot/miniapp/angular` now works correctly and is published via Angular Package Format (APF) with Partial Ivy compilation
- Null-guard in `onMainButtonClick(cb)` — silently returns a no-op if `cb` is not provided

### Fixed

- `showBackButton()`, `hideBackButton()`, `showSettingsButton()`, `hideSettingsButton()` were recursively calling themselves instead of the underlying `@telegram-apps/sdk` functions — all four methods now work correctly
- Angular entry point was inaccessible in 0.1.0 due to incorrect build output structure; the entry is now at `./angular` as documented

### Changed

- Build system replaced: `tsc` → `ng-packagr` (Angular Package Format, Partial Ivy)
- Angular `peerDependencies` widened: `>=17.0.0` → `>=14.0.0 <22.0.0`
- Package structure: Angular sources moved from `src/angular/` to `angular/` (top-level secondary entry point)

## [0.1.0] - 2026-05-29

### Added

- Initial release
- `TelegramApi` class and `telegramApi` singleton for framework-agnostic usage
- `TelegramApiService` Angular service (non-functional in this release due to build issues)
- `init()`, `destroy()`, main/secondary/back/settings button controls
- Automatic theme CSS variables binding via `bindThemeParamsCssVars()`
- Secondary button wired to `closeMiniApp` by default
