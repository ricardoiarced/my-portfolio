import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const experienceAndSkills = html.match(
  /<section[^>]+id="experience"[\s\S]*?<section[^>]+id="skills"[\s\S]*?<\/section>/,
)?.[0];

test("presents both resume-backed roles with concise evidence", () => {
  assert.ok(experienceAndSkills, "Experience should be followed by Skills & Technologies");

  const roles = [...experienceAndSkills.matchAll(/<article class="experience-item"[\s\S]*?<\/article>/g)];
  assert.equal(roles.length, 2);

  const expectedRoles = [
    {
      details: ["Software Engineer", "Beracah Médica", "Oct 2023 – Present", "Hermosillo, Sonora"],
      evidence: ["Odoo", "spreadsheet", "301 redirects", "AWS API"],
    },
    {
      details: ["Application Engineer", "Coinsamatik", "Sep 2021 – Jun 2023", "Hermosillo, Sonora"],
      evidence: ["C\\+\\+", "30 variable frequency drives", "totalizer", "PID control"],
    },
  ];

  for (const [index, expected] of expectedRoles.entries()) {
    const role = roles[index][0];
    const roleText = role.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    for (const detail of expected.details) assert.match(roleText, new RegExp(detail));
    assert.match(role, /<p class="experience-item__summary">[^<]+<\/p>/);

    const achievements = [...role.matchAll(/<li>([^<]+)<\/li>/g)].map(([, achievement]) => achievement);
    assert.ok(achievements.length >= 2 && achievements.length <= 4);
    for (const evidence of expected.evidence) {
      assert.match(achievements.join(" "), new RegExp(evidence));
    }
  }
});

test("groups verified skills by purpose without proficiency ratings", () => {
  assert.ok(experienceAndSkills, "Skills & Technologies section should exist");
  assert.match(experienceAndSkills, /<h2[^>]*>Skills &amp; Technologies<\/h2>/);

  const groups = [...experienceAndSkills.matchAll(/<article class="skill-group"[\s\S]*?<\/article>/g)].map(
    ([group]) => group,
  );
  assert.equal(groups.length, 4);

  const expectedGroups = [
    ["Product &amp; interface", ["React", "Next.js", "Electron", "HTML", "CSS", "Accessibility"]],
    ["Application &amp; data", ["Python", "TypeScript", "JavaScript", "Node.js", "PostgreSQL", "Supabase"]],
    ["Platforms, delivery &amp; verification", ["Odoo", "Magento 2", "AWS", "Docker", "Git", "GitHub Actions", "Vitest", "Playwright"]],
    ["Industrial systems", ["C++", "PLCs", "HMIs", "Variable frequency drives", "PID control"]],
  ];

  for (const [index, [heading, skills]] of expectedGroups.entries()) {
    assert.match(groups[index], new RegExp(`<h3>${heading}</h3>`));
    assert.deepEqual(
      [...groups[index].matchAll(/<li>([^<]+)<\/li>/g)].map(([, skill]) => skill),
      skills,
    );
  }

  assert.doesNotMatch(experienceAndSkills, /<progress|aria-valuenow|\b(?:beginner|intermediate|expert)\b/i);
});
