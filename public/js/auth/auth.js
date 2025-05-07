export function isLoggedIn() {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('id');
    sessionStorage.removeItem('id');
    window.history.pushState(null, null, '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
}