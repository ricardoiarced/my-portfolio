# ADR 0001 — The homepage is a Document, not a page shell

The homepage was prototyped as three radically different minimal designs (a dark man-page "Document", a one-screen index, and a light editorial hairlines layout), chosen via `?variant=` param. All three preserve the same content — projects, experience (three roles), skills, about, contact — but one won.

Decision: ship the **Document** — a single scrollable print/manual-format page with dark paper, monospace type, hairline section rules, an uppercase section-marker label per block, and zero chrome (no site header, no footer, no hero actions).

Why it won: it is the most honest match for the portfolio's promise — "reliable web experiences that make complex work feel simple" — and it reads evenly to the people this page is for (recruiters, technical reviewers) without the marketing electricity of a hero. The losing variants (one-screen index; light editorial) were deliberately rejected: the index removed all evidence required to judge the work, and the editorial style fought the dark document voice that the rest of the site and case studies already use.

Trade-offs considered: no footer means the page ends at Contact (a deliberate full stop, no copyright churn); no site header means no inline "Work / Contact" nav — case-study pages keep their own back-navigation to the homepage anchors, which still exist. The document keeps the `whoami` shell joke out — it is a print/manual aesthetic, not a terminal gag.

**Consequences** listed in issue / capture branch: the real homepage now ships without a nav bar and footer; case studies remain independent pages that link back to the Document sections (`#featured-projects`, `#contact`).