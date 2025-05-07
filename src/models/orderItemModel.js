const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('orderItem', {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'order', key: 'id' }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'product', key: 'id' }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "order_item",
    timestamps: false,
});

module.exports = OrderItem;