// Dia: o resumo do dia no topo da nota do diario. O que espera por mim (com o "pendente" do ultimo registro, o que
// ficou da conversa anterior), o que esta em andamento, o que andou ontem e hoje, os recados e as reunioes abertas
// e os habitos do dia. Le o Central; so grava ao marcar um habito, na nota de habitos.
// O dia e o nome da nota (AAAA-MM-DD). Usado pelo modelo do diario (Templates/DailyTemplate.md).

// ---- ajuste
const VIEW_QUADRO = "Central/Painel/quadro";
const PASTA_REGISTROS = "Central/Diário de trabalho";
const PASTA_RECADOS = "Central/Recados";
const QUADROS_JSON = "Central/quadros.json";
const NOTA_QUADRO = "Central/Quadro geral.md";
const NOTA_HABITOS = "Hábitos.md";
const PASTA_DIARIO = "Diário";
// ---- fim do ajuste

const chave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dataDe = x => x instanceof Date ? x.toISOString().slice(0, 10) : String(x).slice(0, 10);
const data = (d, o) => { const t = d.toLocaleDateString("pt-BR", o); return t[0].toUpperCase() + t.slice(1); };
const link = (pai, caminho, cls, texto = "") => pai.createEl("a", { cls: "internal-link " + cls, text: texto, href: caminho, attr: { "data-href": caminho } });
const m = dv.current().file.name.match(/^(\d{4})-(\d\d)-(\d\d)$/);
const dia = m ? new Date(+m[1], m[2] - 1, +m[3]) : new Date(); dia.setHours(0, 0, 0, 0);
const desloca = n => new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + n);
const D = chave(dia), ONTEM = chave(desloca(-1)), HOJE = chave(new Date());
let MAQUINA = ""; try { MAQUINA = require("os").hostname().toUpperCase(); } catch { /* celular */ }
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

const colunas = raiz.createDiv({ cls: "dia-duas" });
const esq = colunas.createDiv({ cls: "dia-col" });
const dir = colunas.createDiv({ cls: "dia-col" });
const titulo = (pai, texto, ir) => { const h = pai.createDiv({ cls: "dia-h", text: texto }); if (ir) link(h, ir, "dia-ir", "abrir →"); };
const idade = c => c.dias === null ? "" : c.dias <= 0 ? `hoje ${c.hora}` : c.dias === 1 ? "ontem" : `há ${c.dias} dias`;

// ---- o que espera por mim: cada cartao com o pendente do ultimo registro
titulo(esq, "O que espera por você", NOTA_QUADRO);
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
  if (c.conversa) {
    const b = l1.createSpan({ cls: "dia-conversa", text: "💬", attr: { role: "link", tabindex: "0", "aria-label": "Abrir a conversa no Claude" } });
    b.onclick = e => { e.preventDefault(); e.stopPropagation(); window.open(c.conversa); };
  }
}
if (!esperando.length) caixaE.createDiv({ cls: "dia-vazio", text: "Nada esperando você." });

titulo(esq, "Em andamento");
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

// ---- hoje: habitos, recados e reunioes
titulo(dir, D === HOJE ? "Hoje" : "Neste dia");
const caixaH = dir.createDiv({ cls: "dia-caixa" });
const arqHab = app.vault.getAbstractFileByPath(NOTA_HABITOS);
const habitos = ((arqHab && app.metadataCache.getFileCache(arqHab)?.frontmatter?.habitos) ?? [])
  .map(h => ({ nome: h.nome, icone: h.icone ?? "", dias: new Set((h.dias ?? []).map(dataDe)) }));
const linhaHab = caixaH.createDiv({ cls: "dia-habitos" });
const desenharHabitos = () => {
  linhaHab.empty();
  for (const h of habitos) {
    const feito = h.dias.has(D);
    const b = linhaHab.createEl("button", { cls: "dia-hab" + (feito ? " feito" : ""), text: `${feito ? "✓" : "○"} ${h.icone} ${h.nome}`.replace(/\s+/g, " "),
      attr: { "aria-label": `${h.nome}: ${feito ? "feito" : "não feito"} neste dia` } });
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
for (const r of recados) link(caixaH, r.f.path, "dia-linha alerta", `✉ Recado em ${r.area}: ${r.f.basename.replace(/^\d{4}-\d\d-\d\d \d{4} /, "")}`);
for (const r of abertas) link(caixaH, r.file.path, "dia-linha alerta", `◆ Reunião aberta: ${r.title ?? r.file.name}`);

// ---- o que andou: os registros de ontem e de hoje, um por projeto (o mais recente)
titulo(dir, D === HOJE ? "O que andou (ontem e hoje)" : "O que andou (na véspera e no dia)");
const caixaO = dir.createDiv({ cls: "dia-caixa" });
const vistos = new Set();
for (const p of andou) {
  const chaveProj = `${p.area}|${p.projeto}`; if (vistos.has(chaveProj)) continue; vistos.add(chaveProj);
  const mm = p.file.name.match(/^(\d{4}-\d\d-\d\d) (\d\d)(\d\d) (\S+)/);
  const item = link(caixaO, p.file.path, "dia-item curto");
  item.style.setProperty("--c", cor(p.area));
  const l1 = item.createDiv({ cls: "dia-l1" });
  l1.createSpan({ cls: "dia-area", text: p.area ?? "" });
  l1.createSpan({ cls: "dia-proj", text: p.projeto ?? p.file.name });
  l1.createSpan({ cls: "dia-idade", text: mm ? `${mm[1] === D ? "hoje" : "ontem"} ${mm[2]}:${mm[3]}${mm[4].toUpperCase() !== MAQUINA ? " · " + mm[4] : ""}` : "" });
  const h1 = app.metadataCache.getCache(p.file.path)?.headings?.[0]?.heading;
  if (h1) item.createDiv({ cls: "dia-pend", text: h1 });
}
if (!andou.length) caixaO.createDiv({ cls: "dia-vazio", text: "Nenhum registro de trabalho." });
