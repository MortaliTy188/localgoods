const express = require('express');
const { addToCart, getCartItems, removeFromCart } = require('../controllers/cartController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API для управления корзиной
 */

/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     summary: Добавить товар в корзину
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID пользователя
 *               product_id:
 *                 type: integer
 *                 description: ID продукта
 *               quantity:
 *                 type: integer
 *                 description: Количество продукта
 *     responses:
 *       200:
 *         description: Товар добавлен в корзину
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение успеха
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/add', addToCart);

/**
 * @swagger
 * /api/v1/cart/{user_id}:
 *   get:
 *     summary: Получить содержимое корзины пользователя
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Содержимое корзины
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID элемента в корзине
 *                   user_id:
 *                     type: integer
 *                     description: ID пользователя
 *                   product_id:
 *                     type: integer
 *                     description: ID продукта
 *                   quantity:
 *                     type: integer
 *                     description: Количество продукта
 *                   product:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Название продукта
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Цена продукта
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:user_id', getCartItems);

/**
 * @swagger
 * /api/v1/cart/remove:
 *   delete:
 *     summary: Удалить товар из корзины
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID пользователя
 *               product_id:
 *                 type: integer
 *                 description: ID продукта
 *     responses:
 *       200:
 *         description: Товар удален из корзины
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение успеха
 *       404:
 *         description: Товар не найден в корзине
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/remove', removeFromCart);

module.exports = router;