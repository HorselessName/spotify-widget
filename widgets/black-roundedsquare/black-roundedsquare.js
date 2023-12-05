// // Fluxo de Callback, Assíncrono.
//
// function main(callback){
//     console.log("Função Síncrona.")
//
//     // Depois de 2 Segundos vou gerar dados fictícios.
//     setTimeout(
//         () => {
//             const data = {
//                 data: "Dados da API..."
//             }
//
//             // Função Callback executada dentro do Handler do setTimeout.
//             console.log("Invocando o Callback (Ver Dados). " +
//                 "\nVou passar os dados e uma função para o callback do Ver Dados.")
//             callback(data, callBackProVerDados);
//
//             // O que ele faz:
//             // - Gera a função do argumento, com o valor do data.
//             // - Essa função do argumento é o callback da função main.
//             // - O callback é executado com o valor do data.
//
//         }, 2000
//     );
// }
//
// // Função pra tratar o callback da função main.
// // Essa função por sua vez, também tem um callback.
// function verDados(dados, callBackVerDados){
//     console.log("Função Callback 'Ver Dados' executada da Função Main." +
//         "\nRecebi Dados e Função Callback como Argumento.");
//     setTimeout(
//         () => {
//             // Imprime os dados da API.
//             console.log(dados);
//
//             // Executa o callback da função verDados.
//             // O Callback recebeu o argumento de dentro da `Main`...
//             console.log("Agora, vou chamar o Callback do VerDados...")
//             callBackVerDados();
//         }, 1000
//     );
// }
//
// // Executa por último, porquê é uma Task e tem menos prioridade que a Micro Task.
// setTimeout(
//     () => {
//         console.log("setTimeout - Task...");
//     }, 0
// );
//
// // Executa por Segundo, antes do setTimeout, porquê é uma Micro Task.
// new Promise(
//     (resolve => {
//         // Gera o evento promise com esse valor informado.
//         resolve("Promise - Micro Task...");
// })
// ).then(
//     (promiseComValor) => {
//         console.log(`Promise com o Valor Gerado: ${promiseComValor}`)
//     }
// );
//
// // Outro Callback que é chamado na função verDados.
// function callBackProVerDados(){
//     console.log("Outro Callback - Da Função verDados. " +
//         "\nCallback do Ver Dados executado com sucesso.");
// }
//
// // Executa Primeiro - Pq é Síncrono
// //
// // Exemplo de Callback.
// // 1. Main Cria um Callback com os dados.
// // 2. Ver Dados recebe o Callback e executa, com outro Callback.
// //
// // Como criamos um Callback na Main, precisamos também passar o mesmo...
// // E o Callback (Função que vai ser executada ao concluir) é o "verDados".
// main(verDados);

// Exemplo de Fluxo Assíncrono com Async / Await

// Executando Async Function para demonstrar que Async é Síncrono.
// Vai executar antes da FuncaoSincronaNormal ... O que pausa e espera a Promise ser resolvida é o `Await`.
funcaoSincronaQueRetornaPromise().then(() => console.log("Função Async Terminada."));

function funcaoSincronaNormal() {
    console.log("\n----------\nFunção Síncrona Normal.\n----------\n")
}

funcaoSincronaNormal();

// Informações Importantes:
// 1. É uma Função Síncrona que retorna uma Promise
// 2. Apesar de ser síncrona, ou seja, ser executada na CallStack Principal,
// ela não bloqueia outras funções da Call Stack e Callback Queue de serem executadas.
// 3. O Await faz com que a função espere a Promise ser resolvida, para continuar a execução.
async function funcaoSincronaQueRetornaPromise() {
    // Importante dominar esse fluxo:
    // Sempre a cada inicio de fluxo que trata dados, resetar o valor da variável.
    let valor = 0;
    let catFactJSON;

    // Vou depois de 5 segundos, gerar um valor simbólico.
    // Tempo longo pra poder testar o Await.
    // Importante: O Await não cria uma thread ou executa em paralelo... Ele na verdade "Pausa" a função.
    // Ele "Pausa" e permite só retomar a execução quando uma Promise for resolvida.
    await new Promise(resolve => {
        setTimeout(
            () => {
                valor = 10;

                // Precisa resolver a Promise... Na mão.
                resolve();
            }, 5000
        );
    })

    // Aqui, ao terminar a função, ela vai retornar uma Promise.
    // Usamos o Await para esperar o setTimeout acabar pra printar o valor gerado.
    console.log("\n##########\nSó printo quando Primeira Promise do Async for resolvida... " +
        "\nFoi resolvida. Valor: ", valor, "\n##########\n");

    // Existe também como fazer vários Await's em sequência, cada um pausando a função e aguardando ela terminar.
    // Neste Await Promise que pausa a função abaixo, a gente fez uma sintaxe em que não precisamos resolver na mão,
    // a Promise, e o `Resolve` é gerado automaticamente.
    // Pauso a função async até receber os dados, usando o `fetch` que já retorna uma promise, assim que os dados chegam.
    try {
        // As variávis aqui estão em escopo próprio, do `try` e não da função em si...
        // API de Exemplo: https://cat-fact.herokuapp.com/facts
        const catFact = await fetch("https://cat-fact.herokuapp.com/facts");

        // Converto para JSON, que por sua vez também retorna uma Promise que é automaticamente resolvida.
        catFactJSON = await catFact.json();
    } catch (erro) {
        // Caso dê erro, o `catch` é chamado.
        console.log("Erro ao buscar dados da API: ", erro);
        return; // Sai da função `async`.
    }

    // Se não deu erro, printa os dados (Só passa aqui se a função foi resumida com sucesso, pelo `await`).
    console.log("Dados da API: ", catFactJSON);
}
