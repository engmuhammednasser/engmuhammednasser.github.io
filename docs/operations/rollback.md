# Rollback Runbook

Rollback restores a reviewed production state. Do not reset or rewrite `main` as
part of a release rollback.

Record the current Pages publishing source as well as the deployed SHA. Source
rollback and content rollback are different operations; neither is authorized
merely by this runbook. The phase-one artifact work preserves the root export so
branch publishing remains an available fallback.

## Before merge

If review identifies a problem, stop the PR and keep the refactor branch available for diagnosis. Revert individual commits with `git revert <commit>` on a new repair branch, or close the review request and push a corrective commit. Do not use `git reset --hard` to discard the audit trail.

Sprint commits are independently revertible. The final Sprint 5 hardening should be reverted in dependency order if needed: workflow/tooling first, then documentation/handoff, then generated/static artifacts only when the corresponding source change is also reverted.

## After merge or deployment

1. Identify the first deployed commit with the regression.
2. Create a revert commit for that commit (or the smallest safe commit range).
3. Install locked dependencies, run source verification and packaging fixtures,
   build a fresh artifact, and verify that artifact using the commands below.
4. Open the repository’s normal emergency review and merge through protected-branch controls.
5. Confirm GitHub Pages serves the prior route, metadata, Work behavior, and language output.

For a content or generated-output defect, restore the last known-good content
through a revert PR. Do not delete generated assets or historical screenshots to
make the rollback smaller. A publishing-source transition failure also has the
fallback below.

## Initial artifact-transition failure

If the new publishing path fails, explicitly authorize a source-mode rollback and
wait for active artifact deployments to finish, or cancel them with authorization.
A run that already passed its mode check must not race the fallback deployment.
Then open **Settings → Pages → Build and deployment → Source**. Select **Deploy from a
branch**, **main**, **/(root)**, then save. Preserve HTTPS/custom-domain settings and
the `github-pages` environment's `main` restriction. Trigger or rerun the legacy
Pages build if needed and wait for a successful deployment of the intended commit.

The artifact workflow reads the mode and skips upload/deployment when it becomes
`legacy`; do not remove its guard or add a competing deployment workflow. Changing
the setting alone is not proof that a successful rollback has been served.

This fallback republishes the root export, including development files excluded by
the artifact. Record that temporary exposure and verify runtime/route behavior.
Keep the prepared package and source files available for diagnosis, fix the cause
through review, and repeat the explicitly authorized transition in
[pages-artifact.md](pages-artifact.md) when ready.

## Verification after rollback

```powershell
git status --short
npm ci
npm run verify
npm run test:site-package
npm run build:site
npm run verify:site
npm run check:site
git diff --check
```

Manually revisit `/`, `/work/`, `/ar/`, `/ar/work/`, one EN/AR case-study pair,
`sitemap.xml`, and `robots.txt`. Check required CSS/fonts, menu/Work interactions,
and preview/full-view media. In artifact mode, verify representative development
URLs return HTTP 404; in legacy fallback, record that exclusions are inactive.
Record the affected commit, symptoms, publishing source, rollback commit or setting
change, deployed SHA, verification result, and follow-up issue in release notes.
