# Release checks

Run `npm run release:check` before publishing from the repository root. It runs the static contract suite, JavaScript syntax checks, public external-link checks, Chromium checks at 1280x800, 768x1024, and 390x844, and Lighthouse audits with minimum scores of 90 performance and 95 for accessibility, best practices, and SEO. LinkedIn returns its non-standard `999` status to automated clients; the check reports that response as bot protection while the exact public profile URL remains covered by the static and browser checks.

After GitHub Pages reports a successful deployment, run `npm run verify:production`. This checks the HTTPS `/my-portfolio/` page, its canonical URL, and every deployed local asset.

## Accessibility review

The release check and source review cover:

- A skip link, one `main` landmark, labeled primary navigation, and a footer landmark.
- One `h1` and a heading hierarchy without skipped levels.
- Descriptive alternatives and intrinsic dimensions for every content image.
- Visible `:focus-visible` treatment and keyboard access to the always-visible responsive navigation.
- Text labels for navigation, contact, resume, and external-profile actions.
- Text and interactive colors with WCAG AA contrast against their backgrounds.
- `prefers-reduced-motion` disabling smooth scrolling and transitions.
- No horizontal overflow at the representative desktop, tablet, and mobile viewports.

The site uses no form, tracking script, remote font request, icon library, SMTP client, or other third-party runtime resource. Fraunces, Inter, and IBM Plex Mono are served from the repository. Private and unpublished project repositories are described as unavailable rather than linked.

## GitHub Pages

The production source is `master` at the repository root. The public URL is `https://ricardoiarced.github.io/my-portfolio/`, and GitHub Pages must keep HTTPS enforcement enabled.
