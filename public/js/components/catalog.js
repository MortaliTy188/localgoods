import { getAllCategories, getProductsByCategory } from '../api/api.js';

export async function renderCatalog() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
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
                await showProductsByCategory(categoryId);
            });
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        const categoryContainer = document.getElementById('category-container');
        categoryContainer.innerHTML = `<p>Failed to load categories. Please try again later.</p>`;
    }
}

async function showProductsByCategory(categoryId) {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = `<p>Loading products...</p>`;

    try {
        const products = await getProductsByCategory(categoryId);

        if (products.length === 0) {
            categoryContainer.innerHTML = `
                <p>No products available in this category.</p>
                <button id="back-to-categories" class="back-button">Back to Categories</button>
            `;
        } else {
            categoryContainer.innerHTML = `
                <button id="back-to-categories" class="back-button">Back to Categories</button>
                ${products
                .map(
                    (product) => `
                        <div class="product-card">
                            <h3>${product.title}</h3>
                            <p>${product.description}</p>
                            <p>Price: $${product.price}</p>
                        </div>
                    `
                )
                .join('')}
            `;
        }

        const backButton = document.getElementById('back-to-categories');
        backButton.addEventListener('click', async () => {
            await renderCategories();
        });
    } catch (error) {
        console.error('Failed to load products:', error);
        categoryContainer.innerHTML = `
            <p>Failed to load products. Please try again later.</p>
            <button id="back-to-categories" class="back-button">Back to Categories</button>
        `;

        const backButton = document.getElementById('back-to-categories');
        backButton.addEventListener('click', async () => {
            await renderCategories();
        });
    }
}

async function renderCategories() {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = `<p>Loading categories...</p>`;

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
                await showProductsByCategory(categoryId);
            });
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        categoryContainer.innerHTML = `<p>Failed to load categories. Please try again later.</p>`;
    }
}