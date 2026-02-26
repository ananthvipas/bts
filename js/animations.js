/* 
    Bluro Technology - Animation Logic
    Uses Intersection Observer to trigger entrance animations
*/

document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing after animation triggers
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements to be animated
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in, .stagger-item');
    animatedElements.forEach(el => observer.observe(el));
});
