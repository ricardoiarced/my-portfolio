import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const navigation = html.match(/<nav class="nav container"[\s\S]*?<\/nav>/)?.[0];

test("exposes every approved portfolio destination", () => {
  assert.ok(navigation, "Primary navigation should exist");

  const links = [...navigation.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(
    ([, href, label]) => ({ href, label: label.trim() }),
  );

  assert.deepEqual(links, [
    { href: "#top", label: "Ricardo Arce" },
    { href: "#featured-projects", label: "Projects" },
    { href: "#experience", label: "Experience" },
    { href: "#skills", label: "Skills" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
    { href: "assets/CV_ARCE_DIAZ_RICARDO_IRVIN.pdf", label: "Résumé" },
  ]);
  assert.match(navigation, /href="assets\/CV_ARCE_DIAZ_RICARDO_IRVIN\.pdf"[^>]+download/);
});

test("provides a progressively enhanced mobile navigation control", () => {
  assert.ok(navigation, "Primary navigation should exist");
  assert.match(
    navigation,
    /<button class="nav__toggle"[^>]+aria-expanded="false"[^>]+aria-controls="primary-navigation"[^>]+hidden/,
  );
  assert.match(navigation, /<span class="visually-hidden">Open navigation menu<\/span>/);
  assert.match(navigation, /<ul class="nav__links" id="primary-navigation">/);
  assert.doesNotMatch(navigation, /<ul class="nav__links"[^>]+hidden/);
  assert.match(html, /<script src="script\.js" defer><\/script>/);
});
