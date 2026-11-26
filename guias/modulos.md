# As partes do painel

São três partes de código, cada uma com `view.js` e `view.css`, carregadas pelo Dataview com `await dv.view("<pasta>")`:

- `quadro/`: o quadro. Usado pela nota Quadro geral (todas as colunas) e pela Home (só as colunas de `ESTADOS_NA_HOME`).
- `home/`: a Home inteira. Chama o `quadro/` para a parte dos cartões.
- `dia/`: o topo da nota do diário. Chama o `quadro/` só para ler os cartões, sem desenhar. Ver "O diário" abaixo.

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
| `NOTA_QUADRO` | A nota Quadro geral: vira o atalho "Abrir o Quadro geral ↗", na ponta da primeira faixa de cartões |
| `ESTADOS_NA_HOME` | As colunas que aparecem na Home |
| `PASTA_REGISTROS` | Registros de trabalho: viram os pontos coloridos do calendário e a lista do dia |
| `PASTA_DIARIO` | O diário: sublinhado no calendário e "Diário do dia" |
| `CMD_DIARIO_HOJE` | O comando que abre o diário de hoje: `periodic-notes:open-daily-note` ou `daily-notes` |
| `NOTA_HABITOS` | A nota da semana de hábitos |
| `PASTA_EM_ANDAMENTO` | A lista da esquerda, embaixo |
| `TITULO_EM_ANDAMENTO` | O título dessa lista. Vazio usa o nome da pasta (útil quando a pasta não tem acento, como `Reunioes` → "Reuniões") |
| `FORA_DE_RECENTES` | Pastas que não entram em "Mexidas por último" |
| `RECENTES_NA_ESQUERDA` | `true` leva "Mexidas por último" para a coluna da esquerda. Bom quando a Home não tem quadro nem hábitos: a esquerda ganha conteúdo e tudo cabe numa tela |
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
- Cada nota aparece pelo `title` das propriedades, quando tem; senão, pelo nome do arquivo.
- A pasta em andamento, pelas mexidas mais recentes.
- "Mexidas por último": todo o cofre, menos `FORA_DE_RECENTES`, a pasta em andamento, a própria Home e a nota de hábitos.

## O diário: o resumo do dia no topo da nota

O `dia/` é o começo da nota do diário. O modelo está em `modelos/notas/Diario - modelo.md`; ele substitui o modelo do diário do cofre, e o antigo fica guardado ao lado. O dia é o nome da nota (`AAAA-MM-DD`). A nota mostra:

- **O resumo:** quantos cartões esperam a pessoa, quantos estão parados, os recados para esta máquina e as reuniões abertas.
- **A faixa Hoje**, em três cartões:
  - **Como estou:** a escala de 0 a 10, um clique, com a cor do vermelho ao verde e uma palavra ("Bem", "Meio pra baixo"). Grava em `Feeling` na própria nota; o segundo clique no mesmo número apaga. Substitui a barra do Meta Bind, que o CSS esconde nas notas antigas.
  - **Hábitos:** os do dia, marcados com um clique na mesma nota de hábitos da Home, com quantas vezes na semana.
  - **Agenda e recados:** as reuniões abertas e os recados para esta máquina.
- **O que espera por você:** cada cartão com o "Pendente" do último registro, que é o que ficou da conversa anterior, e o 💬 da conversa.
- **Em andamento.**
- **O que andou**, em drill-down: hoje e ontem, cada dia dividido por área. A área fechada mostra a contagem e o projeto mais recente; aberta, um item por projeto com a hora, a máquina (se for a outra), quantas vezes andou e o 💬. Hoje abre sozinho; o resto abre com um clique, e o que a pessoa abriu continua aberto quando a nota se redesenha.

A navegação no alto vai para ontem, para a Home e para amanhã. Embaixo ficam os campos de escrita da pessoa (gratidão, journaling, revisão).

| Nome no bloco de ajuste de `dia/view.js` | O que é |
|---|---|
| `VIEW_QUADRO`, `NOTA_QUADRO` | Como na Home |
| `PASTA_REGISTROS`, `PASTA_RECADOS`, `QUADROS_JSON` | O Central do kit: registros, recados por área e as máquinas donas (os recados mostrados são só os das áreas desta máquina) |
| `NOTA_HABITOS` | A mesma nota de hábitos da Home |
| `PASTA_DIARIO` | Onde ficam as notas do diário (para a navegação) |
| `CAMPO_HUMOR` | A propriedade do "Como estou" na nota do dia (`Feeling`; troque se o cofre já usa outra) |

O diário costuma ser pasta privada. O `dia/` não lê nada do diário além do nome e do `Feeling` da nota aberta, e só grava o `Feeling` dela. Para testar, crie a nota `AAAA-MM-DD` numa pasta de teste fora do diário e apague depois.
