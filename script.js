'use strict';

const header = document.querySelector('.site-header');
const menu = document.querySelector('#primary-navigation');
const menuButton = document.querySelector('.nav__toggle');

if (header && menu && menuButton) {
    const menuButtonLabel = menuButton.querySelector('.visually-hidden');
    const navigationLinks = [...menu.querySelectorAll('a')];
    const sectionLinks = [header.querySelector('.nav__name'), ...navigationLinks].filter(
        (link) => link?.hash,
    );
    const destinations = sectionLinks.map((link) => ({
        link,
        section: getNavigationTarget(link),
    })).filter(({ section }) => section);
    let menuOpen = false;
    let mobileMode;
    let scrollUpdatePending = false;

    function getNavigationTarget(link) {
        return link.hash === '#top' ? document.querySelector('.hero') : document.querySelector(link.hash);
    }

    function usesMobileNavigation() {
        return window.getComputedStyle(menuButton).display !== 'none';
    }

    function setMenuOpen(open, returnFocus = false) {
        const wasOpen = menuOpen;
        const mobile = usesMobileNavigation();
        menuOpen = mobile && open;
        menu.hidden = mobile && !menuOpen;
        menuButton.setAttribute('aria-expanded', String(menuOpen));
        menuButtonLabel.textContent = menuOpen ? 'Close navigation menu' : 'Open navigation menu';
        header.classList.toggle('site-header--menu-open', menuOpen);
        document.body.classList.toggle('nav-menu-open', menuOpen);

        if (menuOpen && !wasOpen) {
            navigationLinks[0]?.focus();
        } else if (returnFocus) {
            menuButton.focus();
        }
    }

    function configureNavigation() {
        header.classList.add('site-header--enhanced');
        menuButton.hidden = false;

        const mobile = usesMobileNavigation();
        const modeChanged = mobileMode !== undefined && mobile !== mobileMode;
        const activeElement = document.activeElement;
        const moveFocusToToggle = modeChanged && mobile && menu.contains(activeElement);
        const moveFocusToName = modeChanged && !mobile && activeElement === menuButton;
        mobileMode = mobile;

        setMenuOpen(modeChanged ? false : menuOpen);
        if (moveFocusToToggle) menuButton.focus();
        if (moveFocusToName) header.querySelector('.nav__name').focus();
    }

    function updateCurrentSection() {
        scrollUpdatePending = false;
        const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        const threshold = header.offsetHeight + Math.min(window.innerHeight * 0.25, 160);
        let current = destinations[0];

        for (const destination of destinations) {
            if (destination.section.getBoundingClientRect().top <= threshold) {
                current = destination;
            } else {
                break;
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

    menuButton.addEventListener('click', () => {
        if (menuOpen) {
            setMenuOpen(false, true);
        } else {
            setMenuOpen(true);
        }
    });

    header.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link || !usesMobileNavigation()) return;

        setMenuOpen(false);
        if (!link.hash) {
            menuButton.focus({ preventScroll: true });
            return;
        }

        const destination = getNavigationTarget(link);
        if (!destination) return;
        destination.setAttribute('tabindex', '-1');
        window.requestAnimationFrame(() => destination.focus({ preventScroll: true }));
    });

    header.addEventListener('keydown', (event) => {
        if (!menuOpen) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            setMenuOpen(false, true);
            return;
        }
        if (event.key !== 'Tab') return;

        const focusableElements = [header.querySelector('.nav__name'), menuButton, ...navigationLinks];
        const firstElement = focusableElements[0];
        const lastElement = focusableElements.at(-1);
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    window.addEventListener('scroll', requestCurrentSectionUpdate, { passive: true });
    window.addEventListener('resize', () => {
        configureNavigation();
        requestCurrentSectionUpdate();
    }, { passive: true });

    configureNavigation();
    updateCurrentSection();
}
