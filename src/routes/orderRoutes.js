const express = require('express');
const { createOrder, getUserOrders } = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticateJWT');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API для управления заказами
 */

/**
 * @swagger
 * /api/v1/orders/create:
 *   post:
 *     summary: Оформить заказ
 *     tags: [Orders]
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
 *     responses:
 *       201:
 *         description: Заказ успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном создании заказа
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID заказа
 *                     user_id:
 *                       type: integer
 *                       description: ID пользователя
 *                     total_price:
 *                       type: number
 *                       format: float
 *                       description: Общая стоимость заказа
 *                     status_id:
 *                       type: integer
 *                       description: Статус заказа (1 - Новый)
 *       400:
 *         description: Корзина пуста
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке сервера
 */
router.post('/create', createOrder);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Получить все заказы текущего пользователя
 *     description: Возвращает список всех заказов, сделанных аутентифицированным пользователем, отсортированных по дате создания (сначала новые).
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: [] # Требует аутентификации
 *     responses:
 *       200:
 *         description: Успешный ответ со списком заказов пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order' # Массив объектов Order
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Токен не предоставлен или недействителен"
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ошибка сервера при получении заказов"
 */
router.get('/', authenticate([1,2,3]), getUserOrders);

module.exports = router;