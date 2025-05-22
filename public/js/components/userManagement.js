import { getAllUsers, getUserById, updateUser, deleteUser } from '../api/api.js'; // Добавляем getUserById и updateUser
import { isLoggedIn, getUserRole } from '../auth/auth.js';
import { navigateTo } from '../router.js';

function getUserRoleName(roleId) {
    const role = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
    switch (role) {
        case 1: return 'Покупатель';
        case 2: return 'Продавец';
        case 3: return 'Администратор';
        default: return 'Неизвестная роль';
    }
}

export async function renderAdminUserList() {
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
            <h1>Управление пользователями</h1>
        </header>
        <main id="admin-user-list-container">
            <div id="loading-users-message">Загрузка списка пользователей...</div>
            <div id="users-table-container" style="margin-top: 20px;"></div> 
            
            <div id="edit-user-form-container" style="display: none; margin-top: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                <h2>Редактировать пользователя</h2>
                <form id="edit-user-form">
                    <input type="hidden" id="edit-user-id">
                    <div style="margin-bottom: 10px;">
                        <label for="edit-first-name" style="display:block; margin-bottom:5px;">Имя:</label>
                        <input type="text" id="edit-first-name" required style="width:100%; padding:8px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="edit-last-name" style="display:block; margin-bottom:5px;">Фамилия:</label>
                        <input type="text" id="edit-last-name" required style="width:100%; padding:8px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="edit-email" style="display:block; margin-bottom:5px;">Email:</label>
                        <input type="email" id="edit-email" required style="width:100%; padding:8px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="edit-password" style="display:block; margin-bottom:5px;">Новый пароль (оставьте пустым, чтобы не менять):</label>
                        <input type="password" id="edit-password" style="width:100%; padding:8px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="edit-role-id" style="display:block; margin-bottom:5px;">Роль:</label>
                        <select id="edit-role-id" required style="width:100%; padding:8px; box-sizing:border-box;">
                            <option value="1">Покупатель</option>
                            <option value="2">Продавец</option>
                            <option value="3">Администратор</option>
                        </select>
                    </div>
                    <button type="submit" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Сохранить</button>
                    <button type="button" id="cancel-edit-user-btn" style="margin-left: 10px; padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Отмена</button>
                </form>
            </div>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const loadingMessage = document.getElementById('loading-users-message');
    const usersTableContainer = document.getElementById('users-table-container');
    const editUserFormContainer = document.getElementById('edit-user-form-container');
    const editUserForm = document.getElementById('edit-user-form');
    const cancelEditUserBtn = document.getElementById('cancel-edit-user-btn');

    async function fetchAndRenderUsers() {
        try {
            showUsersTable();
            loadingMessage.style.display = 'block';
            usersTableContainer.innerHTML = '';
            const users = await getAllUsers();
            loadingMessage.style.display = 'none';

            if (!users || !Array.isArray(users) || users.length === 0) {
                usersTableContainer.innerHTML = '<p>Пользователи не найдены.</p>';
                return;
            }

            const currentAdminId = localStorage.getItem('id') || sessionStorage.getItem('id'); // ID текущего администратора

            usersTableContainer.innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Имя</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Фамилия</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Email</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Роль</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${user.id}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${user.first_name || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${user.last_name || 'N/A'}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${user.email}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${getUserRoleName(user.role_id)}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">
                                    <button class="edit-user-btn" data-user-id="${user.id}" style="padding: 5px 10px; margin-right: 5px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Редакт.</button>
                                    ${user.id.toString() !== currentAdminId ?
                `<button class="delete-user-btn" data-user-id="${user.id}" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Удалить</button>`
                : '<span style="color: #999;" title="Нельзя удалить текущего администратора">Текущий</span>'
            }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            addEventListenersToTableButtons();
        } catch (error) {
            console.error('Ошибка при загрузке списка пользователей:', error);
            loadingMessage.style.display = 'none';
            usersTableContainer.innerHTML = `<p style="color: red;">Ошибка загрузки списка пользователей: ${error.message}</p>`;
        }
    }

    function showEditForm() {
        usersTableContainer.style.display = 'none';
        editUserFormContainer.style.display = 'block';
        loadingMessage.style.display = 'none';
    }

    function showUsersTable() {
        usersTableContainer.style.display = 'block';
        editUserFormContainer.style.display = 'none';
    }

    async function populateEditForm(userId) {
        try {
            const user = await getUserById(userId);
            if (user) {
                document.getElementById('edit-user-id').value = user.id;
                document.getElementById('edit-first-name').value = user.first_name || '';
                document.getElementById('edit-last-name').value = user.last_name || '';
                document.getElementById('edit-email').value = user.email || '';
                document.getElementById('edit-password').value = '';
                document.getElementById('edit-role-id').value = user.role_id || '1';
                showEditForm();
            } else {
                alert('Не удалось загрузить данные пользователя для редактирования.');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя для редактирования:', error);
            alert(`Ошибка загрузки: ${error.message}`);
        }
    }

    function addEventListenersToTableButtons() {
        const editButtons = document.querySelectorAll('.edit-user-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const userId = event.target.dataset.userId;
                populateEditForm(userId);
            });
        });

        const deleteButtons = document.querySelectorAll('.delete-user-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const userId = event.target.dataset.userId;
                if (confirm(`Вы уверены, что хотите удалить пользователя с ID: ${userId}?`)) {
                    try {
                        await deleteUser(userId);
                        alert('Пользователь успешно удален.');
                        fetchAndRenderUsers();
                    } catch (error) {
                        alert(`Ошибка при удалении пользователя: ${error.message}`);
                        console.error('Ошибка при удалении пользователя:', error);
                    }
                }
            });
        });
    }

    if (editUserForm) {
        editUserForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userId = document.getElementById('edit-user-id').value;
            const passwordInput = document.getElementById('edit-password').value;

            const updatedUserData = {
                first_name: document.getElementById('edit-first-name').value,
                last_name: document.getElementById('edit-last-name').value,
                email: document.getElementById('edit-email').value,
                role_id: parseInt(document.getElementById('edit-role-id').value, 10),
            };

            if (passwordInput && passwordInput.trim() !== '') {
                updatedUserData.password = passwordInput;
            }

            const submitButton = editUserForm.querySelector('button[type="submit"]');

            try {
                submitButton.textContent = 'Сохранение...';
                submitButton.disabled = true;
                await updateUser(userId, updatedUserData);
                alert('Данные пользователя успешно обновлены.');
                fetchAndRenderUsers();
            } catch (error) {
                alert(`Ошибка при обновлении данных пользователя: ${error.message}`);
                console.error('Ошибка обновления:', error);
            } finally {
                submitButton.textContent = 'Сохранить';
                submitButton.disabled = false;
            }
        });
    }


    if (cancelEditUserBtn) {
        cancelEditUserBtn.addEventListener('click', () => {
            showUsersTable();
            editUserForm.reset();
        });
    }

    await fetchAndRenderUsers();
}