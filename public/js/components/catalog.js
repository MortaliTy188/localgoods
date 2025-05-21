import { getAllCategories, getProductsByCategory, addToCart } from '../api/api.js';

export async function renderCatalog() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <a href="/" data-link class="back-to-home-button" style="display: inline-block; margin-bottom: 10px; padding: 8px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Back to Home</a>
            <h1>Categories</h1>
        </header>
        <main>
            <div id="catalog" class="catalog">
                <div id="category-container" class="category-container">
                    <p>Loading categories...</p>
                </div>
            </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    try {
        const categories = await getAllCategories();
        const categoryContainer = document.getElementById('category-container');
        if (categories.length === 0) {
            categoryContainer.innerHTML = `<p>No categories available at the moment.</p>`;
            return;
        }

        categoryContainer.innerHTML = categories
            .map(
                (category) => `
                <div class="category-card" data-category-id="${category.id}">
                    <h3>${category.name}</h3>
                </div>
            `
            )
            .join('');

        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card) => {
            card.addEventListener('click', async () => {
                const categoryId = card.getAttribute('data-category-id');
                const headerTitle = document.querySelector('header h1');
                if (headerTitle) {
                    const currentCategory = categories.find(c => c.id.toString() === categoryId.toString());
                    headerTitle.textContent = currentCategory ? `Products in ${currentCategory.name}` : 'Products';
                }
                await showProductsByCategory(categoryId, categories);
            });
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        const categoryContainer = document.getElementById('category-container');
        categoryContainer.innerHTML = `<p>Failed to load categories. Please try again later.</p>`;
    }
}

