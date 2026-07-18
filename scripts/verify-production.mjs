import { findExternalLinks, verifyExternalLinks } from "./link-check.mjs";

const publicUrl = "https://ricardoiarced.github.io/my-portfolio/";
const response = await fetch(publicUrl);
if (!response.ok) throw new Error(`${publicUrl} returned ${response.status}`);

const html = await response.text();
if (!html.includes(`<link rel="canonical" href="${publicUrl}">`)) {
  throw new Error("Production does not contain the expected canonical URL");
}

const references = [...html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
  .flatMap(([, value]) => value.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]))
  .filter((reference) => !/^(?:#|mailto:|https?:)/.test(reference));

for (const reference of new Set(references)) {
  const assetUrl = new URL(reference, publicUrl);
  const assetResponse = await fetch(assetUrl, { method: "HEAD" });
  if (!assetResponse.ok) throw new Error(`${assetUrl} returned ${assetResponse.status}`);
}

await verifyExternalLinks(findExternalLinks(html));
console.log(`Verified ${publicUrl}, ${new Set(references).size} deployed assets, and its external links.`);
