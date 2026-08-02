# Rollback Runbook

Rollback is a controlled Git operation. Do not reset or rewrite `main` as part of a release rollback.

## Before merge

If review identifies a problem, stop the PR and keep the refactor branch available for diagnosis. Revert individual commits with `git revert <commit>` on a new repair branch, or close the review request and push a corrective commit. Do not use `git reset --hard` to discard the audit trail.

Sprint commits are independently revertible. The final Sprint 5 hardening should be reverted in dependency order if needed: workflow/tooling first, then documentation/handoff, then generated/static artifacts only when the corresponding source change is also reverted.

## After merge or deployment

1. Identify the first deployed commit with the regression.
2. Create a revert commit for that commit (or the smallest safe commit range).
3. Run `npm run verify` on the revert branch.
4. Open the repository’s normal emergency review and merge through protected-branch controls.
5. Confirm GitHub Pages serves the prior route, metadata, Work behavior, and language output.

For a Pages deployment issue, the Git commit is the source of truth: restore the last known-good commit through a revert PR. Do not delete generated assets or historical screenshots to make the rollback smaller.

## Verification after rollback

```powershell
git status --short
npm run verify
git diff --check
```

Manually revisit `/`, `/work/`, `/ar/`, `/ar/work/`, one EN/AR case-study pair, `sitemap.xml`, and `robots.txt`. Record the affected commit, symptoms, rollback commit, verification result, and follow-up issue in the incident/release notes.
