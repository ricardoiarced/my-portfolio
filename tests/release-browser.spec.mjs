import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const projectRoutes = [
  "projects/personal-finance.html",
  "projects/local-notes.html",
  "projects/pomodoro-timer.html",
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

test("case studies remain responsive and complete across representative viewports", async ({ page }) => {
  for (const route of projectRoutes) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(route);

      await expect(page.locator(".skip-link")).toHaveCount(1);
      await expect(page.locator('nav[aria-label="Primary navigation"]')).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);

      const dimensions = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);

      const image = page.locator("main img");
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      expect(await image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test("keyboard, landmarks, headings, actions, and reduced motion remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();

  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.locator("nav[aria-label]")).toHaveCount(0);

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

test("text-first Document keeps its approved hierarchy and restrained accent", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 800 });
  await page.goto("./");

  const documentBlock = page.locator("article.document");
  await expect(documentBlock.locator(".document__name")).toHaveText("Ricardo Arce");
  await expect(documentBlock.locator(".document__role")).toContainText("Junior ERP Developer");
  await expect(documentBlock.locator(".document__statement")).toBeVisible();

  const accent = "rgb(91, 155, 217)";
  const documentMetrics = await documentBlock.evaluate((block, accentColor) => {
    const role = block.querySelector(".document__role");
    const statement = block.querySelector(".document__statement");
    const number = block.querySelector(".project__number");
    const link = block.querySelector(".project__link");
    const roleStyle = getComputedStyle(role);
    const accentElements = [...block.querySelectorAll("*")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.color === accentColor || style.backgroundColor === accentColor ||
          (style.textDecorationLine !== "none" && style.textDecorationColor === accentColor);
      })
      .map((element) => element.className)
      .filter((value) => typeof value === "string" && value.length > 0);

    return {
      roleFamily: roleStyle.fontFamily,
      statementSize: Number.parseFloat(getComputedStyle(statement).fontSize),
      numberSize: Number.parseFloat(getComputedStyle(number).fontSize),
      linkDecorationColor: getComputedStyle(link).textDecorationColor,
      accentElements: [...new Set(accentElements)],
      hasDecorativeEffect: [...block.querySelectorAll("*")].some((element) => {
        const style = getComputedStyle(element);
        return style.boxShadow !== "none" || style.backgroundImage !== "none" ||
          style.borderRadius !== "0px";
      }),
    };
  }, accent);

  expect(documentMetrics.roleFamily).toContain("IBM Plex Mono");
  expect(documentMetrics.statementSize).toBeGreaterThanOrEqual(15);
  expect(documentMetrics.numberSize).toBeGreaterThanOrEqual(10);
  expect(documentMetrics.linkDecorationColor).toBe(accent);
  expect(documentMetrics.accentElements).toEqual(["project__number", "project__link"]);
  expect(documentMetrics.hasDecorativeEffect).toBe(false);

  await expect(page.locator("#featured-projects .document__marker")).toHaveText("Work");
  await expect(page.locator("#contact .document__status")).toHaveText("Available for new opportunities");
});

test("work projects render as minimal rows and link to case studies", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("./");

  const work = page.locator("#featured-projects");
  await expect(work.locator(".project")).toHaveCount(3);
  await expect(work.locator("img, picture, figure")).toHaveCount(0);

  const row = work.locator(".project").first();
  const desktop = await row.evaluate((entry) => {
    const title = entry.querySelector("h2");
    const description = entry.querySelector(".project__description");
    const stack = entry.querySelector(".project__stack");
    const link = entry.querySelector(".project__link");
    const titleStyle = getComputedStyle(title);
    const rowStyle = getComputedStyle(entry);

    return {
      gridColumns: rowStyle.gridTemplateColumns,
      borderBottom: rowStyle.borderBottomWidth,
      borderRadius: rowStyle.borderRadius,
      boxShadow: rowStyle.boxShadow,
      titleFamily: titleStyle.fontFamily,
      stackFamily: getComputedStyle(stack).fontFamily,
      descriptionFamily: getComputedStyle(description).fontFamily,
      linkDecorationColor: getComputedStyle(link).textDecorationColor,
    };
  });

  expect(desktop.gridColumns.split(" ").length).toBeGreaterThan(1);
  expect(desktop.borderBottom).toBe("1px");
  expect(desktop.borderRadius).toBe("0px");
  expect(desktop.boxShadow).toBe("none");
  expect(desktop.titleFamily).toContain("Fraunces");
  expect(desktop.stackFamily).toContain("IBM Plex Mono");
  expect(desktop.descriptionFamily).toContain("IBM Plex Mono");
  expect(desktop.linkDecorationColor).toBe("rgb(91, 155, 217)");

  const firstLink = work.locator(".project__link").first();
  await firstLink.focus();
  expect(await firstLink.evaluate((l) => getComputedStyle(l).outlineStyle)).not.toBe("none");

  await work.locator(".project__link").first().click();
  await expect(page).toHaveURL(/projects\/personal-finance\.html$/);
  await expect(page.locator(".skip-link")).toHaveCount(1);
  await expect(page.locator('nav[aria-label="Primary navigation"]')).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  expect(await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});