import { readFile } from "node:fs/promises";

import { findExternalLinks, verifyExternalLinks } from "./link-check.mjs";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
await verifyExternalLinks(findExternalLinks(html));
