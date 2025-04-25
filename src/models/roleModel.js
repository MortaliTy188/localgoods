const {DataTypes} = require('sequelize')
const sequelize = require("../config/db")

const Role = sequelize.define("role", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'roles'
})

module.exports = Role