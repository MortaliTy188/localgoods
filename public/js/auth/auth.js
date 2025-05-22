export function isLoggedIn() {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('id');
    sessionStorage.removeItem('id');
    localStorage.removeItem("role");
    sessionStorage.removeItem("role");
    window.history.pushState(null, null, '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
}

export function getUserRole() {
    return localStorage.getItem('role') || sessionStorage.getItem('role');
}

export function getUserId() {
    return localStorage.getItem('id') || sessionStorage.getItem('id');
}

