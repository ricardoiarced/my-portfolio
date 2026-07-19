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

test("text-first hero keeps its approved hierarchy and restrained accent", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 800 });
  await page.goto("./");

  await expect(page.locator("#primary-navigation a")).toHaveText(["Work", "Contact"]);
  await expect(page.locator(".nav__toggle, .hero img")).toHaveCount(0);
  await expect(page.locator(".hero__primary")).toHaveText("View projects →");
  await expect(page.locator(".hero__secondary")).toHaveText("Get in touch");
  await expect(page.locator(".hero__availability")).toContainText("Available for new opportunities");

  const desktopHero = await page.locator(".hero").evaluate((hero) => {
    const headline = hero.querySelector("h1");
    const content = hero.querySelector(".hero-content");
    const footer = hero.querySelector(".hero-footer");
    const availability = hero.querySelector(".hero__availability");
    const socials = hero.querySelector(".hero__socials");
    const navigation = document.querySelector(".nav");
    const primary = hero.querySelector(".hero__primary");
    const headlineStyle = getComputedStyle(headline);
    const heroBounds = hero.getBoundingClientRect();
    const contentBounds = content.getBoundingClientRect();
    const footerBounds = footer.getBoundingClientRect();
    const availabilityBounds = availability.getBoundingClientRect();
    const socialsBounds = socials.getBoundingClientRect();
    const navigationBounds = navigation.getBoundingClientRect();
    const accent = "rgb(91, 155, 217)";
    const accentElements = [...document.querySelectorAll(".site-header *, .hero *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.color === accent || style.backgroundColor === accent ||
          (style.textDecorationLine !== "none" && style.textDecorationColor === accent);
      })
      .map((element) => element.className);

    return {
      fontSize: Number.parseFloat(headlineStyle.fontSize),
      lineCount: headline.getBoundingClientRect().height / Number.parseFloat(headlineStyle.lineHeight),
      lineBreaks: headline.querySelectorAll("br").length,
      pageWidth: document.body.clientWidth,
      heroWidth: heroBounds.width,
      contentWidth: contentBounds.width,
      footerWidth: footerBounds.width,
      navigationWidth: navigationBounds.width,
      contentCenterOffset: contentBounds.top + (contentBounds.height / 2) -
        (heroBounds.top + (heroBounds.height / 2)),
      footerLeftGap: availabilityBounds.left - footerBounds.left,
      footerRightGap: footerBounds.right - socialsBounds.right,
      primaryBackground: getComputedStyle(primary).backgroundColor,
      primaryBorder: getComputedStyle(primary).borderStyle,
      primaryDecoration: getComputedStyle(primary).textDecorationLine,
      divider: getComputedStyle(footer).borderTopWidth,
      accentElements,
      hasDecorativeEffect: [...hero.querySelectorAll("*")].some((element) => {
        const style = getComputedStyle(element);
        return style.boxShadow !== "none" || style.backgroundImage !== "none";
      }),
    };
  });

  expect(desktopHero.fontSize).toBeGreaterThanOrEqual(56);
  expect(desktopHero.fontSize).toBeLessThanOrEqual(58);
  expect(desktopHero.lineCount).toBeLessThanOrEqual(2.1);
  expect(desktopHero.lineBreaks).toBe(1);
  expect(desktopHero.heroWidth).toBe(Math.min(1400, desktopHero.pageWidth - 64));
  expect(desktopHero.navigationWidth).toBe(desktopHero.heroWidth);
  expect(desktopHero.contentWidth).toBe(1100);
  expect(desktopHero.footerWidth).toBe(desktopHero.heroWidth);
  expect(desktopHero.footerLeftGap).toBe(0);
  expect(desktopHero.footerRightGap).toBe(0);
  expect(desktopHero.contentCenterOffset).toBeLessThan(0);
  expect(desktopHero.primaryBackground).toBe("rgba(0, 0, 0, 0)");
  expect(desktopHero.primaryBorder).toBe("none");
  expect(desktopHero.primaryDecoration).toContain("underline");
  expect(desktopHero.divider).toBe("1px");
  expect(desktopHero.accentElements).toEqual(["eyebrow", "hero__primary", ""]);
  expect(desktopHero.hasDecorativeEffect).toBe(false);

  await page.locator("#featured-projects").scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Work", exact: true })).toHaveAttribute("aria-current", "location");

  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("./");
  const tabletLineCount = await page.locator("h1").evaluate((headline) => {
    const style = getComputedStyle(headline);
    return headline.getBoundingClientRect().height / Number.parseFloat(style.lineHeight);
  });
  expect(tabletLineCount).toBeLessThanOrEqual(2.1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const mobileLayout = await page.locator(".nav").evaluate((navigation) => {
    const wordmark = navigation.querySelector(".nav__name").getBoundingClientRect();
    const links = navigation.querySelector(".nav__links").getBoundingClientRect();
    return { wordmarkBottom: wordmark.bottom, linksTop: links.top };
  });
  const mobileHeadlineSize = await page.locator("h1").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  const mobileFooter = await page.locator(".hero-footer").evaluate((footer) => {
    const footerBounds = footer.getBoundingClientRect();
    const availabilityBounds = footer.querySelector(".hero__availability").getBoundingClientRect();
    const socialsBounds = footer.querySelector(".hero__socials").getBoundingClientRect();
    return {
      direction: getComputedStyle(footer).flexDirection,
      leftGap: availabilityBounds.left - footerBounds.left,
      rightGap: footerBounds.right - socialsBounds.right,
    };
  });
  expect(mobileLayout.linksTop).toBeGreaterThanOrEqual(mobileLayout.wordmarkBottom);
  expect(mobileHeadlineSize).toBeGreaterThanOrEqual(36);
  expect(mobileHeadlineSize).toBeLessThanOrEqual(40);
  expect(mobileFooter.direction).toBe("row");
  expect(mobileFooter.leftGap).toBe(0);
  expect(mobileFooter.rightGap).toBe(0);
});
