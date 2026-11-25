# Painel no Obsidian

Uma skill para o Claude Code que monta com você um **painel no Obsidian**: a Home que abre com o dia e mostra, numa tela só, o que espera por você, o que está em andamento, o calendário do mês e a semana de hábitos. Junto vem uma nota **Quadro geral** com todos os cartões dos seus quadros Kanban.

Ela não é um tema nem um modelo fixo. Ela lê o seu cofre, pergunta o que vale levar da Home que você já tem, instala a partir de um código testado e confere na tela com você. O código nasceu num cofre real, com sete quadros de área e dois computadores, e foi refeito até o dono dizer "ficou ótimo".

## O que aparece
- **Topo:** a data, as reuniões ainda abertas e botões para o diário de hoje, nota nova e busca.
- **Cartões:** "Esperando você", "Em andamento" e "A fazer", juntando todos os quadros, com a cor da área e há quanto tempo cada um está parado. Cartão parado há 3 dias ou mais fica com a idade em laranja.
- **Semana de hábitos:** poucos hábitos, com meta por semana. Um clique no dia marca, e a barra fica verde ao bater a meta.
- **Calendário:** um ponto por área com trabalho no dia, ◆ para reunião e o número sublinhado quando o dia tem diário. Clicando no dia, aparece o que houve nele.
- **Notas:** a pasta em andamento e as notas mexidas por último.
- **Quadro geral:** as quatro colunas, com o que foi feito na última semana.
- **Com um diário de trabalho (opcional):** cada cartão abre o registro do trabalho, e o 💬 abre a conversa do Claude que o fez, no app Claude. O formato está em `guias/conversas.md`.

## O que você precisa
- Obsidian no computador, com o plugin **Dataview** (e "Enable JavaScript queries" ligado).
- Para os cartões: quadros do plugin **Kanban**, de preferência um por área, numa pasta.
- Opcionais: diário (Daily notes ou Periodic Notes) e o plugin **Homepage**, para a Home abrir sozinha.
- [Claude Code](https://claude.com/claude-code).

## Como instalar
Abra o Claude Code e cole:

```
Instala esta skill para mim: https://github.com/kaiosmacedo/painel-obsidian
```

Ou, no PowerShell:

```powershell
git clone https://github.com/kaiosmacedo/painel-obsidian "$HOME\.claude\skills\painel-obsidian"
```

## Como usar
No Claude Code, digite:

```
/painel-obsidian
```

Ela te guia por estas etapas:

1. **Diagnóstico:** lê a configuração do cofre e dos plugins, acha os quadros e o diário e pergunta quais pastas são privadas. Nessas, ela não entra.
2. **Escolha:** quais partes você quer, as cores das áreas, os hábitos e o que levar da Home antiga.
3. **Instalação:** guarda a Home antiga como cópia e instala o painel com os seus nomes.
4. **Teste:** desenha a Home numa nota de teste que não lê as pastas privadas e confere cada clique.
5. **Abrir sozinho:** a Home como nota de abertura, no modo de leitura.
6. **Conversas do Claude:** só com um diário de trabalho no formato de `guias/conversas.md`.

## O que tem aqui
| Pasta | O que tem |
|---|---|
| `SKILL.md` | O roteiro da conversa |
| `guias/` | O diagnóstico do cofre, as partes do painel e o bloco de ajuste, as armadilhas e o link das conversas |
| `modelos/` | O código (`quadro/` e `home/`, com `view.js` e `view.css`) e as notas `Home`, `Quadro geral` e `Hábitos` |

Tudo em texto. Leia, mude, adapte: o que muda de um cofre para outro fica num bloco no alto de cada `view.js`.

## Licença
MIT. Use, mude e compartilhe à vontade.

Feito por Kaio Macedo.
