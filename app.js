const express = require('express');
const app = express();
const port =3000;
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const connection = require('./database/connection');
const usuarios = require('./database/usuarios');
const dispositivos = require('./database/dispositivos');
const leituras = require('./database/leituras');
const { where } = require('sequelize');
const Usuario = require('./database/usuarios');
const session = require('express-session');
const axios = require('axios');

// Configurando body-parser
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

// Configuração do middleware para sessões
app.use(session({
    secret: 'a',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configurando o ejs
app.set('view engine', 'ejs');

// Configurando arquivos staticos
app.use(express.static('public'));

// Configuração da conexão com o banco de dados
connection
    .authenticate()
    .then(()=>{
        console.log('Conexão com o banco de dados estabelecida!')
    }).catch((error)=> {
        console.log(error)
    })

// Rota principal
app.get('/', (req , res)=>{
    res.render('index');
})

// Rota home
app.get('/login', (req , res)=>{
    res.render('login');
})

// Rota dashboard
app.get('/page/dashboard', async (req, res) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }

    try {
        const deviceType = req.query.deviceType || 'all';
        let whereClause = { id_usuario: req.session.usuarioId };
        
        if (deviceType !== 'all') {
            whereClause.tipo_dispositivo = deviceType;
        }

        const devices = await dispositivos.findAll({
            where: whereClause,
        });

        let activeDevices = 0;
        const deviceMetrics = await Promise.all(
            devices.map(async (device) => {
                const readings = await leituras.findAll({
                    where: { id_dispositivo: device.id_dispositivo },
                });
        
                let energyProduced = 0;
                let energyConsumed = 0;
        
                readings.forEach((reading) => {
                    energyProduced += reading.energia_produzida;
                    energyConsumed += reading.energia_consumida;
                });
        
                const performance = energyProduced > 0
                    ? ((energyProduced - energyConsumed) / energyProduced) * 100
                    : 0;
        
                if (device.status_dispositivo === 'ativo') {
                    activeDevices++;
                }

                return {
                    device: {
                        id_dispositivo: device.id_dispositivo,
                        nome_dispositivo: device.nome_dispositivo,
                        tipo_dispositivo: device.tipo_dispositivo,
                    },
                    energy: energyProduced.toFixed(2),
                    consumed: energyConsumed.toFixed(2),
                    performance: performance.toFixed(2),
                };
            })
        );
        

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


// Rota para cadastrar um dispositivo
app.post('/cadastrar-dispositivo', (req, res) => {
    const {
        deviceName,
        deviceType,
        deviceCapacity,
        deviceState,
        deviceStatus,
    } = req.body;

    // Validação básica dos campos
    if (!deviceName || !deviceType || !deviceCapacity || !deviceState || !deviceStatus) {
        return res.status(400).send('Por favor, preencha todos os campos.');
    }

    // Verificar se o usuário está autenticado
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }

    // Inserir o dispositivo no banco de dados
    dispositivos.create({
        id_usuario: req.session.usuarioId, // Pega o ID do usuário logado na sessão
        nome_dispositivo: deviceName,
        tipo_dispositivo: deviceType,
        localizacao: deviceState,
        capacidade_maxima: parseFloat(deviceCapacity),
        status_dispositivo: deviceStatus,
    })
        .then(() => {
            res.redirect('/page/dashboard'); // Redireciona para o dashboard após o cadastro
        })
        .catch((error) => {
            console.error('Erro ao cadastrar dispositivo:', error);
            res.status(500).send('Houve um erro ao cadastrar o dispositivo.');
        });
});

// Rota para a página de cadastro de dispositivos
app.get('/cadastrar-dispositivo', (req, res) => {
    // Verifique se o usuário está logado
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }

    // Renderize a página de cadastro de dispositivos
    usuarios.findByPk(req.session.usuarioId).then(usuario => {
        if (usuario) {
            res.render('page/cadastrar-dispositivo', {
                nome: usuario.nome
            });
        } else {
            res.redirect('/login');
        }
    }).catch(error => {
        res.send("Erro ao carregar página de cadastro: " + error);
    });
});


// Rota de cadatro
app.post('/cadastro-user', (req, res) =>{
    var nome = req.body.nome
    var email = req.body.email
    var senha = req.body.senha

    var salt = bcrypt.genSaltSync(10)
    var hash = bcrypt.hashSync(senha, salt)
    usuarios.create({
        nome: nome,
        email: email,
        senha: hash
    }).then(function(){
        res.redirect('/login')
    }).catch(function(error){
        res.send("Houve algum erro no cadastro , cadastro não efetuado!" + error)
    })
})

// Rota de logar com sucesso
app.post('/logado', (req, res) => {
    var nome = req.body.nomeLogin;
    var senha = req.body.senhaLogin;

    usuarios.findOne({ where: { nome: nome } }).then(usuario => {
        if (usuario != undefined) {
            var correct = bcrypt.compareSync(senha, usuario.senha);
            if (correct) {
                // Armazenando informações do usuário na sessão
                req.session.usuarioId = usuario.id_usuario;
                req.session.nome = usuario.nome;

                // Redirecionando para o dashboard
                res.redirect('page/dashboard');
            } else {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    }).catch((error) => {
        res.send("Erro no login: " + error);
    });
});

// Rota de logout
app.get('/logout', (req, res) => {
    // Destruir a sessão do usuário
    req.session.destroy((err) => {
        if (err) {
            return res.send("Erro ao fazer logout: " + err);
        }
        // Redirecionar para a página de login após logout
        res.redirect('/');
    });
});

// Página para inserir leituras
app.get('/inserir-leitura/:id', async (req, res) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }

    try {
        const dispositivo = await dispositivos.findByPk(req.params.id);

        if (!dispositivo || dispositivo.id_usuario !== req.session.usuarioId) {
            return res.status(403).send('Dispositivo não encontrado ou não pertence ao usuário.');
        }

        const devices = await dispositivos.findAll({
            where: { id_usuario: req.session.usuarioId },
        });

        res.render('page/inserir-leitura', { 
            nome: req.session.nome,
            dispositivo,
            devices, // Adicionando devices ao contexto
        });
    } catch (error) {
        res.status(500).send("Erro ao carregar a página de leituras: " + error);
    }
});

// Processar o envio de leituras
app.post('/inserir-leitura', (req, res) => {
    const { id_dispositivo, energia_produzida, energia_consumida } = req.body;

    // Validar dados recebidos
    if (!id_dispositivo || !energia_produzida || !energia_consumida) {
        return res.status(400).send('Preencha todos os campos corretamente.');
    }

    leituras.create({
        id_dispositivo,
        energia_produzida: parseFloat(energia_produzida),
        energia_consumida: parseFloat(energia_consumida),
        data_leitura: new Date(),
    }).then(() => {
        res.redirect(`/page/dashboard`);
    }).catch(error => {
        res.status(500).send("Erro ao registrar a leitura: " + error);
    });
});

// Iniciando o servidor
app.listen(port, ()=>(
    console.log('Servidor Online!')
))