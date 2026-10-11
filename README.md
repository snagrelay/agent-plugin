# SnagRelay for coding agents

> Your users find the bugs. Your agent fixes them. Give Cursor, Claude Code or Codex a ticket key and it reads the evidence a human debugger would open: the broken element, console errors with file and line, failing requests **with their request and response bodies**, repro steps and a short replay.

This repo is the **listing and distribution repo** for the SnagRelay MCP server. It holds the plugin manifests for each agent platform, the shared skills and the registry entry. The MCP server itself is hosted by SnagRelay at `https://mcp.snagrelay.com/v1`.

## Connect

Sign-in is OAuth. A SnagRelay page opens in your browser, you click **Allow**, and there is no token to copy.

| Client | Install |
|---|---|
| **Cursor** | Open **Customize → Marketplace**, search **SnagRelay**, install, then click **Needs authentication** on the `snagrelay` MCP server |
| **Claude Code** | `claude plugin marketplace add snagrelay/agent-plugin` then `claude plugin install snagrelay@snagrelay`. Run `/mcp` and authenticate `snagrelay` |
| **Codex** | `codex plugin marketplace add snagrelay/agent-plugin` then `codex plugin add snagrelay@snagrelay`. Sign in with `codex mcp login snagrelay` |
| **Lovable** | Settings → Connectors → search **SnagRelay**, or add a custom MCP server with the URL below |
| **Bolt** | Add a custom remote MCP connector with the URL below |
| **Replit** | Add a custom MCP server with the URL below |
| **Anything else** | Point any Streamable HTTP MCP client at `https://mcp.snagrelay.com/v1` |

> Lovable, Bolt and Replit guides are being written; the custom-connector route works today.

For CI, scripts and other headless clients, create an API token in SnagRelay (Settings → API tokens) and send `Authorization: Bearer <token>` to the same URL.

## Which URL?

All four share one server and one sign-in. Pick the narrowest one that fits.

| URL | Use it when |
|---|---|
| `https://mcp.snagrelay.com/v1` | You work across projects. The default |
| `https://mcp.snagrelay.com/v1/readonly` | You want the agent to read issues but never write. The write tools (`report_progress`, `mark_issue_resolved`) are removed and blocked. Good for security-conscious teams and shared machines |
| `https://mcp.snagrelay.com/v1/{projectId}` | This repo belongs to one SnagRelay project. Hard-scoped, so the agent cannot see other projects |
| `https://mcp.snagrelay.com/v1/{projectId}/readonly` | Both of the above |

`{projectId}` is the number from `whoami`, or from the project's URL in SnagRelay.

## Tools

| Tool | Access | What it does |
|---|---|---|
| `get_issue_context` | read | Full context of one issue by key: the element, repro steps, console errors with file and line, requests with bodies, and a screenshot resource link |
| `get_issue_payload` | read | One full request or response body, or one console entry, by the index from `get_issue_context` |
| `get_related_history` | read | Earlier resolved issues on the same screen or endpoint, with the PR that fixed them |
| `find_issues` | read | List or search issues when you have no key |
| `whoami` | read | Signed-in account, plan and accessible projects |
| `report_progress` | **write** | Tells SnagRelay which file the agent is editing |
| `mark_issue_resolved` | **write** | Marks an issue resolved with the PR, commit and branch. Optionally emails the reporter |

One resource: `screenshot`, the issue's screenshot, read with `resources/read`.

Every tool carries MCP annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`). None is destructive. The agent is instructed not to call `mark_issue_resolved` before you have reviewed the fix.

## Usage

```
fix PROJ-123
-> get_issue_context("PROJ-123")
-> reads the failing request and its response body, the console error with file and line, the repro steps
-> get_related_history: has this broken before, and what fixed it?
-> proposes a targeted fix on feature/PROJ-123-<summary>
```

## Skills

Six skills, written once in `skills/` and used by every client.

| Skill | What it does |
|---|---|
| `fix-issue` | Load context and fix a SnagRelay issue on a branch, then stop for your review |
| `open-pr` | Branch `feature/{key}-{summary}`, PR title `[{key}] {type}: {description}`, full description |
| `resolve-issue` | Commit and open a PR if needed, then mark the issue resolved |
| `triage` | List open issues so you can pick one |
| `connect` | Diagnose a broken MCP connection |
| `scope` | When the agent may (and may not) call SnagRelay |

Cursor also gets `rules/snagrelay-context.mdc`, which tells the agent to load an issue's context before proposing a fix.

Claude Code namespaces plugin skills: run `/snagrelay:fix-issue PROJ-123`. In Cursor and Codex, say `fix PROJ-123` or use `/fix-issue`.

## Data and privacy

The agent receives what your users' widget captured on the page: element, console, network, replay and screenshot. Secrets are stripped on the server before anything reaches the agent: authorization and cookie headers, API keys, tokens, passwords, CSRF values, secret-looking query and form parameters, bearer tokens, JWTs and long hex or base64 strings. Issues are visible to the agent only as long as your plan's history window (`history_days`) allows. See [TELEMETRY.md](TELEMETRY.md) for the full list and [SECURITY.md](SECURITY.md) to report a vulnerability.

This repo contains no code that runs on your machine: only manifests, skills, a rule and a remote MCP URL.

## Requirements

- A SnagRelay account. The free plan includes the MCP server, network bodies and 1 project. See [pricing](https://snagrelay.com/pricing)
- Cursor, Claude Code, Codex, or any MCP client that supports Streamable HTTP with OAuth

## Links

[Website](https://snagrelay.com/?ref=github) · [Docs](https://docs.snagrelay.com/docs/ai-features/ai-agent-mcp) · [Pricing](https://snagrelay.com/pricing) · [Support](mailto:hello@snagrelay.com) · [Privacy](https://snagrelay.com/privacy) · [Terms](https://snagrelay.com/terms)

## Contributing

Edit `skills/` and `rules/`, never the manifests by hand: see [AGENTS.md](AGENTS.md). MIT licensed.
