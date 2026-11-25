---
name: painel-obsidian
description: "Monta com a pessoa um painel no Obsidian: a Home que abre com o dia, o quadro de tudo o que está em andamento (a partir dos quadros Kanban), um calendário com o que houve em cada dia, a semana de hábitos marcada com um clique e as notas recentes; com o kit de trabalho, cada cartão ganha o link para a conversa do Claude que fez o trabalho. Parte de uma versão testada e adapta ao cofre dela: diagnóstico do cofre e dos plugins, escolha das partes, instalação, teste sem ler pastas privadas e ajustes. Use em /painel-obsidian e quando a pessoa quiser uma Home, um dashboard, um quadro geral, um calendário ou hábitos no Obsidian, ou melhorar a Home que já tem."
---

# painel-obsidian

Você vai montar com a pessoa um **painel no Obsidian**: uma Home que abre com o dia e mostra, numa tela só, o que espera por ela, o que está em andamento, o calendário do mês e a semana de hábitos. E uma nota **Quadro geral** com todos os cartões, inclusive o que foi feito na semana.

O código saiu de um cofre real, refeito e validado com o dono ao longo de uma noite: Windows, tema escuro, Dataview, Kanban, Periodic Notes e Homepage, sete quadros de área e dois computadores escrevendo no mesmo cofre. Ele está em `modelos/`, com um bloco de ajuste no alto de cada arquivo. Outro cofre muda as pastas, as áreas e as cores. O desenho é o mesmo.

## O que a pessoa ganha
- **Home:** a data e três botões (diário de hoje, nova nota, buscar); os cartões "Esperando você", "Em andamento" e "A fazer"; a semana de hábitos; o calendário com um ponto colorido por área com trabalho no dia, ◆ para reunião e o número sublinhado quando o dia tem diário. Clicando num dia, aparece o que houve nele. Embaixo, as notas em andamento e as mexidas por último.
- **Quadro geral:** as quatro colunas de todos os quadros, com "Feito" só da última semana. A idade de cada cartão fica laranja quando passa de 3 dias sem novidade.
- **Com o kit de trabalho:** o cartão abre o último registro do projeto, e o 💬 abre a conversa do Claude que fez o trabalho.

## Como falar
- Português, frases curtas. Muita gente usa o Obsidian sem nunca ter visto código: explique o que cada parte mostra, não como foi feita.
- Uma fase por vez. Antes de cada uma, diga em uma frase o que ela faz.
- Uma pergunta por vez, sempre com a sua sugestão: "Eu sugiro X, porque Y. Prefere outra coisa?"
- **O que só lê, você faz.** Criar ou trocar nota, você explica antes e espera o "sim". Configuração do Obsidian (plugin, Homepage, aparência), quem muda é a pessoa: você diz onde clicar.
- Ao dizer como ficou, separe o que você viu na tela do que a pessoa contou.

## Arquivos desta skill (leia só o que a fase pedir)
| Arquivo | Quando |
|---|---|
| `guias/cofre.md` | Fase 1: o que ler no cofre e nos plugins, sem entrar nas pastas privadas |
| `guias/modulos.md` | Fases 2 e 3: cada parte do painel, de onde lê, o bloco de ajuste e os formatos das notas |
| `guias/armadilhas.md` | Fases 3 a 5, e sempre que algo aparecer diferente do esperado |
| `guias/conversas.md` | Fase 6: o link da conversa do Claude (só com o kit de trabalho e o app Claude) |
| `modelos/quadro/`, `modelos/home/` | O código: `view.js` e `view.css` de cada parte |
| `modelos/notas/` | As notas `Home.md`, `Quadro geral.md` e `Hábitos.md` |

## Pastas privadas
Antes de abrir qualquer nota, pergunte se há pastas que você não deve ler (diário, notas pessoais, trabalho de terceiros). Se houver: não leia, não busque e não abra nada lá dentro, nem para testar. A Home pode mostrar dados dessas pastas para a pessoa. Quem não vê é você: o teste da fase 4 desenha a Home sem lê-las.

## Fase 0. Apresentar
Diga em poucas linhas:
- o resultado: o Obsidian abre na Home, com o dia, o que espera por ela e o calendário; o Quadro geral mostra todos os cartões;
- o que precisa: o Obsidian no computador, o plugin **Dataview** com JavaScript ligado e, para o quadro, quadros do plugin **Kanban**. Diário (Daily notes ou Periodic Notes) e Homepage são opcionais;
- o caminho: diagnóstico do cofre → escolher as partes → instalar → testar → abrir sozinho → (com o kit) conversas → fechamento. Leva de 30 a 60 minutos;
- que nada do que ela já tem é apagado: a Home antiga vira cópia antes da troca.

