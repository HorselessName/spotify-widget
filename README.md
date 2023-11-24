# Spotify Widget

Esse Widget mostra a música que está tocando no momento no Spotify.
Ele depende de algumas coisas, devido a forma que o Spotify lida com a API deles.

## Como usar

- Você precisa de uma API que vai servir de intermediador para os requests.

A API de Exemplo do Repositório utilizado foi feita utilizando o Express,
pra ser simples e direto.

- npm init
- npm install express
- npm install dotenv

Utilize a API para gerar o Token de acesso do Spotify para fazer seus REQUESTS.
Por padrão, o Token dura somente 1 Hora, então foi configurada uma CRON na API para ficar gerando um novo token a cada 50 minutos.

## Exemplos de Uso do Widget

- Em Progresso.
