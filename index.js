const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;

const mongoURI = `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/${dbName}?retryWrites=true&w=majority`;

// Middleware para parsing de JSON
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch(err => {
    console.error('Erro ao conectar ao MongoDB', err);
});

// Definição do modelo Pessoa
const pessoaSchema = new mongoose.Schema({
    nome: { type: String, required: true }
});

const Pessoa = mongoose.model('Pessoa', pessoaSchema);

// Rotas CRUD

// CREATE - Adicionar uma nova pessoa
app.post('/pessoas', async (req, res) => {
    try {
        const novaPessoa = new Pessoa(req.body);
        await novaPessoa.save();
        res.status(201).json(novaPessoa);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// READ - Listar todas as pessoas
app.get('/pessoas', async (req, res) => {
    try {
        const pessoas = await Pessoa.find();
        res.json(pessoas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - Obter uma pessoa pelo ID
app.get('/pessoas/:id', async (req, res) => {
    try {
        const pessoa = await Pessoa.findById(req.params.id);
        if (!pessoa) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json(pessoa);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE - Atualizar uma pessoa pelo ID
app.put('/pessoas/:id', async (req, res) => {
    try {
        const pessoaAtualizada = await Pessoa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!pessoaAtualizada) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json(pessoaAtualizada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE - Remover uma pessoa pelo ID
app.delete('/pessoas/:id', async (req, res) => {
    try {
        const pessoaRemovida = await Pessoa.findByIdAndDelete(req.params.id);
        if (!pessoaRemovida) return res.status(404).json({ error: 'Pessoa não encontrada' });
        res.json({ message: 'Pessoa removida com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
