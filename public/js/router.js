// router.js
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderCatalog } from './components/catalog.js';
import {renderGeneral} from "./components/general.js";
import {renderUserProfile} from "./components/userProfile.js";
import {renderCart} from "./components/cart.js";

const routes = { // Выносим routes, чтобы navigateTo имела к ним доступ
    '/': renderLogin,
    '/register': renderRegister,
    '/catalog': renderCatalog,
    '/general': renderGeneral,
    '/profile': renderUserProfile,
    '/cart': renderCart,
};

// Функция для программной навигации, которую можно импортировать
export function navigateTo(path) {
    window.history.pushState(null, null, path);
    // Вызываем тот же механизм, что и при popstate
    // чтобы Router отреагировал и вызвал нужный render-метод
    const routeHandler = routes[path] || routes['/']; // Используем routes['/'] как фоллбэк
    routeHandler();
    // Альтернативно, если вы хотите строго следовать вашему текущему паттерну
    // и если navigate() внутри Router() всегда доступна (что сейчас не так):
    // window.dispatchEvent(new PopStateEvent('popstate'));
}

// Основная функция инициализации роутера
export function Router() {
    // Внутренняя функция для обработки маршрута
    function handleRouteChange(currentPath) {
        const routeHandler = routes[currentPath] || routes['/'];
        routeHandler();
    }

    // Слушатель для навигации по истории браузера (кнопки "вперед/назад")
    window.addEventListener('popstate', () => handleRouteChange(window.location.pathname));

    // Слушатель для кликов по ссылкам data-link
    // Важно: этот слушатель нужно добавлять только один раз
    if (!document.body.hasAttribute('data-router-listener-attached')) {
        document.body.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.hasAttribute('data-link')) {
                e.preventDefault();
                const path = e.target.getAttribute('href');
                // Вместо прямого вызова handleRouteChange, используем navigateTo,
                // чтобы было единообразие и pushState происходил там.
                navigateTo(path);
            }
        });
        document.body.setAttribute('data-router-listener-attached', 'true');
    }

    // Обработка начального маршрута при загрузке страницы
    handleRouteChange(window.location.pathname);
}