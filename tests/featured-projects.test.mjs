import assert from "node:assert/strict";
import test from "node:test";
import { panel } from "./site-fixture.mjs";

test("provides three text-first projects with working case-study destinations", () => {
  const projects = panel("projects");
  const links = [...projects.matchAll(/<a class="quiet-project"[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => link);
  assert.equal(links.length, 3);
  for (const [index, [title, slug]] of [
    ["Personal Finance Tracker", "personal-finance"], ["Local Notes", "local-notes"], ["Pomodoro Timer", "pomodoro-timer"],
  ].entries()) {
    assert.ok(links[index].includes(title));
    assert.ok(links[index].includes(`/my-portfolio/projects/${slug}.html`));
    assert.match(links[index], /class="stack"/);
  }
  assert.doesNotMatch(projects, /<img\b|<picture\b|<figure\b/);
});
