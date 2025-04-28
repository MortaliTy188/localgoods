const API_BASE_URL = 'http://localhost:3000/api/v1/users';

//REGISTER
export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка регистрации');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        throw error;
    }
}

// LOGIN
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка авторизации');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        throw error;
    }
}