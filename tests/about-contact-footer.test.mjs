import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { html, panel } from "./site-fixture.mjs";

test("offers the reviewed opportunity statement and direct contact without a form", () => {
  const contact = panel("contact");
  assert.match(contact, /Open to new opportunities/);
  assert.match(contact, /Let’s talk/);
  assert.match(contact, /href="mailto:ricardoiarced@gmail\.com"/);
  for (const domain of ["https://github.com/ricardoiarced", "https://www.linkedin.com/in/ricardo-irvin-arce-diaz/"]) {
    assert.ok(contact.includes(`href="${domain}" target="_blank" rel="noopener noreferrer"`));
  }
  assert.doesNotMatch(contact, /<form\b/);
});

test("links to a real downloadable résumé from Experience", async () => {
  assert.match(panel("experience"), /href="\/my-portfolio\/assets\/ricardo-arce-resume\.pdf" download/);
  const pdf = await readFile(new URL("../dist/assets/ricardo-arce-resume.pdf", import.meta.url));
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.doesNotMatch(html, /<footer\b/);
});
