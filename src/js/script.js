// Smooth scrolling for nav links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Fade in animation for about section paragraphs
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all about section paragraphs
document.addEventListener('DOMContentLoaded', () => {
    const aboutParagraphs = document.querySelectorAll('.about-content p');
    aboutParagraphs.forEach(paragraph => {
        observer.observe(paragraph);
    });
});