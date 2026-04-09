# A Provação dos Padawans

Jogo web educativo focado em praticar logica de algoritmos por meio de um quiz progressivo por disciplinas.

## Objetivo

Ajudar estudantes de programacao a entender o estado interno de algoritmos durante a execucao, com perguntas sobre variaveis e estrutura de dados em pontos especificos.

## Stack

- HTML
- CSS
- JavaScript

Sem frameworks e sem bibliotecas externas.

## Status atual

Projeto com versao funcional de gameplay em dois modos: Percurso de Formatura e Treino livre.

## Estrutura principal

- `vida_de_inseto/`: codigo e documentacao ativa do projeto.
- `Pair_Programming/`: material de planejamento legado (ignorado pelo Git).

## MVP (resumo)

- Modos: Percurso de Formatura e Treino livre
- Banco de perguntas por disciplina (IALG, ED, POO, Grafos e CPA)
- Exibicao de trechos em C++ para contexto da pergunta
- Pontuacao por acerto
- Objetivo configuravel de questoes por partida

## Como executar localmente

Importante: o projeto usa modulos ES (`type="module"`).
Abrir o `index.html` direto no navegador via `file://` pode bloquear os imports e impedir a interface de responder.

Execute com servidor local na pasta `vida_de_inseto`:

```bash
python3 -m http.server 5500
```

Depois acesse:

```text
http://localhost:5500
```
