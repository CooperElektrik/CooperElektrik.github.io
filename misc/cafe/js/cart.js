// Shared cart module with localStorage persistence
// Used across all pages to maintain cart state

const CART_STORAGE_KEY = 'cafao_cart';

function loadCart() {
    try {
        const data = localStorage.getItem(CART_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.warn('Failed to load cart from localStorage:', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.warn('Failed to save cart to localStorage:', e);
    }
}

// Cart item shape: { id, name, price, priceNum, image, quantity }

function addToCart(product, quantity) {
    quantity = quantity || 1;
    var cart = loadCart();

    // Check if item already exists (match by id)
    var existing = cart.find(function (item) {
        return item.id === product.id;
    });

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            priceNum: product.priceNum,
            image: product.image || '',
            quantity: quantity
        });
    }

    saveCart(cart);
    return cart;
}

function removeFromCart(productId) {
    var cart = loadCart();
    cart = cart.filter(function (item) {
        return item.id !== productId;
    });
    saveCart(cart);
    return cart;
}

function updateQuantity(productId, newQuantity) {
    var cart = loadCart();
    var item = cart.find(function (item) {
        return item.id === productId;
    });
    if (item) {
        if (newQuantity < 1) {
            cart = removeFromCart(productId);
        } else {
            item.quantity = Math.min(newQuantity, 99);
            saveCart(cart);
        }
    }
    return cart;
}

function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
}

function getCart() {
    return loadCart();
}

function getCartTotal() {
    var cart = loadCart();
    var total = 0;
    cart.forEach(function (item) {
        total += item.priceNum * item.quantity;
    });
    return total;
}

function getCartCount() {
    var cart = loadCart();
    var count = 0;
    cart.forEach(function (item) {
        count += item.quantity;
    });
    return count;
}

// Floating cart widget (bottom-right popup)
function renderCartWidget() {
    var cartItemsListEl = document.getElementById('cart-items-list');
    var cartTotalEl = document.getElementById('cart-total');
    var cartItemsEl = document.getElementById('cart-items');
    var navCountEl = document.getElementById('nav-cart-count');

    var cart = loadCart();

    // Update nav badge
    if (navCountEl) {
        var count = getCartCount();
        navCountEl.textContent = count;
        navCountEl.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    // Show/hide cart widget
    if (cartItemsEl && cartItemsListEl && cartTotalEl) {
        if (cart.length > 0) {
            cartItemsEl.classList.add('visible');
        } else {
            cartItemsEl.classList.remove('visible');
        }

        // Render items
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
                    '<p class="cart-item-name">' + item.name + ' × ' + item.quantity + '</p>' +
                    '<p class="cart-item-price">₫' + (item.priceNum * item.quantity).toLocaleString() + '</p>' +
                    '</div>' +
                    '<button class="cart-item-remove" data-id="' + item.id + '">&times;</button>';
                cartItemsListEl.appendChild(itemEl);
                total += item.priceNum * item.quantity;
            });
            cartTotalEl.textContent = 'Tổng: ₫' + total.toLocaleString();
            cartItemsEl.scrollTop = cartItemsEl.scrollHeight;

            // Remove buttons
            document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = this.getAttribute('data-id');
                    removeFromCart(id);
                    renderCartWidget();
                });
            });
        }
    }
}

// Bind "add to cart" buttons on any page
function bindAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var productCard = this.closest('.product-card') || this.closest('.product');
            if (!productCard) return;

            var nameEl = productCard.querySelector('h3');
            var priceEl = productCard.querySelector('.price');
            var imgEl = productCard.querySelector('img');

            if (!nameEl || !priceEl) return;

            var name = nameEl.textContent.trim();
            var priceText = priceEl.textContent;
            var priceNum = parseInt(priceText.replace(/[₫,]/g, ''));
            var id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, '');
            var image = imgEl ? imgEl.getAttribute('src') : '';

            addToCart({ id: id, name: name, price: priceText, priceNum: priceNum, image: image }, 1);
            renderCartWidget();

            // Visual feedback
            var originalText = button.textContent;
            button.textContent = 'Đã thêm!';
            setTimeout(function () {
                button.textContent = originalText;
            }, 1000);
        });
    });
}

// Export for use on other pages
if (typeof window !== 'undefined') {
    window.CafaoCart = {
        loadCart: loadCart,
        saveCart: saveCart,
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        updateQuantity: updateQuantity,
        clearCart: clearCart,
        getCart: getCart,
        getCartTotal: getCartTotal,
        getCartCount: getCartCount,
        renderCartWidget: renderCartWidget,
        bindAddToCartButtons: bindAddToCartButtons
    };
}
