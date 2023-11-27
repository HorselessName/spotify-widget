const express = require('express');
const axios = require("axios");
const router = express.Router();

const {
    atualizarEnvTokens,
    definirExpireDate
} = require('./service.utils')

// Rota para Obter o access_token.
router.get('/get', (req, res) => {
    // Lê o access_token do arquivo .env
    const accessToken = process.env.ACCESS_TOKEN;
    const expiresIn = process.env.TOKEN_EXPIREDATE;

    if (!accessToken) {
        // Se não encontrar o access_token, retorna status 404 com mensagem
        res.status(404).send({ message: 'Access token not found.' });
    } else {
        // Se encontrar, retorna o access_token em um objeto JSON
        res.status(200).send({
            access_token: accessToken,
            expires_in: expiresIn,
        });
    }
});

router.get('/refresh', async (req, res) => {
    // Define a URL para solicitar um novo token
    const url = 'https://accounts.spotify.com/api/token';

    // Monta o payload para a requisição POST
    const payload = {
        method: 'post',
        url: url,

        // Headers para o POST do Token.
        headers: {
            Accept: 'application/json',
            'Authorization': 'Basic ' + (Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        // Ref. https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
        data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: process.env.REFRESH_TOKEN
        })
    };

    try {
        // Realiza a requisição para o endpoint do Spotify
        const response = await axios(payload);

        // Atualiza os tokens no arquivo .env
        atualizarEnvTokens(
            response.data.access_token,
            process.env.REFRESH_TOKEN, // Preserva o refresh token atual
            definirExpireDate(response.data) // Calcula a nova data de expiração
        );

        // Responde com o novo access token e a data de expiração
        res.status(200).send({
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            refresh_token: process.env.REFRESH_TOKEN
        });
    } catch (error) {
        res.status(500).send('Erro ao atualizar o token do Spotify: ' + error.message);
    }
});

module.exports = router;
