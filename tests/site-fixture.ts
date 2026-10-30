import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

export const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
export function panel(id: string): string {
  const section = html.match(new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>[\\s\\S]*?<\\/section>`))?.[0];
  assert.ok(section, `Panel ${id} should exist`);
  return section;
}
export const css = (await Promise.all(
  [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
    .map(([, path]) => readFile(new URL(`../dist/${path.replace(/^\/my-portfolio\//, "")}`, import.meta.url), "utf8")),
)).join("\n");
