# Spotify Widget

Esse Widget exibe a música que está tocando no seu Spotify em tempo real.

Ele interage com a API do Spotify para obter informações sobre a faixa atual e
do processo de autenticação do Spotify para acessar esses dados.

## Como Usar

Antes de usar o Widget, você precisa configurar a API que atuará como intermediário entre o Widget e o Spotify.
Essa etapa é necessária devido ao fluxo que a API do Spotify recebe os requests,
de [acordo com essa documentação](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)

### Configuração Inicial

- Clone o repositório e instale as dependências necessárias:
  ```bash
  npm init
  npm install express dotenv axios nodemon
  ```

- Configure as variáveis de ambiente no arquivo `.env` com suas credenciais do Spotify, abaixo as variáveis necessárias.
    - Parâmetros de
      Servidor - [Configurados aqui.](https://github.com/HorselessName/spotify-widget/blob/main/api/index.js#L70)
        - PROTOCOL: "http" ou "https".
        - HOST: IP do servidor.
        - PORT: Porta do servidor.
    - Parâmetros de Autenticação - Utilizados nas requisições para a API do Spotify.
        - SPOTIFY_CLIENT_ID: Você acha / gera em https://developer.spotify.com/dashboard/"
        - SPOTIFY_CLIENT_SECRET: Você acha / gera em https://developer.spotify.com/dashboard/"
        - ACCESS_TOKEN: O Access Token é gerado somente uma vez, mas ele expira, use o Refresh Token para renovar.
        - REFRESH_TOKEN: Como o Access Token, mesmo precisando ser gerado só uma vez, tem validade de uma hora,
          então é necessário renová-lo com o Refresh Token, que não expira.
        - TOKEN_EXPIREDATE: Nas requisições locals dessa API,
          [como esta](https://github.com/HorselessName/spotify-widget/blob/cfcdabe267bd8a54be01077b2ea446a0fa281810/api/routes.auth.js#L19),
          salvamos a data de expiração pra facilidade de uso.

### Usando a API

- A API utiliza o Express para facilitar a criação do servidor e o Axios para as requisições HTTP.
- Com a API rodando, ela irá gerar e renovar o Token de acesso necessário para os requests na API do Spotify.

## Como Funciona

O Widget opera com base no fluxo "Authorization Code" do OAuth 2.0, que é o método recomendado pelo Spotify para
aplicações que requerem acesso aos dados do usuário. O processo é ilustrado no diagrama abaixo e consiste nas seguintes
etapas:

![Fluxo de Autorização do Spotify](https://developer.spotify.com/images/documentation/web-api/auth-code-flow.png)

1. **Solicitação de Autorização**: A aplicação solicita autorização do usuário para acessar os dados do Spotify.
2. **Código de Acesso e Tokens**: Após a autorização, a aplicação recebe um código de acesso que é trocado por um token
   de acesso e um token de atualização.
3. **Utilização do Token de Acesso**: O token de acesso é utilizado em todas as requisições à API do Spotify para obter
   dados.
4. **Renovação do Token de Acesso**: Uma vez que o token de acesso expira após 1 hora, a aplicação utiliza o token de
   atualização para obter um novo token de acesso sem a necessidade de nova autorização do usuário.

Para manter o widget atualizado, uma tarefa cron na API regenera o token de acesso a cada 50 minutos, assegurando que o
Widget tenha acesso contínuo aos dados necessários sem interrupção.

## Exemplos de Uso do Widget

A pasta "widget" contém exemplos de Widgets personalizáveis que você pode usar como ponto de partida. Eles podem ser
modificados e estilizados conforme sua preferência para exibir a faixa atual em diferentes ambientes, como sites ou
aplicativos de desktop.

A pasta "examples" inclui amostras de código e exemplos de fluxos de requisições no Postman que ilustram como interagir
com a API do Spotify através da API intermediária criada.

Siga os exemplos caso queira criar widgets próprios e personalizados que podem ser usados em qualquer ambiente
que permite HTML e JavaScript ser utilizado.
