import { loginUser } from '../api/api.js';
import { isLoggedIn } from '../auth/auth.js';

export function renderLogin() {
    if (isLoggedIn()) {
        window.history.pushState(null, null, '/general');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Login</h1>
        </header>
        <main>
            <form id="login-form">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <label style="text-align: center">
                    <input type="checkbox" id="remember-me">
                    Remember Me
                </label>
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
        const rememberMe = document.getElementById('remember-me').checked; // Check if "Remember Me" is selected

        try {
            const data = await loginUser({ email, password });
            alert('Авторизация успешна!');
            console.log('Token:', data.token);

            if (rememberMe) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('id', data.user.id);
            } else {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('id', data.user.id);
            }

            window.history.pushState(null, null, '/general');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Ошибка при авторизации:', error);
        }
    });
}