import { getAllProducts } from '../api/api.js';

export async function renderCatalog() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Product Catalog</h1>
        </header>
        <main>
        <div id="catalog" class="catalog">
            <p>Loading products...</p>
        </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;


    try {
        const products = await getAllProducts();
        const catalog = document.getElementById('catalog');
        if (products.length === 0) {
            catalog.innerHTML = `<p>No products available at the moment.</p>`;
            return;
        }

        catalog.innerHTML = products
            .map(
                (product) => `
                <div class="product-card">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `
            )
            .join('');


        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach((button) => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.getAttribute('data-id');
                try {
                    await addToCart({ product_id: productId, user_id: 1, quantity: 1 });
                    alert('Product added to cart!');
                } catch (error) {
                    alert('Failed to add product to cart.');
                }
            });
        });
    } catch (error) {
        console.error('Failed to load products:', error);
        const catalog = document.getElementById('catalog');
        catalog.innerHTML = `<p>Failed to load products. Please try again later.</p>`;
    }
}