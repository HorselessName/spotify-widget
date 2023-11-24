const express = require('express');
const { stringify } = require("querystring");
const axios = require("axios");
const router = express.Router();
const fs = require('fs');
const path = require('path');

function atualizarEnvTokens(accessToken, refreshToken) {
    const envPath = path.resolve(__dirname, '.env');
    let envContents = fs.readFileSync(envPath, 'utf-8');

    // Atualizar ou adicionar ACCESS_TOKEN e REFRESH_TOKEN
    envContents = atualizarEnvLinha(envContents, 'ACCESS_TOKEN', accessToken);
    envContents = atualizarEnvLinha(envContents, 'REFRESH_TOKEN', refreshToken);

    // Reescrever o arquivo .env com as alterações
    fs.writeFileSync(envPath, envContents);
}

function atualizarEnvLinha(envContents, chave, valor) {
    const linhas = envContents.split('\n');
    let linhaEncontrada = false;

    const linhasAtualizadas = linhas.map(linha => {
        if (linha.startsWith(chave + '=')) {
            linhaEncontrada = true;
            return `${chave}=${valor}`;
        }
        return linha;
    });

    // Adicionar a chave se não foi encontrada
    if (!linhaEncontrada) {
        linhasAtualizadas.push(`${chave}=${valor}`);
    }

    return linhasAtualizadas.join('\n');
}

// Deve estar igual o que você configurou em sua aplicação no Spotify, no Dashboard.
const redirect_uri = `http://localhost:${process.env.PORT}/auth/callback`;

// Defina os escopos que você precisa para a sua aplicação.
// Ref. https://developer.spotify.com/documentation/web-api/concepts/scopes
// O Token que vai ser gerado através deste Auth, vai poder acessar só os Scopes definidos aqui.

router.get('/generate', async (req, res) => {
    const scope = "user-read-currently-playing";
    const state = generateRandomString(16);
    const auth_query_parameters = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    });

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

// Função para gerar uma string aleatória para o state
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

router.get('/callback', async (req, res) => {
    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow
    // Parametros application/x-www-form-urlencoded para o POST do Token.
    // Gerados do `Response` do "Request User Authorization".

    // Parametros para o POST do Token.
    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',

        // Data: Dados para o Axios, precisa usar o nome `data`.
        data: stringify({
            code: req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: redirect_uri
        }),

        // Headers para o POST do Token.
        headers: {
            Accept: 'application/json',
            'Authorization': 'Basic ' + (Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        const response = await axios(authOptions);

        // Atualizar no Environment os Tokens.
        atualizarEnvTokens(
            response.data.access_token,
            response.data.refresh_token
        );

        res.send({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            scope: response.data.scope,
            expires_in: response.data.expires_in
        });
    } catch (error) {

        const errorResponse = {
            message: error.message,
            response: error.response ? {
                data: error.response.data,
                status: error.response.status,
            } : null,
            config: error.config ? {
                url: error.config.url,
                method: error.config.method,
                headers: error.config.headers
            } : null
        };

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(errorResponse, null, 4));
    }
});

module.exports = router;
