---
name: fix-issue
description: Fix a captured SnagRelay bug when the user already has a tracker key.
---

# Fix a SnagRelay issue

Only if the user gave a tracker key, URL, or SnagRelay id (PROJ-123, AB#456, #88, a Trello/Jira/Linear/GitHub URL). A connected MCP or a capture widget is not enough.

1. Call `get_issue_context` with that `issue_key` and nothing else first.
2. Do not call `find_issues` or `whoami` first.
3. Default `response_format` is concise. For a full request or response body, call `get_issue_payload` with the `index` from `network`.
4. Work on a local branch named `feature/{ticket-key}-{summary}` (for example `feature/FDF-7-promo-code-nan-total`: key as given, then a short lowercase kebab-case summary of at most 5 words). Create it from `develop` if the repo has one, otherwise from the default branch. If you are already on a branch for this ticket that follows this format, keep it. Implement the fix. Do not git commit.
5. Stop for developer review. Do not push, do not create a pull request, do not call `mark_issue_resolved`, and do not use GitKraken / GitHub / GitLab or any other MCP.
6. When the change is done, only propose a PR title and description in chat:
   - Title: `[{ticket-key}] {semantic}: {short description}` (`feat`, `fix`, `chore`, `refactor`, …)
   - Body: a self-contained long description of what changed and why. Do not replace the description with a ticket link.
