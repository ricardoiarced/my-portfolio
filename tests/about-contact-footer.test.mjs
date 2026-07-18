import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("introduces Ricardo with a concise, evidence-based About narrative", () => {
  const about = html.match(/<section[^>]+id="about"[\s\S]*?<\/section>/)?.[0];

  assert.ok(about, "About Me section should exist");
  assert.match(about, /<h2[^>]*>About Me<\/h2>/);
  assert.match(about, /Hermosillo, Sonora/);
  assert.match(about, /web development, systems integration, and industrial automation/i);

  const paragraphs = [...about.matchAll(/<p(?:\s[^>]*)?>([^<]+)<\/p>/g)];
  assert.ok(paragraphs.length <= 3, "About Me should remain concise");
});

test("offers direct contact and a downloadable resume without a form", async () => {
  const contact = html.match(/<section[^>]+id="contact"[\s\S]*?<\/section>/)?.[0];

  assert.ok(contact, "Contact section should exist");
  assert.match(contact, /<h2[^>]*>Let’s Work Together<\/h2>/);
  assert.match(contact, /href="mailto:ricardoiarced@gmail\.com"/);
  assert.match(contact, />ricardoiarced@gmail\.com</);
  assert.match(contact, /href="https:\/\/www\.linkedin\.com\/in\/ricardo-irvin-arce-diaz\/"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.match(contact, /href="https:\/\/github\.com\/ricardoiarced"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.match(contact, /href="assets\/CV_ARCE_DIAZ_RICARDO_IRVIN\.pdf"[^>]+download/);
  assert.doesNotMatch(contact, /<form\b/i);

  const resume = await readFile(
    new URL("../assets/CV_ARCE_DIAZ_RICARDO_IRVIN.pdf", import.meta.url),
  );
  assert.equal(resume.subarray(0, 4).toString(), "%PDF");
});

test("credits Ricardo and the current GitHub Pages deployment in the footer", () => {
  const footer = html.match(/<footer>[\s\S]*?<\/footer>/)?.[0];
  const currentYear = new Date().getFullYear().toString();

  assert.ok(footer, "Footer should exist");
  assert.match(footer, new RegExp(`<time datetime="${currentYear}">${currentYear}</time>`));
  assert.match(footer, /Ricardo Arce/);
  assert.match(footer, /GitHub Pages/);
});