## Fase 1. Diagnóstico do cofre (só lê)
Leia `guias/cofre.md` e siga o roteiro dele: qual cofre, quais plugins estão ligados, se o Dataview roda JavaScript, onde ficam o diário e os quadros Kanban, o que a Home atual tem e quais pastas são privadas. Mostre um resumo curto: o que já serve, o que falta ligar (com o caminho dos cliques) e o que a Home atual tem de bom para levar.

## Fase 2. Escolher as partes e os nomes
Leia `guias/modulos.md`. Mostre as partes (quadro, semana de hábitos, calendário, notas, ações do topo) e recomende o que serve para o cofre dela. Combine, uma coisa por vez:
- a pasta dos quadros, os nomes das colunas e uma cor por área;
- os hábitos da semana e a meta de cada um (comece com poucos: dois ou três);
- a pasta do diário e o formato do nome (precisa dar `AAAA-MM-DD`);
- a pasta "em andamento", se houver, e as pastas que não entram em "Mexidas por último";
- o que a Home atual tem e vai junto (ou some).

## Fase 3. Instalar
Explique o que vai criar e espere o "sim". Depois:
1. Copie a Home atual para `Home (antes).md`, na mesma pasta, se ela existir.
2. Copie `modelos/quadro/` e `modelos/home/` para uma pasta do cofre (no kit, `Central/Painel/`; fora dele, `Painel/`). Preencha o bloco de ajuste no alto de cada `view.js` com o que foi combinado. Fora desse bloco, não mude nada.
3. Crie as notas a partir de `modelos/notas/`, trocando no `dv.view(...)` o caminho da pasta do passo 2. `Hábitos.md` sai com os hábitos combinados e `dias: []`.
4. Confira os caminhos: cada `dv.view("X")` precisa achar `X/view.js`.

## Fase 4. Testar sem ver o pessoal
1. Crie uma nota de teste, na mesma pasta do código, com as mesmas `cssclasses` da Home e `await dv.view("<pasta>/home", { semPrivado: true })`. Ela desenha a Home sem ler as `PASTAS_PRIVADAS`.
2. Abra pelo link `obsidian://open?vault=<cofre>&file=<nota>`. Se você puder ver a tela, confira: as duas colunas, os cartões com as cores, o calendário (troque de mês, clique num dia, "Hoje"), a semana (marque e desmarque um dia e veja a nota de hábitos mudar) e as listas de notas. Se não puder ver, peça um print da nota de teste, não da Home.
3. Desfaça as marcas de teste, apague a nota de teste e abra a Home de verdade. Se você pode ver a tela, olhe só a parte de cima. As partes com dados das pastas privadas, quem confere é a pessoa.

## Fase 5. Abrir sozinho e ajustes finos
- Com o plugin Homepage, a pessoa escolhe a Home como nota de abertura, no **modo de leitura**. Diga onde clicar; não mude a configuração por ela.
- Ajustes comuns (cor de área, colunas na Home, dias para "parado", botões do topo) ficam no bloco de ajuste: ver `guias/modulos.md`.
- Se algo aparecer estranho, veja `guias/armadilhas.md` antes de mexer no código.

## Fase 6. Conversas do Claude (só com o kit de trabalho)
Se o cofre tem o Central do kit e a pessoa usa o app Claude, leia `guias/conversas.md`: o registro novo já sai com o link, e os antigos desta máquina podem ganhá-lo procurando nas conversas. Pergunte antes de mexer em registros antigos: a regra do kit é não editar registro gravado.

Teste o 💬 num cartão desta máquina. Na primeira vez, o Obsidian pergunta "Open external link?": marque **"Always open claude:// links"** e clique em "Open Link". É o padrão da skill, para o 💬 abrir direto dali em diante. Diga à pessoa que marcou. O ajuste vale para o computador todo; em outro computador, marque de novo.

## Fase 7. Fechamento
Mostre o uso do dia a dia em três linhas: a Home abre sozinha; o clique no dia mostra o que houve; o clique na semana marca o hábito. E onde mudar depois: o bloco de ajuste, a nota de hábitos e as cores. Com o kit, registre a entrega no Central (skill `central`).

## Regras
- Nunca leia, busque ou abra as pastas privadas, nem para testar.
- Nunca apague a Home antiga: ela vira `Home (antes).md`.
- Configuração do Obsidian e dos plugins, quem muda é a pessoa. A exceção é o que ela pedir em palavras, uma coisa por vez.
- Nos avisos do Obsidian, "sempre abrir" só para os links do Claude (fase 6). Para outros apps, quem decide é a pessoa.
- O código fica igual ao modelo, fora o bloco de ajuste. Melhoria que valha para todos volta para `modelos/`, com teste.
