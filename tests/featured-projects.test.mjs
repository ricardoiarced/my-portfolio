import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const featuredProjects = html.match(
  /<section class="document__section" id="featured-projects"[\s\S]*?<\/section>\s*<section class="document__section" id="experience"/,
)?.[0];

test("presents exactly three projects as concise, linked entries", () => {
  assert.ok(featuredProjects, "Work section should exist before Experience");

  const projects = [...featuredProjects.matchAll(/<article class="project"[\s\S]*?<\/article>/g)].map(([entry]) => entry);
  assert.equal(projects.length, 3);

  const expected = [
    {
      number: "[01]",
      title: "Personal Finance Tracker",
      technologies: "Next.js · TypeScript · Tailwind · PostgreSQL",
      destination: "projects/personal-finance.html",
    },
    {
      number: "[02]",
      title: "Local Notes",
      technologies: "Electron · TypeScript · CodeMirror · Node.js",
      destination: "projects/local-notes.html",
    },
    {
      number: "[03]",
      title: "Pomodoro Timer",
      technologies: "React · TypeScript · Vite · Web Audio API",
      destination: "projects/pomodoro-timer.html",
    },
  ];

  for (const [index, expectations] of expected.entries()) {
    const escapedNumber = expectations.number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(projects[index], new RegExp(`class="project__number"[^>]*>${escapedNumber}<`));
    assert.match(projects[index], new RegExp(`<h2 class="project__title">${expectations.title}<\\/h2>`));
    assert.match(projects[index], new RegExp(`class="project__stack"[^>]*>${expectations.technologies}<\\/p>`));
    assert.match(projects[index], new RegExp(`class="project__link" href="${expectations.destination}"`));
    assert.match(projects[index], /class="project__description"[\s\S]*?<\/p>/);
  }
});

test("keeps the homepage work list free of imagery and cards", () => {
  assert.ok(featuredProjects, "Work section should exist");
  assert.doesNotMatch(featuredProjects, /<img\b|<picture\b|<figure\b/);
  assert.doesNotMatch(featuredProjects, /project-card|card|shadow|border-radius/i);
});