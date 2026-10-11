# Changelog

## 1.0.0

- First release of the multi-agent repo. One set of skills and one remote MCP URL (`https://mcp.snagrelay.com/v1`) for Cursor, Claude Code, Codex and the official MCP Registry (`com.snagrelay/snagrelay`).
- Manifests: `.cursor-plugin/`, `.claude-plugin/` (plugin and marketplace), `.codex-plugin/`, `.agents/plugins/marketplace.json`, `server.json`.
- Six skills (connect, fix-issue, open-pr, resolve-issue, scope, triage) and the SnagRelay context rule. The `connect` skill now covers sign-in for Cursor, Claude Code and Codex.
- Sign-in is OAuth. No token to copy.
