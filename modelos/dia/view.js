// Dia: o topo da nota do diario.
// - Faixa "Hoje": como estou (0 a 10, grava "Feeling" na propria nota), os habitos do dia (gravam na nota de habitos,
//   a mesma da semana na Home) e a agenda (reunioes abertas e recados para esta maquina).
// - O que espera por mim, com o "pendente" do ultimo registro (o que ficou da conversa anterior), e o que esta em andamento.
// - O que andou ontem e hoje, em drill-down: dia > area > projeto. Fechado mostra a contagem e o mais recente.
// Le o Central. O dia e o nome da nota (AAAA-MM-DD). Usado pelo modelo do diario (Templates/DailyTemplate.md).

// ---- ajuste
const VIEW_QUADRO = "Central/Painel/quadro";
const PASTA_REGISTROS = "Central/Diário de trabalho";
const PASTA_RECADOS = "Central/Recados";
const QUADROS_JSON = "Central/quadros.json";
const NOTA_QUADRO = "Central/Quadro geral.md";
const NOTA_HABITOS = "Hábitos.md";
const PASTA_DIARIO = "Diário";
const CAMPO_HUMOR = "Feeling";
// ---- fim do ajuste

const chave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dataDe = x => x instanceof Date ? x.toISOString().slice(0, 10) : String(x).slice(0, 10);
const data = (d, o) => { const t = d.toLocaleDateString("pt-BR", o); return t[0].toUpperCase() + t.slice(1); };
const link = (pai, caminho, cls, texto = "") => pai.createEl("a", { cls: "internal-link " + cls, text: texto, href: caminho, attr: { "data-href": caminho } });
const atual = dv.current();
const m = atual.file.name.match(/^(\d{4})-(\d\d)-(\d\d)$/);
const dia = m ? new Date(+m[1], m[2] - 1, +m[3]) : new Date(); dia.setHours(0, 0, 0, 0);
const desloca = n => new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + n);
const D = chave(dia), ONTEM = chave(desloca(-1)), HOJE = chave(new Date());
let MAQUINA = ""; try { MAQUINA = require("os").hostname().toUpperCase(); } catch { /* celular */ }
const est = window.diaEstado ??= { aberto: {} }; // o que foi aberto ou fechado no drill-down sobrevive ao redesenho
const raiz = dv.container.createDiv({ cls: "dia" });

// ---- topo: o dia e a navegacao
const topo = raiz.createDiv({ cls: "dia-topo" });
topo.createDiv({ cls: "dia-data", text: data(dia, { weekday: "long", day: "numeric", month: "long" }) + (D === HOJE ? "" : D < HOJE ? " (passado)" : " (adiante)") });
const nav = topo.createDiv({ cls: "dia-nav" });
link(nav, `${PASTA_DIARIO}/${ONTEM}`, "dia-navlink", "‹ ontem");
link(nav, "Home.md", "dia-navlink", "Home");
link(nav, `${PASTA_DIARIO}/${chave(desloca(1))}`, "dia-navlink", "amanhã ›");

// ---- dados: os cartoes (o mesmo leitor do Quadro geral, sem desenhar), recados, reunioes e registros
const q = { alvo: document.createElement("div"), estados: [] };
try { await dv.view(VIEW_QUADRO, q); } catch { /* sem quadro: o resto continua */ }
const cor = q.cor ?? (() => "var(--text-muted)");
const cartoes = q.cartoes ?? [];
const esperando = cartoes.filter(c => c.coluna === "Esperando você");
const andamento = cartoes.filter(c => c.coluna === "Em andamento");
const pendenteDe = async alvo => {
  const f = app.metadataCache.getFirstLinkpathDest(alvo, "");
  if (!f || f.extension !== "md") return "";
  return (await app.vault.cachedRead(f)).match(/^- \*\*Pendente:\*\* (.+)$/m)?.[1] ?? "";
};
let donos = {}; try { donos = JSON.parse(await app.vault.adapter.read(QUADROS_JSON)); } catch { }
const minhas = Object.keys(donos).filter(a => String(donos[a]).toUpperCase() === MAQUINA);
const recados = [];
for (const a of minhas) {
  for (const f of app.vault.getAbstractFileByPath(`${PASTA_RECADOS}/${a}`)?.children ?? []) {
    if (f.extension !== "md" || f.name.endsWith(".lido.md")) continue;
    if (app.vault.getAbstractFileByPath(`${PASTA_RECADOS}/${a}/${f.basename}.lido.md`)) continue;
    recados.push({ area: a, f });
  }
}
const abertas = dv.pages().where(p => p.type === "reuniao" && p.situacao === "aberta" && !p.file.path.startsWith("Templates/")).array();
const andou = dv.pages(`"${PASTA_REGISTROS}"`).where(p => p.file.name.startsWith(ONTEM) || p.file.name.startsWith(D))
  .sort(p => p.file.name, "desc").array();

