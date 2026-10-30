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
into the initial HTML, with the About introduction first. At every width the body
fills `100dvh`, the header remains outside the moving viewport, and each panel
owns its vertical scrolling. Panels occupy the same grid cell. Later panels
keep the higher layer: forward navigation covers the earlier panel from the
right, and back navigation moves the top panel right to reveal the earlier
one. The covered panel retreats 25% and darkens to 60% brightness. Both panels
and the menu underline use 650ms with `cubic-bezier(0.32, 0.72, 0, 1)`.

CSS drives panel transforms, brightness, and edge shadows from `--index` and
each panel's `--panel-index`. During a jump, all panels except the leaving and
arriving panels are hidden and move immediately into place. A timer releases
those hidden panels after the transition, accepting both `ms` and minified `s`
units from `--speed`. Rapid navigation replaces that timer, and CSS retargets
the transitions. Reduced motion disables panel and underline transitions,
including when the preference changes during navigation.

Plain hash links work as deep links and retain modified-click behavior.
Navigation updates history, the active menu link, focus, and inactive-panel
`inert` state. An early inline script positions a deep link before transitions
are enabled. Reduced motion disables the transitions. Arrow keys retain their
native behavior; optional global arrow-key navigation is not enabled.

Phone navigation uses the same cover/push effect and inactive-panel inertness
as desktop. Menu targets remain at least 44px tall, and tall panels scroll
internally. This replaces the previous vertical fallback below 641px, as
recorded in ADR 0002. Navigation uses taps and links; swipe gestures are not
implemented. Without JavaScript all four panels remain readable vertically.

The source résumé project supplied for the previous experience rewrite remains
read-only. Historical titles, locations, team attribution, and delivery statuses
are preserved in `src/data/portfolio.ts`.

The downloadable PDF is an unchanged copy of the résumé project's
`resumes/resume-se.pdf` (Software Engineer), served as
`assets/ricardo-arce-resume.pdf` so the download uses Ricardo's chosen filename.

## Validation

`npm run test:browser` exercises the production build in Chromium, including
iPhone 13 touch emulation. It covers forward/back layering, synchronized menu
motion, jumps, rapid navigation, menu/brand/Contact taps, history, direct and
legacy hashes, early deep-link positioning before the navigation module loads,
keyboard focus and inertness, reduced motion, case-study return links, and
the JavaScript-disabled fallback. Layout checks run at 1600, 1280, 768, 390,
and 640px, including short landscape screens, internal scrolling and 44px
menu targets. An additional WebKit run was attempted, but its browser
installation stalled and remained incomplete; Safari engine coverage is
unverified.

Physical iOS Safari and Android Chrome, a real screen reader, and low-end phone
animation performance still need manual verification. The downloadable résumé
and case-study content are unchanged by the navigation update.
