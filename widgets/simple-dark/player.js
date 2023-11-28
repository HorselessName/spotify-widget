// JavaScript para trazer as informações da música tocando.
class Artista {
    constructor(nome, url) {
        this.nome = nome;
        this.url = url;
    }
}

class Album {
    constructor(nome, url, imagem) {
        this.nome = nome;
        this.url = url;
        this.imagem = imagem;
    }
}

class Musica {
    constructor(nome, tocandoAgora, duracaoMs, posicaoMs) {
        this.nome = nome;
        this.tocandoAgora = tocandoAgora;
        this.duracaoMs = duracaoMs;
        this.posicaoMs = posicaoMs;
    }
}

console.log("JavaScript Carregado!");

// Função para obter o token de acesso da nossa API local
function getAccessToken() {
    return fetch('http://localhost:3000/token/get', {

        // Definição dos Headers p/ correção do CORS (Implementado no Back-End - Na API).
        headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
            'Allowed-URI': 'http://localhost/',
        },

        method: 'GET',

    })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                return data.access_token;
            } else {
                throw new Error('Access token not found');
            }
        });
}

// Função para buscar a música atual tocando no Spotify
function getCurrentPlaying(accessToken, callback) {
    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            // Correção do erro "Unexpected end of JSON input"
            if (response.status === 204) {
                return {"nenhuma_musica": true, response: response};
            }
            return response.json();
        })
        .then(data => {
            // Chama o callback mas ao invés de informar a música, informo o erro "nenhuma_musica"
            if (data["nenhuma_musica"] === true) {
                callback("nenhuma_musica", null);
                return;  // Return pra evitar das outras linhas serem executadas.
            }

            // Gerar a Resposta com base nas Classes, pra evitar o Warning "Unresolved Variable".
            const item = data["item"];

            const artista = new Artista(
                item["artists"][0].name,
                item["artists"][0]["external_urls"]["spotify"]
            );

            const album = new Album(
                item["album"].name,
                item["album"]["external_urls"]["spotify"],
                item.album.images.find(image => image.height === 64 && image.width === 64).url
            );

            const musica = new Musica(
                item["name"],
                data["is_playing"],
                item["duration_ms"],
                data["progress_ms"]
            );

            // Musica Atual Tocando no momento.
            let tocandoAgora = {
                album: album,
                musica: musica,
                artista: artista
            };

            callback(null, tocandoAgora); // Chama o callback com os dados
        })
        .catch(error => {
            console.error('Erro ao buscar a música atual:', error);
        });
}

// Variáveis de Controle
let barraDeProgresso;
let musicaAtual;

// Função: Formata o Progresso - Tempo minutos/segundos;
// Calcula o percentual de progresso.
function formatarProgresso(tempoAtualMs, tempoTotalMs) {
    let tempoTotalSegundos = Math.ceil(tempoTotalMs / 1000);
    let tempoAtualSegundos = Math.ceil(tempoAtualMs / 1000);

    let percentualProgresso = (tempoAtualSegundos * 100) / tempoTotalSegundos;

    let minutosTotal = Math.floor(tempoTotalSegundos / 60);
    let segundosTotal = tempoTotalSegundos % 60;
    let minutosAtual = Math.floor(tempoAtualSegundos / 60);
    let segundosAtual = tempoAtualSegundos % 60;

    // Formatar os minutos e segundos para garantir dois dígitos
    let tempoTotalFormatado = `${minutosTotal}:${segundosTotal < 10 ? '0' : ''}${segundosTotal}`;
    let tempoAtualFormatado = `${minutosAtual}:${segundosAtual < 10 ? '0' : ''}${segundosAtual}`;

    return `Progresso: ${percentualProgresso.toFixed(2)}% - Tempo: ${tempoAtualFormatado} / ${tempoTotalFormatado}`;
}

// Função: Centralizar aqui as lógicas de população dos dados no HTML.
function popularDados(musica) {
    // Atualiza o título da música
    const tituloDiv = document.querySelector('.title');
    tituloDiv.textContent = musica.nome;

    // Atualiza a barra de progresso
    const progressBar = document.querySelector('.timer .bg .progress-bar');
    if (progressBar) {
        const percentualProgresso = (musica.posicaoMs / musica.duracaoMs) * 100;
        progressBar.style.width = `${percentualProgresso.toFixed(2)}%`;
    }
}

// Função: Sincroniza os dados do Spotify com o do Widget.
function syncWithSpotify(musica) {
    // Função Auxiliar: Verificar se a música mudou.
    const musicaMudou = () => {
        if (musicaAtual) return musicaAtual.nome !== musica.nome;
        return false;
    }

    // Informações Iniciais.
    if (musica.tocandoAgora && !musicaAtual?.tocandoAgora) console.log("Musica Iniciada.");
    if (musicaMudou()) {
        console.log("Musica Mudou.");

        // Exibe informações da música atual em formato tabular
        console.table({
            "Musica": musica.nome,
            "Posicao": formatarProgresso(Math.ceil(musica.posicaoMs / 1000)),
        });

        // Atualiza os dados do HTML.
        popularDados(musica);
    }

    musicaAtual = musica;
    popularDados(musica);

    if (musicaAtual.nome !== musica.nome) console.log(`Tocando Agora: ${musica.nome}`);

    // Função Auxiliar: Verificar se a música está tocando e se mudou.
    if (musica.tocandoAgora && musicaMudou()) {
        // Música mudou. Parar o intervalo de progresso.
        clearInterval(barraDeProgresso);

        // Inicia o sincronizador novamente.
        initSyncer();
        return;

    } else if (!musica.tocandoAgora && !musicaMudou()) {
        // Música está pausada. Pauso também a barra de progresso.
        clearInterval(barraDeProgresso);
        console.log("Música Pausada.")
        return;
    }

    // Função Auxiliar: Controla a barra de progresso.
    barraDeProgresso = setInterval(() => {
        if (musica.posicaoMs >= musica.duracaoMs) {
            // Musica, teoricamente, terminou. Ver se o Spotify já atualizou a música atual.
            clearInterval(barraDeProgresso);
            initSyncer(); // Inicia o sincronizador novamente.

            // Sai da função do setInterval para evitar problemas com a recursividade.
            return
        }

        console.log(formatarProgresso(musica.posicaoMs, musica.duracaoMs));
        musica.posicaoMs += 1000; // Incrementa o tempo atual a cada segundo

    }, 1000); // Atualiza a cada segundo
}

function initSyncer() {
    const verificaMusica = () => {
        getAccessToken().then(accessToken => {
            getCurrentPlaying(accessToken, (error, tocandoAgora) => {
                if (error === "nenhuma_musica") {
                    console.log("Nenhuma música tocando no momento.");
                    musicaAtual.tocandoAgora = false;
                    return; // Isso deveria sair da função se não houver música tocando
                }

                // Sincronizar os dados locais com o Spotify.
                clearInterval(barraDeProgresso)
                syncWithSpotify(tocandoAgora.musica);
            });
        });
    };

    // Inicia a verificação inicial e continua verificando a cada 5 segundos
    verificaMusica();
    setInterval(verificaMusica, 5000); // Continua a verificar a cada 5 segundos
}

// Inicia o nosso sincronizador quando a página carregar.
initSyncer();
