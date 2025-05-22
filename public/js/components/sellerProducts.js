import {
    getProductsBySeller,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    getAllCategories,
    getReviewsByProduct,
    deleteReview
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

    const canManageProductsGlobally = (loggedInUserId === sellerIdFromUrl) || (userRole === '3');
    const canManageReviews = canManageProductsGlobally;

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
                    <div><label for="edit-product-title">Название:</label><input type="text" id="edit-product-title" required></div>
                    <div><label for="edit-product-description">Описание:</label><textarea id="edit-product-description" required rows="4"></textarea></div>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;"><label for="edit-product-price">Цена (руб.):</label><input type="number" id="edit-product-price" required min="0" step="0.01"></div>
                        <div style="flex:1;"><label for="edit-product-stock">В наличии (шт.):</label><input type="number" id="edit-product-stock" required min="0" step="1"></div>
                    </div>
                    <div><label for="edit-product-category">Категория:</label><select id="edit-product-category" required><option value="">Загрузка...</option></select></div>
                    <div>
                        <label for="edit-product-image">Изображение (выберите, чтобы изменить):</label>
                        <input type="file" id="edit-product-image" accept="image/*">
                        <img id="current-product-image-preview" src="#" alt="Текущее изображение" style="max-width: 150px; max-height: 150px; margin-top: 10px; display: none; border: 1px solid #ccc;">
                    </div>
                    <button type="submit">Сохранить изменения</button>
                    <button type="button" id="cancel-edit-product-btn">Отмена</button>
                </form>
            </div>

            <div id="my-products-list-container">
                <div id="my-products-list" style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;"></div>
                <div id="no-my-products-message" style="display: none; text-align: center; padding: 20px;">
                    <p>У вас пока нет добавленных товаров.</p>
                    <button id="add-first-product-btn">Добавить свой первый товар</button>
                </div>
            </div>

            <div id="product-reviews-modal" class="modal" style="display:none; position: fixed; z-index: 1050; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(5px);">
                <div class="modal-content" style="background-color: #fefefe; margin: 8% auto; padding: 25px; border: 1px solid #888; width: 90%; max-width: 700px; border-radius: 10px; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                    <span class="close-product-reviews-modal" style="color: #aaa; position: absolute; right: 15px; top: 10px; font-size: 30px; font-weight: bold; cursor: pointer; line-height: 1;">×</span>
                    <h2 id="product-reviews-modal-title" style="margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Отзывы о товаре</h2>
                    <div id="product-reviews-list-container" style="max-height: 450px; overflow-y: auto; margin-top: 15px;"></div>
                </div>
            </div>
        </main>
        <footer><h1>LocalGoods</h1></footer>
    `;

    applyStylesToEditForm();

    const loadingMessage = document.getElementById('loading-my-products-message');
    const productsListContainer = document.getElementById('my-products-list-container');
    const productsListDiv = document.getElementById('my-products-list');
    const noProductsMessageDiv = document.getElementById('no-my-products-message');
    const editProductFormContainer = document.getElementById('edit-product-form-container');
    const editProductFormEl = document.getElementById('edit-product-form'); // Renamed to avoid conflict
    const cancelEditProductBtn = document.getElementById('cancel-edit-product-btn');
    const categorySelect = document.getElementById('edit-product-category');
    const currentImagePreview = document.getElementById('current-product-image-preview');
    const reviewsModal = document.getElementById('product-reviews-modal');
    const closeReviewsModalBtn = reviewsModal.querySelector('.close-product-reviews-modal');
    const reviewsListContainer = document.getElementById('product-reviews-list-container');
    const reviewsModalTitle = document.getElementById('product-reviews-modal-title');

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
            categorySelect.innerHTML = '<option value="">Ошибка загрузки категорий</option>';
        }
    }

    await loadCategoriesForSelect();

    function showEditProductForm() {
        productsListContainer.style.display = 'none';
        editProductFormContainer.style.display = 'block';
        loadingMessage.style.display = 'none';
        window.scrollTo({ top: editProductFormContainer.offsetTop - 70, behavior: 'smooth' });
    }

    function showProductsList() {
        productsListContainer.style.display = 'block';
        editProductFormContainer.style.display = 'none';
        if (editProductFormEl) editProductFormEl.reset();
        currentImagePreview.style.display = 'none';
        currentImagePreview.src = "#";
    }

    async function populateEditProductForm(productId) {
        try {
            const product = await getProductById(productId);
            if (product && editProductFormEl) {
                editProductFormEl.querySelector('#edit-product-id').value = product.id;
                editProductFormEl.querySelector('#edit-product-title').value = product.title || '';
                editProductFormEl.querySelector('#edit-product-description').value = product.description || '';
                editProductFormEl.querySelector('#edit-product-price').value = product.price || 0;
                editProductFormEl.querySelector('#edit-product-stock').value = product.stock || 0;
                categorySelect.value = product.category_id || "";

                if (product.image) {
                    currentImagePreview.src = `/uploads/${product.image}`;
                    currentImagePreview.style.display = 'block';
                } else {
                    currentImagePreview.style.display = 'none';
                    currentImagePreview.src = '#';
                }
                editProductFormEl.querySelector('#edit-product-image').value = '';
                showEditProductForm();
            } else {
                alert('Не удалось загрузить данные товара.');
                showProductsList();
            }
        } catch (error) {
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
                const addFirstBtn = document.getElementById('add-first-product-btn');
                if(addFirstBtn) addFirstBtn.addEventListener('click', () => navigateTo('/add-product'));
                return;
            }

            productsListDiv.style.display = 'grid';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card-seller';
                productCard.style.cssText = `border:1px solid #ddd; border-radius:8px; padding:15px; background-color:#fff; box-shadow:0 2px 5px rgba(0,0,0,0.1); display:flex; flex-direction:column; min-height: 420px;`;

                const defaultImage = '/images/default-product-image.png';
                const productImage = product.image ? `/uploads/${product.image}` : defaultImage;

                productCard.innerHTML = `
                    <img src="${productImage}" alt="${product.title}" style="width:100%; height:180px; object-fit:cover; border-radius:4px; margin-bottom:10px;">
                    <h3 style="margin:0 0 8px 0; font-size:1.1em;">${product.title}</h3>
                    <p style="font-size:0.9em; color:#555; margin-bottom:8px; flex-grow:1;">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                    <p style="font-size:1em; font-weight:bold; color:#333; margin-bottom:12px;">Цена: ${product.price} руб.</p>
                    <p style="font-size:0.9em; color:#777; margin-bottom:10px;">В наличии: ${product.stock} шт.</p>
                    <div class="product-actions-seller" style="margin-top:auto; display:flex; flex-direction:column; gap:8px;">
                        ${canManageProductsGlobally ? `
                            <button class="edit-my-product-btn" data-product-id="${product.id}">Редактировать</button>
                            <button class="delete-my-product-btn" data-product-id="${product.id}">Удалить товар</button>
                        ` : ''}
                        <button class="view-my-product-reviews-btn" data-product-id="${product.id}" data-product-title="${product.title}">Просмотреть отзывы</button>
                    </div>
                `;
                productsListDiv.appendChild(productCard);
            });

            addEventListenersToProductCardButtons();

        } catch (error) {
            loadingMessage.style.display = 'none';
            productsListDiv.innerHTML = `<p style="color:red; grid-column:1/-1;">Ошибка загрузки: ${error.message}</p>`;
        }
    }

    function addEventListenersToProductCardButtons() {
        document.querySelectorAll('.edit-my-product-btn').forEach(button => {
            button.addEventListener('click', (e) => populateEditProductForm(e.target.dataset.productId));
        });
        document.querySelectorAll('.delete-my-product-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                const productName = e.target.closest('.product-card-seller').querySelector('h3').textContent;
                if (confirm(`Удалить товар "${productName}"?`)) {
                    try {
                        await deleteProduct(productId);
                        alert('Товар удален.');
                        fetchAndRenderMyProducts();
                    } catch (error) { alert(`Ошибка удаления: ${error.message}`); }
                }
            });
        });
        document.querySelectorAll('.view-my-product-reviews-btn').forEach(button => {
            button.addEventListener('click', (e) => showProductReviewsModal(e.target.dataset.productId, e.target.dataset.productTitle));
        });
    }

    async function showProductReviewsModal(productId, productTitle) {
        reviewsModalTitle.textContent = `Отзывы о "${productTitle}"`;
        reviewsListContainer.innerHTML = '<p>Загрузка отзывов...</p>';
        reviewsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        try {
            const reviews = await getReviewsByProduct(productId);
            if (!Array.isArray(reviews) || reviews.length === 0) {
                reviewsListContainer.innerHTML = '<p>Отзывов пока нет.</p>';
            } else {
                reviewsListContainer.innerHTML = `
                    <ul style="list-style:none; padding:0;">
                        ${reviews.map(review => `
                            <li style="border-bottom:1px solid #eee; padding:10px 0; margin-bottom:10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <strong>${review.user_first_name || 'User'} ${review.user_last_name || ''}</strong>
                                    <span>Рейтинг: ${review.rating}/5</span>
                                </div>
                                <p style="margin:5px 0; color:#555;">${review.comment}</p>
                                <small style="color:#888;">${new Date(review.created_at).toLocaleDateString()}</small>
                                ${canManageReviews ? `<button class="delete-review-btn" data-review-id="${review.id}" data-product-id="${productId}" style="float:right; font-size:0.8em; padding:3px 6px; background-color:#fdd; border:1px solid #f00; color:#c00; border-radius:3px; cursor:pointer;">Удалить</button>` : ''}
                            </li>
                        `).join('')}
                    </ul>`;
                if (canManageReviews) addDeleteReviewListeners(productId);
            }
        } catch (error) {
            reviewsListContainer.innerHTML = `<p style="color:red;">Ошибка загрузки отзывов: ${error.message}</p>`;
        }
    }

    function addDeleteReviewListeners(currentProductId) {
        reviewsListContainer.querySelectorAll('.delete-review-btn').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', async (e) => {
                const reviewId = e.target.dataset.reviewId;
                const productIdForRefresh = e.target.dataset.productId;
                if (confirm('Удалить этот отзыв?')) {
                    try {
                        await deleteReview(reviewId);
                        alert('Отзыв удален.');
                        const productTitleForRefresh = reviewsModalTitle.textContent.replace('Отзывы о "', '').replace('"', '');
                        showProductReviewsModal(productIdForRefresh, productTitleForRefresh);
                    } catch (error) {
                        alert(`Ошибка удаления отзыва: ${error.message}`);
                    }
                }
            });
        });
    }


    if (editProductFormEl) {
        editProductFormEl.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = editProductFormEl.querySelector('#edit-product-id').value;
            const imageFile = editProductFormEl.querySelector('#edit-product-image').files[0];
            const productDataToUpdate = {
                title: editProductFormEl.querySelector('#edit-product-title').value,
                description: editProductFormEl.querySelector('#edit-product-description').value,
                price: parseFloat(editProductFormEl.querySelector('#edit-product-price').value),
                stock: parseInt(editProductFormEl.querySelector('#edit-product-stock').value, 10),
                category_id: parseInt(categorySelect.value, 10),
            };

            if (!productDataToUpdate.title || !productDataToUpdate.description || isNaN(productDataToUpdate.price) || isNaN(productDataToUpdate.stock) || isNaN(productDataToUpdate.category_id)) {
                alert('Заполните все поля корректно.');
                return;
            }
            const submitButton = editProductFormEl.querySelector('button[type="submit"]');
            try {
                submitButton.textContent = 'Сохранение...'; submitButton.disabled = true;
                await updateProduct(productId, productDataToUpdate);
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('product_id', productId); formData.append('image', imageFile);
                    await uploadProductImage(formData);
                }
                alert('Товар обновлен!');
                fetchAndRenderMyProducts();
            } catch (error) {
                alert(`Ошибка обновления: ${error.message}`);
            } finally {
                submitButton.textContent = 'Сохранить изменения'; submitButton.disabled = false;
            }
        });
    }

    if (cancelEditProductBtn) {
        cancelEditProductBtn.addEventListener('click', showProductsList);
    }

    closeReviewsModalBtn.onclick = () => {
        reviewsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    window.onclick = (event) => {
        if (event.target == reviewsModal) {
            reviewsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    await fetchAndRenderMyProducts();
}

function applyStylesToEditForm() {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        #edit-product-form div { margin-bottom: 12px; }
        #edit-product-form label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #333; }
        #edit-product-form input[type="text"],
        #edit-product-form input[type="number"],
        #edit-product-form input[type="file"],
        #edit-product-form textarea,
        #edit-product-form select {
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1em;
        }
        #edit-product-form textarea { resize: vertical; min-height: 80px; }
        #edit-product-form button {
            padding: 10px 18px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
            font-weight: bold;
        }
        #edit-product-form button[type="submit"] { background-color: #28a745; color: white; }
        #edit-product-form button[type="button"] { background-color: #6c757d; color: white; margin-left: 10px; }
        #my-products-list-container .product-actions-seller button {
             padding: 8px 12px; font-size:0.9em; color:white; border:none; border-radius:4px; cursor:pointer; width:100%;
        }
         #my-products-list-container .product-actions-seller button.edit-my-product-btn { background-color: #007bff;}
         #my-products-list-container .product-actions-seller button.delete-my-product-btn { background-color: #dc3545;}
         #my-products-list-container .product-actions-seller button.view-my-product-reviews-btn { background-color: #17a2b8;}

    `;
    document.head.appendChild(styleSheet);
}