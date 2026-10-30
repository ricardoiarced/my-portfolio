import { readFile } from "node:fs/promises";

export const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
export function panel(id) {
  return html.match(new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>[\\s\\S]*?<\\/section>`))?.[0];
}
export const css = (await Promise.all(
  [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
    .map(([, path]) => readFile(new URL(`../dist/${path.replace(/^\/my-portfolio\//, "")}`, import.meta.url), "utf8")),
)).join("\n");
