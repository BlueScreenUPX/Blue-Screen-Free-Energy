const { Sequelize, DataTypes } = require('sequelize');
const connection = require('./connection');
const Dispositivo = require('./dispositivos');

// Modelo de Leituras
const Leituras = connection.define('leituras', {
    id_leitura: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_dispositivo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Dispositivo,
            key: 'id_dispositivo',
        },
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
    energia_consumida: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    energia_produzida: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
}, {
    timestamps: false,
});

Leituras.sync({ force: false }).then(() => {
    console.log('Tabela de leituras sincronizada com sucesso!');
});

module.exports = Leituras