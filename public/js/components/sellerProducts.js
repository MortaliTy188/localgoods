import {
    getProductsBySeller,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    getAllCategories
} from '../api/api.js';
import { isLoggedIn, getUserRole, getUserId } from '../auth/auth.js';
import { navigateTo } from '../router.js';

export async function renderMyProductsPage(params) {
    if (!isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    const app = document.getElementById('app');
    const loggedInUserId = getUserId();
    const sellerIdFromUrl = params.seller_id;
    const userRole = getUserRole();

    if (!((userRole === '2' || userRole === '3') && loggedInUserId === sellerIdFromUrl) && userRole !== '3') {
        alert('Доступ запрещен: вы не можете просматривать или редактировать эти товары.');
        navigateTo('/profile');
        return;
    }

    const canEditDeleteGlobally = (loggedInUserId === sellerIdFromUrl) || (userRole === '3');

    let allCategories = [];

    app.innerHTML = `
        <header>
            <a href="/profile" data-link class="back-to-profile-button" style="display: inline-block; margin-bottom: 10px; padding: 8px 15px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px;">Назад в профиль</a>
            <h1>Мои товары</h1>
        </header>
        <main id="my-products-container">
            <div id="loading-my-products-message">Загрузка ваших товаров...</div>


            <div id="edit-product-form-container" style="display: none; margin-top: 20px; margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                <h2>Редактировать товар</h2>
                <form id="edit-product-form">
                    <input type="hidden" id="edit-product-id">
                    <div style="margin-bottom: 10px;">
                        <label for="edit-product-title" style="display:block; margin-bottom:5px;">Название:</label>
                        <input type="text" id="edit-product-title" required style="width:100%; padding:8px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="edit-product-description" style="display:block; margin-bottom:5px;">Описание:</label>
                        <textarea id="edit-product-description" required rows="4" style="width:100%; padding:8px; box-sizing:border-box;"></textarea>
                    </div>
                    <div style="display:flex; gap: 10px; margin-bottom: 10px;">
                        <div style="flex:1;">
                            <label for="edit-product-price" style="display:block; margin-bottom:5px;">Цена (руб.):</label>
                            <input type="number" id="edit-product-price" required min="0" step="0.01" style="width:100%; padding:8px; box-sizing:border-box;">
                        </div>
                        <div style="flex:1;">
                            <label for="edit-product-stock" style="display:block; margin-bottom:5px;">В наличии (шт.):</label>
                            <input type="number" id="edit-product-stock" required min="0" step="1" style="width:100%; padding:8px; box-sizing:border-box;">
                        </div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="edit-product-category" style="display:block; margin-bottom:5px;">Категория:</label>
                        <select id="edit-product-category" required style="width:100%; padding:8px; box-sizing:border-box;">
                            <option value="">Загрузка категорий...</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-product-image" style="display:block; margin-bottom:5px;">Изображение (выберите, чтобы изменить):</label>
                        <input type="file" id="edit-product-image" accept="image/*" style="width:100%; padding:8px; box-sizing:border-box;">
                        <img id="current-product-image-preview" src="#" alt="Текущее изображение" style="max-width: 200px; max-height: 200px; margin-top: 10px; display: none;">
                    </div>
                    <button type="submit" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Сохранить изменения</button>
                    <button type="button" id="cancel-edit-product-btn" style="margin-left: 10px; padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Отмена</button>
                </form>
            </div>


            <div id="my-products-list-container"> 
                <div id="my-products-list" style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                </div>
                <div id="no-my-products-message" style="display: none; text-align: center; padding: 20px;">
                    <p>У вас пока нет добавленных товаров.</p>
                    <button id="add-first-product-btn" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Добавить свой первый товар</button>
                </div>
            </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const loadingMessage = document.getElementById('loading-my-products-message');
    const productsListContainer = document.getElementById('my-products-list-container');
    const productsListDiv = document.getElementById('my-products-list');
    const noProductsMessageDiv = document.getElementById('no-my-products-message');

    const editProductFormContainer = document.getElementById('edit-product-form-container');
    const editProductForm = document.getElementById('edit-product-form');
    const cancelEditProductBtn = document.getElementById('cancel-edit-product-btn');
    const categorySelect = document.getElementById('edit-product-category');
    const currentImagePreview = document.getElementById('current-product-image-preview');


    async function loadCategoriesForSelect() {
        try {
            allCategories = await getAllCategories();
            categorySelect.innerHTML = '<option value="">-- Выберите категорию --</option>';
            allCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Ошибка загрузки категорий:", error);
            categorySelect.innerHTML = '<option value="">Не удалось загрузить категории</option>';
        }
    }

    await loadCategoriesForSelect();


    function showEditProductForm() {
        productsListContainer.style.display = 'none';
        editProductFormContainer.style.display = 'block';
        loadingMessage.style.display = 'none';
        window.scrollTo(0, editProductFormContainer.offsetTop - 20);
    }

    function showProductsList() {
        productsListContainer.style.display = 'block';
        editProductFormContainer.style.display = 'none';
        editProductForm.reset();
        currentImagePreview.style.display = 'none';
        currentImagePreview.src = "#";
    }

    async function populateEditProductForm(productId) {
        try {
            const product = await getProductById(productId);
            if (product) {
                document.getElementById('edit-product-id').value = product.id;
                document.getElementById('edit-product-title').value = product.title || '';
                document.getElementById('edit-product-description').value = product.description || '';
                document.getElementById('edit-product-price').value = product.price || 0;
                document.getElementById('edit-product-stock').value = product.stock || 0;
                if (product.category_id && categorySelect.options.length > 1) {
                    categorySelect.value = product.category_id;
                } else {
                    categorySelect.value = "";
                }

                if (product.image) {
                    currentImagePreview.src = `/uploads/${product.image}`;
                    currentImagePreview.style.display = 'block';
                } else {
                    currentImagePreview.style.display = 'none';
                    currentImagePreview.src = '#';
                }
                document.getElementById('edit-product-image').value = ''; // Сбрасываем поле выбора файла

                showEditProductForm();
            } else {
                alert('Не удалось загрузить данные товара для редактирования.');
                showProductsList();
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных товара для редактирования:', error);
            alert(`Ошибка загрузки товара: ${error.message}`);
            showProductsList();
        }
    }


    async function fetchAndRenderMyProducts() {
        showProductsList();
        try {
            loadingMessage.style.display = 'block';
            productsListDiv.innerHTML = '';
            noProductsMessageDiv.style.display = 'none';

            const productsData = await getProductsBySeller(sellerIdFromUrl);
            const products = productsData.products;
            loadingMessage.style.display = 'none';

            if (!products || !Array.isArray(products) || products.length === 0) {
                productsListDiv.style.display = 'none';
                noProductsMessageDiv.style.display = 'block';
                const addFirstProductBtn = document.getElementById('add-first-product-btn');
                if (addFirstProductBtn) {
                    addFirstProductBtn.addEventListener('click', () => navigateTo('/add-product'));
                }
                return;
            }

            productsListDiv.style.display = 'grid';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card-seller';
                productCard.style.border = '1px solid #ddd';
                productCard.style.borderRadius = '8px';
                productCard.style.padding = '15px';
                productCard.style.backgroundColor = '#fff';
                productCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                productCard.style.display = 'flex';
                productCard.style.flexDirection = 'column';

                const defaultImage = '/images/default-product-image.png';
                const productImage = product.image ? `/uploads/${product.image}` : defaultImage;

                productCard.innerHTML = `
                    <img src="${productImage}" alt="${product.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                    <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1em;">${product.title}</h3>
                    <p style="font-size: 0.9em; color: #555; margin-bottom: 8px; flex-grow: 1;">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                    <p style="font-size: 1em; font-weight: bold; color: #333; margin-bottom: 12px;">Цена: ${product.price} руб.</p>
                    <p style="font-size: 0.9em; color: #777; margin-bottom: 15px;">В наличии: ${product.stock} шт.</p>
                    ${canEditDeleteGlobally ? `
                    <div class="product-actions-seller" style="margin-top: auto; display: flex; justify-content: space-between;">
                        <button class="edit-my-product-btn" data-product-id="${product.id}" style="padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; flex-grow:1; margin-right: 5px;">Редактировать</button>
                        <button class="delete-my-product-btn" data-product-id="${product.id}" style="padding: 8px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; flex-grow:1; margin-left: 5px;">Удалить</button>
                    </div>
                    ` : '<p style="font-size: 0.9em; color: #777; text-align: center;">Просмотр (нет прав на изменение)</p>' }
                `;
                productsListDiv.appendChild(productCard);
            });

            if (canEditDeleteGlobally) {
                addEventListenersToProductButtons();
            }

        } catch (error) {
            console.error('Ошибка при загрузке товаров продавца:', error);
            loadingMessage.style.display = 'none';
            productsListDiv.innerHTML = `<p style="color: red; grid-column: 1 / -1;">Ошибка загрузки товаров: ${error.message}</p>`;
            noProductsMessageDiv.style.display = 'none';
        }
    }

    function addEventListenersToProductButtons() {
        const editButtons = document.querySelectorAll('.edit-my-product-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                populateEditProductForm(productId);
            });
        });

        const deleteButtons = document.querySelectorAll('.delete-my-product-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.productId;
                if (confirm(`Вы уверены, что хотите удалить товар "${event.target.closest('.product-card-seller').querySelector('h3').textContent}"?`)) {
                    try {
                        await deleteProduct(productId);
                        alert('Товар успешно удален.');
                        fetchAndRenderMyProducts();
                    } catch (error) {
                        alert(`Ошибка при удалении товара: ${error.message}`);
                        console.error('Ошибка при удалении товара:', error);
                    }
                }
            });
        });
    }

    if (editProductForm) {
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = document.getElementById('edit-product-id').value;
            const imageFile = document.getElementById('edit-product-image').files[0];

            const productDataToUpdate = {
                title: document.getElementById('edit-product-title').value,
                description: document.getElementById('edit-product-description').value,
                price: parseFloat(document.getElementById('edit-product-price').value),
                stock: parseInt(document.getElementById('edit-product-stock').value, 10),
                category_id: parseInt(document.getElementById('edit-product-category').value, 10),
            };

            if (!productDataToUpdate.title || !productDataToUpdate.description || isNaN(productDataToUpdate.price) || isNaN(productDataToUpdate.stock) || isNaN(productDataToUpdate.category_id)) {
                alert('Пожалуйста, заполните все обязательные поля корректно.');
                return;
            }

            const submitButton = editProductForm.querySelector('button[type="submit"]');

            try {
                submitButton.textContent = 'Сохранение...';
                submitButton.disabled = true;

                await updateProduct(productId, productDataToUpdate);

                if (imageFile) {
                    const formData = new FormData();
                    formData.append('product_id', productId);
                    formData.append('image', imageFile);
                    await uploadProductImage(formData);
                }

                alert('Товар успешно обновлен!');
                fetchAndRenderMyProducts();
            } catch (error) {
                alert(`Ошибка при обновлении товара: ${error.message}`);
                console.error('Ошибка обновления товара:', error);
            } finally {
                submitButton.textContent = 'Сохранить изменения';
                submitButton.disabled = false;
            }
        });
    }

    if (cancelEditProductBtn) {
        cancelEditProductBtn.addEventListener('click', () => {
            showProductsList();
        });
    }

    await fetchAndRenderMyProducts();
}