# Exemplos de Classe e Método Estático

Este documento apresenta exemplos de como criar classes com métodos estáticos em diferentes linguagens de programação (
JavaScript, Python e Java) e como instanciar essas classes acessando diretamente seus métodos estáticos.

## JavaScript

Em JavaScript, você pode criar uma classe com um método estático e, em seguida, usar esse método estático para
inicializar uma instância da classe.

```javascript
class Pessoa {
    constructor(nome) {
        this.nome = nome;
    }

    static getNome() {
        return "João";
    }
}

const nomePessoa = new Pessoa(Pessoa.getNome());
console.log(nomePessoa.nome); // Saída: "João"
```

**Explicação:**

- `Pessoa.getNome()` é um método estático que retorna um nome.
- `new Pessoa(...)` cria uma nova instância da classe `Pessoa`.
- O nome retornado pelo método estático é usado para inicializar a instância.

## Python

Python também permite a criação de métodos estáticos, mas sua utilização na criação de instâncias é feita de maneira um
pouco diferente.

```python
class Pessoa:
    def __init__(self, nome):
        self.nome = nome

    @staticmethod
    def get_nome():
        return "João"

nome_pessoa = Pessoa(Pessoa.get_nome())
print(nome_pessoa.nome)  # Saída: "João"
```

**Explicação:**

- `@staticmethod` decora o método `get_nome`, tornando-o um método estático.
- `Pessoa.get_nome()` é chamado para obter um nome.
- O resultado é passado para o construtor de `Pessoa`.

## Java

Java usa uma abordagem similar para métodos estáticos e construtores. A diferença está na sintaxe e na convenção de
nomes.

```java
public class Pessoa {
    private String nome;

    public Pessoa(String nome) {
        this.nome = nome;
    }

    public static String getNome() {
        return "João";
    }

    public String getNomeInstancia() {
        return nome;
    }

    public static void main(String[] args) {
        Pessoa nomePessoa = new Pessoa(Pessoa.getNome());
        System.out.println(nomePessoa.getNomeInstancia()); // Saída: "João"
    }
}
```

**Explicação:**

- `Pessoa.getNome()` é um método estático que retorna um nome.
- `new Pessoa(...)` cria uma nova instância da classe `Pessoa` com o nome retornado pelo método estático.
- `getNomeInstancia()` é um método de instância que retorna o nome da instância.

---

Estes exemplos demonstram como métodos estáticos podem ser usados de forma similar, mas com nuances específicas em cada
linguagem, para inicializar objetos com valores específicos.
