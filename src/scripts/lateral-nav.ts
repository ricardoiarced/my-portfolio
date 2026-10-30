import { sections, sectionAliases } from "../data/sections";

const root = document.documentElement;
const panels = sections.map(section => document.getElementById(section.id)!);
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>(".site-nav a")];
const mobile = window.matchMedia("(max-width: 640px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = -1;
let animations: Animation[] = [];

function stopMotion(): void {
  animations.forEach(animation => animation.cancel());
  animations = [];
  panels.forEach(panel => panel.style.removeProperty("z-index"));
}

function cover(previous: HTMLElement, incoming: HTMLElement, direction: number, from: { transform: string; filter: string }): void {
  const style = getComputedStyle(root);
  const speed = style.getPropertyValue("--speed").trim();
  const options: KeyframeAnimationOptions = {
    duration: parseFloat(speed) * (speed.endsWith("ms") ? 1 : 1000),
    easing: style.getPropertyValue("--ease").trim(),
    fill: "both",
  };
  previous.style.zIndex = "1";
  incoming.style.zIndex = "2";
  const running = [
    previous.animate([
      { transform: from.transform, filter: from.filter },
      { transform: `translateX(${-direction * 12}%) scale(0.94)`, filter: "brightness(0.65)" },
    ], options),
    incoming.animate([
      { transform: `translateX(${direction * 100}%)`, filter: "none" },
      { transform: "translateX(0) scale(1)", filter: "none" },
    ], options),
  ];
  animations = running;
  Promise.all(running.map(animation => animation.finished)).then(() => {
    if (animations === running) stopMotion();
  }).catch(() => { /* A newer navigation or layout change canceled this transition. */ });
}

function indexFromHash(hash = location.hash): number {
  const id = hash.slice(1);
  const index = sections.findIndex(section => section.id === (sectionAliases[id] || id));
  return index < 0 ? 0 : index;
}

function show(index: number, { push = true, focus = true, scroll = true } = {}): void {
  const previous = current;
  const changed = previous !== index;
  const animate = changed && previous >= 0 && root.classList.contains("is-ready") && !mobile.matches && !reducedMotion.matches;
  // Snapshot the visible incoming panel before canceling an interrupted transition.
  const from = animate ? { transform: getComputedStyle(panels[previous]).transform, filter: getComputedStyle(panels[previous]).filter } : null;
  if (changed || mobile.matches || reducedMotion.matches) stopMotion();
  current = index;
  root.style.setProperty("--index", String(index));
  panels.forEach((panel, position) => {
    const active = position === index;
    panel.classList.toggle("is-active", active);
    panel.inert = !mobile.matches && !active;
    if (!active) panel.querySelectorAll<HTMLMediaElement>("video, audio").forEach(media => media.pause());
  });
  if (animate && from) cover(panels[previous], panels[index], Math.sign(index - previous), from);
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
  if (mobile.matches && scroll) panels[index].scrollIntoView({ behavior: "auto", block: "start" });
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
reducedMotion.addEventListener("change", stopMotion);
mobile.addEventListener("change", () => {
  if (!mobile.matches) window.scrollTo({ top: 0, behavior: "auto" });
  show(current, { push: false, focus: false });
});

const initialUrl = new URL(location.href);
const initialHash = initialUrl.hash.slice(1);
initialUrl.searchParams.delete("variant");
if (initialHash) initialUrl.hash = sections[indexFromHash()].id;
if (initialUrl.href !== location.href) history.replaceState(history.state, "", initialUrl);
show(indexFromHash(), { push: false, focus: false, scroll: Boolean(location.hash) });
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));
