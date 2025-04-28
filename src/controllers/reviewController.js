const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

/**
 * Добавить отзыв на продукт
 */
exports.addReview = async (req, res) => {
    const { user_id, product_id, rating, comment } = req.body;

    try {
        // Проверяем, существует ли продукт
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        // Создаем отзыв
        const review = await Review.create({
            user_id,
            product_id,
            rating,
            comment
        });

        return res.status(201).json({ message: 'Отзыв успешно добавлен', review });
    } catch (error) {
        console.error('Ошибка при добавлении отзыва:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить отзывы о продукте
 */
exports.getReviewsByProduct = async (req, res) => {
    const { product_id } = req.params;

    try {
        const reviews = await Review.findAll({
            where: { product_id },
        });

        return res.status(200).json(reviews);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Удалить отзыв
 */
exports.deleteReview = async (req, res) => {
    const { id } = req.params;

    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден' });
        }

        await review.destroy();
        return res.status(200).json({ message: 'Отзыв успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};