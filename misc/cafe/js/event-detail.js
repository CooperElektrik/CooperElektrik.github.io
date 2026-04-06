document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector("#nav-bar");

    // 1. Navbar shrink on scroll
    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });

    // 2. Fade-in animation (Intersection Observer)
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target); // run once
            }
        });
    }, observerOptions);

    // Select all event items and cards for animation
    const elements = document.querySelectorAll(
        ".event-item, .event-card"
    );

    elements.forEach(el => {
        el.classList.add("hidden");
        observer.observe(el);
    });
});
