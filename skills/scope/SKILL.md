---
name: scope
description: Call SnagRelay MCP only when the user named SnagRelay, a tracker key, a snag URL, or asked to list SnagRelay issues. A connected MCP or capture widget does not mean this repo is a SnagRelay project.
---

# When an agent may call SnagRelay MCP

## Hard rule

A SnagRelay MCP appearing in the tool list does **not** mean the current workspace is a SnagRelay project, or that the user's message is a SnagRelay issue.

MCP servers are often **user-global** (`~/.cursor/mcp.json`, `~/.claude.json`, `~/.codex/config.toml`, editor extensions). They are visible in every chat. Project attachment only exists if this repo has its own MCP config (`.cursor/mcp.json`, `.mcp.json`, `.vscode/mcp.json`) or the user names SnagRelay / a ticket key / a snag URL.

**Widget ≠ MCP.** `react-native-snagrelay` / a capture widget in the app only means the product can *submit* snags. It is not a licence to `find_issues` / `get_issue_context`.

## Call SnagRelay tools only if at least one is true

1. The user gave a SnagRelay / tracker key, snag URL, or `snagrelay_id`.
2. The user explicitly asked to look up, list, or resolve **SnagRelay** issues.
3. The user said they captured this in SnagRelay (or pasted a snag link).

Otherwise: do not call `find_issues`, `get_issue_context`, `get_issue_payload`, `get_related_history`, or `mark_issue_resolved`.

## Do not treat these as a snag

- A QA / product bug written in chat
- “Looks like a captured note”
- No Jira/Linear key, so “list snags instead”
- The MCP is connected, so “inspect the matching server before guessing”
- The repo has a SnagRelay SDK / widget

Those are ordinary product bugs. Work in the codebase.

## If you did call `find_issues` and the hits are the wrong product/domain

Stop. You are on a **user-global MCP bound to another SnagRelay project**. Do not keep paging. Do not use those issues. Continue in the current repo (or ask which SnagRelay project to use).

## `find_issues` vs `get_issue_context`

- User gave a key / URL → **only** `get_issue_context`. Never list first.
- User asked to list SnagRelay issues, no key → `find_issues`.
- User asked to fix a product bug and gave no snag key → **neither**.
