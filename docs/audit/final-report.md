# Final Engineering Report

Release recommendation: **READY FOR PR REVIEW**.

Branch: `refactor/performance-clean-architecture`  
Scope: Sprint 0 through Sprint 5  
Deployment model: committed static export served by GitHub Pages

## Executive summary

The portfolio refactor is ready for pull-request review. The final branch has a canonical project data model, a generated route/SEO inventory, localized progressive Work rendering, responsive image delivery checks, bounded/lifecycle-aware portfolio effects, structural accessibility and SEO validation, security/hygiene scans, practical artifact budgets, deterministic supported generators, a representative Chrome gate, and a minimal CI workflow.

The recommendation is deliberately “PR review,” not “production merge.” Reviewers still own content decisions, deployment approval, and the protected-branch merge.

## Original state

The baseline described a large static export with repeated project markup, mixed image delivery, client/runtime effect concerns, incomplete route metadata consistency, and no single engineering verification command. The early audit also documented high media volume and historical capture/migration utilities with unclear ownership.

Sprint 0 established the handoff and baseline. Sprint 1 added image delivery normalization and pilot optimized variants. Sprint 2 inventoried and gated runtime effects. Sprint 3 centralized project data and rendered the progressive Work archive. Sprint 4 hardened route-specific SEO and accessibility semantics.

## Final architecture

The final architecture is documented in [final-architecture-inventory.md](final-architecture-inventory.md). In brief, `data/projects.json` is the canonical project record set, `data/routes.json` is the generated route/locale inventory, and deterministic scripts materialize Work HTML/payloads, route metadata, JSON-LD, sitemap, and robots. The export remains static; JavaScript is progressive enhancement rather than the source of route or project truth.

Final inventory facts:

- 43 canonical projects across five categories.
- 186 route records, 184 indexable and two English utility-error records.
- 184 indexable routes split evenly between 92 EN and 92 AR records.
- 187 HTML files in the static-reference gate, including fallback/error files outside the route inventory.
- 1,474 payload text files checked by the image-delivery gate.
- 41 projects with live URLs and 43 localized case-study records per language.
- Work starts with 12 cards and progressively reveals all 43 projects per locale.

## Sprint outcomes

### Sprint 0 — baseline and handoff

Completed. Established the branch, baseline audit, engineering handoff, and scope boundaries without touching `main`.

### Sprint 1 — image delivery

Completed. Added responsive image delivery normalization, committed pilot optimized variants/manifests, and validation for static HTML and payload image references.

### Sprint 2 — runtime effects

Completed. Inventory and invariants now cover effect inclusion, reduced-motion policy, lifecycle cleanup, DOM scope, CSS behavior, and static route coverage.

### Sprint 3 — Work architecture

Completed. Centralized the 43-project data model and replaced duplicated Work archive markup with a localized, 12-card initial shell plus progressive filtering/Load More enhancement and no-JavaScript links.

### Sprint 4 — SEO and accessibility

Completed. Applied route-specific titles/descriptions, canonical and hreflang links, Open Graph/Twitter metadata, JSON-LD, robots/sitemap output, skip links, labelled navigation, mobile-menu relationships, heading corrections, image/button checks, and focus-visible styling.

### Sprint 5 — architecture, CI, and release readiness

Completed. Added the final architecture and script inventories, one supported `npm run verify` pipeline, generator idempotency checks, security/hygiene and practical budget gates, cross-platform browser discovery, GitHub Actions with minimal permissions, generated-asset policy, branch diff audit, workflow/rollback/release/PR documentation, and this final report.

## Before versus after

| Area | Before refactor | Final branch |
| --- | --- | --- |
| Project truth | Repeated exported Work markup | 43-record `data/projects.json` with schema validation |
| Work behavior | Duplicated static archive markup | 12-card EN/AR shell, progressive 43-project data, filters, Load More, no-JS routes |
| Route truth | Route metadata reviewed manually | 186-record generated inventory; 184 indexable SEO gate |
| SEO | Inconsistent/static export metadata risk | Route-specific canonical, OG, hreflang, JSON-LD, sitemap and robots checks |
| Accessibility | Mixed landmarks, headings and control relationships | Skip/main landmarks, labelled nav, mobile-menu relationships, heading/alt/button/focus checks |
| Images | Mixed original/preload delivery | Normalized responsive delivery with manifests, payload checks, and pilot variants |
| Runtime | Effects lacked one invariant policy | Reduced-motion, lifecycle, scope, CSS, inclusion and size checks |
| Validation | Separate ad hoc commands | `npm run check` and release/CI `npm run verify` |
| Release safety | No repository workflow | PR/push quality workflow, security/hygiene, idempotency, rollback and release docs |

The table describes engineering controls added in this branch; it does not claim measured Core Web Vitals or a laboratory accessibility score.

## Dependency and hygiene audit

`package.json` declares no dependencies and requires Node `>=20`; the committed `package-lock.json` is lockfile v3 with no dependency entries. The workflow therefore uses `npm ci --ignore-scripts --no-audit --no-fund`. No broad dependency upgrade was introduced.

The ignore rules cover local caches, builds, coverage, logs, browser profiles, traces, HAR files, and test results. Committed static HTML, route/project data, sitemap, robots, optimized manifests, and historical screenshots remain release inputs. No tracked local OS paths or credential-shaped secrets were found in production text output; loopback references are limited to development browser/server tooling, and framework vendor output is excluded from the targeted production hygiene gate.

## Known risks and deferred work

- Large historical media remains in the export; no destructive deletion was performed.
- Screenshot/capture and one-off repair scripts remain and are classified rather than removed.
- No real-user or lab Core Web Vitals are reported.
- No full automated WCAG/contrast conformance claim is reported.
- The static export has no server-side fallback for runtime or external-link failures.
- The package has no dependency packages today; future dependency additions must update the lockfile and remain narrowly scoped.

## Rollback and release

Use [rollback.md](../operations/rollback.md) for a non-destructive revert procedure and [release-checklist.md](../operations/release-checklist.md) before deployment. The suggested review text is in [pr-draft.md](../operations/pr-draft.md).

## Final decision

**READY FOR PR REVIEW.** All requested repository-local validation and documentation work is complete on the refactor branch. No PR was created and `main` was not merged or modified.
