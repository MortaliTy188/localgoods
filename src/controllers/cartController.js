const CartItem = require('../models/cartItemModel');
const Product = require('../models/productModel');

/**
 * Добавить товар в корзину
 */
exports.addToCart = async (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    try {
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        const existingCartItem = await CartItem.findOne({ where: { user_id, product_id } });

        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
        } else {
            await CartItem.create({ user_id, product_id, quantity });
        }

        return res.status(200).json({ message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить содержимое корзины пользователя
 */
exports.getCartItems = async (req, res) => {
    const user_id = req.params.user_id;

    try {
        const cartItems = await CartItem.findAll({
            where: { user_id },
            include: [{ model: Product, as: 'product' }],
        });

        return res.status(200).json(cartItems);
    } catch (error) {
        console.error('Ошибка при получении корзины:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Удалить товар из корзины
 */
exports.removeFromCart = async (req, res) => {
    const { user_id, product_id } = req.body;

    try {
        const cartItem = await CartItem.findOne({ where: { user_id, product_id } });

        if (!cartItem) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        await cartItem.destroy();
        return res.status(200).json({ message: 'Товар удален из корзины' });
    } catch (error) {
        console.error('Ошибка при удалении из корзины:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};