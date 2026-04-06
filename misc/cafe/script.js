window.addEventListener('scroll', function () {
    var navBar = document.getElementById('nav-bar');
    if (window.scrollY > 50) {
        navBar.classList.add('scrolled');
    } else {
        navBar.classList.remove('scrolled');
    }
});

const btn = document.getElementById('mobile-nav-button');
const menu = document.getElementById('nav-bar-buttons');

if (btn && menu) {
    btn.addEventListener('click', () => {
        menu.classList.toggle('show-menu');
    });
}

// Cart: use shared localStorage-backed cart
document.addEventListener('DOMContentLoaded', function () {
    if (typeof CafaoCart !== 'undefined') {
        CafaoCart.renderCartWidget();
        CafaoCart.bindAddToCartButtons();
    }
});