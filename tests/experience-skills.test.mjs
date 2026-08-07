import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const experienceAndSkills = html.match(
  /<section class="document__section" id="experience"[\s\S]*?<section class="document__section" id="about"/,
)?.[0];

test("presents three resume-backed roles with concise evidence", () => {
  assert.ok(experienceAndSkills, "Experience should be followed by Skills");

  const jobs = [...experienceAndSkills.matchAll(/<article class="job"[\s\S]*?<\/article>/g)].map(([entry]) => entry);
  assert.equal(jobs.length, 3);

  const expected = [
    {
      details: ["Junior ERP Developer", "Villa Group Resorts &amp; Spas", "Aug 2025 – Present"],
      evidence: ["Odoo", "v17 to v19", "7 hotel properties"],
    },
    {
      details: ["Junior Software Engineer", "Beracah Médica", "Oct 2023 – Aug 2025"],
      evidence: ["checkout", "spreadsheet", "301 redirects"],
    },
    {
      details: ["Application Engineer", "Coinsamatik", "Sep 2021 – Jun 2023"],
      evidence: ["C\\+\\+", "totalizer", "PID control"],
    },
  ];

  for (const [index, expectations] of expected.entries()) {
    const job = jobs[index];
    for (const detail of expectations.details) assert.match(job, new RegExp(detail));

    const bullets = [...job.matchAll(/<li>([^<]+)<\/li>/g)].map(([, bullet]) => bullet);
    assert.ok(bullets.length >= 2 && bullets.length <= 3);
    for (const evidence of expectations.evidence) {
      assert.match(bullets.join(" "), new RegExp(evidence));
    }
  }
});

test("groups verified skills by focus without proficiency ratings", () => {
  assert.ok(experienceAndSkills, "Skills section should exist");

  const lines = [...experienceAndSkills.matchAll(/<p class="skill-line"[\s\S]*?<\/p>/g)].map(([line]) => line);
  assert.equal(lines.length, 4);

  const expectedLabels = ["Product &amp; interface", "Application &amp; data", "Platforms &amp; delivery", "Industrial"];
  for (const [index, label] of expectedLabels.entries()) {
    assert.match(lines[index], new RegExp(`class="skill-line__label">${label}<`));
  }

  assert.doesNotMatch(experienceAndSkills, /<progress|aria-valuenow|\b(?:beginner|intermediate|expert)\b/i);
});