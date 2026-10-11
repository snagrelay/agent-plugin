---
name: open-pr
description: Create the branch, commit and pull request for a fix to a SnagRelay issue, named from its ticket key. Use when the user asks to open a PR or branch for an issue they have a key for.
---

# Open a pull request for an issue

Only for an issue the user named by key or URL, after the fix is written. The user asking for this skill is the go-ahead to create the branch, commit and PR. Do not do it unprompted.

## Naming

- `{ticket-key}` is the key exactly as the user gave it (`FDF-7`, `PROJ-123`). For a bare GitHub issue number use `#88` in the PR title and `88` in the branch.
- `{summary}` is a short kebab-case summary of the fix, lowercase, ASCII only, at most 5 words.
- `{semantic}` is a Conventional Commits type: `fix` for a bug fix (the default for SnagRelay issues), `feat`, `refactor`, `perf`, `test`, `docs` or `chore` when that is truer.

| Part | Format | Example |
|---|---|---|
| Branch | `feature/{ticket-key}-{summary}` | `feature/FDF-7-promo-code-nan-total` |
| PR title | `[{ticket-key}] {semantic}: {short description}` | `[FDF-7] fix: show an error when a promo code fails` |
| PR body | `{long description}` | see below |

Keep the PR title under 72 characters. The short description is imperative and lowercase after the colon, with no trailing period.

## Steps

1. Call `get_issue_context` with the key if you have not already, so the title and description match the real report.
2. Check `git status` and the current branch.
   - Base branch: `develop` if the repo has one (gitflow), otherwise the default branch. The PR targets the base branch.
   - On the base branch or an unrelated branch: create `feature/{ticket-key}-{summary}` from the current commit.
   - On a branch already in the `feature/{ticket-key}-{summary}` format: keep it.
   - On a branch for this ticket in another format (for example `fdf-7`) that has not been pushed: rename it with `git branch -m feature/{ticket-key}-{summary}`. If it was already pushed, keep it and say so.
3. Commit the fix if it is uncommitted. Use `{semantic}: {short description} ({ticket-key})` as the message, and do not add `Co-authored-by` or generated-by trailers.
4. Push the branch and open the PR against the base branch with `gh pr create --base <base>` (or the repo's usual tool). If `gh` is missing or unauthenticated, stop and tell the user the exact command to run instead.
5. Write the PR body (long description) in this shape:
   - **What was wrong**: the user-visible symptom, in plain words, taken from the report.
   - **Cause**: the root cause in the code, with the file and function.
   - **Fix**: what changed and why this approach.
   - **How to verify**: the steps from the report, and what should happen now.
   - **SnagRelay**: the ticket key, and anything from `get_related_history` worth knowing.
6. Give the user the PR URL. Do not mark the issue resolved here. When the user wants it resolved, `/resolve-issue` does this whole flow and then marks it.

## Do not

- Force-push, or push to the default branch.
- Open a PR for uncommitted work the user has not asked you to commit.
- Paste raw console logs, tokens or reporter email addresses into the PR body.
