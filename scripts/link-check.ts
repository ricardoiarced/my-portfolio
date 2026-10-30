export function findExternalLinks(html: string): Set<string> {
  return new Set([...html.matchAll(/<a\b[^>]+href="(https?:\/\/[^"]+)"/g)].map(([, url]) => url));
}

export async function verifyExternalLinks(urls: Iterable<string>): Promise<void> {
  for (const url of urls) {
    let response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405) {
      response = await fetch(url, { redirect: "follow" });
      await response.body?.cancel();
    }

    const linkedinBlocksAutomation = new URL(url).hostname.endsWith("linkedin.com") && response.status === 999;
    if (!response.ok && !linkedinBlocksAutomation) {
      throw new Error(`${url} returned ${response.status}`);
    }
    console.log(`Verified external link: ${url}${linkedinBlocksAutomation ? " (LinkedIn blocks automated clients)" : ""}`);
  }
}
