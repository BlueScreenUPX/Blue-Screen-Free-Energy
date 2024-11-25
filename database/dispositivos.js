const { Sequelize, DataTypes } = require('sequelize');
const connection = require('./connection');
const Usuario = require('./usuarios');

// Modelo de Dispositivo
const Dispositivo = connection.define('dispositivos', {
    id_dispositivo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id_usuario',
        },
    },
    nome_dispositivo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipo_dispositivo: {
        type: DataTypes.ENUM('solar', 'eolica'),
        allowNull: false,
    },
    localizacao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    capacidade_maxima: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    status_dispositivo: {
        type: DataTypes.ENUM('ativo', 'inativo', 'manutencao'),
        defaultValue: 'ativo',
    },
    criado_quando: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
    atualizado_quando: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
    },
}, {
    timestamps: false,
});

Dispositivo.sync({ force: false }).then(() => {
    console.log('Tabela de dispositivos sincronizada com sucesso!');
});

module.exports = Dispositivo