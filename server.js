// Importa os pacotes principais
const express = require('express');
const connectDB = require('./db');
const User = require('./models/User');
const cors = require('cors');

const app = express();

// Conecta ao banco de dados
connectDB();

// Permite que o frontend acesse o backend
app.use(cors());

// Permite que o servidor entenda dados JSON vindos do frontend
app.use(express.json());

// Rota POST para cadastrar novos usuários
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verifica se já existe um usuário com esse email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email já está em uso.' });
        }

        // Cria um novo usuário e salva no banco
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Inicia o servidor na porta 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
});
