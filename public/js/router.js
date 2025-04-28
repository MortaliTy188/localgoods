import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';

export function Router() {
    const routes = {
        '/': renderLogin,
        '/register': renderRegister,
    };

    function navigate(path) {
        const route = routes[path] || renderLogin;
        route();
    }

    window.addEventListener('popstate', () => navigate(window.location.pathname));

    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.hasAttribute('data-link')) {
            e.preventDefault();
            const path = e.target.getAttribute('href');
            window.history.pushState(null, null, path);
            navigate(path);
        }
    });

    navigate(window.location.pathname);
}