# Changelog

All notable changes to `@verse-bot/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Optional `UniversalCallbackContext` for normalized callback data, acknowledgement and editing the source message.
- `UniversalAdminCheck` for adapter-provided asynchronous role checks.
- Original update payloads, inline-button `callbackData`, and VK button color metadata in shared types.

### Fixed

- Command guards preserve typed handler arguments without explicit `any`.

## [0.1.0] - 2026-09-23

### Added

- Platform-neutral `UniversalContext`, shared message types and database contracts.
- Common command dispatching and command guards.
- JSON HTTP helper and authentication/logging middleware.
- ESM-only package exports.
