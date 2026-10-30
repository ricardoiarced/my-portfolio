import { expect, test } from "@playwright/test";

const viewports = [
  { width: 1600, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 640, height: 360 },
];

async function activePanel(page, id) {
  await expect(page.locator('.site-nav [aria-current="page"]')).toHaveAttribute("href", `#${id}`);
  await expect(page.locator(`#${id}`)).toHaveClass(/is-active/);
  await expect(page.locator(`#${id}`)).not.toHaveAttribute("inert", "");
  if (page.viewportSize().width > 640) {
    await expect(page.locator(".panel[inert]")).toHaveCount(3);
    await expect.poll(() => page.locator(`#${id}`).evaluate(panel => Math.abs(panel.getBoundingClientRect().left))).toBeLessThan(1);
  }
}

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
    await page.goto(`./#${hash}`);
    await activePanel(page, destination);
    await expect(page).toHaveURL(new RegExp(`#${destination}$`));
  }
});

test("cover/push layers the incoming panel above a shrinking, darkening panel and handles interruption", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await expect(page.locator("html")).toHaveClass(/is-ready/);
  await page.locator('.site-nav a[href="#experience"]').click();
  const motion = await page.evaluate(() => {
    const outgoing = document.querySelector("#about");
    const incoming = document.querySelector("#experience");
    return {
      outgoingPosition: getComputedStyle(outgoing).position,
      incomingPosition: getComputedStyle(incoming).position,
      above: Number(getComputedStyle(incoming).zIndex) > Number(getComputedStyle(outgoing).zIndex),
      outgoingFrames: outgoing.getAnimations()[0].effect.getKeyframes(),
      incomingFrames: incoming.getAnimations()[0].effect.getKeyframes(),
      duration: incoming.getAnimations()[0].effect.getTiming().duration,
    };
  });
  expect(motion.outgoingPosition).toBe("absolute");
  expect(motion.incomingPosition).toBe("absolute");
  expect(motion.above).toBe(true);
  expect(motion.duration).toBe(800);
  expect(motion.outgoingFrames.at(-1).transform).toContain("scale(0.94)");
  expect(motion.outgoingFrames.at(-1).filter).toBe("brightness(0.65)");
  expect(motion.incomingFrames[0].transform).toBe("translateX(100%)");
  await page.locator('.site-nav a[href="#contact"]').click();
  await page.locator('.site-nav a[href="#projects"]').click();
  await activePanel(page, "projects");
  await expect.poll(() => page.locator(".panel-stack").evaluate(stack => stack.getAnimations({ subtree: true }).length)).toBe(0);
});

test("long Experience content scrolls without moving the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("./#experience");
  await activePanel(page, "experience");
  await page.locator("#experience").press("PageDown");
  await expect.poll(() => page.locator("#experience").evaluate(panel => panel.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 });
});

test("skip link and Tab keep keyboard focus out of inactive panels", async ({ page }) => {
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
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.locator('.site-nav a[href="#contact"]').click();
  await activePanel(page, "contact");
  await expect(page.locator(".nav-indicator")).toHaveCSS("transition-duration", "0s");
  expect(await page.locator(".panel-stack").evaluate(stack => stack.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const viewport of viewports) {
  test(`${viewport.width}px viewport keeps content reachable without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./#experience");
    await activePanel(page, "experience");
    const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(layout.width).toBeLessThanOrEqual(layout.viewport);
    if (viewport.width <= 640) {
      await expect(page.locator(".panel[inert]")).toHaveCount(0);
      await expect(page.locator("#experience")).toHaveCSS("position", "static");
      await expect(page.locator("#experience")).toHaveCSS("transform", "none");
      await expect(page.locator("#experience .quiet-job").last()).toContainText("Coinsamatik");
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
