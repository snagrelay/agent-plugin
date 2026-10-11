# AGENTS.md

This is a listing and distribution repo, not the SnagRelay product. It holds plugin manifests for Cursor, Claude Code and Codex, the official MCP Registry entry, and the skills they share. Keep changes small.

## Where things live

| Path | What | Edit by hand? |
|---|---|---|
| `skills/*/SKILL.md` | The six skills. Single source for every client | Yes |
| `rules/*.mdc` | Cursor rule | Yes |
| `mcp.json` | MCP server for Cursor | Yes (the only place) |
| `.mcp.json` | Copy of `mcp.json` for Claude and Codex | **No**, generated |
| `.cursor-plugin/`, `.claude-plugin/`, `.codex-plugin/`, `.agents/plugins/`, `server.json` | Manifests | Only fields other than `version` |
| `CHANGELOG.md` | Release notes | Yes |

## Rules

1. **Never write a dev URL.** The server is `https://mcp.snagrelay.com/v1`. Not `system.test`, not `localhost`. CI fails on it.
2. **Do not touch `version` in manifests.** Add a `## x.y.z` heading to `CHANGELOG.md`, then run `node scripts/sync-manifests.mjs x.y.z`.
3. **After editing `mcp.json`, run** `node scripts/sync-manifests.mjs`.
4. **Every skill needs frontmatter** with `name` (equal to its folder) and `description`. Every rule needs `description` and `alwaysApply`.
5. **Write skills for all clients.** No Cursor-only wording unless it is inside a per-client list. Do not mention features SnagRelay removed: AI duplicate detection, triage rules, care reports.
6. **`description` in `server.json` is capped at 100 characters** by the registry.
7. Do not add executable code, hooks, install scripts or stdio servers. The security story depends on this repo being data only (see `SECURITY.md`).

## Before you commit

```bash
node scripts/sync-manifests.mjs --check
node scripts/validate.mjs
claude plugin validate .        # if Claude Code is installed
```

## Release

1. Add a `## x.y.z` heading to `CHANGELOG.md`.
2. Run `node scripts/sync-manifests.mjs x.y.z`.
3. Merge to `main`, then tag `vx.y.z`. `release.yml` verifies the manifests match the tag, creates the GitHub Release and publishes `server.json` to the MCP Registry.
