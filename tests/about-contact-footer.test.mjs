import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("introduces Ricardo with a concise About narrative without header/footer chrome", () => {
  const about = html.match(/<section class="document__section" id="about"[\s\S]*?<\/section>/)?.[0];

  assert.ok(about, "About section should exist");
  assert.match(about, /<p class="document__marker" id="about-title">About<\/p>/);

  const paragraphs = [...about.matchAll(/<p(?:\s[^>]*)?>([^<]+)<\/p>/g)];
  assert.ok(paragraphs.length >= 2 && paragraphs.length <= 3, "About should be concise");
  assert.match(about, /Odoo ecosystem/);
  assert.doesNotMatch(about, /mechatronics/i);
});

test("offers direct contact and a downloadable resume without a form", async () => {
  const contact = html.match(/<section class="document__section" id="contact"[\s\S]*?<\/section>/)?.[0];

  assert.ok(contact, "Contact section should exist");
  assert.match(contact, /<p class="document__marker" id="contact-title">Contact<\/p>/);
  assert.match(contact, /class="document__status">Available for new opportunities<\/p>/);
  assert.match(contact, /href="mailto:ricardoiarced@gmail\.com"/);
  assert.match(contact, /href="https:\/\/www\.linkedin\.com\/in\/ricardo-irvin-arce-diaz\/"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.match(contact, /href="https:\/\/github\.com\/ricardoiarced"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.match(contact, /href="assets\/CV_ARCE_DIAZ_RICARDO_IRVIN\.pdf"[^>]+download/);
  assert.doesNotMatch(contact, /<form\b/i);

  const resume = await readFile(
    new URL("../assets/CV_ARCE_DIAZ_RICARDO_IRVIN.pdf", import.meta.url),
  );
  assert.equal(resume.subarray(0, 4).toString(), "%PDF");
});