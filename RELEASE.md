# Release checks

Use Node.js 26.13.0 LTS (`mise install` installs the configured release; `mise exec -- npm run release:check` runs checks with it). The package engine accepts compatible Node.js 26 releases from 26.13.0 onward. Local tooling and both GitHub Actions validation and build jobs pin 26.13.0.

Verified on October 30, 2026 against the official [release index](https://nodejs.org/dist/index.json) and [26.13.0 release notes](https://nodejs.org/en/blog/release/v26.13.0): Node.js 26.13.0 is the latest LTS release, named Lithium. Node.js 26 entered LTS on October 28, 2026 and is supported through April 2029; see the official [release schedule](https://github.com/nodejs/Release/blob/main/schedule.json). Official Linux binaries require `libatomic`, which may need to be installed separately on some distributions.

Scripts and Node tests run TypeScript directly using Node's built-in type stripping; no separate script runner is needed. Astro components remain `.astro` files.

Playwright is pinned to 1.60.0 for browser installation compatibility. Earlier releases can hang extracting downloaded Chromium archives on newer Node.js releases; see the [upstream report](https://github.com/microsoft/playwright/issues/41000). Install the matching browser with `npx playwright install chromium` (CI adds `--with-deps` for system libraries) after `npm ci`.

Run `npm run release:check` before publishing from the repository root. It runs strict type checks, the Astro build, the static contract suite, public external-link checks, Chromium checks at 1280x800, 768x1024, and 390x844, and Lighthouse audits with minimum scores of 90 performance and 95 for accessibility, best practices, and SEO. LinkedIn returns its non-standard `999` status to automated clients; the check reports that response as bot protection while the exact public profile URL remains covered by the static and browser checks.

`npm run check` checks Astro components and application TypeScript, then checks scripts, tests, and configuration with Node module resolution. Both TypeScript configurations disable JavaScript inputs and require erasable syntax compatible with native type stripping. Node modules use explicit `.ts` extensions for local imports. `npm run check:astro` remains available for checking only the Astro/application side.

After GitHub Pages reports a successful deployment, run `npm run verify:production`. This checks the HTTPS `/my-portfolio/` page, its canonical URL, and every deployed local asset.

## Accessibility review

The homepage follows [ADR 0002](docs/adr/0002-quiet-index-with-lateral-navigation.md) and the [portfolio navigation guide](docs/portfolio-navigation.md).

The release check and source review cover:

- A skip link and one `main` landmark per page, labeled homepage section navigation, and labeled primary navigation plus a footer landmark on the case-study pages.
- One `h1` per page and a heading hierarchy without skipped levels.
- Descriptive alternatives and intrinsic dimensions for every content image.
- Visible `:focus-visible` treatment, keyboard access to the always-visible navigation, active-panel focus, and inactive-panel `inert` state.
- Homepage cover/push navigation at every width with internally scrollable panels; without JavaScript, all panels remain readable vertically.
- Text labels for navigation, contact, resume, and external-profile actions.
- Text and interactive colors with WCAG AA contrast against their backgrounds.
- `prefers-reduced-motion` disabling transitions, including panel and menu motion.
- No horizontal overflow at the representative desktop, tablet, and mobile viewports.

The site uses no form, tracking script, remote font request, icon library, SMTP client, or other third-party runtime resource. Fraunces, Inter, and IBM Plex Mono are served from the repository. Private and unpublished project repositories are described as unavailable rather than linked.

## GitHub Pages

The `.github/workflows/deploy.yml` workflow runs `npm run release:check` on pull requests targeting `master`, pushes to `master`, and manual runs. It installs Node.js 26.13.0 and Chromium with its system dependencies before validation, and uses the same Node.js release for the Astro build. All release checks must pass before the build and deployment jobs can run. Pull requests and manual runs on other branches validate without publishing; pushes and manual runs on `master` publish Astro's `dist/` output. Only the deployment job receives Pages and OIDC write permissions.

In GitHub Pages settings, select **GitHub Actions** as the build and deployment source. The public URL is `https://ricardoiarced.github.io/my-portfolio/`, and GitHub Pages must keep HTTPS enforcement enabled.
