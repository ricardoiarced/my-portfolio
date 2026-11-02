import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import { findInternalLinks, hasAnchor, resolveInternalLink } from "../scripts/link-check.ts";

test("findInternalLinks collects scheme-free hrefs and skips absolute links", () => {
  const html = `<a href="/my-portfolio/blog/">Blog</a><a href="https://github.com/ricardoiarced">GitHub</a><a href="mailto:hi@example.com">Mail</a><a href="#about">About</a><a href="two-pointers/">Post</a>`;
  assert.deepEqual(
    [...findInternalLinks(html)].sort(),
    ["#about", "/my-portfolio/blog/", "two-pointers/"].sort(),
  );
});

test("resolveInternalLink maps base-prefixed URLs onto built files", () => {
  assert.deepEqual(resolveInternalLink("/my-portfolio/", "blog/index.html"), {
    kind: "file",
    candidates: ["index.html"],
    hash: null,
  });
  assert.deepEqual(resolveInternalLink("/my-portfolio/blog/", "projects/index.html"), {
    kind: "file",
    candidates: [join("blog", "index.html"), join("blog.html"), join("blog")],
    hash: null,
  });
  assert.deepEqual(resolveInternalLink("/my-portfolio/blog/two-pointers/", "index.html"), {
    kind: "file",
    candidates: [join("blog", "two-pointers", "index.html"), join("blog", "two-pointers.html"), join("blog", "two-pointers")],
    hash: null,
  });
});

test("resolveInternalLink keeps relative references beside their source page", () => {
  assert.deepEqual(resolveInternalLink("#contact", join("projects", "local-notes.html")), {
    kind: "file",
    candidates: [join("projects", "local-notes.html")],
    hash: "contact",
  });
  assert.deepEqual(resolveInternalLink("#main-content", join("projects", "local-notes.html")), {
    kind: "file",
    candidates: [join("projects", "local-notes.html")],
    hash: "main-content",
  });
  assert.deepEqual(resolveInternalLink("./neighbor/", join("blog", "two-pointers.html")), {
    kind: "file",
    candidates: [join("blog", "neighbor", "index.html"), join("blog", "neighbor.html"), join("blog", "neighbor")],
    hash: null,
  });
  assert.deepEqual(resolveInternalLink("../case-study.html", join("blog", "two-pointers.html")), {
    kind: "file",
    candidates: [join("case-study.html")],
    hash: null,
  });
});

test("resolveInternalLink rejects root-relative paths missing the base", () => {
  const resolved = resolveInternalLink("/blog/", "blog/index.html");
  assert.equal(resolved.kind, "invalid");
  if (resolved.kind === "invalid") assert.match(resolved.reason, /\/my-portfolio/);
});

test("resolveInternalLink carries fragments and strips queries", () => {
  const resolved = resolveInternalLink("/my-portfolio/blog/two-pointers/#complexity", "blog/index.html");
  assert.deepEqual(resolved, {
    kind: "file",
    candidates: [join("blog", "two-pointers", "index.html"), join("blog", "two-pointers.html"), join("blog", "two-pointers")],
    hash: "complexity",
  });
  const queried = resolveInternalLink("/my-portfolio/blog/?utm_source=test", "blog/index.html");
  assert.deepEqual(queried, {
    kind: "file",
    candidates: [join("blog", "index.html"), join("blog.html"), join("blog")],
    hash: null,
  });
});

test("resolveInternalLink treats a bare hash link as a same-page anchor", () => {
  assert.deepEqual(resolveInternalLink("#about", join("projects", "index.html")), {
    kind: "file",
    candidates: [join("projects", "index.html")],
    hash: "about",
  });
});

test("hasAnchor matches id and name attributes exactly", () => {
  assert.ok(hasAnchor(`<h2 id="two-pointers">Two pointers</h2>`, "two-pointers"));
  assert.ok(hasAnchor(`<a name="two-pointers"></a>`, "two-pointers"));
  assert.equal(hasAnchor(`<h2 id="sliding-window">Sliding window</h2>`, "two-pointers"), false);
  assert.equal(hasAnchor(`<h2 id="two-pointers-variant">Variant</h2>`, "two-pointers"), false);
});
