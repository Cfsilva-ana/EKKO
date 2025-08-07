// Importamos mongoose para criar um "Schema", ou seja, a estrutura do nosso dado
const mongoose = require('mongoose');

// Criamos um schema que define como os dados de "usuário" serão salvos
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Garante que não tenha dois com o mesmo nome
    },
    email: {
        type: String,
        required: true,
        unique: true // Garante que o email seja único
    },
    password: {
        type: String,
        required: true // Senha obrigatória
    }
}, {
    timestamps: true // Salva data de criação e atualização automaticamente
});

// Exportamos o modelo para usar em outras partes do código
module.exports = mongoose.model('User', UserSchema);
