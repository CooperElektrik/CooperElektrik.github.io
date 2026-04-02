// Product detail page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Quantity controls
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.getElementById('quantity-minus');
    const plusBtn = document.getElementById('quantity-plus');

    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < 99) {
                quantityInput.value = value + 1;
            }
        });

        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else if (value > 99) {
                this.value = 99;
            }
        });
    }

    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const name = document.getElementById('detail-name').textContent;
            const priceText = document.getElementById('detail-price').textContent;
            const priceNum = parseInt(priceText.replace(/[₫,]/g, ''));
            const quantity = parseInt(quantityInput.value) || 1;

            // Add multiple items based on quantity
            for (let i = 0; i < quantity; i++) {
                if (typeof addToCart === 'function') {
                    addToCart(name, priceText, priceNum);
                }
            }

            // Visual feedback
            this.innerHTML = '<i class="fas fa-check"></i> Đã thêm vào giỏ!';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ';
            }, 2000);
        });
    }

    // Product data (for future dynamic loading)
    const products = {
        'ca-phe-muoi': {
            name: 'Cà Phê Muối',
            price: '₫35,000',
            priceNum: 35000,
            image: 'img/ca_phe_muoi.png',
            description: 'Cà phê muối là thức uống đặc trưng với vị đắng nhẹ của cà phê nguyên chất, hòa quyện cùng vị mặn tinh tế của muối biển. Sự kết hợp độc đáo này tạo nên hương vị đậm đà, khó quên.',
            sku: 'CPM-001',
            category: 'Cà phê'
        },
        'ca-phe-sua': {
            name: 'Cà Phê Sữa',
            price: '₫30,000',
            priceNum: 30000,
            image: 'img/ca_phe_sua.png',
            description: 'Cà phê sữa truyền thống với vị ngọt dịu của sữa đặc, tạo nên hương vị cân bằng hoàn hảo giữa đắng và ngọt.',
            sku: 'CPS-002',
            category: 'Cà phê'
        },
        'ca-phe-trung': {
            name: 'Cà Phê Trứng',
            price: '₫45,000',
            priceNum: 45000,
            image: 'img/ca_phe_trung_hinh_meo.png',
            description: 'Cà phê trứng Hà Nội với lớp trứng gà đánh bông mịn, béo ngậy trên nền cà phê đậm đà. Món quà tinh tế từ ẩm thực Việt.',
            sku: 'CPT-003',
            category: 'Cà phê'
        },
        'americano': {
            name: 'Americano',
            price: '₫35,000',
            priceNum: 35000,
            image: 'img/americano.png',
            description: 'Americano cổ điển với espresso pha loãng, giữ nguyên hương vị cà phê nguyên chất nhưng nhẹ nhàng hơn.',
            sku: 'AME-004',
            category: 'Cà phê'
        },
        'hot-chocolate': {
            name: 'Sô Cô La Nóng',
            price: '₫40,000',
            priceNum: 40000,
            image: 'img/hot_chocolate.png',
            description: 'Sô cô la nóng béo ngậy, thơm lừng, hoàn hảo cho những ngày se lạnh. Làm từ sô cô la Bỉ cao cấp.',
            sku: 'HC-005',
            category: 'Cà phê'
        },
        'soda-chanh-leo': {
            name: 'Soda Chanh Leo',
            price: '₫45,000',
            priceNum: 45000,
            image: 'img/passion_fruit_soda.png',
            description: 'Soda sảng khoái với tinh chất chanh leo nhiệt đới, vị chua ngọt hài hòa cùng bọt soda tươi mát.',
            sku: 'SCL-006',
            category: 'Soda'
        },
        'soda-dau': {
            name: 'Soda Dâu Tây',
            price: '₫45,000',
            priceNum: 45000,
            image: 'img/soda_dau.png',
            description: 'Soda dâu tây ngọt ngào với hương vị trái cây sảng khoái, màu sắc bắt mắt.',
            sku: 'SD-007',
            category: 'Soda'
        },
        'soda-viet-quat': {
            name: 'Soda Việt Quất',
            price: '₫45,000',
            priceNum: 45000,
            image: 'img/soda_viet_quat.png',
            description: 'Soda việt quất với hương vị trái cây đậm đà và màu sắc rực rỡ, giàu chất chống oxy hóa.',
            sku: 'SVQ-008',
            category: 'Soda'
        },
        'mojito': {
            name: 'Mojito',
            price: '₫50,000',
            priceNum: 50000,
            image: 'img/mojito.png',
            description: 'Mojito không cồn với hương vị bạc hà và chanh cổ điển, thức uống giải khát hoàn hảo.',
            sku: 'MJ-009',
            category: 'Soda'
        },
        'butter-beer': {
            name: 'Bia Bơ',
            price: '₫55,000',
            priceNum: 55000,
            image: 'img/butter_beer.png',
            description: 'Thức uống ngọt ngào với hương vị bơ caramel. Một món quà ma thuật từ thế giới phù thủy!',
            sku: 'BB-010',
            category: 'Soda'
        },
        'ruou-gin': {
            name: 'Rượu Gin',
            price: '₫120,000',
            priceNum: 120000,
            image: 'img/ruou_gin.png',
            description: 'Rượu gin cao cấp với hương thảo mộc đặc trưng, phù hợp pha chế cocktail hoặc thưởng thức nguyên chất.',
            sku: 'GN-011',
            category: 'Đồ uống có cồn'
        },
        'ruou-sake': {
            name: 'Rượu Sake',
            price: '₫150,000',
            priceNum: 150000,
            image: 'img/ruou_sake.png',
            description: 'Rượu sake Nhật Bản truyền thống, được lên men từ gạo nếp cao cấp. Thưởng thức ấm hoặc lạnh đều ngon.',
            sku: 'SK-012',
            category: 'Đồ uống có cồn'
        },
        'vodka': {
            name: 'Vodka',
            price: '₫130,000',
            priceNum: 130000,
            image: 'img/vodka.png',
            description: 'Vodka nguyên chất với hương vị tinh khiết, phù hợp cho các buổi tiệc và pha chế cocktail.',
            sku: 'VK-013',
            category: 'Đồ uống có cồn'
        }
    };

    // Load product data from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && products[productId]) {
        const product = products[productId];
        document.getElementById('detail-image').src = product.image;
        document.getElementById('detail-name').textContent = product.name;
        document.getElementById('detail-price').textContent = product.price;
        document.getElementById('detail-description').textContent = product.description;
        document.getElementById('detail-sku').textContent = product.sku;
        document.getElementById('detail-category').textContent = product.category;
        document.title = product.name + ' - Cafao';
    }
});
