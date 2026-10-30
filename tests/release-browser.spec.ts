import { devices, expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 1600, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 640, height: 360 },
];

async function activePanel(page: Page, id: string): Promise<void> {
  await expect(page.locator('.site-nav [aria-current="page"]')).toHaveAttribute("href", `#${id}`);
  await expect(page.locator(`#${id}`)).toHaveClass(/is-active/);
  await expect(page.locator(`#${id}`)).not.toHaveAttribute("inert", "");
  await expect(page.locator(".panel[inert]")).toHaveCount(3);
  await expect.poll(() => page.locator(`#${id}`).evaluate(panel => Math.abs(panel.getBoundingClientRect().left))).toBeLessThan(1);
}

test("phone taps animate the cover and keep inactive panels out of reach", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...devices["iPhone 13"], baseURL, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("./");
  await expect(page.locator("html")).toHaveClass(/is-ready/);
  await page.locator('.site-nav a[href="#experience"]').tap();
  expect(await page.locator("#experience").evaluate(panel => panel.getAnimations().length)).toBeGreaterThan(0);
  await activePanel(page, "experience");
  await expect(page.locator(".panel[inert]")).toHaveCount(3);
  await page.locator("#experience").evaluate(panel => panel.scrollTo(0, panel.scrollHeight));
  expect(await page.locator("#experience").evaluate(panel => panel.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 });
  await page.locator(".wordmark").tap();
  await activePanel(page, "about");
  await page.getByRole("link", { name: "Get in touch", exact: true }).tap();
  await activePanel(page, "contact");
  await page.locator('.site-nav a[href="#experience"]').tap();
  await activePanel(page, "experience");
  expect(await page.locator("#experience").evaluate(panel => panel.scrollTop)).toBeGreaterThan(0);
  await page.goBack();
  await activePanel(page, "contact");
  await page.goForward();
  await activePanel(page, "experience");
  await context.close();
});

test("menu, CTA, and history navigate panels and move focus", async ({ page }) => {
  await page.goto("./");
  for (const id of ["experience", "projects", "contact", "about"]) {
    await page.locator(`.site-nav a[href="#${id}"]`).click();
    await activePanel(page, id);
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
  await page.getByRole("link", { name: "Get in touch", exact: true }).click();
  await activePanel(page, "contact");
  await page.goBack();
  await activePanel(page, "about");
  await page.goForward();
  await activePanel(page, "contact");
});

test("direct and legacy deep links select their destination on load", async ({ page }) => {
  for (const [hash, destination] of [["experience", "experience"], ["featured-projects", "projects"], ["top", "about"], ["unknown", "about"]]) {
    // Different hashes on the same document do not reload the initial script.
    await page.goto("about:blank");
    await page.goto(`./#${hash}`);
    await activePanel(page, destination);
    await expect(page).toHaveURL(new RegExp(`#${destination}$`));
  }
});

test("a phone deep link is positioned before the navigation module loads", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // Astro may inline small modules in production; retain only the early script.
  await page.route("**/my-portfolio/", async route => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({ response, body: html.replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, "") });
  });
  await page.goto("./#experience");
  await expect(page.locator("html")).not.toHaveClass(/is-ready/);
  expect(await page.locator("#experience").evaluate(panel => panel.getBoundingClientRect().left)).toBe(0);
  expect(await page.locator("#projects").evaluate(panel => panel.getBoundingClientRect().left)).toBe(390);
  expect(await page.locator(".panel-stack").evaluate(stack => stack.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const width of [1280, 390]) {
  test(`${width}px cover/push reverses its layers and synchronizes the menu`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("./");
    await expect(page.locator("html")).toHaveClass(/is-ready/);
    for (const destination of ["experience", "about"]) {
      await page.locator(`.site-nav a[href="#${destination}"]`).click();
      const motion = await page.evaluate(() => {
        const animations = document.getAnimations();
        animations.forEach(animation => {
          animation.pause();
          if (!animation.effect) throw new Error("Animation should have an effect");
          animation.currentTime = Number(animation.effect.getTiming().duration) / 2;
        });
        const about = document.querySelector("#about");
        const experience = document.querySelector("#experience");
        const indicator = document.querySelector(".nav-indicator");
        if (!about || !experience || !indicator) throw new Error("Navigation elements should exist");
        const brightness = getComputedStyle(about).filter.match(/[\d.]+/);
        if (!brightness) throw new Error("About panel should have a brightness filter");
        return {
          durations: animations.map(animation => animation.effect?.getTiming().duration),
          aboutX: about.getBoundingClientRect().left,
          experienceX: experience.getBoundingClientRect().left,
          aboutBrightness: parseFloat(brightness[0]),
          above: Number(getComputedStyle(experience).zIndex) > Number(getComputedStyle(about).zIndex),
          indicatorProgress: new DOMMatrixReadOnly(getComputedStyle(indicator).transform).m41 / indicator.getBoundingClientRect().width,
        };
      });
      expect(motion.durations.length).toBeGreaterThan(0);
      expect(motion.durations.every(duration => duration === 650)).toBe(true);
      expect(motion.above).toBe(true);
      expect(motion.aboutX).toBeLessThan(0);
      expect(motion.aboutX).toBeGreaterThan(-width / 4);
      expect(motion.experienceX).toBeGreaterThan(0);
      expect(motion.experienceX).toBeLessThan(width);
      expect(motion.aboutBrightness).toBeLessThan(1);
      expect(motion.indicatorProgress).toBeCloseTo(1 - motion.experienceX / width, 2);
      await page.evaluate(() => document.getAnimations().forEach(animation => animation.finish()));
      await activePanel(page, destination);
    }
  });

  test(`${width}px jumps hide intermediate panels and rapid navigation settles`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    await expect(page.locator("html")).toHaveClass(/is-ready/);
    for (const destination of ["contact", "about"]) {
      await page.locator(`.site-nav a[href="#${destination}"]`).click();
      await expect(page.locator("#experience")).toHaveCSS("visibility", "hidden");
      await expect(page.locator("#projects")).toHaveCSS("visibility", "hidden");
      await activePanel(page, destination);
      await expect(page.locator(".panel.is-skip")).toHaveCount(0);
      expect(await page.locator("#experience").evaluate(panel => panel.getAnimations().length)).toBe(0);
      expect(await page.locator("#projects").evaluate(panel => panel.getAnimations().length)).toBe(0);
    }
    for (const id of ["experience", "contact", "projects", "about", "projects"]) {
      await page.locator(`.site-nav a[href="#${id}"]`).click();
    }
    await activePanel(page, "projects");
    await expect(page.locator(".panel.is-skip")).toHaveCount(0);
    await expect.poll(() => page.locator(".panel-stack").evaluate(stack => stack.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(page.locator("#projects")).toHaveCSS("visibility", "visible");
  });
}

test("long Experience content scrolls without moving the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("./#experience");
  await activePanel(page, "experience");
  await page.locator("#experience").press("PageDown");
  await expect.poll(() => page.locator("#experience").evaluate(panel => panel.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 });
});

