const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');
const OrderItem = require('./orderItemModel');

const Order = sequelize.define('order', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'user', key: 'id' }
    },
    total_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'order',
    timestamps: false,
});

Order.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'orderItems'
});

module.exports = Order;