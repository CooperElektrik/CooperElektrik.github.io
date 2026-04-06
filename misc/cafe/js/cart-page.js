// Cart page logic — renders full cart table from localStorage
document.addEventListener('DOMContentLoaded', function () {
    var tableBody = document.querySelector('.cart-table tbody');
    var cartContainer = document.querySelector('.cart-container');

    if (!tableBody || !cartContainer) return;

    function formatPrice(num) {
        return '₫' + num.toLocaleString('vi-VN');
    }

    function renderCartPage() {
        var cart = typeof CafaoCart !== 'undefined' ? CafaoCart.getCart() : [];

        if (cart.length === 0) {
            cartContainer.innerHTML =
                '<div class="cart-empty">' +
                '<i class="fas fa-shopping-cart"></i>' +
                '<h3>Giỏ hàng trống</h3>' +
                '<p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>' +
                '<a href="shop.html" class="btn-shop">Mua ngay</a>' +
                '</div>';
            return;
        }

        var total = 0;
        tableBody.innerHTML = '';

        cart.forEach(function (item) {
            var subtotal = item.priceNum * item.quantity;
            total += subtotal;

            var tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);
            tr.innerHTML =
                '<td>' +
                    '<div class="cart-item-cell">' +
                        (item.image ? '<img src="' + item.image + '" alt="' + item.name + '">' : '') +
                        '<span>' + item.name + '</span>' +
                    '</div>' +
                '</td>' +
                '<td class="cart-price">' + formatPrice(item.priceNum) + '</td>' +
                '<td>' +
                    '<div class="cart-quantity">' +
                        '<button type="button" class="qty-minus">−</button>' +
                        '<input type="number" value="' + item.quantity + '" min="1" max="99">' +
                        '<button type="button" class="qty-plus">+</button>' +
                    '</div>' +
                '</td>' +
                '<td class="cart-subtotal">' + formatPrice(subtotal) + '</td>' +
                '<td><button class="cart-remove"><i class="fas fa-trash"></i></button></td>';
            tableBody.appendChild(tr);
        });

        // Update totals
        var shipping = total >= 200000 ? 0 : 20000;
        var grandTotal = total + shipping;

        var subtotalRow = document.querySelector('.cart-totals-row:not(.total):nth-child(1) span:last-child');
        var shippingRow = document.querySelector('.cart-totals-row:not(.total):nth-child(2) span:last-child');
        var totalRow = document.querySelector('.cart-totals-row.total span:last-child');

        if (subtotalRow) subtotalRow.textContent = formatPrice(total);
        if (shippingRow) {
            shippingRow.textContent = shipping === 0 ? 'Miễn phí' : formatPrice(shipping);
        }
        if (totalRow) totalRow.textContent = formatPrice(grandTotal);

        // Bind quantity buttons
        document.querySelectorAll('.qty-minus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tr = this.closest('tr');
                var id = tr.getAttribute('data-id');
                var input = tr.querySelector('input');
                var qty = parseInt(input.value) - 1;
                if (typeof CafaoCart !== 'undefined') {
                    CafaoCart.updateQuantity(id, qty);
                }
                renderCartPage();
            });
        });

        document.querySelectorAll('.qty-plus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tr = this.closest('tr');
                var id = tr.getAttribute('data-id');
                var input = tr.querySelector('input');
                var qty = parseInt(input.value) + 1;
                if (typeof CafaoCart !== 'undefined') {
                    CafaoCart.updateQuantity(id, qty);
                }
                renderCartPage();
            });
        });

        // Bind input change
        document.querySelectorAll('.cart-quantity input').forEach(function (input) {
            input.addEventListener('change', function () {
                var tr = this.closest('tr');
                var id = tr.getAttribute('data-id');
                var qty = parseInt(this.value);
                if (typeof CafaoCart !== 'undefined') {
                    CafaoCart.updateQuantity(id, qty);
                }
                renderCartPage();
            });
        });

        // Bind remove buttons
        document.querySelectorAll('.cart-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tr = this.closest('tr');
                var id = tr.getAttribute('data-id');
                if (typeof CafaoCart !== 'undefined') {
                    CafaoCart.removeFromCart(id);
                }
                renderCartPage();
                if (typeof CafaoCart.renderCartWidget === 'function') {
                    CafaoCart.renderCartWidget();
                }
            });
        });
    }

    renderCartPage();

    // Checkout button handler
    var checkoutBtn = document.querySelector('.cart-checkout-btn');
    var checkoutOverlay = document.getElementById('checkout-overlay');
    var checkoutCloseBtn = document.getElementById('checkout-close-btn');

    if (checkoutBtn && checkoutOverlay) {
        checkoutBtn.addEventListener('click', function () {
            var cart = typeof CafaoCart !== 'undefined' ? CafaoCart.getCart() : [];
            if (cart.length === 0) return;

            // Clear cart
            if (typeof CafaoCart !== 'undefined') {
                CafaoCart.clearCart();
            }

            // Show popup
            checkoutOverlay.classList.add('active');

            // Update cart widget
            if (typeof CafaoCart !== 'undefined' && typeof CafaoCart.renderCartWidget === 'function') {
                CafaoCart.renderCartWidget();
            }

            // Re-render empty cart
            renderCartPage();
        });
    }

    if (checkoutCloseBtn && checkoutOverlay) {
        checkoutCloseBtn.addEventListener('click', function () {
            checkoutOverlay.classList.remove('active');
        });

        // Close on overlay click
        checkoutOverlay.addEventListener('click', function (e) {
            if (e.target === checkoutOverlay) {
                checkoutOverlay.classList.remove('active');
            }
        });
    }
});
