// Importamos o mongoose, que vai ajudar a conectar ao MongoDB
const mongoose = require('mongoose');

// Aqui vai a URL do banco de dados. No exemplo, está local, mas pode ser do MongoDB Atlas também.
const mongoURI = 'mongodb://localhost:27017/ekko';

// Essa função assíncrona conecta ao Mongo
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado ao MongoDB');
    } catch (err) {
        console.error(' Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); // Encerra o app se não conseguir conectar
    }
};

// Exportamos a função para usá-la no server.js
module.exports = connectDB;
