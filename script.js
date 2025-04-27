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
    const headerEl = document.querySelector('.header'); // Add this
    document.querySelector('.nav__links').addEventListener('click', function (e) {
        e.preventDefault();

        if (e.target.classList.contains('nav__link')) {
            const id = e.target.getAttribute('href');
            document.querySelector(id).scrollIntoView({ behavior: 'smooth' });

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
sendEmail();