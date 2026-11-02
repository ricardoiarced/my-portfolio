import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { findInternalLinks, hasAnchor, resolveInternalLink } from "./link-check.ts";
import { sectionAliases } from "../src/data/sections.ts";

const distDir = fileURLToPath(new URL("../dist", import.meta.url));

const entries = await readdir(distDir, { recursive: true, withFileTypes: true });
const pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".html"));

const errors: string[] = [];
let verified = 0;
for (const page of pages) {
  const pagePath = join(page.parentPath, page.name);
  const sourcePage = relative(distDir, pagePath);
  const html = await readFile(pagePath, "utf8");
  for (const href of findInternalLinks(html)) {
    const resolved = resolveInternalLink(href, sourcePage);
    if (resolved.kind === "invalid") {
      errors.push(`${pagePath}: ${resolved.reason}`);
      continue;
    }

    let target: string | null = null;
    for (const candidate of resolved.candidates) {
      const candidatePath = join(distDir, candidate);
      try {
        if ((await stat(candidatePath)).isFile()) {
          target = candidate;
          break;
        }
      } catch {
        // The candidate does not exist; the next one may.
      }
    }
    if (!target) {
      errors.push(`${pagePath}: href="${href}" resolves to no built file (tried ${resolved.candidates.join(", ")})`);
      continue;
    }

    if (resolved.hash) {
      if (!target.endsWith(".html")) {
        errors.push(`${pagePath}: href="${href}" targets the non-HTML asset ${target}, which cannot carry the #${resolved.hash} anchor`);
        continue;
      }
      const targetHtml = await readFile(join(distDir, target), "utf8");
      // The homepage keeps legacy anchors alive through sectionAliases
      // (ADR 0002): a hash with no literal target may still land via its
      // alias, the same resolution the shipped lateral-nav script performs.
      const aliased = sectionAliases[resolved.hash];
      if (!hasAnchor(targetHtml, resolved.hash) && !(aliased && hasAnchor(targetHtml, aliased))) {
        const aliasNote = aliased ? ` (alias "${aliased}" has no anchor there either)` : "";
        errors.push(`${pagePath}: href="${href}" targets ${target} but no id/name="${resolved.hash}" anchor exists there${aliasNote}`);
        continue;
      }
    }

    verified += 1;
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  throw new Error(`${errors.length} broken internal link${errors.length === 1 ? "" : "s"} found`);
}
console.log(`Verified ${verified} internal links across ${pages.length} built pages.`);
