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
and accessible landmarks remain unique. Project data comes from the existing site;
career content is reconciled with the user's supplied résumé project.

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

## Experience revision — October 29, 2026

Reviewed the complete supplied `../resume` project: all Markdown, Typst, HTML,
and SVG sources, seven PDFs / nine pages, raster cover assets, and build and
agent configuration. The approved decision register and profile copy resolve
historical contradictions; the October 20 LinkedIn export is a comparison source,
not new confirmation of broader ownership claims.

The prototypes retain all three historical roles with exact month ranges and
job locations, distinct from Ricardo's current home in Hermosillo. Villa Group
ended in September 2026. The section now leads with implementation evidence:
ERP workflows and tests, the staging accounting integration, the production
maintenance upgrade, and the MP9 equipment migration. Beracah shows checkout,
the production CSV/S3 pricing workflow, and the domain/redirect contribution
within the three-person migration. Coinsamatik focuses on the C++ reporting
application and explicitly states that it reached testing.

Expandable contributions retain the Villa accounting fix and Beracah supplier
cost importer without making every role equally long. The importer remains
separate from the scheduled pricing integration. Scope figures are retained as
scope: 491 accounts, 2,000+ equipment records, seven properties, 10,000+ products,
and website-level MXN 100K+ sales. No savings, SEO gains, leadership title,
complete Magento cron authorship, or unconfirmed deployment is inferred.

This revision updates the three design prototypes. The source résumé project
is read-only and no design has been promoted to the production Document.