// ---- a linha do resumo
const parados = esperando.filter(c => c.parado).length + andamento.filter(c => c.parado).length;
const resumo = raiz.createDiv({ cls: "dia-resumo" });
const chip = (n, txt, alerta) => { if (n) resumo.createSpan({ cls: "dia-chip" + (alerta ? " alerta" : ""), text: `${n} ${txt}` }); };
chip(esperando.length, "esperando você");
chip(parados, "parados há 3 dias ou mais", true);
chip(recados.length, recados.length === 1 ? "recado para esta máquina" : "recados para esta máquina", true);
chip(abertas.length, abertas.length === 1 ? "reunião aberta" : "reuniões abertas", true);
if (!resumo.childElementCount) resumo.createSpan({ cls: "dia-chip", text: "Nada esperando você. Bom dia." });

// ---- faixa "Hoje": como estou, habitos e agenda
const faixa = raiz.createDiv({ cls: "dia-faixa" });
const cartao = (titulo) => { const c = faixa.createDiv({ cls: "dia-cartao" }); c.createDiv({ cls: "dia-cartao-t", text: titulo }); return c; };

// como estou: 0 a 10, um clique; grava na propriedade da propria nota
const cHumor = cartao(D === HOJE ? "Como estou hoje" : "Como estava");
const arqNota = app.vault.getAbstractFileByPath(atual.file.path);
// dv.current() e o que o Dataview acabou de indexar (o metadataCache pode estar um passo atras no redesenho)
const v0 = atual[CAMPO_HUMOR] ?? atual[CAMPO_HUMOR.toLowerCase()];
let humor = v0 === null || v0 === undefined || v0 === "" ? null : Number(v0);
const rotulo = n => n === null ? "Toque num número" : n <= 2 ? "😞 Dia pesado" : n <= 4 ? "😕 Meio pra baixo" : n <= 6 ? "😐 Normal" : n <= 8 ? "🙂 Bem" : "😄 Ótimo";
const escala = cHumor.createDiv({ cls: "dia-humor" });
const legenda = cHumor.createDiv({ cls: "dia-humor-leg" });
const desenharHumor = () => {
  escala.empty();
  for (let n = 0; n <= 10; n++) {
    const b = escala.createEl("button", { cls: "dia-h-n" + (n === humor ? " sel" : ""), text: String(n), attr: { "aria-label": `Como estou: ${n} de 10` } });
    b.style.setProperty("--c", `hsl(${n * 12}, 62%, 48%)`);
    b.onclick = async () => {
      humor = n === humor ? null : n; desenharHumor();
      await app.fileManager.processFrontMatter(arqNota, fm => { fm[CAMPO_HUMOR] = humor; });
    };
  }
  legenda.setText(rotulo(humor));
};
desenharHumor();

// habitos do dia: o mesmo da semana na Home
const cHab = cartao(D === HOJE ? "Hábitos de hoje" : "Hábitos do dia");
const arqHab = app.vault.getAbstractFileByPath(NOTA_HABITOS);
const habitos = ((arqHab && app.metadataCache.getFileCache(arqHab)?.frontmatter?.habitos) ?? [])
  .map(h => ({ nome: h.nome, icone: h.icone ?? "", meta: Number(h.meta) || 0, dias: new Set((h.dias ?? []).map(dataDe)) }));
