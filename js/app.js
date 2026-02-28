/* 
    Bluro Technology - Main Logic
    Handles navigation, scroll events, and UI interactions
*/

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    // Reset contact form on every page load (clears data on refresh)
    const form = document.getElementById('contactForm');
    if (form) form.reset();


    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navigation Highlighting Logic
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    function highlightNav() {
        let currentSection = '';

        // 1. Check Scroll Position for Homepage Sections
        if (currentPath === 'index.html' || currentPath === '') {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= (sectionTop - 150)) {
                    currentSection = section.getAttribute('id');
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // 2. Exact Page Match
            const linkPath = href.split('/').pop().split('#')[0];
            let isMatch = (linkPath === currentPath);

            // 3. Section Match (for homepage anchors)
            // On index.html, we prioritize the scroll position (currentSection)
            if (currentPath === 'index.html' || currentPath === '') {
                // If it's a section-based link, only highlight if it's the current section
                if (href.includes('#')) {
                    const sectionId = href.split('#')[1];
                    isMatch = (currentSection === sectionId);
                } else if (linkPath === 'index.html' || linkPath === '') {
                    // "Home" link only active if we're at the very top (no current section)
                    isMatch = !currentSection;
                }
            }

            if (isMatch) {
                link.classList.add('active');

                // Highlight parent dropdown if child is active
                const dropdown = link.closest('.dropdown');
                if (dropdown) {
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) toggle.classList.add('active');
                }
            }
        });
    }

    // Initial highlight on load
    highlightNav();

    // Update on scroll (for scroll spy)
    window.addEventListener('scroll', highlightNav);

    // Contact Form — Google Sheets via Apps Script
    // ↓ Paste your deployed Apps Script URL here after setup
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwllkNFaSrmGrHRX6pKsl-CCVcwHBNpSbyC6mRCLHdYw_W-bW6-41EoPx2BMJ-qA_Wr/exec';

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            const payload = {
                name: contactForm.querySelector('[name="name"]').value.trim(),
                email: contactForm.querySelector('[name="email"]').value.trim(),
                phone: contactForm.querySelector('[name="phone"]').value.trim(),
                company: contactForm.querySelector('[name="company"]').value.trim() || 'Not provided',
                project_type: contactForm.querySelector('[name="project_type"]').value,
                message: contactForm.querySelector('[name="message"]').value.trim()
            };

            try {
                await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',   // required for Apps Script cross-origin
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // no-cors = can't read response, assume success after fetch completes
                contactForm.style.display = 'none';
                const successMsg = document.getElementById('form-success');
                if (successMsg) successMsg.style.display = 'block';

            } catch (err) {
                alert('Could not send. Please email us at blurotech.in@gmail.com');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // Intersection Observer for Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start CSS Animation if present
                if (getComputedStyle(entry.target).animationName !== 'none') {
                    entry.target.style.animationPlayState = 'running';
                }
                // Add .active class for CSS Transitions (fade-up, fade-in, etc.)
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up, .fade-in, .hero-animate, .slide-left, .slide-right').forEach(el => {
        // Pause CSS Animation initially
        if (getComputedStyle(el).animationName !== 'none') {
            el.style.animationPlayState = 'paused';
        }
        observer.observe(el);
    });

    // Auto-calculate copyright year
    document.querySelectorAll('.copyright-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

});
