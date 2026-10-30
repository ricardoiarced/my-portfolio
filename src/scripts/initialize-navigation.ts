// Keep this function self-contained: the layout serializes it into a blocking
// head script so deep links are positioned before the navigation module loads.
export function initializeNavigation(ids: readonly string[], aliases: Readonly<Record<string, string>>): void {
  const hash = location.hash.slice(1);
  const index = ids.indexOf(aliases[hash] || hash);
  document.documentElement.style.setProperty("--index", String(index < 0 ? 0 : index));
  document.documentElement.classList.add("lateral-enabled");
}
