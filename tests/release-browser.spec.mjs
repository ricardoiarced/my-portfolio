import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`${viewport.name} layout has no overflow or broken media`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./", { waitUntil: "networkidle" });

    const dimensions = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);

    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      expect(await image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
    }
  });
}

test("keyboard, landmarks, headings, actions, and reduced motion remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();

  await expect(page.locator("nav[aria-label]")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);

  const headingLevels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((headings) =>
    headings.map((heading) => Number(heading.tagName.slice(1))),
  );
  for (let index = 1; index < headingLevels.length; index += 1) {
    expect(headingLevels[index] - headingLevels[index - 1]).toBeLessThanOrEqual(1);
  }

  await expect(page.locator('a[href="mailto:ricardoiarced@gmail.com"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="assets/CV_ARCE_DIAZ_RICARDO_IRVIN.pdf"]')).not.toHaveCount(0);
  await expect(page.locator('a[href^="https://github.com/"]')).not.toHaveCount(0);
  await expect(page.locator('a[href^="https://www.linkedin.com/"]')).not.toHaveCount(0);
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
});
