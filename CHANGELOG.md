# Changelog

All notable changes to the AgentInbox Node.js SDK will be documented in this file.

## [0.1.1] - 2026-06-13

### Fixed
- Package name corrected to `agentinbox.in` (npm blocked `agentinbox` as too similar to existing `agent-inbox`)
- README install commands updated to use correct package name

### Added
- MIT LICENSE file
- Package metadata: repository, homepage, bugs URLs
- Additional keywords for npm discoverability

## [0.1.0] - 2026-06-13

### Added
- Initial release of the AgentInbox Node.js SDK
- Full TypeScript support with strict types
- Resources: inboxes, waits, messages, sessions, api-keys, webhooks, usage
- Automatic retry with exponential backoff
- Rate limit handling
- Custom error classes for each error type
- ESM and CommonJS dual-module support
- 13 unit tests with Vitest
- GitHub Actions CI/CD (build + test + publish to npm)
