const API_BASE_URL = 'http://localhost:3000/api/v1';

// Universal fetch function
async function fetchAPI(endpoint, method = 'GET', body = null) {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token'); // 1. Получаем токен

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Ошибка авторизации, токен недействителен или отсутствует.');
            }
            const error = await response.json().catch(() => ({ message: response.statusText || 'Ошибка сервера (не JSON ответ)' }));
            throw new Error(error.message || 'Ошибка сервера');
        }

        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Ошибка при запросе к ${endpoint}:`, error);
        throw error;
    }
}

// Users
export async function registerUser(userData) {
    return fetchAPI('/users/register', 'POST', userData);
}

export async function loginUser(credentials) {
    return fetchAPI('/users/login', 'POST', credentials);
}

export async function getAllUsers() {
    return fetchAPI('/users/all');
}

export async function getUserById(id) {
    return fetchAPI(`/users/${id}`);
}

export async function updateUser(id, userData) {
    return fetchAPI(`/users/${id}`, 'PUT', userData);
}

export async function deleteUser(id) {
    return fetchAPI(`/users/${id}`, 'DELETE');
}

// Products
export async function createProduct(productData) {
    return fetchAPI('/products', 'POST', productData);
}

export async function getAllProducts() {
    return fetchAPI('/products');
}

export async function getProductById(id) {
    return fetchAPI(`/products/${id}`);
}

export async function updateProduct(id, productData) {
    return fetchAPI(`/products/${id}`, 'PUT', productData);
}

export async function deleteProduct(id) {
    return fetchAPI(`/products/${id}`, 'DELETE');
}

export async function getProductsByCategory(category_id) {
    return fetchAPI(`/products/category/${category_id}`);
}

export async function uploadProductImage(formData) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Server returned an error (not JSON)' }));
            throw new Error(errorData.message || `Image upload failed with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
}

// Cart
export async function addToCart(cartData) {
    return fetchAPI('/cart/add', 'POST', cartData);
}

export async function getCartItems(user_id) {
    return fetchAPI(`/cart/${user_id}`);
}

export async function removeFromCart(cartData) {
    return fetchAPI('/cart/remove', 'DELETE', cartData);
}

// Orders
export async function createOrder(orderData) {
    return fetchAPI('/orders/create', 'POST', orderData);
}

export async function getUserOrders() {
    return fetchAPI('/orders');
}

// Reviews
export async function addReview(reviewData) {
    return fetchAPI('/reviews/add', 'POST', reviewData);
}

export async function getReviewsByProduct(product_id) {
    return fetchAPI(`/reviews/${product_id}`);
}

export async function deleteReview(id) {
    return fetchAPI(`/reviews/${id}`, 'DELETE');
}

// Categories
export async function getAllCategories() {
    return fetchAPI('/category/all');
}

export async function addCategory(categoryData) {
    return fetchAPI('/category/add', 'POST', categoryData);
}

export async function updateCategory(id, categoryData) {
    return fetchAPI(`/category/update/${id}`, 'PUT', categoryData);
}

export async function deleteCategory(id) {
    return fetchAPI(`/category/delete/${id}`, 'DELETE');
}
