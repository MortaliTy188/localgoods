import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderCatalog } from './components/catalog.js';
import { renderGeneral } from "./components/general.js";
import { renderUserProfile } from "./components/userProfile.js";
import { renderCart } from "./components/cart.js";
import { renderAddProductPage } from "./components/addProduct.js";
import { renderAdminUserList } from "./components/userManagement.js";
import { renderAdminCategoryList } from "./components/categoryManagement.js";
import { renderMyProductsPage } from "./components/sellerProducts.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$");

const routes = [
    { path: "/", view: renderLogin },
    { path: "/register", view: renderRegister },
    { path: "/catalog", view: renderCatalog },
    { path: "/general", view: renderGeneral },
    { path: "/profile", view: renderUserProfile },
    { path: "/cart", view: renderCart },
    { path: "/add-product", view: renderAddProductPage },
    { path: "/admin/users", view: renderAdminUserList },
    { path: "/admin/categories", view: renderAdminCategoryList },
    { path: "/seller/:seller_id/products", view: renderMyProductsPage },
];

export function navigateTo(path) {
    window.history.pushState(null, null, path);
    router();
}


const getParams = match => {
    if (!match.result) return {};
    const values = match.result.slice(1); // Первый элемент - это весь совпавший путь
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

export function router() {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: window.location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [window.location.pathname]
        };
    }

    const params = getParams(match);
    match.route.view(params);
}


export function initializeRouter() {
    window.addEventListener("popstate", router);

    if (!document.body.hasAttribute('data-router-listener-attached')) {
        document.body.addEventListener("click", e => {
            const anchor = e.target.closest('a[data-link]');
            if (anchor) {
                e.preventDefault();
                navigateTo(anchor.pathname);
            }
        });
        document.body.setAttribute('data-router-listener-attached', 'true');
    }
    router();
}
