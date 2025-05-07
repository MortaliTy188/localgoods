import { getUserById, updateUser } from '../api/api.js';
import { isLoggedIn } from '../auth/auth.js';

export async function renderUserProfile() {
    if (!isLoggedIn()) {
        window.history.pushState(null, null, '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Личный кабинет</h1>
        </header>
        <main id="user-profile-container">
            <div id="loading-message">Загрузка данных пользователя...</div>
            <div id="user-details" style="display: none;">
                <h2>Информация о пользователе</h2>
                <p><strong>Имя:</strong> <span id="user-first-name"></span></p>
                <p><strong>Фамилия:</strong> <span id="user-last-name"></span></p>
                <p><strong>Email:</strong> <span id="user-email"></span></p>
                <button id="edit-profile-btn">Редактировать профиль</button>
                <button id="logout-btn">Выйти</button>
            </div>

            <form id="edit-profile-form" style="display: none;">
                <h2>Редактировать профиль</h2>
                <div>
                    <label for="edit-first-name">Имя:</label>
                    <input type="text" id="edit-first-name" required>
                </div>
                <div>
                    <label for="edit-last-name">Фамилия:</label>
                    <input type="text" id="edit-last-name" required>
                </div>
                <div>
                    <label for="edit-email">Email:</label>
                    <input type="email" id="edit-email" required>
                </div>
                
                <button type="submit">Сохранить изменения</button>
                <button type="button" id="cancel-edit-btn">Отмена</button>
            </form>
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

    const userId = localStorage.getItem('id') || sessionStorage.getItem('id');

    if (!userId) {
        loadingMessage.textContent = 'Ошибка: ID пользователя не найден. Пожалуйста, войдите снова.';
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('id');
        sessionStorage.removeItem('id');
        setTimeout(() => {
            window.history.pushState(null, null, '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
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

            document.getElementById('user-first-name').textContent = currentUserData.first_name;
            document.getElementById('user-last-name').textContent = currentUserData.last_name;
            document.getElementById('user-email').textContent = currentUserData.email;

            document.getElementById('edit-first-name').value = currentUserData.first_name;
            document.getElementById('edit-last-name').value = currentUserData.last_name;
            document.getElementById('edit-email').value = currentUserData.email;

            loadingMessage.style.display = 'none';
            userDetailsDiv.style.display = 'block';
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
            loadingMessage.textContent = `Ошибка загрузки данных: ${error.message}. Попробуйте перезагрузить страницу.`;
            loadingMessage.style.color = 'red';
        }
    }

    await fetchAndRenderUserData();

    editProfileBtn.addEventListener('click', () => {
        userDetailsDiv.style.display = 'none';
        editProfileForm.style.display = 'block';
    });

    cancelEditBtn.addEventListener('click', () => {
        editProfileForm.style.display = 'none';
        userDetailsDiv.style.display = 'block';
        if (currentUserData) {
            document.getElementById('edit-first-name').value = currentUserData.first_name;
            document.getElementById('edit-last-name').value = currentUserData.last_name;
            document.getElementById('edit-email').value = currentUserData.email;
        }
    });

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            first_name: document.getElementById('edit-first-name').value,
            last_name: document.getElementById('edit-last-name').value,
            email: document.getElementById('edit-email').value,
        };

        try {
            await updateUser(userId, updatedData);
            alert('Профиль успешно обновлен!');

            await fetchAndRenderUserData();

            editProfileForm.style.display = 'none';
            userDetailsDiv.style.display = 'block';
        } catch (error) {
            alert(`Ошибка обновления профиля: ${error.message}`);
            console.error('Ошибка при обновлении профиля:', error);
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('id');
        sessionStorage.removeItem('id');
        alert('Вы успешно вышли из системы.');
        window.history.pushState(null, null, '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}