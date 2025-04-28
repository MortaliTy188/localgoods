const express = require('express');
const { createOrder } = require('../controllers/orderController');
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

module.exports = router;