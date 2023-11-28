// #### API para Autenticação com o Spotify ####
const express = require('express');
const fs = require('fs');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

// TODO: Achar outra forma mais otimizada de sincronizar o .env com o process.env.

// Função para recarregar o arquivo .env
function reloadEnv() {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// Monitora mudanças no arquivo .env e recarrega as variáveis de ambiente
fs.watch('.env', (eventType, filename) => {
    if (filename && eventType === 'change') {
        console.log('Arquivo .env modificado. Recarregando variáveis de ambiente...');
        reloadEnv();
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Verifica se o arquivo .env existe
if (!fs.existsSync('.env')) {
    console.log('Primeira execução do app. Executando Configuração Inicial...');

    rl.question('Insira a Porta do Server: ', (port) => {
        rl.question('Insira o Client ID do Spotify: ', (spotifyClientId) => {
            rl.question('Insira o Client Secret do Spotify: ', (spotifyClientSecret) => {
                // Cria ou sobrescreve o arquivo .env
                fs.writeFileSync('.env', `PORT=${port}\nSPOTIFY_CLIENT_ID=${spotifyClientId}\n`);
                console.log('Arquivo .env criado com sucesso.');

                // Carrega as variáveis de ambiente
                process.env.PORT = port;
                process.env.SPOTIFY_CLIENT_ID = spotifyClientId;
                process.env.SPOTIFY_CLIENT_SECRET = spotifyClientSecret;

                rl.close();
            });
        });
    });

    // Verificar se o valor do TOKEN_EXPIREDATE existe no arquivo .env, se não, crio a variavel de ambiente.
    if (!process.env.TOKEN_EXPIREDATE) {
        process.env.TOKEN_EXPIREDATE = new Date().toISOString();
    }
}

// #### Configuração do Servidor (Depois das Configurações do .env estarem criadas.) ####
const authRoutes = require('./routes.auth');
const tokenRoutes = require('./routes.token');

const cors = require('cors');
const app = express();

// Correção do CORs: Access-Control-Allow-Origin dando erro com `Origin: Null`.
app.use((req, res, next) => {
    // Esse Middleware é executado DEPOIS do Cors (Mesmo estando antes dele no código).
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Headers', 'Allowed-URI');
    next();
});

const corsOptionsDelegate = function (req, callback) {
    // Fluxo: 1. Recebe o PreFlight (Front-End) -> 2. Faz o OPTIONS -> 3. Retorna para o Front-End.
    let corsOptions;

    console.log("\n#### Verificação do CORS ####\nHeaders: ", req.headers);

    corsOptions = {
        origin: '*',
        methods: 'GET',
        allowedHeaders: ['Content-Type', 'Authorization', 'Allowed-URI'],
        credentials: true
    };

    // Verifica se a origem é null
    if (req.headers.origin === 'null') {
        // Verifica se Allowed-URI está presente e é localhost
        if (req.headers['allowed-uri'] === 'http://localhost/') {
            corsOptions.origin = '*'; // Permite a solicitação
        } else {
            corsOptions.origin = false; // Bloqueia a solicitação
        }
    }

    callback(null, corsOptions); // Retorna as opções do CORS
};

app.use(cors(corsOptionsDelegate));

// Middleware pra debug dos requests (Erro Cors)
app.use(
    (req, res, next) => {
        console.log(`Request: ${req.method} ${req.url}
        \nOrigin: ${req.get('origin')} - Allowed URI: ${req.get('Allowed-URI')}`);
        next();  // Avançar p/ próxima rota ou MiddleWare.
    }
)

app.use('/auth', authRoutes)
app.use('/token', tokenRoutes)

// Imprimir as rotas. Ref. https://stackoverflow.com/a/28199817/8297745
function printRoutes(stack, parentPath = '') {
    stack.forEach(middleware => {
        if (middleware.route) { // Caso seja uma rota
            const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase()).join(', ');
            console.log(`${methods} ${parentPath + middleware.route.path}`);
        } else if (middleware.name === 'router') {
            // Caso seja um sub-roteador (Ex: /auth)
            printRoutes(
                middleware.handle.stack,
                `${parentPath}${middleware.regexp.source.replace(
                    // Remover caracteres especiais da rota com regex. Ref. https://regex101.com/library/AVjwQi
                    /(\^)|(\\)(!?.+[a-zA-Z])(\\.*)/g, '$3'
                )}`);
        }
    });
}

app.get('/', (req, res) => {
    res.redirect('https://github.com/HorselessName');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`);
    printRoutes(app._router.stack);
});
