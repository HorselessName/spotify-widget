// Fluxo Assíncrono

function main(){
    console.log("Função Síncrona.")
}

// Executa por último, porquê é uma Task e tem menos prioridade que a Micro Task.
setTimeout(
    () => {
        console.log("setTimeout - Task...");
    }, 0
);

// Executa por Segundo, antes do setTimeout, porquê é uma Micro Task.
new Promise(
    (resolve => {
        // Gera o evento promise com esse valor informado.
        resolve("Promise - Micro Task...");
})
).then(
    (promiseComValor) => {
        console.log(`Promise com o Valor Gerado: ${promiseComValor}`)
    }
);

// Executa Primeiro - Pq é Síncrono
main();