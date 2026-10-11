---
name: triage
description: List captured SnagRelay issues only when the user asked to list, triage, or browse SnagRelay issues and did not give a tracker key.
---

# Triage SnagRelay issues

Call `find_issues` only when the user asked to list, triage, or browse **SnagRelay** issues and did not give a key.

Do **not** call it because:

- they described a product bug in chat
- this MCP is connected (it may be user-global and bound to another project)
- the repo has a SnagRelay widget / SDK

If they gave a key or snag URL, use `fix-issue` instead (`get_issue_context` only).

When listing is actually requested:

1. Call `find_issues` (status `open`, page with `cursor` if needed).
2. If `assignee=me` returns an empty list with a message, show that message — do not guess.
3. If the hits are a different product or domain than this repo, stop. Do not page. You are on a user-global MCP bound to another project.
4. Pick an issue, then call `get_issue_context` with its `issue_key`.
5. Use `get_related_history` if a previous fix would help.
