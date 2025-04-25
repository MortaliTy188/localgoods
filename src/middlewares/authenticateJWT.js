const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware для проверки авторизации пользователя и роли
 */
const authenticate = (allowedRoles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Доступ запрещен. Токен отсутствует.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = decoded;

            // Проверяем role_id
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role_id)) {
                return res.status(403).json({ message: 'Доступ запрещен. Недостаточно прав.' });
            }

            next();
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            return res.status(401).json({ message: 'Доступ запрещен. Неверный токен.' });
        }
    };
};

module.exports = authenticate;