# Changelog

All notable changes to `@verse-bot/vk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-23

### Added

- Long Poll client with auto-reconnection.
- `createUniversalVKBot` factory with universal context.
- Message sending with keyboards and attachments.
- Inline button payload handling.
- Inline keyboard callbacks through the universal command dispatcher.
- Dynamic commands `/content_`, `/userlog_`.
- Optional `onCallback` handler for raw VK callback payloads.
