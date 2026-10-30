# Portfolio navigation

Selected design: A / quiet index. The reviewed comparison is preserved on
`codex/prototype-minimal-portfolio` at `1127628`; see issue #11 and ADR 0002.

Run `npm run dev` for editing. To inspect static output, run `npm run build`,
then `npm run preview`. The site base is `/my-portfolio/`.

## Migration audit

- Replaced homepage anchors that scrolled the document with delegated panel
  navigation. Header links and the introduction's Contact action share it.
- Removed the prototype switcher, its keyboard interception and `scrollTo`,
  the old homepage scroll-spy script, and the losing variant layouts.
- Kept one section wrapper per panel, supplied by `Panel.astro`.
- The homepage has no content images, framework islands, ClientRouter, media,
  scroll-triggered effects, or third-party scripts to migrate.
- Case studies keep their own vertical layouts and assets. Their existing
  `#featured-projects` return links resolve to the new Projects panel.

## Behavior

`src/data/sections.ts` owns section order and labels. Astro renders all panels
into the initial HTML, with the About introduction first. On desktop the body
fills `100dvh`, the header remains outside the moving viewport, and each panel
owns its vertical scrolling. Panels occupy the same absolute-positioned stack,
rather than a horizontal row. Cover/push brings the incoming panel above the
outgoing panel from the direction of navigation. The outgoing panel retreats
12%, scales to 94%, and darkens to 65% brightness. Both panels and the menu
underline use 800ms with `cubic-bezier(0.77, 0, 0.175, 1)`.

Panel transforms and brightness animate through the Web Animations API.
Completion removes animation layers; rapid navigation cancels the previous
transition and starts from the currently visible panel's transform. Resizing
into the phone layout or enabling reduced motion cancels ongoing motion.

Plain hash links work as deep links and retain modified-click behavior.
Navigation updates history, the active menu link, focus, and inactive-panel
`inert` state. An early inline script positions a deep link before transitions
are enabled. Reduced motion disables the transitions. Arrow keys retain their
native behavior; optional global arrow-key navigation is not enabled.

Below 641px the sections stack, the header is sticky, and all panels remain
available to keyboard and assistive technology. At the breakpoint, switching
layout preserves the selected panel. Without JavaScript the page is also a
readable vertical portfolio.

The source résumé project supplied for the previous experience rewrite remains
read-only. Historical titles, locations, team attribution, and delivery statuses
are preserved in `src/data/portfolio.ts`.

The downloadable PDF is an unchanged copy of the résumé project's
`resumes/resume-se.pdf` (Software Engineer), served as
`assets/ricardo-arce-resume.pdf` so the download uses Ricardo's chosen filename.

## Validation

The built preview was checked in the in-app browser at desktop and tablet
widths of 768, 1077, 1280, and 1600px, and phone sizes of 360×800, 390×844,
and 640×360. No horizontal overflow was observed. Menu navigation, Contact
CTA, direct and legacy hashes, Back/Forward, modified-click opening, case-study
return links, skip-link focus, inactive-panel accessibility, and independent
Experience scrolling were exercised. The browser viewport override was reset.

Astro type checking, the production build, static Node tests, and JavaScript
syntax checks pass. The updated 13-test Playwright suite collects successfully;
it was not executed because browser interaction in this session uses the
in-app browser. Reduced-motion and JavaScript-disabled fallbacks are covered
in source and the suite, but were not runtime-emulated here. A real screen
reader, physical trackpad, and Lighthouse audit remain release checks.

Cover/push was checked against the production build: the incoming panel has
the higher layer while the outgoing panel scales and darkens; completed and
interrupted transitions release their temporary layers. Back navigation,
independent Experience scrolling, and the 390px vertical fallback were checked
again. The served résumé was byte-compared with the Software Engineer source
PDF and matches exactly.
