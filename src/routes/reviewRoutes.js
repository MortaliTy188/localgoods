const express = require('express');
const { addReview, getReviewsByProduct, deleteReview } = require('../controllers/reviewController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API для управления отзывами о продуктах
 */

/**
 * @swagger
 * /api/v1/reviews/add:
 *   post:
 *     summary: Добавить отзыв на продукт
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID пользователя, который оставляет отзыв
 *               product_id:
 *                 type: integer
 *                 description: ID продукта, к которому относится отзыв
 *               rating:
 *                 type: number
 *                 description: Рейтинг продукта (1-5)
 *               comment:
 *                 type: string
 *                 description: Текст отзыва
 *     responses:
 *       201:
 *         description: Отзыв успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном добавлении
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/add', addReview);

/**
 * @swagger
 * /api/v1/reviews/{product_id}:
 *   get:
 *     summary: Получить все отзывы о продукте
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Список отзывов о продукте
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:product_id', getReviewsByProduct);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Удалить отзыв
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID отзыва
 *     responses:
 *       200:
 *         description: Отзыв успешно удалён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном удалении
 *       404:
 *         description: Отзыв не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:id', deleteReview);

module.exports = router;