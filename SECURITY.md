# Security

## Reporting a vulnerability

Email **developer@snagrelay.com** with the subject "Security". Please do not open a public issue for a vulnerability.

Include what you found, how to reproduce it, and what you think the impact is. We acknowledge reports within 3 business days and aim to fix confirmed issues within 30 days. We will credit you if you want.

## Scope

In scope:

- This repo: manifests, skills, the rule, release workflows.
- The MCP server at `https://mcp.snagrelay.com` and its OAuth endpoints.

Out of scope: social engineering, denial of service, third-party services, findings that need a rooted device or a stolen session.

## What this repo cannot do

It contains no executable code that runs on your machine. The plugin is data (JSON manifests, markdown skills and a rule) plus a remote MCP URL. There are no install scripts, no `npx` package, no stdio server and no hooks. The only scripts are the repo's own release and validation scripts in `scripts/`, which run in CI.

## How the connection is secured

- **OAuth 2.1 with PKCE** and Dynamic Client Registration. Clients never see your password and there is no long-lived token to paste.
- **Same permissions as the web app.** The MCP server mirrors your SnagRelay role. It cannot reach a project you are not a member of.
- **Read-only URLs.** `/v1/readonly` removes and blocks the write tools. See the README.
- **Project-scoped URLs.** `/v1/{projectId}` limits a connection to one project.
- **Redaction.** Secrets are stripped from request and response bodies before the agent sees them. See [TELEMETRY.md](TELEMETRY.md).
- **Write tools are limited.** The only tools that change anything are `report_progress` (a progress heartbeat) and `mark_issue_resolved`. Neither deletes data. The agent is told not to resolve an issue before you have reviewed the fix.
- **Rate limiting** on the MCP endpoints and on client registration.

## Secrets

Never commit a token, key or password here. CI fails on dev URLs, and registry publishing uses a key held only in GitHub Actions secrets.
