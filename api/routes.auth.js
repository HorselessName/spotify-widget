const express = require('express');
const { stringify } = require("querystring");
const axios = require("axios");
const router = express.Router();
const {
    generateRandomString,
    getToken,
    definirExpireDate,
    atualizarEnvTokens
} = require('./service.utils');

// Deve estar igual o que você configurou em sua aplicação no Spotify, no Dashboard.
const redirect_uri = `http://localhost:${process.env.PORT}/auth/callback`;

// Defina os escopos que você precisa para a sua aplicação.
// Ref. https://developer.spotify.com/documentation/web-api/concepts/scopes
// O Token que vai ser gerado através deste Auth, vai poder acessar só os Scopes definidos aqui.

router.get('/generate', async (req, res) => {
    // Verifica se o Access Token já foi gerado, anteriormente.
    if (!process.env.ACCESS_TOKEN) {
        const scope = "user-read-currently-playing";
        const state = generateRandomString(16);
        const auth_query_parameters = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        });

        console.log("Gerando Auth... (GET /auth/generate)");
        res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
    } else {
        // O ACCESS_TOKEN já existe, verificar se está expirado
        const horaAtual = new Date();
        const horaTokenExpira = new Date(process.env.TOKEN_EXPIREDATE);

        if (horaAtual < horaTokenExpira) {
            // O token ainda é válido
            res.status(200).send({
                message: `Token ainda é válido. Data de expiração: ${horaTokenExpira}`,
                access_token: getToken("ACCESS_TOKEN")
            });
        } else {
            console.log("Redirect Auth Local... (GET /auth/generate para GET /token/refresh)");
            res.redirect('/token/refresh');
        }
    }
});

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
        const dataQueTokenExpira = definirExpireDate(response.data);

        // Atualizar no Environment os Tokens.
        console.log(
            "Atualizando Environment com os Tokens... (GET /auth/callback)",
            "\nAccess Token: ", response.data.access_token,
            "\nRefresh Token: ", response.data.refresh_token,
            "Token Expira em: ", dataQueTokenExpira.toISOString()
        );

        atualizarEnvTokens(
            response.data.access_token,
            response.data.refresh_token,
            dataQueTokenExpira
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
