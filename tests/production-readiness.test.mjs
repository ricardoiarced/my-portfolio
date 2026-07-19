import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const head = html.match(/<head>[\s\S]*?<\/head>/)?.[0];
const publicUrl = "https://ricardoiarced.github.io/my-portfolio/";
const description =
  "Ricardo Arce is a software developer focused on reliable, accessible, and maintainable web applications.";

test("publishes complete canonical and social metadata", () => {
  assert.ok(head, "Document head should exist");
  assert.match(head, /<title>Ricardo Arce \| Software Developer<\/title>/);
  assert.match(head, new RegExp(`<meta name="description" content="${description}">`));
  assert.match(head, new RegExp(`<link rel="canonical" href="${publicUrl}">`));
  assert.match(head, /<meta property="og:type" content="profile">/);
  assert.match(head, /<meta property="og:title" content="Ricardo Arce \| Software Developer">/);
  assert.match(head, new RegExp(`<meta property="og:description" content="${description}">`));
  assert.match(head, new RegExp(`<meta property="og:url" content="${publicUrl}">`));
  assert.match(head, /<meta property="og:image" content="https:\/\/ricardoiarced\.github\.io\/my-portfolio\/img\/social-preview\.jpg">/);
  assert.match(head, /<meta property="og:image:width" content="1200">/);
  assert.match(head, /<meta property="og:image:height" content="630">/);
  assert.match(head, /<meta property="og:image:alt" content="[^"]+">/);
  assert.match(head, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(head, /<link rel="apple-touch-icon" href="img\/apple-touch-icon\.png">/);
  assert.match(head, /<link rel="manifest" href="site\.webmanifest">/);
});

test("describes Ricardo with valid Person structured data", () => {
  const json = head?.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(json, "Person JSON-LD should exist");

  const person = JSON.parse(json);
  assert.equal(person["@context"], "https://schema.org");
  assert.equal(person["@type"], "Person");
  assert.equal(person.name, "Ricardo Arce");
  assert.equal(person.url, publicUrl);
  assert.equal(person.jobTitle, "Software Developer");
  assert.deepEqual(person.sameAs, [
    "https://github.com/ricardoiarced",
    "https://www.linkedin.com/in/ricardo-irvin-arce-diaz/",
  ]);
});

test("uses deploy-safe links and references assets that exist", async () => {
  const attributes = [...html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)].flatMap(([, value]) =>
    value.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]),
  );
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id));

  for (const reference of attributes) {
    assert.doesNotMatch(reference, /^\/(?!\/)/, `${reference} assumes a domain-root deployment`);
    if (reference.startsWith("#")) {
      assert.ok(ids.has(reference.slice(1)), `${reference} should target an existing id`);
    } else if (!/^(?:https?:|mailto:)/.test(reference)) {
      await access(new URL(reference, root));
    }
  }
});

test("serves optimized media with stable dimensions and deliberate loading", async () => {
  const contentImages = [...html.matchAll(/<img\s[^>]+>/g)].map(([image]) => image);
  assert.equal(contentImages.length, 3);

  for (const image of contentImages) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt="[^"]+"/);
    assert.match(image, /\.(?:webp|avif)"/);
  }

  for (const image of contentImages) assert.match(image, /\bloading="lazy"/);

  const budgets = {
    "img/me-on-red.webp": 100_000,
    "img/personal-finance-dashboard.webp": 100_000,
    "img/personal-finance-dashboard-mobile.webp": 60_000,
    "img/local-notes.webp": 60_000,
    "img/pomodoro-timer.webp": 100_000,
    "img/social-preview.jpg": 250_000,
  };

  for (const [path, maximumBytes] of Object.entries(budgets)) {
    assert.ok((await stat(new URL(path, root))).size <= maximumBytes, `${path} exceeds its byte budget`);
  }
});

test("loads no third-party runtime resources", () => {
  const scripts = [...html.matchAll(/<script\b[^>]+src="([^"]+)"/g)].map(([, url]) => url);
  const links = [...html.matchAll(/<link\b[^>]+rel="([^"]+)"[^>]+href="([^"]+)"/g)]
    .filter(([, rel]) => rel !== "canonical")
    .map(([, , url]) => url);
  const runtimeResources = [...scripts, ...links];
  assert.doesNotMatch(runtimeResources.join("\n"), /^https?:/m);
  assert.doesNotMatch(html, /smtp|emailjs|fontawesome|fonts\.(?:googleapis|gstatic)/i);
});
