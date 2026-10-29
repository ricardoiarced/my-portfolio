# Minimal dark portfolio comparison

Question: which layout best presents Ricardo's projects, experience, and contact
details while feeling minimal, dark, and personal without a portrait?

This is throwaway design exploration on `codex/prototype-minimal-portfolio`.
No winner has been selected or promoted to production.

Run `npm run prototype`, then open
`http://localhost:4321/my-portfolio/?variant=A`.

| Key | Direction | Structure |
| --- | --- | --- |
| A | Quiet index | Centered text column; projects first; lime accent; no imagery. |
| B | Split profile | Sticky introduction beside a career timeline, projects, and contact; blue accent. |
| C | Project gallery | Wide layout; one featured project and two smaller project previews; warm neutrals. |

The floating bottom bar and left/right keyboard arrows cycle between variants.
The URL records the variant; browser back/forward and reload retain the selection.
There is no saved state. Only the active variant is mounted, so navigation anchors
and accessible landmarks remain unique. All data comes from the existing site.

The shared navigation targets the existing project case studies and résumé.
Each direction includes the three existing jobs and the three existing projects.
Separate About and Skills sections are omitted; positioning belongs in the
introduction and technology belongs with the work.

Implementation note: Astro's static pages do not expose query parameters to the
server. The development homepage therefore mounts the prototype and chooses its
variant in the browser. Production builds render the original Document homepage,
whose markup is preserved in `src/components/DocumentHomepage.astro`.
The prototype controls are also explicitly gated on development mode.

This exploration reopens ADR 0001's Document layout decision at the user's request.
That ADR remains the production decision until the user chooses a direction.

Validation: Astro diagnostics, production build, existing tests, JavaScript syntax
checks, desktop review of all three variants, mobile review at 390px, project
navigation, variant wraparound, keyboard switching, and reload persistence.

Decision pending: select one direction, or combine specific parts. After selection,
implement the validated design and capture the verdict in the implementation issue.
Keep the full comparison on this throwaway branch.
