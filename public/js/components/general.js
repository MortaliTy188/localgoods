export function renderGeneral() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
        <nav>
            <ul class="nav-list">
                <li><a href="">Catalog</a></li>
                <li><a href="">Personal</a></li>
                <li><a href="">Cart</a></li>
            </ul>
        </nav>
            
        </header>
        <main>

        </main>
        <footer>
            <h1>LocalGoods</h1>
        </footer>
    `;
}