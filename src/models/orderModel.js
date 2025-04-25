const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('order', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id',
        }
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
    }
}, {
    tableName: 'order',
})

module.exports = Order;