import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const featuredProjects = html.match(
  /<section[^>]+id="featured-projects"[\s\S]*?<\/section>\s*<section[^>]+id="experience"/,
)?.[0];

test("presents exactly the three featured project stories", () => {
  assert.ok(featuredProjects, "Featured Projects section should exist before Experience");

  const storyTitles = [...featuredProjects.matchAll(/<article class="project-story"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g)].map(
    ([, title]) => title.trim(),
  );

  assert.deepEqual(storyTitles, ["Personal Finance", "Local Notes", "Pomodoro Timer"]);
});

test("prepares every project preview to load without layout shift", () => {
  assert.ok(featuredProjects, "Featured Projects section should exist");

  const images = [...featuredProjects.matchAll(/<img\s[^>]+>/g)].map(([image]) => image);
  assert.equal(images.length, 3);

  for (const image of images) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\bloading="lazy"/);
    assert.match(image, /\balt="[^"]+"/);
  }
});
