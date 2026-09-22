# Changelog

All notable changes to `create-verse-bot` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-23

### Added

- Initial public release.
- Interactive wizard (project name, platform selection).
- Project template with Docker, GitHub Actions, TypeScript.
- `--local` flag for framework development.
- Updated the generated Docker template to Node.js 24.
- Added the Apache-2.0 package metadata.
- Generated projects include only the selected bot adapters.
- Generated projects use the `database` adapter option for optional PostgreSQL persistence.
- Added a programmatic project-generation API for smoke testing.
