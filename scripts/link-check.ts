import { dirname, join } from "node:path";

export const BASE_PATH = "/my-portfolio";

export type ResolvedInternalLink =
  | { kind: "file"; candidates: string[]; hash: string | null }
  | { kind: "invalid"; reason: string };

export function findExternalLinks(html: string): Set<string> {
  return new Set([...html.matchAll(/<a\b[^>]+href="(https?:\/\/[^"]+)"/g)].map(([, url]) => url));
}

export async function verifyExternalLinks(urls: Iterable<string>): Promise<void> {
  for (const url of urls) {
    let response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405) {
      response = await fetch(url, { redirect: "follow" });
      await response.body?.cancel();
    }

    const linkedinBlocksAutomation = new URL(url).hostname.endsWith("linkedin.com") && response.status === 999;
    if (!response.ok && !linkedinBlocksAutomation) {
      throw new Error(`${url} returned ${response.status}`);
    }
    console.log(`Verified external link: ${url}${linkedinBlocksAutomation ? " (LinkedIn blocks automated clients)" : ""}`);
  }
}

export function findInternalLinks(html: string): Set<string> {
  return new Set(
    [...html.matchAll(/<a\b[^>]+href="([^"]+)"/g)]
      .map(([, href]) => href)
      .filter((href) => !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)),
  );
}

/**
 * Resolves one scheme-free href against the built site. `sourcePage` is the
 * dist-relative path of the page carrying the link. Candidates are
 * dist-relative paths; `format: "preserve"` builds put directory pages at
 * `<path>/index.html` and file pages at `<path>.html`, so a resolved link is
 * any existing candidate. Root-relative paths must carry the GitHub Pages
 * base; GitHub itself 404s anything without it.
 */
export function resolveInternalLink(href: string, sourcePage: string): ResolvedInternalLink {
  const [rawPath, rawHash] = href.split("#");
  const hash = rawHash || null;
  let path = rawPath.replace(/\?.*$/, "");
  if (rawPath === "") {
    // A bare fragment targets an anchor on the page carrying the link.
    path = sourcePage;
  } else if (path.startsWith("/")) {
    if (path === BASE_PATH) path = "";
    else if (path.startsWith(`${BASE_PATH}/`)) path = path.slice(BASE_PATH.length + 1);
    else return { kind: "invalid", reason: `href="${href}" is root-relative without the "${BASE_PATH}" base; GitHub Pages would return 404` };
  } else if (path !== "") {
    path = join(dirname(sourcePage), path);
  }
  path = path.replace(/\/+$/, "");
  const candidates = path === "" ? ["index.html"] : path.endsWith(".html") ? [path] : [join(path, "index.html"), `${path}.html`, path];
  return { kind: "file", candidates, hash };
}

export function hasAnchor(html: string, id: string): boolean {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b(?:id|name)="(?:[^"]*\\s)?${escaped}(?:\\s[^"]*)?"`).test(html);
}