test("skip link and Tab keep keyboard focus out of inactive panels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#about")).toBeFocused();
  await page.locator('.site-nav a[href="#contact"]').click();
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    const focusedPanel = await page.evaluate(() => document.activeElement?.closest(".panel")?.id ?? null);
    expect([null, "contact"]).toContain(focusedPanel);
  }
});

test("reduced motion switches panels immediately without cover or indicator motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.locator('.site-nav a[href="#contact"]').click();
  await activePanel(page, "contact");
  await expect(page.locator(".nav-indicator")).toHaveCSS("transition-duration", "0s");
  expect(await page.locator(".panel-stack").evaluate(stack => stack.getAnimations({ subtree: true }).length)).toBe(0);
});

test("enabling reduced motion during a phone transition settles immediately", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await expect(page.locator("html")).toHaveClass(/is-ready/);
  await page.locator('.site-nav a[href="#contact"]').click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await activePanel(page, "contact");
  expect(await page.locator(".panel-stack").evaluate(stack => stack.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const viewport of viewports) {
  test(`${viewport.width}px viewport keeps content reachable without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#experience");
    await activePanel(page, "experience");
    const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(layout.width).toBeLessThanOrEqual(layout.viewport);
    await expect(page.locator("#experience")).toHaveCSS("overflow-y", "auto");
    await page.locator("#experience .quiet-job").last().scrollIntoViewIfNeeded();
    await expect(page.locator("#experience .quiet-job").last()).toBeInViewport();
    for (const link of await page.locator(".site-nav a").all()) {
      const bounds = await link.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
  });
}

test("without JavaScript, all portfolio content is readable vertically", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("./");
  await expect(page.locator(".panel")).toHaveCount(4);
  await expect(page.locator(".panel[inert]")).toHaveCount(0);
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.locator("#contact")).toHaveCSS("transform", "none");
  await context.close();
});

test("case-study navigation returns to the Projects panel", async ({ page }) => {
  await page.goto("./#projects");
  await activePanel(page, "projects");
  await page.locator(".quiet-project").filter({ hasText: "Personal Finance Tracker" }).click();
  await expect(page).toHaveURL(/projects\/personal-finance\.html$/);
  await expect(page.locator("main img")).toHaveJSProperty("complete", true);
  await page.getByRole("link", { name: "← Back to work", exact: true }).click();
  await activePanel(page, "projects");
});
