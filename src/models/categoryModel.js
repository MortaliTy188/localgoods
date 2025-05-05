const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const Category = sequelize.define('category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'category',
    timestamps: false
})

module.exports = Category