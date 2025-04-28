export function renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>Register</h1>
        </header>
        <form id="register-form">
            <input type="text" id="first_name" placeholder="First Name" required>
            <input type="text" id="last_name" placeholder="Last Name" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Register</button>
        </form>
        <footer>
            <p>Already have an account? <a href="/" data-link>Login</a></p>
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
            const response = await fetch('http://localhost:3000/api/v1/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ first_name, last_name, email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Регистрация успешна!');
                console.log('User:', data.user);
                window.history.pushState(null, null, '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.message}`);
            }
        } catch (err) {
            console.error('Ошибка при регистрации:', err);
            alert('Ошибка сервера. Попробуйте позже.');
        }
    });
}