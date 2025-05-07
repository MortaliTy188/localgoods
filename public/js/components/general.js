import { logout } from '../auth/auth.js';

export function renderGeneral() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <nav>
                <ul class="nav-list">
                    <li><a href="/catalog" data-link>Catalog</a></li>
                    <li><a href="/profile" data-link>Personal</a></li>
                    <li><a href="/cart" data-link>Cart</a></li>
                    <li><button id="logout-button" class="logout-button">Logout</button></li>
                </ul>
            </nav>
        </header>
        <main>
            
        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logout();
    });
}