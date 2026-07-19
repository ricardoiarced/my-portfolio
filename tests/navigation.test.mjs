import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const navigation = html.match(/<nav class="nav container"[\s\S]*?<\/nav>/)?.[0];

test("exposes the focused portfolio destinations", () => {
  assert.ok(navigation, "Primary navigation should exist");

  const links = [...navigation.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(
    ([, href, label]) => ({ href, label: label.trim() }),
  );

  assert.deepEqual(links, [
    { href: "#top", label: "Ricardo Arce" },
    { href: "#featured-projects", label: "Work" },
    { href: "#contact", label: "Contact" },
  ]);
});

test("keeps navigation available without a mobile menu control", () => {
  assert.ok(navigation, "Primary navigation should exist");
  assert.match(navigation, /<ul class="nav__links" id="primary-navigation">/);
  assert.doesNotMatch(navigation, /<button\b|\bhidden\b/);
  assert.match(html, /<script src="script\.js" defer><\/script>/);
});
