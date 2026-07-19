import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const featuredProjects = html.match(
  /<section[^>]+id="featured-projects"[\s\S]*?<\/section>\s*<section[^>]+id="experience"/,
)?.[0];

test("presents exactly three projects as concise, linked rows", () => {
  assert.ok(featuredProjects, "Work section should exist before Experience");
  assert.match(featuredProjects, /<h2 id="projects-title">Work<\/h2>/);

  const rows = [...featuredProjects.matchAll(/<article class="project-row"[\s\S]*?<\/article>/g)].map(([row]) => row);
  assert.equal(rows.length, 3);

  const projects = rows.map((row) => ({
    number: row.match(/class="project-row__number"[^>]*>([^<]+)<\/p>/)?.[1].trim(),
    title: row.match(/<h3[^>]*>([^<]+)<\/h3>/)?.[1].trim(),
    technologies: row.match(/class="project-row__stack"[^>]*>([^<]+)<\/p>/)?.[1].trim(),
    destination: row.match(/class="project-row__link" href="([^"]+)"/)?.[1],
  }));

  assert.deepEqual(projects, [
    {
      number: "01",
      title: "Personal Finance Tracker",
      technologies: "Next.js · TypeScript · Tailwind · PostgreSQL",
      destination: "projects/personal-finance.html",
    },
    {
      number: "02",
      title: "Local Notes",
      technologies: "Electron · TypeScript · CodeMirror · Node.js",
      destination: "projects/local-notes.html",
    },
    {
      number: "03",
      title: "Pomodoro Timer",
      technologies: "React · TypeScript · Vite · Web Audio API",
      destination: "projects/pomodoro-timer.html",
    },
  ]);

  for (const row of rows) {
    assert.match(row, /class="project-row__description"/);
    assert.match(row, />View project →<\/a>/);
  }
});

test("keeps the homepage work list free of project imagery and decorative containers", () => {
  assert.ok(featuredProjects, "Work section should exist");
  assert.doesNotMatch(featuredProjects, /<img\b|<picture\b|<figure\b/);
  assert.doesNotMatch(featuredProjects, /project-story|project-card/);
});
