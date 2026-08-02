# Release Checklist

## Source and branch

- [ ] Work is on `refactor/performance-clean-architecture` or the approved development branch.
- [ ] `main` has not been reset, rewritten, merged locally, or changed outside the review process.
- [ ] `git status --short` contains only intended Sprint 5 changes.
- [ ] `git diff --check` passes.
- [ ] No route/project deletion or suspicious binary change is unexplained.

## Data and generated output

- [ ] `data/projects.json` is the reviewed project source of truth.
- [ ] `data/routes.json` has 186 records and 184 indexable records.
- [ ] Work has 12 initial cards and 43 no-JavaScript localized routes.
- [ ] `sitemap.xml` has 184 canonical URLs and `robots.txt` has the intended utility exclusions.
- [ ] Optimized image manifests and variants are present for the projects that claim them.

## Quality gates

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

- [ ] Project-data, static-reference, image, runtime, Work, SEO/accessibility, security/hygiene, budget, browser, idempotency, and diff checks pass.
- [ ] Browser smoke covers EN and AR homepage/Work routes and representative case studies.
- [ ] Manual keyboard pass reaches the skip link, navigation, Work filters, Load More, language switch, and case-study links.
- [ ] Browser console has no unexplained errors.
- [ ] No local machine paths, loopback URLs, secrets, `javascript:` URLs, unsafe `_blank` links, or encoding damage are present in production output.

## Review and deployment

- [ ] [final-report.md](../audit/final-report.md) is current and recommends the actual release state.
- [ ] [pr-draft.md](pr-draft.md) is used for the review request; no PR is created by this checklist.
- [ ] Reviewers understand the minimal lockfile/no-dependency state and deferred CWV/contrast work.
- [ ] Deployment completes through the normal protected-branch process.
- [ ] Post-deployment smoke checks pass for EN/AR home, Work, one case-study pair, sitemap, and robots.
- [ ] Rollback owner and prior known-good commit are recorded.
