import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const documentBlock = html.match(/<article class="document">[\s\S]*?<\/article>\s*<\/main>/)?.[0];

test("presents the approved text-first Document introduction", () => {
  assert.ok(documentBlock, "Homepage Document should exist");
  assert.match(documentBlock, /<h1 class="document__name">Ricardo Arce<\/h1>/);
  assert.match(documentBlock, /class="document__role">Junior ERP Developer/);
  assert.match(documentBlock, /class="document__role">[^<]*Villa Group Resorts &amp; Spas/);
  assert.match(documentBlock, /class="document__statement">I build reliable web experiences that make complex work feel simple\.<\/p>/);
  assert.match(documentBlock, /class="document__status">Available for new opportunities<\/p>/);
  assert.doesNotMatch(documentBlock, /<img\b|portrait|glow|hero/i);
});

test("uses the approved palette and self-hosted type roles", async () => {
  for (const [variable, value] of [
    ["--color-background", "#141310"],
    ["--color-text", "#f8f6f0"],
    ["--color-muted", "#a8a498"],
    ["--color-border", "#2e2c26"],
    ["--color-accent", "#5b9bd9"],
  ]) {
    assert.match(css, new RegExp(`${variable}: ${value};`, "i"));
  }

  const fontFiles = [
    "fonts/fraunces-latin.woff2",
    "fonts/inter-latin.woff2",
    "fonts/ibm-plex-mono-latin-regular.woff2",
    "fonts/ibm-plex-mono-latin-medium.woff2",
  ];
  for (const fontFile of fontFiles) {
    assert.match(css, new RegExp(`url\\("${fontFile.replaceAll("/", "\\/")}\\"?\\)`, "i"));
  }

  assert.match(css, /\.document__name\s*{[\s\S]*?font-family: "Fraunces"/);
  assert.match(css, /\.document__role\s*{[\s\S]*?font-family: "IBM Plex Mono"/);
  assert.match(css, /\.document__marker\s*{[\s\S]*?font-family: "IBM Plex Mono"/);
  assert.match(css, /\.document\s*{[\s\S]*?font-family: "IBM Plex Mono"/);
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)|https?:\/\/[^"']+\.(?:woff2?|ttf)/i);
});