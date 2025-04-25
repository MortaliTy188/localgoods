const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const orderItemModel = sequelize.define('orderItem', {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'order',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'product',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})

module.exports = orderItemModel;