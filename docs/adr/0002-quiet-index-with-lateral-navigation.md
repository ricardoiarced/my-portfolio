---
status: accepted
---

# Quiet index with lateral navigation

On October 29, 2026, Ricardo selected variant A, the dark, text-first quiet index,
and supplied a guide requesting lateral navigation. This supersedes ADR 0001:
keep A's reviewed content, typography, lime accent, and lack of portrait, but
present About, Experience, Projects, and Contact as independently scrollable
panels on desktop, with an 800ms transform transition and synchronized menu
indicator. About contains the existing introduction and is the landing panel.

At 640px and below, use the guide's vertical fallback so the longer experience
content remains straightforward to read. All content is in the static HTML;
without JavaScript it also stacks vertically. Hash links, browser history,
programmatic focus, inactive-panel inertness, and reduced-motion support are
part of navigation, rather than relying on document scrolling. Keep legacy
`#top` and `#featured-projects` links as aliases for About and Projects.

On October 30, 2026, Ricardo requested the supplied cover/push add-on on phones
as well as desktop. This supersedes the 640px vertical fallback and the 800ms
motion above: JavaScript-enabled panels now share a grid cell at every width,
using a 650ms cover transition with a 25% retreat and 40% dimming underneath.
Later panels keep the higher layer, so going back reveals the earlier panel.
Only the leaving and arriving panels remain visible during a jump. Vertical
stacking remains the fallback without JavaScript; reduced motion switches
panels immediately. See [portfolio navigation](../portfolio-navigation.md).

The full three-way comparison and reviewed copy are preserved on
[`codex/prototype-minimal-portfolio`, commit `1127628`](https://github.com/ricardoiarced/my-portfolio/tree/1127628),
linked from [design issue #11](https://github.com/ricardoiarced/my-portfolio/issues/11).
Losing variants and comparison controls do not belong in the implementation.
