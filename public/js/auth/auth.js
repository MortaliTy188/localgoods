export function isLoggedIn() {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.history.pushState(null, null, '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
}