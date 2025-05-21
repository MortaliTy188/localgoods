import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderCatalog } from './components/catalog.js';
import {renderGeneral} from "./components/general.js";
import {renderUserProfile} from "./components/userProfile.js";
import {renderCart} from "./components/cart.js";
import {renderAddProductPage} from "./components/addProduct.js";

const routes = {
    '/': renderLogin,
    '/register': renderRegister,
    '/catalog': renderCatalog,
    '/general': renderGeneral,
    '/profile': renderUserProfile,
    '/cart': renderCart,
    '/add-product': renderAddProductPage,
};

export function navigateTo(path) {
    window.history.pushState(null, null, path);
    const routeHandler = routes[path] || routes['/'];
    routeHandler();
}

export function Router() {
    function handleRouteChange(currentPath) {
        const routeHandler = routes[currentPath] || routes['/'];
        routeHandler();
    }

    window.addEventListener('popstate', () => handleRouteChange(window.location.pathname));


    if (!document.body.hasAttribute('data-router-listener-attached')) {
        document.body.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.hasAttribute('data-link')) {
                e.preventDefault();
                const path = e.target.getAttribute('href');
                navigateTo(path);
            }
        });
        document.body.setAttribute('data-router-listener-attached', 'true');
    }

    handleRouteChange(window.location.pathname);
}