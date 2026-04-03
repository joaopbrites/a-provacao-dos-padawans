# Vida de Inseto

Jogo web educativo focado em praticar logica de algoritmos por meio da leitura de execucao passo a passo.

## Objetivo

Ajudar estudantes de programacao a entender o estado interno de algoritmos durante a execucao, com perguntas sobre variaveis e estrutura de dados em pontos especificos.

## Stack

- HTML
- CSS
- JavaScript

Sem frameworks e sem bibliotecas externas.

## Status atual

Projeto com primeira versao funcional de gameplay (Arcade e Selection) ja implementada.

## Estrutura principal

- `vida_de_inseto/`: codigo e documentacao ativa do projeto.
- `Pair_Programming/`: material de planejamento legado (ignorado pelo Git).

## MVP (resumo)

- Modos: Arcade e Selection
- Execucao real dos algoritmos em JavaScript
- Exibicao em pseudocodigo
- Quiz por snapshots
- Pontuacao por tempo de resposta

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
