import { sections, sectionAliases } from "../data/sections";

const root = document.documentElement;
const panels = sections.map(section => document.getElementById(section.id)!);
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>(".site-nav a")];
let current = -1;
let moveTimer: number | undefined;

function speedMs(): number {
  // Production CSS may minify 650ms to .65s.
  const match = /([\d.]+)\s*(ms|s)\b/.exec(getComputedStyle(root).getPropertyValue("--speed"));
  if (!match) return 0;
  return parseFloat(match[1]) * (match[2] === "ms" ? 1 : 1000);
}

function indexFromHash(hash = location.hash): number {
  const id = hash.slice(1);
  const index = sections.findIndex(section => section.id === (sectionAliases[id] || id));
  return index < 0 ? 0 : index;
}

function show(index: number, { push = true, focus = true } = {}): void {
  index = Math.min(Math.max(index, 0), panels.length - 1);
  const previous = current;
  current = index;
  if (previous !== index) {
    // Only the leaving and arriving panels may be visible during a jump.
    panels.forEach((panel, position) => {
      panel.classList.toggle("is-skip", previous !== -1 && position !== previous && position !== index);
    });
    window.clearTimeout(moveTimer);
    moveTimer = window.setTimeout(() => {
      panels.forEach(panel => panel.classList.remove("is-skip"));
    }, speedMs() + 50);
  }
  root.style.setProperty("--index", String(index));
  panels.forEach((panel, position) => {
    const active = position === index;
    panel.classList.toggle("is-active", active);
    panel.inert = !active;
    if (!active) panel.querySelectorAll<HTMLMediaElement>("video, audio").forEach(media => media.pause());
  });
  navLinks.forEach((link, position) => {
    if (position === index) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (push && location.hash !== `#${sections[index].id}`) {
    const url = new URL(location.href);
    url.hash = sections[index].id;
    history.pushState({ section: sections[index].id }, "", url);
  }
  if (focus) panels[index].focus({ preventScroll: true });
}

document.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute("href")!;
  if (hash === "#main-content") {
    event.preventDefault();
    show(current, { push: false });
    return;
  }
  const id = hash.slice(1);
  const index = sections.findIndex(section => section.id === (sectionAliases[id] || id));
  if (index < 0) return;
  event.preventDefault();
  show(index);
});

window.addEventListener("popstate", () => show(indexFromHash(), { push: false }));
window.addEventListener("hashchange", () => show(indexFromHash(), { push: false }));

const initialUrl = new URL(location.href);
const initialHash = initialUrl.hash.slice(1);
initialUrl.searchParams.delete("variant");
if (initialHash) initialUrl.hash = sections[indexFromHash()].id;
if (initialUrl.href !== location.href) history.replaceState(history.state, "", initialUrl);
show(indexFromHash(), { push: false, focus: false });
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));
