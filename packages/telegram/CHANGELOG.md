# Changelog

All notable changes to `@verse-bot/telegram` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-23

### Added

- `createUniversalTelegramBot` factory with automatic `UniversalContext`.
- Registration of static and dynamic commands, inline/reply keyboards.
- Database and logger middleware.
- Callback query handling.

### Changed

- Renamed the package from `@verse-bot/tg-core` to `@verse-bot/telegram`.
- Made the package ESM-only and removed the source export.
- Made PostgreSQL integration optional through the neutral `BotDatabase` contract.
- Shared universal command dispatch and unknown-command handling with the VK adapter.
- Documented the underlying `grammY` dependency.
