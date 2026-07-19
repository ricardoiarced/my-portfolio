import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const hero = html.match(/<section class="hero container"[\s\S]*?<\/section>/)?.[0];

test("presents the approved text-first introduction", () => {
  assert.ok(hero, "Homepage hero should exist");

  assert.match(hero, /<p class="eyebrow">Software Developer<\/p>/);
  assert.match(hero, /<h1[^>]*>I build reliable web experiences<br>that make complex work feel simple\.<\/h1>/);
  assert.match(hero, /I’m Ricardo Arce, a software developer focused on accessible, maintainable applications that solve practical problems\./);
  assert.match(hero, /class="hero__primary" href="#featured-projects">View projects →<\/a>/);
  assert.match(hero, /class="hero__secondary" href="#contact">Get in touch<\/a>/);
  assert.match(hero, /Available for new opportunities/);
  assert.match(hero, /href="https:\/\/github\.com\/ricardoiarced"[^>]*>GitHub<\/a>/);
  assert.match(hero, /href="https:\/\/www\.linkedin\.com\/in\/ricardo-irvin-arce-diaz\/"[^>]*>LinkedIn<\/a>/);
  assert.doesNotMatch(hero, /<img\b|portrait|glow/i);
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
  ];
  for (const fontFile of fontFiles) {
    await access(new URL(`../${fontFile}`, import.meta.url));
    assert.match(css, new RegExp(`url\\("${fontFile.replaceAll("/", "\\/")}\\"?\\)`, "i"));
  }

  assert.match(css, /\.nav__name\s*{[\s\S]*?font-family: "Fraunces"/);
  assert.match(css, /h1\s*{[\s\S]*?font-family: "Fraunces"/);
  assert.match(css, /body\s*{[\s\S]*?font-family: "Inter"/);
  assert.match(css, /\.eyebrow\s*{[\s\S]*?font-family: "IBM Plex Mono"/);
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)|https?:\/\/[^"']+\.(?:woff2?|ttf)/i);
});
