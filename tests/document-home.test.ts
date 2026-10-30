import assert from "node:assert/strict";
import test from "node:test";
import { html, panel } from "./site-fixture.ts";

test("renders the complete portfolio in static HTML with one main landmark", () => {
  assert.equal([...html.matchAll(/<main\b/g)].length, 1);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  for (const id of ["about", "experience", "projects", "contact"]) assert.ok(panel(id), `${id} is present before JavaScript`);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.doesNotMatch(html, /prototype-switcher|prototype-canvas|data-prototype|<template/);
});

test("has unique ids and named, programmatically focusable panels", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length);
  for (const [id, label] of [["about", "About"], ["experience", "Experience"], ["projects", "Projects"], ["contact", "Contact"]]) {
    assert.match(panel(id), /tabindex="-1"/);
    assert.ok(panel(id).includes(`aria-label="${label}"`));
  }
});
