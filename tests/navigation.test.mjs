import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("exposes the document sections and their anchors", () => {
  const sections = [...html.matchAll(/<section class="document__section" id="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(sections, ["featured-projects", "experience", "skills", "about", "contact"]);
});

test("keeps document navigation free of a header menu control", () => {
  assert.doesNotMatch(html, /<button\b/);
  assert.match(html, /<script src="script\.js" defer><\/script>/);
});