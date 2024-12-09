const express = require('express');
const app = express();
const port = 3000;
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const connection = require('./database/connection');
const usuarios = require('./database/usuarios');
const dispositivos = require('./database/dispositivos');
const leituras = require('./database/leituras');
const session = require('express-session');
const axios = require('axios');

// Configuração do body-parser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


// Configuração do middleware para sessões
app.use(session({
    secret: 'a', // Substituir por uma string mais segura em produção
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Usar `true` se HTTPS estiver configurado
}));

// Configuração do EJS para renderização de páginas
app.set('view engine', 'ejs');

// Configuração de arquivos estáticos
app.use(express.static('public'));

// Conexão com o banco de dados
connection
    .authenticate()
    .then(() => console.log('Conexão com o banco de dados estabelecida!'))
    .catch(error => console.error(error));

// Rota principal
app.get('/', (req, res) => res.render('index'));

// Página de login
app.get('/login', (req, res) => res.render('login'));

// Dashboard
app.get('/page/dashboard', async (req, res) => {
    if (!req.session.usuarioId) return res.redirect('/login');

    try {
        const deviceType = req.query.deviceType || 'all';
        const whereClause = { id_usuario: req.session.usuarioId };
        if (deviceType !== 'all') whereClause.tipo_dispositivo = deviceType;

        const devices = await dispositivos.findAll({ where: whereClause });

        let activeDevices = 0;
        const deviceMetrics = await Promise.all(devices.map(async (device) => {
            const readings = await leituras.findAll({ 
                where: { id_dispositivo: device.id_dispositivo },
                order: [['timestamp', 'ASC']]
            });
            let energyProduced = 0, energyConsumed = 0;

            readings.forEach(reading => {
                energyProduced += reading.energia_produzida;
                energyConsumed += reading.energia_consumida;
            });

            const performance = energyProduced > 0 
                ? ((energyProduced - energyConsumed) / energyProduced) * 100 
                : 0;

            if (device.status_dispositivo === 'ativo') activeDevices++;

            return {
                device: {
                    id_dispositivo: device.id_dispositivo,
                    nome_dispositivo: device.nome_dispositivo,
                    tipo_dispositivo: device.tipo_dispositivo,
                },
                energy: energyProduced.toFixed(2),
                consumed: energyConsumed.toFixed(2),
                performance: performance.toFixed(2),
                readings: readings.map(r => ({
                    timestamp: r.timestamp,
                    energia_produzida: r.energia_produzida,
                    energia_consumida: r.energia_consumida
                }))
            };
        }));

        res.render('page/dashboard', {
            nome: req.session.nome,
            devices: deviceMetrics,
            deviceType,
            activeDevices,
        });
    } catch (error) {
        console.error('Erro ao carregar o dashboard:', error);
        res.status(500).send('Erro ao carregar o dashboard.');
    }
});

// Cadastro de dispositivos
app.post('/cadastrar-dispositivo', (req, res) => {
    const { deviceName, deviceType, deviceCapacity, deviceState, deviceStatus } = req.body;
    if (!deviceName || !deviceType || !deviceCapacity || !deviceState || !deviceStatus) {
        return res.status(400).send('Preencha todos os campos.');
    }

    if (!req.session.usuarioId) return res.redirect('/login');

    dispositivos.create({
        id_usuario: req.session.usuarioId,
        nome_dispositivo: deviceName,
        tipo_dispositivo: deviceType,
        localizacao: deviceState,
        capacidade_maxima: parseFloat(deviceCapacity),
        status_dispositivo: deviceStatus,
    })
        .then(() => res.redirect('/page/dashboard'))
        .catch(error => {
            console.error('Erro ao cadastrar dispositivo:', error);
            res.status(500).send('Erro ao cadastrar dispositivo.');
        });
});

// Página de cadastro de dispositivos
app.get('/cadastrar-dispositivo', (req, res) => {
    if (!req.session.usuarioId) return res.redirect('/login');

    usuarios.findByPk(req.session.usuarioId)
        .then(usuario => {
            if (usuario) {
                res.render('page/cadastrar-dispositivo', { nome: usuario.nome });
            } else {
                res.redirect('/login');
            }
        })
        .catch(error => res.send("Erro ao carregar página: " + error));
});


// Cadastro de usuário
app.post('/cadastro-user', (req, res) => {
    const { nome, email, senha } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);

    usuarios.create({ nome, email, senha: hash })
        .then(() => res.redirect('/login'))
        .catch(error => res.send("Erro no cadastro: " + error));
});

// Login
app.post('/logado', (req, res) => {
    const { nomeLogin, senhaLogin } = req.body;

    usuarios.findOne({ where: { nome: nomeLogin } })
        .then(usuario => {
            if (usuario && bcrypt.compareSync(senhaLogin, usuario.senha)) {
                req.session.usuarioId = usuario.id_usuario;
                req.session.nome = usuario.nome;
                res.redirect('/page/dashboard');
            } else {
                res.redirect('/login');
            }
        })
        .catch(error => res.send("Erro no login: " + error));
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Erro ao fazer logout: " + err);
        res.redirect('/');
    });
});

// Inserção de leituras
app.get('/inserir-leitura/:id', async (req, res) => {
    if (!req.session.usuarioId) return res.redirect('/login');

    try {
        const dispositivo = await dispositivos.findByPk(req.params.id);
        if (!dispositivo || dispositivo.id_usuario !== req.session.usuarioId) {
            return res.status(403).send('Dispositivo não autorizado.');
        }

        res.render('page/inserir-leitura', { 
            nome: req.session.nome,
            dispositivo,
        });
    } catch (error) {
        res.status(500).send("Erro ao carregar página: " + error);
    }
});

app.post('/inserir-leitura', (req, res) => {
    const { id_dispositivo, energia_produzida, energia_consumida } = req.body;
    if (!id_dispositivo || !energia_produzida || !energia_consumida) {
        return res.status(400).send('Preencha todos os campos.');
    }

    leituras.create({
        id_dispositivo,
        energia_produzida: parseFloat(energia_produzida),
        energia_consumida: parseFloat(energia_consumida),
        data_leitura: new Date(),
    })
        .then(() => res.redirect('/page/dashboard'))
        .catch(error => res.status(500).send("Erro ao registrar leitura: " + error));
});

// Iniciando o servidor
app.listen(port, () => console.log('Servidor Online!'));
