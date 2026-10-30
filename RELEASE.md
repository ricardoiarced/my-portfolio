# Release checks

Run `npm run release:check` before publishing from the repository root. It runs the static contract suite, JavaScript syntax checks, public external-link checks, Chromium checks at 1280x800, 768x1024, and 390x844, and Lighthouse audits with minimum scores of 90 performance and 95 for accessibility, best practices, and SEO. LinkedIn returns its non-standard `999` status to automated clients; the check reports that response as bot protection while the exact public profile URL remains covered by the static and browser checks.

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

The `.github/workflows/deploy.yml` workflow runs `npm run release:check` on pull requests targeting `master`, pushes to `master`, and manual runs. It installs Node.js 22 and Chromium with its system dependencies before validation. All release checks must pass before the build and deployment jobs can run. Pull requests and manual runs on other branches validate without publishing; pushes and manual runs on `master` publish Astro's `dist/` output. Only the deployment job receives Pages and OIDC write permissions.

In GitHub Pages settings, select **GitHub Actions** as the build and deployment source. The public URL is `https://ricardoiarced.github.io/my-portfolio/`, and GitHub Pages must keep HTTPS enforcement enabled.
