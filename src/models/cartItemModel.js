const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./productModel');

const cartItemModel = sequelize.define('cartItem', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: "cart_item",
    timestamps: false,
})

cartItemModel.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = cartItemModel