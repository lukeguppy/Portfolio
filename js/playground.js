// Hide scroll indicator on last section
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.playground-container');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const sections = document.querySelectorAll('.game-portal');

    if (!container || !scrollIndicator || sections.length === 0) return;

    const lastSection = sections[sections.length - 1];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target === lastSection && entry.isIntersecting) {
                scrollIndicator.classList.add('hidden');
            } else if (entry.target === lastSection && !entry.isIntersecting) {
                scrollIndicator.classList.remove('hidden');
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(lastSection);
});
