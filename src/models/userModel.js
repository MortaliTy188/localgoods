const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const User = sequelize.define('user', {
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'role',
            key: 'id',
        },
        defaultValue: 1
    }
}, {
    tableName: 'users',
    timestamps: false
})

module.exports = User