async function showProductsByCategory(categoryId, allCategories) {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = `<p>Loading products...</p>`;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle && allCategories) {
        const currentCategory = allCategories.find(c => c.id.toString() === categoryId.toString());
        headerTitle.textContent = currentCategory ? `Products in ${currentCategory.name}` : 'Products';
    }

    const BACKEND_URL = 'http://localhost:3000';

    try {
        const products = await getProductsByCategory(categoryId);

        if (products.length === 0) {
            categoryContainer.innerHTML = `
                <p>No products available in this category.</p>
                <button id="back-to-categories" class="back-button">Back to Categories</button>
            `;
        } else {
            categoryContainer.innerHTML = `
                <button id="back-to-categories" class="back-button" style="margin-bottom: 15px; padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Back to Categories</button>
                <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                ${products
                .map(
                    (product) => {
                        let cardStyles = `
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 15px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            min-height: 350px; /* Еще немного увеличим для итоговой цены */
                        `;

                        if (product.image) {
                            const imagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
                            const fullImageUrl = `${BACKEND_URL}${imagePath}`;
                            const encodedFullImageUrl = encodeURI(fullImageUrl);

                            cardStyles += `
                                background-image: url('${encodedFullImageUrl}');
                                background-size: cover;
                                background-position: center;
                                color: white;
                                text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
                            `;
                        } else {
                            cardStyles += `
                                background-color: #f8f9fa;
                                color: #333;
                            `;
                        }

                        const quantityInputId = `quantity-product-${product.id}`;
                        const totalPriceDisplayId = `total-price-product-${product.id}`;
                        const basePrice = parseFloat(product.price) || 0;

                        return `
                            <div class="product-card" style="${cardStyles}" data-product-id="${product.id}" data-base-price="${basePrice}">
                                <div> <!-- Content wrapper -->
                                    <h3 style="margin-top: 0;">${product.title}</h3>
                                    <p>${product.description}</p>
                                </div>
                                <div style="margin-top: auto;"> 
                                    <p style="font-weight: bold; margin-bottom: 5px;">Price per unit: $${basePrice.toFixed(2)}</p>
                                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                        <label for="${quantityInputId}" style="margin-right: 5px; ${product.image ? 'color: white; text-shadow: 1px 1px 2px black;' : 'color: #333;'}">Qty:</label>
                                        <input type="number" id="${quantityInputId}" class="product-quantity-input" name="quantity" value="1" min="1" max="${product.stock || 99}" style="width: 60px; padding: 5px; border: 1px solid #ccc; border-radius: 4px; text-align: center; margin-right: 10px;">
                                    </div>
                                    <p style="font-weight: bold; margin-bottom: 10px;">Total: <span id="${totalPriceDisplayId}">$${basePrice.toFixed(2)}</span></p>
                                    <button class="add-to-cart-btn" data-product-id="${product.id}" style="padding: 8px 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Add to Cart</button>
                                </div>
                            </div>
                        `;
                    }
                )
                .join('')}
                </div>
            `;
        }

        const backButton = document.getElementById('back-to-categories');
        if (backButton) {
            backButton.addEventListener('click', async () => {
                if (headerTitle) {
                    headerTitle.textContent = 'Categories';
                }
                await renderCategories();
            });
        }

        document.querySelectorAll('.product-quantity-input').forEach(input => {
            input.addEventListener('input', (event) => {
                const productId = event.target.closest('.product-card').getAttribute('data-product-id');
                const basePrice = parseFloat(event.target.closest('.product-card').getAttribute('data-base-price'));
                const quantity = parseInt(event.target.value, 10);
                const stock = parseInt(event.target.getAttribute('max'), 10);

                const totalPriceDisplay = document.getElementById(`total-price-product-${productId}`);

                if (isNaN(quantity) || quantity < 1) {
                    totalPriceDisplay.textContent = '$--.--';
                    return;
                }
                if (quantity > stock) {
                    event.target.value = stock;
                    totalPriceDisplay.textContent = `$${(basePrice * stock).toFixed(2)}`;
                    return;
                }

                totalPriceDisplay.textContent = `$${(basePrice * quantity).toFixed(2)}`;
            });
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();

                const productCard = event.target.closest('.product-card');
                const productId = productCard.getAttribute('data-product-id');
                const userId = localStorage.getItem('id') || sessionStorage.getItem('id');

                if (!userId) {
                    alert('Please log in to add items to your cart.');
                    return;
                }

                if (!productId) {
                    console.error('Product ID not found for "Add to Cart" button.');
                    return;
                }

                const quantityInput = productCard.querySelector(`#quantity-product-${productId}`);
                let quantity = 1;
                if (quantityInput) {
                    const parsedQuantity = parseInt(quantityInput.value, 10);
                    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
                        quantity = parsedQuantity;
                    } else {
                        alert('Please enter a valid quantity.');
                        quantityInput.focus();
                        return;
                    }
                    const maxStock = parseInt(quantityInput.getAttribute('max'), 10);
                    if (!isNaN(maxStock) && quantity > maxStock) {
                        alert(`You can add a maximum of ${maxStock} items for this product.`);
                        quantityInput.value = maxStock;
                        quantityInput.focus();
                        return;
                    }
                }

                try {
                    const cartData = {
                        user_id: parseInt(userId),
                        product_id: parseInt(productId),
                        quantity: quantity
                    };

                    button.textContent = 'Adding...';
                    button.disabled = true;

                    await addToCart(cartData);
                    const productName = products.find(p => p.id.toString() === productId)?.title || 'Product';
                    alert(`${productName} (Qty: ${quantity}) added to cart!`);

                } catch (error) {
                    console.error('Failed to add product to cart:', error);
                    alert(`Failed to add product to cart. ${error.message}`);
                } finally {
                    button.textContent = 'Add to Cart';
                    button.disabled = false;
                    if (quantityInput) {

                    }
                }
            });
        });

    } catch (error) {
        console.error('Failed to load products:', error);
        categoryContainer.innerHTML = `
            <p>Failed to load products. Please try again later. Error: ${error.message}</p>
            <button id="back-to-categories" class="back-button" style="margin-bottom: 15px; padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Back to Categories</button>
        `;

        const backButtonOnError = document.getElementById('back-to-categories');
        if (backButtonOnError) {
            backButtonOnError.addEventListener('click', async () => {
                if (headerTitle) {
                    headerTitle.textContent = 'Categories';
                }
                await renderCategories();
            });
        }
    }
}

async function renderCategories() {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = `<p>Loading categories...</p>`;

    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.textContent = 'Categories';
    }

    try {
        const categories = await getAllCategories();
        if (categories.length === 0) {
            categoryContainer.innerHTML = `<p>No categories available at the moment.</p>`;
            return;
        }

        categoryContainer.innerHTML = categories
            .map(
                (category) => `
                <div class="category-card" data-category-id="${category.id}">
                    <h3>${category.name}</h3>
                </div>
            `
            )
            .join('');

        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card) => {
            card.addEventListener('click', async () => {
                const categoryId = card.getAttribute('data-category-id');
                await showProductsByCategory(categoryId, categories);
            });
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        categoryContainer.innerHTML = `<p>Failed to load categories. Please try again later.</p>`;
    }
}