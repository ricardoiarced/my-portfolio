import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Keep in sync with astro.config.ts and scripts/static-server.ts.
const BASE_PATH = "/my-portfolio";

// Absolute paths into public/ written by hand: a base-less one trips Astro's
// dev router and 404s on GitHub Pages. The extension whitelist keeps route
// paths (e.g. /blog/) out of scope — those are guarded by the internal link
// check on built HTML instead.
const ASSET_PATH = /(?<![\w.~])\/(?:[\w@%+-]+\/)*[\w@%+.-]+\.(?:woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|bmp|mp4|webm|mp3|pdf|txt|xml|json|csv|webmanifest|css|m?js)(?=[?#"')\s\]]|$)/g;

const SOURCE_EXTENSIONS = [".astro", ".css", ".md", ".markdown", ".mdx", ".ts", ".mts"];

export type PublicRef = { path: string; index: number };

export function findUnbasedPublicRefs(source: string, publicFiles: ReadonlySet<string>): PublicRef[] {
  const refs: PublicRef[] = [];
  for (const match of source.matchAll(ASSET_PATH)) {
    if (match[0] === BASE_PATH || match[0].startsWith(`${BASE_PATH}/`)) continue;
    const path = match[0].replace(/[?#].*$/, "").slice(1);
    if (publicFiles.has(path)) refs.push({ path, index: match.index });
  }
  return refs;
}

async function collectFiles(dir: string, extensions?: string[]): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (!extensions || extensions.includes(extname(entry.name))))
    .map((entry) => join(entry.parentPath, entry.name));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const srcDir = fileURLToPath(new URL("../src", import.meta.url));
  const publicDir = fileURLToPath(new URL("../public", import.meta.url));
  const publicFiles = new Set(
    (await collectFiles(publicDir)).map((file) => relative(publicDir, file).split(sep).join("/")),
  );

  const errors: string[] = [];
  let checked = 0;
  for (const filePath of await collectFiles(srcDir, SOURCE_EXTENSIONS)) {
    const source = await readFile(filePath, "utf8");
    checked += 1;
    for (const ref of findUnbasedPublicRefs(source, publicFiles)) {
      const line = source.slice(0, ref.index).split("\n").length;
      errors.push(`${filePath}:${line}: "/${ref.path}" points into public/ without the "${BASE_PATH}" base; GitHub Pages would return 404`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    throw new Error(`${errors.length} un-based public/ reference${errors.length === 1 ? "" : "s"} found`);
  }
  console.log(`Checked ${checked} source files: no un-based public/ references.`);
}
