const express = require('express');
const router = express.Router();
const {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const authenticate = require('../middlewares/authenticateJWT');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API для управления категориями товаров
 */

/**
 * @swagger
 * /api/v1/category/all:
 *   get:
 *     summary: Получить список всех категорий
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/all', getCategories);

/**
 * @swagger
 * /api/v1/category/add:
 *   post:
 *     summary: Добавить новую категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Категория успешно добавлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.post('/add', authenticate([3]), addCategory);

/**
 * @swagger
 * /api/v1/category/update/{id}:
 *   put:
 *     summary: Обновить категорию по ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID категории
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Категория успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Категория не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put('/update/:id', authenticate([3]), updateCategory);

/**
 * @swagger
 * /api/v1/category/delete/{id}:
 *   delete:
 *     summary: Удалить категорию по ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Категория успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном удалении
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Категория не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/delete/:id', authenticate([3]), deleteCategory);

module.exports = router;
