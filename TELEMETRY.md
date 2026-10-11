# Data handling

What the SnagRelay MCP server sends to your agent, what it removes first, and what this repo itself collects.

## This repo

Nothing. It has no code that runs on your machine and sends no telemetry.

## What your agent receives

Only for the issue you name (or list, when you ask), and only for projects your account can already open:

| Data | Source |
|---|---|
| Title, description, status, ticket key, tracker link | The issue |
| The element the reporter pointed at: selector, comment, computed styles | SnagRelay widget |
| Repro steps | Captured page interactions |
| Console errors and logs with file and line | Widget |
| Network requests: method, URL, status, timing, **request and response bodies** | Widget, after redaction |
| Short session replay | Widget |
| Screenshot | Read on demand as the `screenshot` resource |
| Earlier similar issues and the PR that fixed them | SnagRelay history |
| Your account name, plan and project list | `whoami` |

Reporter email addresses are not placed in PR descriptions by the skills, and the agent is told never to paste raw logs, tokens or emails into a PR.

## What is removed before the agent sees it

The server redacts (replaces with `***`) secrets in everything it returns for an issue, including console entries and request and response headers, bodies and URLs:

- Values under keys that contain: `authorization`, `cookie`, `set-cookie`, `x-api-key`, `api_key`, `apikey`, `access_token`, `refresh_token`, `id_token`, `password`, `passwd`, `secret`, `token`, `client_secret`, `private_key`, `csrf`, `authenticity_token`.
- Query-string and form-encoded values under those same keys.
- Bearer tokens, JWTs (`eyJ…`), Stripe-style keys (`sk_live_…`, `rk_test_…`), and any run of 32 or more hex characters or 40 or more base64 characters.

Redaction is pattern-based. It catches common secrets, not every possible one. If your app puts sensitive data in an unusual field, treat it as visible to the agent and tell us.

## How long issues stay visible

The agent can read an issue only while it is inside your plan's history window (`history_days`): 7 days on Free, 90 days on Studio and the trial, unlimited on lifetime plans. This follows the same rule as the SnagRelay inbox.

## Writes

`mark_issue_resolved` records the resolution, PR URL, commit and branch on the issue, comments on the linked tracker, and may email the reporter (the response says whether it did). `report_progress` records which tool or file the agent is on. Nothing else is written.

## Your controls

- Use the read-only URL (`/v1/readonly`) to disable writes.
- Use a project URL (`/v1/{projectId}`) to limit one connection to one project.
- Revoke an API token in SnagRelay (Settings → API tokens), or remove the MCP server in your client to drop the OAuth connection.

## Questions

hello@snagrelay.com. Privacy policy: https://snagrelay.com/privacy
