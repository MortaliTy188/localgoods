const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    uploadProductImage
} = require('../controllers/productController');
const authenticate = require('../middlewares/authenticateJWT');
const upload = require('../config/multer');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API для управления продуктами
 */

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Создать новый продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               seller_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', authenticate([2]), createProduct);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Получить все продукты
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список всех продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Обновить продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Продукт успешно обновлён
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:id', authenticate([2]), updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Удалить продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт успешно удалён
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:id', authenticate([2]), deleteProduct);

/**
 * @swagger
 * /api/v1/products/category/{category_id}:
 *   get:
 *     summary: Получить продукты по категории
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Список продуктов в категории
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Категория не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/category/:category_id', getProductsByCategory);

/**
 * @swagger
 * /api/v1/products/upload-image:
 *   post:
 *     summary: Загрузить изображение для продукта
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Изображение успешно загружено
 *       400:
 *         description: Ошибка загрузки
 *       500:
 *         description: Ошибка сервера
 */
router.post('/upload-image', upload.single('image'), uploadProductImage);

module.exports = router;