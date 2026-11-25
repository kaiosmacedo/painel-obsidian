# As partes do painel

São dois arquivos de código, cada um com `view.js` e `view.css`, carregados pelo Dataview com `await dv.view("<pasta>")`:

- `quadro/`: o quadro. Usado pela nota Quadro geral (todas as colunas) e pela Home (só as colunas de `ESTADOS_NA_HOME`).
- `home/`: a Home inteira. Chama o `quadro/` para a parte dos cartões.

As duas notas usam `cssclasses: painel`, que deixa a nota usar a largura da janela, até 1500px. A Home usa também `sem-titulo`, que esconde o título e as propriedades.

## Bloco de ajuste do `quadro/view.js`
| Nome | O que é |
|---|---|
| `PASTA_QUADROS` | A pasta com um quadro Kanban por área |
| `CORES` | Uma cor por área: `{ "Nome do arquivo": "#rrggbb" }`. Área sem cor fica cinza |
| `SECOES` | As colunas, na ordem. `alerta: true` deixa a idade laranja quando parado; `dias: 7` mostra só os da última semana |
| `DIAS_PARADO` | Depois de quantos dias sem novidade a idade fica laranja |

O cartão `- [ ] **Projeto** · resumo [[registro]]` vira título, resumo e idade. A idade sai da data no nome do registro (`AAAA-MM-DD HHmm ...`). O clique abre o registro. Sem registro, o clique abre o quadro da área.

## Bloco de ajuste do `home/view.js`
Um texto vazio (`""`) desliga a parte.

| Nome | O que é |
|---|---|
| `VIEW_QUADRO` | A pasta do `quadro/`. Vazio: a Home fica sem cartões |
| `NOTA_QUADRO` | A nota Quadro geral (o link "com o que foi feito na semana") |
| `ESTADOS_NA_HOME` | As colunas que aparecem na Home |
| `PASTA_REGISTROS` | Registros de trabalho: viram os pontos coloridos do calendário e a lista do dia |
| `PASTA_DIARIO` | O diário: sublinhado no calendário e "Diário do dia" |
| `CMD_DIARIO_HOJE` | O comando que abre o diário de hoje: `periodic-notes:open-daily-note` ou `daily-notes` |
| `NOTA_HABITOS` | A nota da semana de hábitos |
| `PASTA_EM_ANDAMENTO` | A lista da esquerda, embaixo |
| `FORA_DE_RECENTES` | Pastas que não entram em "Mexidas por último" |
| `PASTAS_PRIVADAS` | O que o teste com `semPrivado` não lê |
| `ACOES` | Os botões do topo: `[texto, id do comando ou link]`. O primeiro fica em destaque. Um link `obsidian://open?vault=<outro cofre>&file=<nota>` abre nota de outro cofre (por exemplo, o Quadro geral do cofre onde mora o Central) |

Para achar o id de um comando: Configurações → Atalhos mostra o nome; o id é o do plugin mais o do comando (`file-explorer:new-file`, `switcher:open`). Na dúvida, rode `app.commands.listCommands()` no console do Obsidian.

## As partes da Home
- **Topo:** a data, as reuniões abertas e os botões.
- **Coluna da esquerda:** os cartões, a semana de hábitos e a pasta em andamento.
- **Coluna da direita, com 320px:** o calendário e "Mexidas por último". Abaixo de 860px de largura, as duas colunas viram uma.

### Semana de hábitos
A nota de hábitos guarda tudo nas propriedades:

```yaml
habitos:
  - nome: Yoga
    icone: "🧘"
    meta: 3
    dias: []
```

O clique num dia marca ou desmarca e grava em `dias` (`AAAA-MM-DD`). Os dias que ainda não chegaram ficam bloqueados. A barra fica verde ao bater a meta. As setas trocam de semana, para marcar um dia esquecido. A semana vai de domingo a sábado.

### Calendário
- Um ponto por área com registro no dia (até 4), ◆ para reunião e o número sublinhado quando o dia tem diário.
- O clique no dia mostra embaixo: o diário (ou o botão para criar o de hoje), as reuniões e um item por projeto, do mais recente para o mais antigo, com até 6 itens e um botão para ver o resto. Passando o mouse no item, aparece o título do registro.
- O mês e o dia escolhidos não se perdem quando a Home se redesenha.

### Notas
- A pasta em andamento, pelas mexidas mais recentes.
- "Mexidas por último": todo o cofre, menos `FORA_DE_RECENTES`, a pasta em andamento, a própria Home e a nota de hábitos.
