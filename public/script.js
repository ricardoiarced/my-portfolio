'use strict';

const header = document.querySelector('.site-header');
const navigationLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const destinations = navigationLinks.map((link) => ({
    link,
    section: link.hash === '#top' ? document.querySelector('.hero') : document.querySelector(link.hash),
})).filter(({ section }) => section);
let scrollUpdatePending = false;

function updateCurrentSection() {
    scrollUpdatePending = false;
    const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const threshold = (header?.offsetHeight ?? 0) + Math.min(window.innerHeight * 0.25, 160);
    let current = destinations[0];

    for (const destination of destinations) {
        if (destination.section.getBoundingClientRect().top <= threshold) {
            current = destination;
        }
    }

    if (pageBottom) current = destinations.at(-1);

    for (const { link } of destinations) {
        if (link === current?.link) {
            link.setAttribute('aria-current', 'location');
        } else {
            link.removeAttribute('aria-current');
        }
    }
}

function requestCurrentSectionUpdate() {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    window.requestAnimationFrame(updateCurrentSection);
}

header?.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const destination = link.hash === '#top' ? document.querySelector('.hero') : document.querySelector(link.hash);
    if (!destination) return;
    destination.setAttribute('tabindex', '-1');
    window.requestAnimationFrame(() => destination.focus({ preventScroll: true }));
});

window.addEventListener('scroll', requestCurrentSectionUpdate, { passive: true });
window.addEventListener('resize', requestCurrentSectionUpdate, { passive: true });
updateCurrentSection();
