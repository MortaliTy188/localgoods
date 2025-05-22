import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../api/api.js';
import { isLoggedIn, getUserRole } from '../auth/auth.js';
import { navigateTo } from '../router.js';

export async function renderAdminCategoryList() {
    if (!isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    const adminUserRole = getUserRole();
    if (adminUserRole !== '3') {
        alert('Доступ запрещен: у вас нет прав для просмотра этой страницы.');
        navigateTo('/profile');
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <a href="/profile" data-link class="back-to-profile-button" style="display: inline-block; margin-bottom: 10px; padding: 8px 15px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px;">Назад в профиль</a>
            <h1>Управление категориями</h1>
        </header>
        <main id="admin-category-list-container">
            <div id="category-form-container" style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9;">
                <h2 id="category-form-title">Добавить новую категорию</h2>
                <form id="category-form">
                    <input type="hidden" id="category-id">
                    <div style="margin-bottom: 10px;">
                        <label for="category-name" style="display:block; margin-bottom:5px;">Название категории:</label>
                        <input type="text" id="category-name" required style="width:100%; padding:8px; box-sizing:border-box;">
                    </div>
                    <button type="submit" id="save-category-btn" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Сохранить</button>
                    <button type="button" id="cancel-edit-category-btn" style="margin-left: 10px; padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;">Отмена</button>
                </form>
            </div>

            <div id="loading-categories-message">Загрузка списка категорий...</div>
            <div id="categories-list-content" style="margin-top: 20px;"></div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const loadingMessage = document.getElementById('loading-categories-message');
    const categoriesListDiv = document.getElementById('categories-list-content');
    const categoryFormContainer = document.getElementById('category-form-container');
    const categoryForm = document.getElementById('category-form');
    const categoryFormTitle = document.getElementById('category-form-title');
    const categoryIdInput = document.getElementById('category-id');
    const categoryNameInput = document.getElementById('category-name');
    const saveCategoryBtn = document.getElementById('save-category-btn');
    const cancelEditCategoryBtn = document.getElementById('cancel-edit-category-btn');

    let editingCategoryId = null;

    function resetCategoryForm() {
        categoryForm.reset();
        categoryIdInput.value = '';
        categoryFormTitle.textContent = 'Добавить новую категорию';
        saveCategoryBtn.textContent = 'Сохранить';
        cancelEditCategoryBtn.style.display = 'none';
        editingCategoryId = null;
    }

    async function fetchAndRenderCategories() {
        try {
            loadingMessage.style.display = 'block';
            categoriesListDiv.innerHTML = '';

            const categories = await getAllCategories();
            loadingMessage.style.display = 'none';

            if (!categories || !Array.isArray(categories) || categories.length === 0) {
                categoriesListDiv.innerHTML = '<p>Категории не найдены. Вы можете добавить первую!</p>';
                return;
            }

            categoriesListDiv.innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Название</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left; width: 150px;">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(category => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${category.id}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${category.name}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">
                                    <button class="edit-category-btn" data-category-id="${category.id}" data-category-name="${category.name}" style="padding: 5px 10px; margin-right: 5px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Редакт.</button>
                                    <button class="delete-category-btn" data-category-id="${category.id}" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Удалить</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            addEventListenersToCategoryButtons();
        } catch (error) {
            console.error('Ошибка при загрузке списка категорий:', error);
            loadingMessage.style.display = 'none';
            categoriesListDiv.innerHTML = `<p style="color: red;">Ошибка загрузки списка категорий: ${error.message}</p>`;
        }
    }

    function populateCategoryFormForEdit(category) {
        editingCategoryId = category.id;
        categoryIdInput.value = category.id;
        categoryNameInput.value = category.name;
        categoryFormTitle.textContent = 'Редактировать категорию';
        saveCategoryBtn.textContent = 'Обновить';
        cancelEditCategoryBtn.style.display = 'inline-block';
        categoryNameInput.focus();
    }

    function addEventListenersToCategoryButtons() {
        const editButtons = document.querySelectorAll('.edit-category-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const categoryId = event.target.dataset.categoryId;
                const categoryName = event.target.dataset.categoryName;
                populateCategoryFormForEdit({ id: categoryId, name: categoryName });
            });
        });

        const deleteButtons = document.querySelectorAll('.delete-category-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const categoryId = event.target.dataset.categoryId;
                if (confirm(`Вы уверены, что хотите удалить категорию с ID: ${categoryId}? Это также может повлиять на товары в этой категории.`)) {
                    try {
                        await deleteCategory(categoryId);
                        alert('Категория успешно удалена.');
                        resetCategoryForm();
                        fetchAndRenderCategories();
                    } catch (error) {
                        alert(`Ошибка при удалении категории: ${error.message}`);
                        console.error('Ошибка при удалении категории:', error);
                    }
                }
            });
        });
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const categoryName = categoryNameInput.value.trim();

            if (!categoryName) {
                alert('Название категории не может быть пустым.');
                return;
            }

            const categoryData = {
                name: categoryName,
            };

            const submitButton = saveCategoryBtn;

            try {
                submitButton.textContent = editingCategoryId ? 'Обновление...' : 'Сохранение...';
                submitButton.disabled = true;

                if (editingCategoryId) {
                    await updateCategory(editingCategoryId, categoryData);
                    alert('Категория успешно обновлена.');
                } else {
                    await addCategory(categoryData);
                    alert('Категория успешно добавлена.');
                }
                resetCategoryForm();
                fetchAndRenderCategories();
            } catch (error) {
                alert(`Ошибка: ${error.message}`);
                console.error('Ошибка при сохранении категории:', error);
            } finally {
                submitButton.textContent = editingCategoryId ? 'Обновить' : 'Сохранить';
                submitButton.disabled = false;
            }
        });
    }

    if (cancelEditCategoryBtn) {
        cancelEditCategoryBtn.addEventListener('click', () => {
            resetCategoryForm();
        });
    }

    await fetchAndRenderCategories();
}