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

btn.addEventListener('click', () => {
    // This toggles a class so the menu stays open until clicked again
    menu.classList.toggle('show-menu');
});

// Cart functionality
var cart = [];
var cartItemsListEl = document.getElementById('cart-items-list');
var cartTotalEl = document.getElementById('cart-total');
var cartItemsEl = document.getElementById('cart-items');

function updateCart() {
    if (!cartItemsListEl || !cartTotalEl) return;

    // Show/hide cart list based on item count
    if (cart.length > 0) {
        cartItemsEl.classList.add('visible');
    } else {
        cartItemsEl.classList.remove('visible');
    }

    // Update items list
    if (cart.length === 0) {
        cartItemsListEl.innerHTML = '<p class="cart-empty">Giỏ hàng trống</p>';
        cartTotalEl.textContent = 'Tổng: ₫0';
    } else {
        cartItemsListEl.innerHTML = '';
        var total = 0;
        cart.forEach(function (item, index) {
            var itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML =
                '<div class="cart-item-info">' +
                '<p class="cart-item-name">' + item.name + '</p>' +
                '<p class="cart-item-price">' + item.price + '</p>' +
                '</div>' +
                '<button class="cart-item-remove" data-index="' + index + '">&times;</button>';
            cartItemsListEl.appendChild(itemEl);
            total += item.priceNum;
        });
        cartTotalEl.textContent = 'Tổng: ₫' + total.toLocaleString();

        // Scroll to bottom
        cartItemsEl.scrollTop = cartItemsEl.scrollHeight;

        // Add remove event listeners
        document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
}

function addToCart(name, price, priceNum) {
    cart.push({ name: name, price: price, priceNum: priceNum });
    updateCart();
}

// Add event listeners to all add-to-cart buttons
document.querySelectorAll('.add-to-cart').forEach(function (button) {
    button.addEventListener('click', function (e) {
        e.stopPropagation();
        var productCard = this.closest('.product-card') || this.closest('.product');
        if (productCard) {
            var name = productCard.querySelector('h3').textContent;
            var priceEl = productCard.querySelector('.price');
            var price = priceEl.textContent;
            var priceNum = parseInt(price.replace(/[₫,]/g, ''));
            addToCart(name, price, priceNum);
        }
    });
});