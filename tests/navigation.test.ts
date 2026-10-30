import assert from "node:assert/strict";
import test from "node:test";
import { html } from "./site-fixture.ts";

test("keeps navigation as real shareable section links in display order", () => {
  const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav);
  const destinations = [...nav.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(destinations, ["about", "experience", "projects", "contact"]);
  assert.match(nav, /aria-current="page"/);
  const ids = [...html.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(ids, destinations);
});

test("the introduction contact action uses the same in-page navigation", () => {
  assert.match(html, /href="#contact">Get in touch/);
  assert.match(html, /class="wordmark" href="#about"/);
});
