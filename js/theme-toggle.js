/**
 * Global Theme Toggle & Persistence
 * This script runs immediately in the <head> to prevent theme flashing (FOUT).
 */

(function () {
    // 1. Immediate Execution (Prevents Flashing)
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;

    if (savedTheme === 'light') {
        htmlElement.classList.add('light-theme');
    } else {
        htmlElement.classList.remove('light-theme');
    }

    // 2. Button Interaction (Wait for DOM)
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isLight = htmlElement.classList.toggle('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });
        }
        // 3. Listen for changes from other tabs
        window.addEventListener('storage', (event) => {
            if (event.key === 'theme') {
                if (event.newValue === 'light') {
                    htmlElement.classList.add('light-theme');
                } else {
                    htmlElement.classList.remove('light-theme');
                }
            }
        });
    }); // Corrected: This closes the DOMContentLoaded listener
})(); // This closes the main IIFE
