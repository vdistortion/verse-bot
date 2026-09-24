# Changelog

All notable changes to `@verse-bot/vk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Published package includes the Apache-2.0 license file.
- `onMessage` fallback and asynchronous `checkAdmin` hook for community roles or additional administrators.
- Optional second API client configured with `userToken` and exposed as `bot.userApi`.
- Callback context with normalized data, callback acknowledgement, and source-message editing.
- Inline callback data and per-button VK colors; VK photo attachment IDs can be sent directly through `replyWithPhoto`.
- Profile results include VK's `screen_name` as `username`.
- Shared `replySafe`, one-time keyboards, and keyboard removal behavior with Telegram.

### Changed

- Inline keyboards now use VK callback actions so they produce `message_event` updates.
- `onCallback` receives normalized string data like Telegram; the original VK payload remains on `ctx.payload`.
- Reply and callback edits map shared link-preview settings to VK's `dont_parse_links` option.
- External HTTPS rich links render as `Label: URL`; VK-native links use `[target|label]` markup.
- Rich message conversion preserves intentional single and repeated line breaks.

### Fixed

- `getUserProfile` returns `null` when the VK profile API lookup fails, matching Telegram behavior.

## [0.1.0] - 2026-09-23

### Added

- Long Poll client with auto-reconnection.
- `createUniversalVKBot` factory with universal context.
- Message sending with keyboards and attachments.
- Inline button payload handling.
- Inline keyboard callbacks through the universal command dispatcher.
- Rich message links rendered with VK link markup.
- Dynamic commands `/content_`, `/userlog_`.
- Optional `onCallback` handler for raw VK callback payloads.
