'use strict';

// Send email
const sendEmail = function () {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const formmessage = document.getElementById('message').value;
    const body = `
Name: ${name} <br />
Email: ${email}\ <br />
Message: ${formmessage}  
    `;
    Email.send({
        SecureToken: '39d79899-0a51-41ef-b5d7-65ebd7f63a72',
        To: 'ricardoiarced@gmail.com',
        From: 'ricardoiarced@gmail.com',
        Subject: `Message from ${name} in your portfolio`,
        Body: body
    }).then(
        message => {
            if (String(message) === 'OK') {
                swal('Your message has been sent successfully!', 'I\'m going to send you a response back', 'success');
            } else {
                swal('Something went wrong', 'Try again later', 'error');
            }
        }
    );
}

// Page navigation
document.querySelector('.nav__links').addEventListener('click', function (e) {
    e.preventDefault();

    //Matching strategy
    if (e.target.classList.contains('nav__link')) {
        const id = e.target.getAttribute('href');
        document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
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