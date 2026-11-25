# O link da conversa do Claude no cartão

Só com o kit de trabalho (Central com quadros e registros) e o app Claude no computador.

## Como funciona
- O app Claude abre uma conversa pelo link `claude://claude.ai/epitaxy/<id>`, em que `<id>` é `local_...`. É o mesmo link que a ferramenta `get_session` devolve no campo `link`.
- Nas conversas do app, o id está na variável de ambiente `CLAUDE_CODE_HOST_SESSION_ID`.
- O `registrar.ps1` do kit (desde a 0.5.1) lê essa variável e grava no registro a propriedade `conversa: local_...` e, logo abaixo do título, a linha `- **Conversa:** [abrir no Claude, no MAQUINA](claude://...)`. Fica no alto porque é o que aparece no preview do cartão.
- O `quadro/view.js` mostra o 💬 no cartão quando o registro tem `conversa` e a `maquina` dele é o computador onde o Obsidian está aberto. A conversa só existe na máquina que gravou o registro; em outra, o link cairia na tela inicial do app.

## Registros antigos desta máquina
Antes, pergunte: a regra do kit é não editar registro gravado, e isto é uma exceção.

1. Liste os registros desta máquina: `Central/Diário de trabalho/* <MAQUINA> *.md`, sem `conversa:`.
2. Para cada um, procure a conversa com `search_session_transcripts`, consulta `trabalho\<nome do registro>` e `include_archived: true`. O trecho certo é a saída do `registrar.ps1`: `...\<nome>.md Quadro: <área> -> <coluna>`.
3. Quando vierem várias conversas, descarte:
   - a que só listou a pasta (o trecho segue com outro caminho, não com `Quadro:`);
   - a que recebeu o relato de outra conversa (o trecho aparece entre aspas ou dentro de uma nota entre conversas);
   - a cópia (fork) que herdou a conversa original: fique com a original, que é quem a cópia aponta em `startedBy`.
4. Faça primeiro um ensaio que só confere (os 29 do primeiro cofre passaram assim) e depois grave. Em cada registro, a gravação faz duas coisas:
   - põe `conversa: <id>` antes do `---` que fecha as propriedades;
   - põe a linha da conversa logo abaixo do título.
   Fora isso, nada muda no registro.
5. Os registros de outra máquina ficam como estão: só aquela máquina conhece as conversas dela.

## Codex e outros
A propriedade `conversa` pode guardar outro tipo de link mais tarde. Para isso, o `registrar.ps1` precisa saber ler o id daquele app, e o `conversaDe` do `quadro/view.js` precisa montar o link certo.
