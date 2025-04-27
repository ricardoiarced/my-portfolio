'use strict';

// Mobile navigation
function setupMobileNavigation() {
    const btnNavEl = document.querySelector('.btn-mobile-nav');
    const headerEl = document.querySelector('.header');

    btnNavEl.addEventListener('click', function () {
        headerEl.classList.toggle('nav-open');
    });
}

// Page navigation
function setupPageNavigation() {
    const navLinks = document.querySelector('.nav__links');
    const headerEl = document.querySelector('.header'); // Already needed for mobile nav

    navLinks.addEventListener('click', function (e) {
        e.preventDefault();

        if (e.target.classList.contains('nav__link')) {
            const id = e.target.getAttribute('href');
            const element = document.querySelector(id);

            const headerOffset = 90; // 9rem = 90px
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Close mobile nav menu if open
            if (headerEl.classList.contains('nav-open')) {
                headerEl.classList.remove('nav-open');
            }
        }
    });

    const nav = document.querySelector('.nav');
    const navHeight = nav.getBoundingClientRect().height;
    const header = document.querySelector('.header');

    const stickyNav = function (entries) {
        const [entry] = entries;

        if (!entry.isIntersecting) nav.classList.add('sticky');
        else nav.classList.remove('sticky');
    }

    const headerObserver = new IntersectionObserver(stickyNav, {
        root: null,
        threshold: 0,
        rootMargin: `-${navHeight}px`,
    });

    headerObserver.observe(header);
}

setupMobileNavigation();
setupPageNavigation();