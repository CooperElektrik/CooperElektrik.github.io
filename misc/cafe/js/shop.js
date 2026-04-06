// Shop filtering and sorting functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const products = document.querySelectorAll('#shop-products .product');

    // Filter by category
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            
            products.forEach(function(product) {
                const productCategory = product.getAttribute('data-category');
                
                if (category === 'all' || productCategory === category) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    }

    // Sort products
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            const sortValue = this.value;
            const productGrid = document.querySelector('#shop-products .product-grid');
            const productArray = Array.from(products);

            productArray.forEach(function(product) {
                product.style.display = 'block';
            });

            if (sortValue === 'price-asc') {
                productArray.sort(function(a, b) {
                    return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
                });
            } else if (sortValue === 'price-desc') {
                productArray.sort(function(a, b) {
                    return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
                });
            } else if (sortValue === 'name') {
                productArray.sort(function(a, b) {
                    return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
                });
            }

            // Re-append sorted products
            productArray.forEach(function(product) {
                productGrid.appendChild(product);
            });
        });
    }

    // "Add to cart" is handled by CafaoCart.bindAddToCartButtons() in script.js
    // to avoid duplicate event listeners causing double-adds.
});