const linhaHab = cHab.createDiv({ cls: "dia-habitos" });
const iniSemana = chave(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() - dia.getDay()));
const desenharHabitos = () => {
  linhaHab.empty();
  for (const h of habitos) {
    const feito = h.dias.has(D);
    const naSemana = [...h.dias].filter(d => d >= iniSemana && d <= chave(desloca(6 - dia.getDay()))).length;
    const b = linhaHab.createEl("button", { cls: "dia-hab" + (feito ? " feito" : ""), attr: { "aria-label": `${h.nome}: ${feito ? "feito" : "não feito"} neste dia` } });
    b.createSpan({ text: `${feito ? "✓" : "○"} ${h.icone} ${h.nome}`.replace(/\s+/g, " ") });
    if (h.meta) b.createSpan({ cls: "dia-hab-meta", text: `${naSemana}/${h.meta} na semana` });
    b.disabled = D > HOJE;
    b.onclick = async () => {
      const marcar = !h.dias.has(D);
      marcar ? h.dias.add(D) : h.dias.delete(D);
      desenharHabitos();
      await app.fileManager.processFrontMatter(arqHab, fm => {
        const alvo = fm.habitos?.find(x => x.nome === h.nome); if (!alvo) return;
        const lista = (alvo.dias ?? []).map(dataDe).filter(d => d !== D);
        if (marcar) lista.push(D);
        alvo.dias = lista.sort();
      });
    };
  }
  if (!habitos.length) linhaHab.createSpan({ cls: "dia-vazio", text: "Sem hábitos na nota de hábitos." });
};
desenharHabitos();

// agenda: reunioes abertas e recados
const cAg = cartao("Agenda e recados");
for (const r of abertas) link(cAg, r.file.path, "dia-linha alerta", `◆ ${r.title ?? r.file.name}`);
for (const r of recados) link(cAg, r.f.path, "dia-linha alerta", `✉ ${r.area}: ${r.f.basename.replace(/^\d{4}-\d\d-\d\d \d{4} /, "")}`);
if (!abertas.length && !recados.length) cAg.createDiv({ cls: "dia-vazio", text: "Nada marcado nem recado pendente." });

// ---- duas colunas
const colunas = raiz.createDiv({ cls: "dia-duas" });
const esq = colunas.createDiv({ cls: "dia-col" });
const dir = colunas.createDiv({ cls: "dia-col" });
const titulo = (pai, texto, ir, extra) => {
  const h = pai.createDiv({ cls: "dia-h" }); h.createSpan({ text: texto });
  if (extra) h.createSpan({ cls: "dia-h-extra", text: extra });
  if (ir) link(h, ir, "dia-ir", "abrir →");
};
const bolha = (pai, url) => {
  const b = pai.createSpan({ cls: "dia-conversa", text: "💬", attr: { role: "link", tabindex: "0", "aria-label": "Abrir a conversa no Claude" } });
  b.onclick = e => { e.preventDefault(); e.stopPropagation(); window.open(url); };
};
const idade = c => c.dias === null ? "" : c.dias <= 0 ? `hoje ${c.hora}` : c.dias === 1 ? "ontem" : `há ${c.dias} dias`;

// o que espera por mim: cada cartao com o pendente do ultimo registro
titulo(esq, "O que espera por você", NOTA_QUADRO, String(esperando.length));
const caixaE = esq.createDiv({ cls: "dia-caixa" });
for (const c of esperando) {
  const item = link(caixaE, c.link, "dia-item");
  item.style.setProperty("--c", cor(c.area));
  const l1 = item.createDiv({ cls: "dia-l1" });
  l1.createSpan({ cls: "dia-area", text: c.area });
  l1.createSpan({ cls: "dia-proj", text: c.projeto });
  l1.createSpan({ cls: "dia-idade" + (c.parado ? " parado" : ""), text: idade(c) });
  const pend = await pendenteDe(c.link);
  item.createDiv({ cls: "dia-pend", text: pend ? `Pendente: ${pend}` : c.resumo });
  if (c.conversa) bolha(l1, c.conversa);
}
if (!esperando.length) caixaE.createDiv({ cls: "dia-vazio", text: "Nada esperando você." });

