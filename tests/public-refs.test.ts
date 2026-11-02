import assert from "node:assert/strict";
import test from "node:test";

import { findUnbasedPublicRefs } from "../scripts/check-public-refs.ts";

const publicFiles = new Set(["fonts/inter-latin.woff2", "img/hero.png", "style.css"]);

test("flags hand-written absolute paths into public/ that lack the base", () => {
  const refs = findUnbasedPublicRefs(`src: url("/fonts/inter-latin.woff2") format("woff2");`, publicFiles);
  assert.deepEqual(refs.map((ref) => ref.path), ["fonts/inter-latin.woff2"]);
});

test("flags unquoted CSS urls and attribute references alike", () => {
  assert.deepEqual(
    findUnbasedPublicRefs(`<img src="/img/hero.png">`, publicFiles).map((ref) => ref.path),
    ["img/hero.png"],
  );
  assert.deepEqual(
    findUnbasedPublicRefs(`background: url(/style.css);`, publicFiles).map((ref) => ref.path),
    ["style.css"],
  );
});

test("accepts base-carrying paths", () => {
  assert.deepEqual(findUnbasedPublicRefs(`url("/my-portfolio/fonts/inter-latin.woff2")`, publicFiles), []);
});

test("ignores paths that public/ does not serve", () => {
  assert.deepEqual(findUnbasedPublicRefs(`<img src="/img/missing.png">`, publicFiles), []);
  assert.deepEqual(findUnbasedPublicRefs(`[a post](/blog/two-pointers/)`, publicFiles), []);
});

test("ignores relative, protocol-relative, and data references", () => {
  assert.deepEqual(findUnbasedPublicRefs(`<link href="../img/favicon.svg">`, publicFiles), []);
  assert.deepEqual(findUnbasedPublicRefs(`url("data:image/svg+xml,%3Csvg%3E")`, publicFiles), []);
  assert.deepEqual(findUnbasedPublicRefs(`<img src="https://example.com/img/hero.png">`, publicFiles), []);
});

test("reads markdown image syntax and strips query suffixes", () => {
  const refs = findUnbasedPublicRefs(`![Big-O](/img/hero.png?v=2)`, publicFiles);
  assert.deepEqual(refs.map((ref) => ref.path), ["img/hero.png"]);
});

test("checks each srcset candidate against public/", () => {
  const refs = findUnbasedPublicRefs(`<img srcset="/img/hero.png 1x, /img/hero@2x.png 2x">`, publicFiles);
  assert.deepEqual(refs.map((ref) => ref.path), ["img/hero.png"]);
});
