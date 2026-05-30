# Changelog

All notable changes to `@verse-bot/miniapp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-30

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
