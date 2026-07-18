import { chromium } from "@playwright/test";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

import { startStaticServer } from "./static-server.mjs";

const port = 42732;
const server = await startStaticServer(port);
let chrome;

try {
  chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });
  const result = await lighthouse(`http://127.0.0.1:${port}/my-portfolio/`, {
    logLevel: "error",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: chrome.port,
  });
  if (!result) throw new Error("Lighthouse did not return a report");

  const minimumScores = {
    performance: 0.9,
    accessibility: 0.95,
    "best-practices": 0.95,
    seo: 0.95,
  };
  const failures = [];
  for (const [category, minimum] of Object.entries(minimumScores)) {
    const score = result.lhr.categories[category].score;
    console.log(`${result.lhr.categories[category].title}: ${Math.round(score * 100)}`);
    if (score < minimum) failures.push(`${category} scored ${score}, below ${minimum}`);
  }
  if (failures.length) throw new Error(failures.join("\n"));
} finally {
  await chrome?.kill();
  await new Promise((resolve) => server.close(resolve));
}
