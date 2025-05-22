const CartItem = require('../models/cartItemModel');
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Product = require('../models/productModel');
const sequelize = require('../config/db');

/**
 * Оформить заказ
 */
exports.createOrder = async (req, res) => {
    const { user_id } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const cartItems = await CartItem.findAll({
            where: { user_id },
            include: [{ model: Product, as: 'product' }],
            transaction
        });

        if (cartItems.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Корзина пуста' });
        }

        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Недостаточно товара "${item.product.title}" на складе. В наличии: ${item.product.stock}, запрашиваемое количество: ${item.quantity}`
                });
            }
        }

        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + item.quantity * item.product.price;
        }, 0);

        const newOrder = await Order.create({
            user_id,
            total_price: totalPrice,
            status_id: 1,
            created_at: new Date(),
        }, { transaction });

        for (const item of cartItems) {
            await OrderItem.create({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
            }, { transaction });


            const productToUpdate = await Product.findByPk(item.product_id, { transaction });


            item.product.stock -= item.quantity;
            await item.product.save({ transaction });
        }

        await CartItem.destroy({ where: { user_id }, transaction });

        await transaction.commit();
        return res.status(201).json({ message: 'Заказ успешно создан', order: newOrder });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Ошибка при оформлении заказа:', error);
        return res.status(500).json({ message: 'Ошибка сервера при оформлении заказа' });
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
            attributes: ['id', 'created_at', 'total_price', 'status_id'],
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    attributes: ['quantity', 'product_id'],
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['title', 'price', 'image']
                        }
                    ]
                }
            ],
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