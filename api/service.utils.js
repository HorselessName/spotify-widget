const fs = require('fs');
const path = require('path');

function atualizarEnvTokens(accessToken, refreshToken, tokenExpireDate) {
    console.log("New Token Expire Date: " + tokenExpireDate.toISOString());
    const envPath = path.resolve(__dirname, '.env');
    let envContents = fs.readFileSync(envPath, 'utf-8');

    // Atualizar ou adicionar ACCESS_TOKEN e REFRESH_TOKEN
    envContents = atualizarEnvLinha(envContents, 'ACCESS_TOKEN', accessToken);
    envContents = atualizarEnvLinha(envContents, 'REFRESH_TOKEN', refreshToken);
    envContents = atualizarEnvLinha(envContents, 'TOKEN_EXPIREDATE', tokenExpireDate.toISOString());

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

// Função para gerar uma string aleatória para o state
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Calcula e define a data de expiração do token.
 *
 * Este método cria um objeto Date e imediatamente utiliza um de seus métodos estáticos para definir a data de expiração do token.
 *
 * Analogia com outros contextos de programação:
 * - Exemplo em Python: 'Pessoa.getNome()'.
 * - Exemplo em JavaScript: 'new Pessoa(Pessoa.getNome())'.
 *
 * @param {Object} token - Objeto contendo informações do token, incluindo a duração de validade.
 * @returns {Date} A data de expiração do token.
 *
 * Referências:
 * 1. [Spotify Web API Tutorial](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
 * 2. [StackOverflow: JavaScript Date.now()](https://stackoverflow.com/a/7687926/8297745)
 */
function definirExpireDate(token) {
    // Cria uma data no horário UTC
    const dataUTC = new Date(Date.now() + token.expires_in * 1000);

    // Converte para o fuso horário local (UTC-3 para Curitiba)
    const offsetEmHoras = 3; // Curitiba está 3 horas atrás do UTC
    dataUTC.setHours(dataUTC.getHours() - offsetEmHoras);

    return dataUTC;
}

function getToken(tipo){
    // Retorna o Valor do Token da Variável no .env
    return process.env[tipo]
}

// Exportar as Funcoes da Service
module.exports = {
    atualizarEnvTokens,
    generateRandomString,
    definirExpireDate,
    getToken
};
