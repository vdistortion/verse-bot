# Changelog

All notable changes to `@verse-bot/telegram` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Published package includes the Apache-2.0 license file.
- `onMessage` fallback for incoming updates not handled by registered commands or buttons.
- Asynchronous `checkAdmin` hook for custom Telegram administrator checks.
- Callback context with normalized data, source message ID, callback answers, and text/caption editing.
- `callbackData` support for inline buttons.
- Shared `replySafe` keyboard safety and complete one-time/keyboard-removal behavior across send methods.
- Photo hook receives the same universal context argument as the VK adapter.

## [0.1.0] - 2026-09-23

### Added

- `createUniversalTelegramBot` factory with automatic `UniversalContext`.
- Registration of static and dynamic commands, inline/reply keyboards.
- Database and logger middleware.
- Callback query handling.
- Optional `onCallback` handler for raw Telegram callback data.
