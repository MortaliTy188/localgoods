import { registerUser } from '../api/api.js';

export function renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Register</h1>
        </header>
        <main>
            <form id="register-form">
            <input type="text" id="first_name" placeholder="First Name" required>
            <input type="text" id="last_name" placeholder="Last Name" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Register</button>
            <p>Already have an account? <a href="/" data-link>Login</a></p>
        </form>
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await registerUser({ first_name, last_name, email, password });
            alert('Регистрация успешна!');
            console.log('User:', data.user);

            window.history.pushState(null, null, '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Ошибка при регистрации:', error);
        }
    });
}