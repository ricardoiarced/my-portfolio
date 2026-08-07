import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("hosts the homepage document without header or footer chrome", () => {
  assert.ok(html.includes('<a class="skip-link" href="#main-content">'));
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.ok(!/<header class="site-header">/.test(html), "Document should not include the site header");
  assert.ok(!/<footer>/.test(html), "Document should end at Contact, with no footer");
  assert.match(html, /<article class="document">/);
});

test("opens the Document with a role line and make-good statement", () => {
  const title = html.match(/<header class="document__title">[\s\S]*?<\/header>/)?.[0];
  assert.ok(title, "Document title block should exist");
  assert.match(title, /<h1 class="document__name">Ricardo Arce<\/h1>/);
  assert.match(title, /<p class="document__role">Junior ERP Developer — Villa Group Resorts &amp; Spas — Puerto Vallarta, Jalisco<\/p>/);
  assert.match(title, /<p class="document__statement">I build reliable web experiences that make complex work feel simple\.<\/p>/);
});

test("keeps section anchors that case studies and links rely on", () => {
  for (const id of ["featured-projects", "experience", "skills", "about", "contact"]) {
    assert.match(html, new RegExp(`<section class="document__section" id="${id}"`));
  }
});

test("includes the homepage script without coupling to a nav", () => {
  assert.match(html, /<script src="script\.js" defer><\/script>/);
});