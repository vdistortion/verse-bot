# Changelog

All notable changes to `@verse-bot/vk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Handle inline keyboard callbacks in `createUniversalVKBot` through the universal command dispatcher.
- Renamed the package from `@verse-bot/vk-core` to `@verse-bot/vk`.
- Made the package ESM-only and removed the source export.
- Made PostgreSQL integration optional through the neutral `BotDatabase` contract.
- Shared universal command dispatch and unknown-command handling with the Telegram adapter.
- Documented the underlying `vk-io` dependency.

## [0.1.0] - 2026-05-29

### Added

- Long Poll client with auto-reconnection.
- `createUniversalVKBot` factory with universal context.
- Message sending with keyboards and attachments.
- Inline button payload handling.
- Dynamic commands `/content_`, `/userlog_`.
