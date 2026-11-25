# Armadilhas (todas apareceram no cofre onde o painel nasceu)

| O que aparece | Por quê | O que fazer |
|---|---|---|
| A nota abre mostrando o código, não o painel | No modo de edição, o cursor caiu dentro do bloco `dataviewjs` | Deixe uma linha em branco entre as propriedades e o bloco (os modelos já têm) |
| O painel fica estreito, com metade das colunas | "Largura de linha legível" do Obsidian | `cssclasses: painel` na nota; o `view.css` do quadro e o da Home mudam `--file-line-width` (antes da 0.7.1, só o do quadro: a Home sem quadro ficava estreita) |
| O botão com link `obsidian://` para outro cofre abre a Home de lá, não a nota pedida | O outro cofre estava fechado, e o Homepage dele troca tudo pela Home ao abrir | Com o outro cofre já aberto, o botão abre a nota certa. Na primeira vez do dia, clique de novo |
| A semana de hábitos vaza da caixa à direita, com a janela menor | A grade pedia no mínimo 526px | Desde a 0.7.2, a grade encolhe até ~340px e esconde a barra quando a caixa fica estreita |
| Mudou o `view.js` e nada mudou na tela | O Dataview só roda de novo quando uma nota muda | Feche a aba e abra a nota de novo |
| Os arquivos `.js` e `.css` não aparecem na barra lateral | O Obsidian só lista os tipos que conhece | Normal: estão lá e o `dv.view` acha |
| `Failed to execute view` | O caminho do `dv.view` não acha `<pasta>/view.js` | Confira o caminho, sem `/view.js` no fim |
| A Home se redesenha sozinha de vez em quando | O Dataview atualiza quando o cofre muda | Normal; o mês, o dia e a semana escolhidos ficam guardados |
| A Home antiga, feita de caixas `[!dashboard]`, fica toda numa coluna | Ela dependia de um snippet de CSS que está desligado | Ou liga o snippet, ou leva o que vale para o painel novo |
| Ícone de editar por cima do botão "Buscar" | No modo de edição, o Obsidian mostra o botão do bloco ao passar o mouse | Abrir a Home no modo de leitura (Homepage → Reading view) |
| O preview do cartão não abre no modo de edição | No modo de edição, o preview pede Ctrl | Passar o mouse com Ctrl, ou usar o modo de leitura |
| "Open external link?" no clique do 💬 | O Obsidian pede confirmação para abrir outro app | No teste, marque "Always open claude:// links" e clique em "Open Link" (padrão da skill). Fica em `obsidian.json`, `openSchemes.claude`, por computador |
| A semana grava a data como texto estranho | Leitura pelo Dataview converte datas | O modelo lê pelo `metadataCache` e grava com `processFrontMatter`; não troque |
| Abrir o Obsidian pelo menu Iniciar abre o seletor de cofres | O executável abre o seletor quando já está rodando | Abra a nota pelo link `obsidian://open?vault=...&file=...` |
| Ao testar, aparecem dados de pasta privada na tela | A Home lê o diário e as notas recentes | Teste com `semPrivado: true`; na Home de verdade, olhe só a parte de cima |
| O dia escolhido no calendário ficou no dia de ontem | O dia escolhido fica guardado enquanto o Obsidian está aberto | "Hoje" volta para o dia de hoje |
