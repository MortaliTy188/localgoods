const CartItem = require('../models/cartItemModel');
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Product = require('../models/productModel');

/**
 * Оформить заказ
 */
exports.createOrder = async (req, res) => {
    const { user_id } = req.body;

    try {
        const cartItems = await CartItem.findAll({ where: { user_id }, include: [{model: Product, as: 'product'}] });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Корзина пуста' });
        }

        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + item.quantity * item.product.price;
        }, 0);

        const newOrder = await Order.create({
            user_id,
            total_price: totalPrice,
            status_id: 1,
            created_at: new Date(),
        });

        for (const item of cartItems) {
            await OrderItem.create({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
            });
        }

        await CartItem.destroy({ where: { user_id } });

        return res.status(201).json({ message: 'Заказ успешно создан', order: newOrder });
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

/**
 * Получить все заказы пользователя
 */
exports.getUserOrders = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(400).json({ message: 'ID пользователя не предоставлен или не аутентифицирован' });
    }

    try {
        const orders = await Order.findAll({
            where: { user_id: userId },
            attributes: ['id', 'created_at', 'total_price'],
            order: [['created_at', 'DESC']],
        });

        if (!orders || orders.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Ошибка при получении заказов пользователя:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};