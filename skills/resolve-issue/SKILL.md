---
name: resolve-issue
description: Resolve a SnagRelay issue by committing and opening a PR for the fix if that has not happened yet, then marking the issue resolved. Use when the user says to resolve or close an issue they already have a key for.
---

# Resolve an issue

Only for an issue the user named by key or URL. Asking to resolve it means the user has reviewed the fix and approves committing and opening the PR, so do not stop to ask for that.

1. Find what landed: a commit, a branch, or a pull request for this fix. Uncommitted edits do not count.
2. If nothing has landed, do the `open-pr` steps first: create or rename to `feature/{ticket-key}-{summary}` (base `develop` if it exists), commit, push, and open the PR with the title and body format from that skill.
   - If the repo has no remote, or `gh` is missing or not signed in, commit on the branch, skip the PR, and continue with `commit_sha` and `branch` only. Tell the user the PR was not opened and why.
   - If the working tree contains changes unrelated to this fix, commit only the files you changed for it and mention what you left out.
3. Call `mark_issue_resolved` with the same `issue_key` used for `get_issue_context`. Pass `pr_url` whenever there is one, and `commit_sha` and `branch` when known.
4. Optionally pass `resolution_note`: one or two plain sentences for the person who reported the bug, with no code or internal details.
5. Read the response and report it as it is. `reporter_email` says whether a "fixed" email will be sent (`queued`, `sent`, `no_reporter_email`, `disabled_for_project`), so do not claim an email went out unless it says so. `updated_fields` lists what changed.
6. Do not move cards on Jira, Linear, Azure, GitHub or GitLab. SnagRelay posts a comment instead. Trello moves a card only if a Done list is mapped.

Never force-push or push to the default branch.