titulo(esq, "Em andamento", null, String(andamento.length));
const caixaA = esq.createDiv({ cls: "dia-caixa" });
for (const c of andamento) {
  const item = link(caixaA, c.link, "dia-item curto");
  item.style.setProperty("--c", cor(c.area));
  const l1 = item.createDiv({ cls: "dia-l1" });
  l1.createSpan({ cls: "dia-area", text: c.area });
  l1.createSpan({ cls: "dia-proj", text: c.projeto });
  l1.createSpan({ cls: "dia-idade" + (c.parado ? " parado" : ""), text: idade(c) });
}
if (!andamento.length) caixaA.createDiv({ cls: "dia-vazio", text: "Nada em andamento." });

// ---- o que andou, em drill-down: dia > area > projeto (o registro mais recente de cada um)
const det = (pai, cls, chaveEst, abertoPadrao) => {
  const d = pai.createEl("details", { cls });
  d.open = est.aberto[chaveEst] ?? abertoPadrao;
  d.addEventListener("toggle", () => { est.aberto[chaveEst] = d.open; });
  return d;
};
titulo(dir, "O que andou", null, `${andou.length} registros`);
const caixaO = dir.createDiv({ cls: "dia-caixa" });
const dias = [[D, D === HOJE ? "Hoje" : "Neste dia"], [ONTEM, D === HOJE ? "Ontem" : "Na véspera"]];
for (const [k, nome] of dias) {
  const doDia = andou.filter(p => p.file.name.startsWith(k));
  if (!doDia.length) continue;
  const porArea = new Map();
  for (const p of doDia) { const a = p.area ?? "Sem área"; if (!porArea.has(a)) porArea.set(a, []); porArea.get(a).push(p); }
  const dDia = det(caixaO, "dia-det-dia", `${k}|dia`, k === D);
  const sDia = dDia.createEl("summary");
  sDia.createSpan({ cls: "dia-det-nome", text: nome });
  sDia.createSpan({ cls: "dia-det-info", text: `${doDia.length} ${doDia.length === 1 ? "registro" : "registros"} em ${porArea.size} ${porArea.size === 1 ? "área" : "áreas"}` });
  for (const [area, regs] of porArea) {
    const projetos = new Map();
    for (const p of regs) { const pr = p.projeto ?? p.file.name; if (!projetos.has(pr)) projetos.set(pr, { p, n: 0 }); projetos.get(pr).n++; }
    const dArea = det(dDia, "dia-det-area", `${k}|${area}`, false);
    dArea.style.setProperty("--c", cor(area));
    const sArea = dArea.createEl("summary");
    sArea.createSpan({ cls: "dia-area", text: area });
    sArea.createSpan({ cls: "dia-det-conta", text: String(regs.length) });
    const nomes = [...projetos.keys()];
    sArea.createSpan({ cls: "dia-det-proj", text: nomes[0] + (nomes.length > 1 ? `  +${nomes.length - 1}` : "") });
    for (const [pr, { p, n }] of projetos) {
      const mm = p.file.name.match(/^(\d{4}-\d\d-\d\d) (\d\d)(\d\d) (\S+)/);
      const item = link(dArea, p.file.path, "dia-item curto");
      const l1 = item.createDiv({ cls: "dia-l1" });
      l1.createSpan({ cls: "dia-proj", text: pr });
      l1.createSpan({ cls: "dia-idade", text: (mm ? `${mm[2]}:${mm[3]}${mm[4].toUpperCase() !== MAQUINA ? " · " + mm[4] : ""}` : "") + (n > 1 ? ` · ${n}×` : "") });
      // a conversa so abre na maquina que gravou o registro
      if (p.conversa && String(p.maquina).toUpperCase() === MAQUINA) bolha(l1, `claude://claude.ai/epitaxy/${p.conversa}`);
      const h1 = app.metadataCache.getCache(p.file.path)?.headings?.[0]?.heading;
      if (h1) item.createDiv({ cls: "dia-pend", text: h1 });
    }
  }
}
if (!andou.length) caixaO.createDiv({ cls: "dia-vazio", text: "Nenhum registro de trabalho." });
