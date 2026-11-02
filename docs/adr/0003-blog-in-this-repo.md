---
status: accepted
---

# ADR 0003 — The blog lives in this repository

Decision: the DSA learning journal ships inside this repo at `/my-portfolio/blog/`, served by the same GitHub Pages deployment. One site, one pipeline.

Why: Astro is already the content engine, and the Pages workflow, release checks, and domain already exist. A separate blog repository would duplicate the deploy pipeline and split the portfolio's evidence — a recruiter who reads a case study should be one click from the thinking behind it. Hosting both under one domain also keeps the base-path, canonical-URL, and verification story single-tracked (`RELEASE.md`).

Constraints carried into the implementation (tracked in issue #23):

- Posts are content collections with a frontmatter schema, so a malformed post fails `astro build` instead of shipping.
- Post code snippets are checked-in TypeScript files under the Node test suite, imported into posts for display. Fenced copy-paste blocks rot silently; tested files cannot.
- No third-party runtime resources (RELEASE.md). Syntax highlighting is Shiki at build time.
- Every post page passes the release gate — `release:check`, including the Lighthouse minimums (90 performance, 95 accessibility / best practices / SEO) and the internal-link check added alongside this decision: `scripts/check-internal-links.ts` walks built HTML and validates every scheme-free href against `dist/`, fragment anchors included, modeling the legacy `#featured-projects` alias from `sectionAliases`.

Trade-offs: prose commits interleave with code history (accepted; conventional commit prefixes keep the log readable). The quiet index keeps its four panels (ADR 0002) — the blog's entry point must be found without becoming a fifth panel.

Consequences: an authoring doc (frontmatter contract, snippet policy, draft workflow) lands with the blog, and `AGENTS.md` points agents at it, so future runs author posts against the same rules the build enforces.
