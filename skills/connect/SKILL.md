---
name: connect
description: Diagnose a broken SnagRelay MCP connection.
---

# Connect

1. Call `whoami`.
2. If it fails, tell the user exactly what the error data said:
   - Not a member → ask a project owner to invite them as a **developer** at `/users/invite`.
   - Plan → ask the project owner to upgrade at `/billing`.
   - Invalid/expired token or "needs authentication" → the user must sign in again through the client. The server is `https://mcp.snagrelay.com/v1`, one per signed-in user:
     - **Cursor:** run `mcp_auth` for the `snagrelay` server, or click **Needs authentication** on it.
     - **Claude Code:** run `/mcp`, pick `snagrelay`, and choose **Authenticate**.
     - **Codex:** run `codex mcp login snagrelay`.
     - **Any other client:** remove and re-add the server URL, or send `Authorization: Bearer <API token>` from SnagRelay Settings → API tokens.

     A browser page on snagrelay.com opens; the user clicks **Allow**.
   - To target a specific project, pass `project_id` (from `whoami`'s project list) to the tool, or connect to `https://mcp.snagrelay.com/v1/{projectId}`. Ignore any old `.snagrelay.json` file; it belongs to the retired VS Code extension and may name a project the user can't access.
3. MCP mirrors existing SnagRelay permissions. It does not grant access to anything they cannot already see.
