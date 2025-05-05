import { getAllCategories } from '../api/api.js';

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
                <div class="category-card">
                    <h3>${category.name}</h3>
                    <p>Category ID: ${category.id}</p>
                </div>
            `
            )
            .join('');
    } catch (error) {
        console.error('Failed to load categories:', error);
        const categoryContainer = document.getElementById('category-container');
        categoryContainer.innerHTML = `<p>Failed to load categories. Please try again later.</p>`;
    }
}