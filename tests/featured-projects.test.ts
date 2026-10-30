import assert from "node:assert/strict";
import test from "node:test";
import { panel } from "./site-fixture.ts";

test("shows Software Factory first and Personal Finance Tracker second", () => {
  const projects = panel("projects");
  const links = [...projects.matchAll(/<a class="quiet-project"[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => link);
  assert.equal(links.length, 2);
  for (const [index, [title, destination]] of [
    ["Software Factory", "https://github.com/ricardoiarced/software-factory"],
    ["Personal Finance Tracker", "/my-portfolio/projects/personal-finance.html"],
  ].entries()) {
    assert.ok(links[index].includes(title));
    assert.ok(links[index].includes(`href="${destination}"`));
    assert.match(links[index], /class="stack"/);
  }
  assert.doesNotMatch(projects, /<img\b|<picture\b|<figure\b/);
  assert.doesNotMatch(projects, /Local Notes|Pomodoro Timer/);
});
