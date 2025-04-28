export function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Login</h1>
        </header>
        <form id="login-form">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <footer>
            <p>Don't have an account? <a href="/register" data-link>Register</a></p>
        </footer>
    `;

    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/v1/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Авторизация успешна!');
                console.log('Token:', data.token);
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.message}`);
            }
        } catch (err) {
            console.error('Ошибка при авторизации:', err);
            alert('Ошибка сервера. Попробуйте позже.');
        }
    });
}