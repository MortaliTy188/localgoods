import { getUserById, updateUser, getUserOrders } from '../api/api.js';
import { isLoggedIn, getUserRole } from '../auth/auth.js';
import { navigateTo } from '../router.js';

export async function renderUserProfile() {
    if (!isLoggedIn()) {
        navigateTo('/login');
        return;
    }

    const app = document.getElementById('app');
    const userRole = getUserRole();

    let sellerFunctionalityHtml = '';
    let adminFunctionalityHtml = '';


    if (userRole === '2' || userRole === '3') {
        sellerFunctionalityHtml = `
            <button id="add-product-btn" style="margin-left: 10px;">Добавить товар</button>
            <button id="my-products-btn" style="margin-left: 10px;">Мои товары</button>
        `;
    }


    if (userRole === '3') {
        adminFunctionalityHtml = `
            <button id="view-all-users-btn" style="margin-left: 10px;">Просмотр пользователей</button>
            <button id="manage-categories-btn" style="margin-left: 10px;">Управление категориями</button> 
        `;
    }

    app.innerHTML = `
        <header>
            <a href="/general" data-link class="back-to-home-button" style="display: inline-block; margin-bottom: 10px; padding: 8px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Back to Shop</a>
            <h1>Личный кабинет</h1>
        </header>
        <main id="user-profile-container">
            <div id="loading-message">Загрузка данных пользователя...</div>
            
            <div id="user-details" style="display: none;">
                <h2>Информация о пользователе</h2>
                <p><strong>Имя:</strong> <span id="user-first-name"></span></p>
                <p><strong>Фамилия:</strong> <span id="user-last-name"></span></p>
                <p><strong>Email:</strong> <span id="user-email"></span></p>
                <div class="user-actions" style="margin-top: 15px;">
                    <button id="edit-profile-btn">Редактировать профиль</button>
                    <button id="view-orders-btn" style="margin-left: 10px;">Мои заказы</button>
                    ${sellerFunctionalityHtml}
                    ${adminFunctionalityHtml}
                    <button id="logout-btn" style="margin-left: 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; padding: 8px 15px; cursor: pointer;">Выйти</button>
                </div>
            </div>


            <form id="edit-profile-form" style="display: none; margin-top:20px; padding:20px; border:1px solid #ccc; border-radius:8px;">
                <h2>Редактировать профиль</h2>
                <div style="margin-bottom: 10px;">
                    <label for="edit-first-name" style="display:block; margin-bottom:5px;">Имя:</label>
                    <input type="text" id="edit-first-name" required style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label for="edit-last-name" style="display:block; margin-bottom:5px;">Фамилия:</label>
                    <input type="text" id="edit-last-name" required style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="edit-email" style="display:block; margin-bottom:5px;">Email:</label>
                    <input type="email" id="edit-email" required style="width:100%; padding:8px; box-sizing:border-box;">
                </div>
                
                <button type="submit" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Сохранить изменения</button>
                <button type="button" id="cancel-edit-btn" style="margin-left: 10px; padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Отмена</button>
            </form>

            <div id="order-history-container" style="display: none; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 15px;">
                <h2>История заказов</h2>
                <div id="orders-list-content">
                    <p>Загрузка истории заказов...</p>
                </div>
            </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;


    const loadingMessage = document.getElementById('loading-message');
    const userDetailsDiv = document.getElementById('user-details');
    const editProfileForm = document.getElementById('edit-profile-form');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const viewOrdersBtn = document.getElementById('view-orders-btn');
    const orderHistoryContainer = document.getElementById('order-history-container');
    const ordersListDiv = document.getElementById('orders-list-content');



    if (userRole === '2' || userRole === '3') {
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                navigateTo('/add-product');
            });
        }

        const myProductsBtn = document.getElementById('my-products-btn');
        if (myProductsBtn) {
            myProductsBtn.addEventListener('click', () => {
                const currentUserId = localStorage.getItem('id') || sessionStorage.getItem('id');
                if (currentUserId) {
                    navigateTo(`/seller/${currentUserId}/products`);
                } else {
                    alert('Не удалось определить ID пользователя для просмотра товаров.');
                }
            });
        }
    }


    if (userRole === '3') {
        const viewAllUsersBtn = document.getElementById('view-all-users-btn');
        if (viewAllUsersBtn) {
            viewAllUsersBtn.addEventListener('click', () => {
                navigateTo('/admin/users');
            });
        }

        const manageCategoriesBtn = document.getElementById('manage-categories-btn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => {
                navigateTo('/admin/categories');
            });
        }
    }


    const userId = localStorage.getItem('id') || sessionStorage.getItem('id');

    if (!userId) {
        loadingMessage.textContent = 'Ошибка: ID пользователя не найден. Пожалуйста, войдите снова.';
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('id');
        sessionStorage.removeItem('id');
        localStorage.removeItem('role');
        sessionStorage.removeItem('role');
        setTimeout(() => {
            navigateTo('/login');
        }, 2000);
        return;
    }

    let currentUserData = null;

    async function fetchAndRenderUserData() {
        try {
            loadingMessage.style.display = 'block';
            userDetailsDiv.style.display = 'none';
            editProfileForm.style.display = 'none';

            currentUserData = await getUserById(userId);

            document.getElementById('user-first-name').textContent = currentUserData.first_name || 'N/A';
            document.getElementById('user-last-name').textContent = currentUserData.last_name || 'N/A';
            document.getElementById('user-email').textContent = currentUserData.email || 'N/A';

            document.getElementById('edit-first-name').value = currentUserData.first_name || '';
            document.getElementById('edit-last-name').value = currentUserData.last_name || '';
            document.getElementById('edit-email').value = currentUserData.email || '';

            loadingMessage.style.display = 'none';
            userDetailsDiv.style.display = 'block';
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
            loadingMessage.textContent = `Ошибка загрузки данных: ${error.message}. Попробуйте перезагрузить страницу.`;
            loadingMessage.style.color = 'red';
        }
    }

    await fetchAndRenderUserData();

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            userDetailsDiv.style.display = 'none';
            orderHistoryContainer.style.display = 'none';
            editProfileForm.style.display = 'block';
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editProfileForm.style.display = 'none';
            userDetailsDiv.style.display = 'block';
            if (currentUserData) {
                document.getElementById('edit-first-name').value = currentUserData.first_name || '';
                document.getElementById('edit-last-name').value = currentUserData.last_name || '';
                document.getElementById('edit-email').value = currentUserData.email || '';
            }
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                first_name: document.getElementById('edit-first-name').value,
                last_name: document.getElementById('edit-last-name').value,
                email: document.getElementById('edit-email').value,
            };
            const submitButton = editProfileForm.querySelector('button[type="submit"]');
            try {
                submitButton.textContent = 'Сохранение...';
                submitButton.disabled = true;
                await updateUser(userId, updatedData);
                alert('Профиль успешно обновлен!');
                await fetchAndRenderUserData();
                editProfileForm.style.display = 'none';
                userDetailsDiv.style.display = 'block';
            } catch (error) {
                alert(`Ошибка обновления профиля: ${error.message}`);
                console.error('Ошибка при обновлении профиля:', error);
            } finally {
                submitButton.textContent = 'Сохранить изменения';
                submitButton.disabled = false;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            localStorage.removeItem('id');
            sessionStorage.removeItem('id');
            localStorage.removeItem('role');
            sessionStorage.removeItem('role');
            alert('Вы успешно вышли из системы.');
            navigateTo('/login');
        });
    }

    async function fetchAndRenderUserOrders() {
        try {
            ordersListDiv.innerHTML = '<p>Загрузка истории заказов...</p>';
            const orders = await getUserOrders();
            if (!orders || !Array.isArray(orders) || orders.length === 0) {
                ordersListDiv.innerHTML = '<p>У вас пока нет заказов.</p>';
            } else {
                ordersListDiv.innerHTML = `
                    <ul style="list-style: none; padding: 0;">
                        ${orders.map(order => `
                            <li style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 4px; background-color: #f9f9f9;">
                                <p style="margin: 0 0 5px 0;"><strong>Заказ ID:</strong> ${order.id}</p>
                                <p style="margin: 0 0 5px 0;"><strong>Дата:</strong> ${new Date(order.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p> 
                                <p style="margin: 0 0 5px 0;"><strong>Сумма:</strong> $${parseFloat(order.total_price || 0).toFixed(2)}</p>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        } catch (error) {
            console.error('Ошибка при загрузке истории заказов:', error);
            ordersListDiv.innerHTML = `<p style="color: red;">Ошибка загрузки истории заказов: ${error.message}</p>`;
        }
    }

    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', async () => {
            if (editProfileForm.style.display === 'block') {
                editProfileForm.style.display = 'none';
                userDetailsDiv.style.display = 'block';
            }

            if (orderHistoryContainer.style.display === 'none' || orderHistoryContainer.style.display === '') {
                orderHistoryContainer.style.display = 'block';
                await fetchAndRenderUserOrders();
            } else {
                orderHistoryContainer.style.display = 'none';
            }
        });
    }
}