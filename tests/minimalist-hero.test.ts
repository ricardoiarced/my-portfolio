import assert from "node:assert/strict";
import test from "node:test";
import { html, panel, css } from "./site-fixture.ts";

test("preserves the selected introduction and user-reviewed title and location", () => {
  const about = panel("about");
  assert.match(about, /Ricardo Arce/);
  assert.match(about, /Software engineer · Hermosillo, Sonora, Mexico/);
  assert.match(about, /Thoughtful software/);
  assert.match(about, /Useful in the everyday/);
  assert.match(about, /I build web applications and business systems that make complex work feel simple/);
  assert.doesNotMatch(html, /<img\b|<picture\b|<figure\b/);
});

test("uses self-hosted fonts and respects the visitor's motion preference", () => {
  assert.match(css, /\/my-portfolio\/fonts\/inter-latin\.woff2/);
  assert.match(css, /\/my-portfolio\/fonts\/ibm-plex-mono-latin-regular\.woff2/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)/);
});
