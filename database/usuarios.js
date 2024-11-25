const { Sequelize, DataTypes } = require('sequelize');
const connection = require('./connection');

// Modelo de Usuário
const Usuario = connection.define('usuarios', {
    id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
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
    timestamps: false, // Evita a criação automática de `createdAt` e `updatedAt`
});

Usuario.sync({ force: false }).then(() => {
    console.log('Tabela de usuario sincronizada com sucesso!');
});

module.exports = Usuario