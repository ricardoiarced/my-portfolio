// PROTOTYPE ONLY. No storage or production behavior.
(() => {
  const variants = [
    { key: "A", name: "Quiet index", description: "Text first · one column · lime accent" },
    { key: "B", name: "Split profile", description: "Sticky introduction · experience first · blue accent" },
    { key: "C", name: "Project gallery", description: "Visual work · wide layout · warm white" },
  ];
  const canvas = document.querySelector("#prototype-canvas");
  let current = 0;

  function render(updateUrl = false) {
    const url = new URL(location.href);
    const variant = variants.find(item => item.key === url.searchParams.get("variant")) || variants[0];
    current = variants.indexOf(variant);
    document.documentElement.dataset.portfolioVariant = variant.key;
    const template = document.querySelector(`[data-prototype-template="${variant.key}"]`);
    canvas.replaceChildren(template.content.cloneNode(true));
    document.querySelector("[data-prototype-label]").textContent = `${variant.key} · ${variant.name}`;
    document.querySelector("[data-prototype-description]").textContent = variant.description;
    document.querySelector("[data-prototype-count]").textContent = `${current + 1} / ${variants.length}`;
    document.title = `${variant.name} — Portfolio prototype | Ricardo Arce`;
    if (updateUrl) window.scrollTo({ top: 0, behavior: "instant" });
    console.info("Portfolio prototype", {
      ...variant,
      sections: variant.key === "B" ? ["experience", "projects", "contact"] : ["projects", "experience", "contact"],
      portrait: false,
      persistent: false,
      url: url.href,
    });
  }

  function cycle(direction) {
    const next = variants[(current + direction + variants.length) % variants.length];
    const url = new URL(location.href);
    url.searchParams.set("variant", next.key);
    url.hash = "";
    history.pushState({}, "", url);
    render(true);
  }

  document.querySelector("[data-prototype-previous]").addEventListener("click", () => cycle(-1));
  document.querySelector("[data-prototype-next]").addEventListener("click", () => cycle(1));
  document.addEventListener("keydown", event => {
    if (event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      cycle(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  window.addEventListener("popstate", () => render());
  render();
})();
