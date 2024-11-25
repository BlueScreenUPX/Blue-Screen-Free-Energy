const sequelize = require('sequelize')
const connection = new sequelize('freeenergy', 'root' , 'krnxfx', {
    host:'localhost',
    dialect: 'mysql'
})

module.exports = connection