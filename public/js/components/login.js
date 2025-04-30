import { loginUser } from '../api/api.js';

export function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Login</h1>
        </header>
        <main>
            <form id="login-form">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
            <p>Don't have an account? <a href="/register" data-link>Register</a></p>
            </form>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await loginUser({ email, password });
            alert('Авторизация успешна!');
            console.log('Token:', data.token);

            window.history.pushState(null, null, '/general');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Ошибка при авторизации:', error);
        }
    });
}