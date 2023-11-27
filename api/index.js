// #### API para Autenticação com o Spotify ####
const express = require('express');
const fs = require('fs');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

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
const app = express();
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
