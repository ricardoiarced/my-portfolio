import assert from "node:assert/strict";
import test from "node:test";
import { panel } from "./site-fixture.mjs";

const experience = panel("experience");
test("preserves chronology, actual job locations, and delivery status", () => {
  assert.equal([...experience.matchAll(/<article class="quiet-job"/g)].length, 3);
  for (const fact of ["Aug 2025 — Sep 2026", "Puerto Vallarta, Jalisco", "Oct 2023 — Aug 2025", "Sep 2021 — Jun 2023", "Hermosillo, Sonora", "491 accounts", "2,000+ equipment records", "10,000+ products", "staging", "testing before my departure"]) {
    assert.ok(experience.includes(fact), fact);
  }
  assert.doesNotMatch(experience, /\bPresent\b|\bCurrent\b|15 active users|preserved.*SEO/i);
});

test("retains optional contributions and keeps the two Beracah integrations distinct", () => {
  assert.equal([...experience.matchAll(/<details\b/g)].length, 2);
  assert.match(experience, /cost-center adjustments/);
  assert.match(experience, /production Excel importer for supplier costs/);
  assert.match(experience, /scheduled CSV exports to AWS S3/);
  assert.doesNotMatch(experience, /<progress|aria-valuenow|\b(?:beginner|intermediate|expert)\b/i);
});
