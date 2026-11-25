# Diagnóstico do cofre

Tudo aqui só lê. Pergunte antes quais pastas são privadas e deixe-as de fora de toda busca (no ripgrep, `--glob '!Pasta/**'`).

## 1. Qual cofre
- Pergunte. Se ela não souber o caminho, no Windows a lista dos cofres fica em `%APPDATA%\obsidian\obsidian.json` (campo `vaults`, com `path` e `open`). No Mac, em `~/Library/Application Support/obsidian/obsidian.json`.
- Um cofre sincronizado entre computadores (OneDrive, iCloud, Obsidian Sync) recebe o painel nos dois. Combine onde ele vai morar para não instalar duas vezes.

## 2. Plugins
| Arquivo em `.obsidian/` | O que conferir |
|---|---|
| `community-plugins.json` | Ligados: `dataview` (obrigatório), `obsidian-kanban` (para o quadro), `periodic-notes` (diário, se não usar o do Obsidian), `homepage` (opcional) |
| `core-plugins.json` | `daily-notes` ligado, se o diário for o do próprio Obsidian |
| `plugins/dataview/data.json` | `enableDataviewJs: true` (obrigatório) e `refreshEnabled: true` (a Home se atualiza sozinha) |
| `app.json` | `readableLineLength`: o painel já ocupa a largura toda com a classe `painel`, não precisa desligar |
| `daily-notes.json` ou `plugins/periodic-notes/data.json` | Pasta e formato do diário. O calendário espera nomes `AAAA-MM-DD` (formato vazio ou `YYYY-MM-DD`) |
| `plugins/homepage/data.json` | Que nota abre e em que modo. O melhor é "Reading view" |
| `appearance.json` | `enabledCssSnippets`. Uma Home antiga com caixas `[!dashboard]` costuma depender de um snippet; desligado, tudo fica numa coluna estreita |

Fora do cofre, em `%APPDATA%\obsidian\obsidian.json` (Mac: `~/Library/Application Support/obsidian/obsidian.json`): `openSchemes.claude: true` quer dizer que o Obsidian já abre os links do Claude sem perguntar. Vale para o computador todo, não só para o cofre.

Plugin desligado ou faltando: diga o nome e o caminho dos cliques (Configurações → Plugins da comunidade). Quem liga é a pessoa.

## 3. Quadros Kanban
- Ache as notas de quadro: o cabeçalho tem `kanban-plugin: board` (`rg -l "kanban-plugin: board" --glob '*.md'`, sem as privadas).
- O ideal é uma pasta com um quadro por área. O nome do arquivo vira o nome da área no painel.
- As colunas são as linhas `## ` do quadro. Os nomes precisam bater com `SECOES` no `quadro/view.js` (o padrão é A fazer, Em andamento, Esperando você e Feito).
- O cartão rende melhor no formato do kit: `- [ ] **Projeto** · resumo [[registro]]`. Em outro formato, o cartão mostra o texto inteiro e o clique abre o quadro.
- Sem quadros: dá para começar sem o quadro (`VIEW_QUADRO = ""`) ou criar um quadro por área com as quatro colunas. Com o kit, `registrar.ps1 -CriarQuadro` cria.

## 4. Diário, reuniões e registros
- **Diário:** a pasta e o formato do passo 2. Só confira que os nomes são `AAAA-MM-DD`; não abra as notas se a pasta for privada.
- **Reuniões:** notas com `type: reuniao`, `data` e `situacao` (`aberta` ou `processada`), como as da skill `reuniao` do kit. As abertas aparecem no alto da Home.
- **Registros (kit):** `Central/Diário de trabalho`, com nomes `AAAA-MM-DD HHmm MAQUINA Projeto` e as propriedades `area` e `projeto`.

## 5. A Home atual
Se a Home atual não estiver numa pasta privada, leia-a e liste o que ela mostra. Pergunte o que vale levar. Partes comuns e o que fazer com elas:
- contadores ("notas na semana", "total de notas"): a pessoa raramente usa; sugira tirar;
- listas por pasta ou por tag: viram "Mexidas por último" ou uma lista da pasta de andamento;
- tracker de hábitos do diário com muitos campos: troque pela semana de hábitos, começando com poucos;
- botões (Meta Bind e parecidos): viram as `ACOES` do topo.
