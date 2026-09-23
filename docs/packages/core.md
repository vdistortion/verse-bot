# `@verse-bot/core`

Platform-neutral types and utilities shared by the Telegram and VK adapters.

## Install

```bash
npm install @verse-bot/core
```

## Main exports

- `UniversalContext`, `Platform` and shared message and keyboard types;
- `dispatchUniversalCommand` for common command routing;
- `requireAdmin` and `requirePrivateChat` command guards;
- `catchErrors` for consistent command error handling;
- `http` for small JSON HTTP requests;
- authentication and command logging middleware;
- `BotDatabase` and related persistence contracts.

The package is ESM-only and has no runtime dependencies. It does not contain Telegram- or VK-specific code.

## License

Apache-2.0
