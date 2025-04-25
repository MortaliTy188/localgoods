const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
} = require('../controllers/productController');
const authenticate = require('../middlewares/authenticateJWT'); // Middleware для проверки авторизации

const router = express.Router();

// CRUD операции с продуктами
router.post('/', authenticate([2]), createProduct); // Только для пользователей с ролью 2 (например, продавцов)
router.get('/', getAllProducts); // Доступно всем пользователям
router.get('/:id', getProductById); // Доступно всем пользователям
router.put('/:id', authenticate([2]), updateProduct); // Только для пользователей с ролью 2
router.delete('/:id', authenticate([2]), deleteProduct); // Только для пользователей с ролью 2

// Новый маршрут для получения продуктов по категории
router.get('/category/:category', getProductsByCategory); // Доступно всем пользователям

module.exports = router;