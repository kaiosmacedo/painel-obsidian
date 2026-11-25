// Home: o dia, o que espera por mim no quadro, os habitos da semana, o calendario e as notas.
// So grava ao marcar um habito, na nota de habitos.
// input.semPrivado: desenha sem ler as PASTAS_PRIVADAS (para conferir o layout sem ver o que e pessoal).
// Modelo da skill painel-obsidian. Guia: guias/modulos.md.

// ---- ajuste ao cofre (a skill preenche na instalacao); "" desliga a parte
const VIEW_QUADRO = "Central/Painel/quadro";          // o desenho do quadro (pasta com view.js)
const NOTA_QUADRO = "Central/Quadro geral.md";        // a nota com o quadro inteiro
const ESTADOS_NA_HOME = ["Esperando você", "Em andamento", "A fazer"];
const PASTA_REGISTROS = "Central/Diário de trabalho"; // registros "AAAA-MM-DD HHmm ..." com area e projeto: viram pontos no calendario
const PASTA_DIARIO = "Diário";                        // notas diarias AAAA-MM-DD: sublinhado no calendario
const CMD_DIARIO_HOJE = "periodic-notes:open-daily-note"; // core: "daily-notes"
const NOTA_HABITOS = "Hábitos.md";
const PASTA_EM_ANDAMENTO = "Em Andamento";
const TITULO_EM_ANDAMENTO = "";       // o titulo da lista; vazio usa o nome da pasta
const FORA_DE_RECENTES = ["Central", "Diário", "Templates"]; // pastas que nao entram em "Mexidas por ultimo"
const RECENTES_NA_ESQUERDA = false; // "Mexidas por ultimo" na coluna da esquerda (bom quando ela tem pouco: sem quadro nem habitos)
const PASTAS_PRIVADAS = ["Diário"];                   // o teste sem o pessoal nao le estas pastas
const ACOES = [["Diário de hoje", CMD_DIARIO_HOJE], ["Nova nota", "file-explorer:new-file"], ["Buscar", "switcher:open"]]; // [texto, comando ou link obsidian://]
// ---- fim do ajuste

const semPrivado = input?.semPrivado ?? false;
const dentro = (caminho, pastas) => pastas.some(p => p && (caminho === p || caminho.startsWith(p + "/")));
const privada = caminho => semPrivado && dentro(caminho, PASTAS_PRIVADAS);
const comDiario = PASTA_DIARIO && !privada(PASTA_DIARIO);
const chave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dataDe = x => x instanceof Date ? x.toISOString().slice(0, 10) : String(x).slice(0, 10);
const data = (d, o) => { const t = d.toLocaleDateString("pt-BR", o); return t[0].toUpperCase() + t.slice(1); };
const link = (pai, caminho, cls, texto = "") => pai.createEl("a", { cls: "internal-link " + cls, text: texto, href: caminho, attr: { "data-href": caminho } });
const ha = ms => { const min = Math.max(0, Math.round((Date.now() - ms) / 6e4)); return min < 60 ? `há ${min} min` : min < 1440 ? `há ${Math.round(min / 60)} h` : min < 2880 ? "ontem" : `há ${Math.round(min / 1440)} dias`; };
const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
const HOJE = chave(hoje);
const est = window.homeEstado ??= {}; // mes, dia e semana escolhidos sobrevivem quando a Home se redesenha
const raiz = dv.container.createDiv({ cls: "home" });

// ---- o que houve em cada dia: registros do Central, reunioes e diario
const dias = {};
const dia = k => dias[k] ??= { registros: [], reunioes: [], diario: null };
if (PASTA_REGISTROS) for (const p of dv.pages(`"${PASTA_REGISTROS}"`)) {
  const m = p.file.name.match(/^(\d{4}-\d\d-\d\d) (\d\d)(\d\d)/);
  if (m) dia(m[1]).registros.push({ hora: `${m[2]}:${m[3]}`, area: p.area, projeto: p.projeto ?? p.file.name, caminho: p.file.path });
}
for (const p of dv.pages().where(p => p.type === "reuniao" && !privada(p.file.path))) {
  const k = p.file.name.match(/^\d{4}-\d\d-\d\d/)?.[0] ?? p.data?.toFormat?.("yyyy-MM-dd");
  if (k) dia(k).reunioes.push({ titulo: p.title ?? p.file.name, aberta: p.situacao === "aberta", caminho: p.file.path });
}
if (comDiario) for (const p of dv.pages(`"${PASTA_DIARIO}"`)) if (/^\d{4}-\d\d-\d\d$/.test(p.file.name)) dia(p.file.name).diario = p.file.path;

// ---- topo: o dia, reunioes abertas e acoes
const topo = raiz.createDiv({ cls: "home-topo" });
const hojeEl = topo.createDiv();
hojeEl.createDiv({ cls: "home-data", text: data(hoje, { weekday: "long", day: "numeric", month: "long" }) });
const abertas = Object.values(dias).flatMap(d => d.reunioes).filter(r => r.aberta);
if (abertas.length) { const sub = hojeEl.createDiv({ cls: "home-avisos" }); for (const r of abertas) link(sub, r.caminho, "home-aviso", `Reunião aberta: ${r.titulo}`); }
const acoes = topo.createDiv({ cls: "home-acoes" });
ACOES.forEach(([texto, cmd], i) => {
  acoes.createEl("button", { text: texto, cls: i ? "" : "mod-cta" }).onclick = () => cmd.includes("://") ? window.open(cmd) : app.commands.executeCommandById(cmd);
});

// ---- duas colunas: esquerda (Central, semana, Em Andamento) e direita (calendario, mexidas por ultimo)
const colunas = raiz.createDiv({ cls: "home-duas" });
const esq = colunas.createDiv({ cls: "home-col" });
const dir = colunas.createDiv({ cls: "home-col" });

const q = { alvo: esq, estados: ESTADOS_NA_HOME, link: NOTA_QUADRO };
if (VIEW_QUADRO) await dv.view(VIEW_QUADRO, q);
const cor = q.cor ?? (() => "var(--text-muted)");

// ---- semana: os habitos da NOTA_HABITOS, clique no dia marca ou desmarca
const arqHabitos = NOTA_HABITOS ? app.vault.getAbstractFileByPath(NOTA_HABITOS) : null;
const habitos = ((arqHabitos && app.metadataCache.getFileCache(arqHabitos)?.frontmatter?.habitos) ?? [])
  .map(h => ({ nome: h.nome, icone: h.icone ?? "", meta: Number(h.meta) || 1, dias: new Set((h.dias ?? []).map(dataDe)) }));
est.semana ??= 0;
const hab = NOTA_HABITOS ? esq.createDiv({ cls: "home-caixa hab" }) : null;
const marcar = async (h, k) => {
  const feito = !h.dias.has(k);
  feito ? h.dias.add(k) : h.dias.delete(k);
  desenharSemana(); // na hora; a nota grava em seguida
  await app.fileManager.processFrontMatter(arqHabitos, fm => {
    const alvo = fm.habitos?.find(x => x.nome === h.nome); if (!alvo) return;
    const lista = (alvo.dias ?? []).map(dataDe).filter(d => d !== k);
    if (feito) lista.push(k);
    alvo.dias = lista.sort();
  });
};
const desenharSemana = () => {
  if (!hab) return;
  hab.empty();
  const ini = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay() + 7 * est.semana); // domingo
  const dias7 = [...Array(7)].map((_, i) => new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i));
  const cab = hab.createDiv({ cls: "hab-cab" });
  cab.createSpan({ cls: "hab-titulo", text: "Semana" });
  const curta = d => d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
  cab.createSpan({ cls: "hab-periodo", text: `${dias7[0].getMonth() === dias7[6].getMonth() ? dias7[0].getDate() : curta(dias7[0])} a ${curta(dias7[6])}` });
  const ir = n => () => { est.semana = n; desenharSemana(); };
  cab.createEl("button", { cls: "home-nav", text: "‹", attr: { "aria-label": "Semana anterior" } }).onclick = ir(est.semana - 1);
  if (est.semana) cab.createEl("button", { cls: "home-nav home-nav-hoje", text: "Esta semana" }).onclick = ir(0);
  const prox = cab.createEl("button", { cls: "home-nav", text: "›", attr: { "aria-label": "Próxima semana" } });
  prox.onclick = ir(est.semana + 1); prox.disabled = est.semana >= 0;
  if (!arqHabitos) { hab.createDiv({ cls: "cal-vazio", text: `Crie a nota ${NOTA_HABITOS} para acompanhar hábitos.` }); return; }

  const grade = hab.createDiv({ cls: "hab-grade" });
  link(grade, NOTA_HABITOS, "hab-editar", "editar hábitos");
  for (const d of dias7) grade.createDiv({ cls: "hab-dia" + (chave(d) === HOJE ? " hoje" : ""), text: `${data(d, { weekday: "short" }).slice(0, 3)} ${d.getDate()}` });
  grade.createDiv();
  for (const h of habitos) {
    grade.createDiv({ cls: "hab-nome", text: `${h.icone} ${h.nome}`.trim() });
    for (const d of dias7) {
      const k = chave(d), feito = h.dias.has(k);
      const cel = grade.createEl("button", {
        cls: "hab-cel" + (feito ? " feito" : "") + (k === HOJE ? " hoje" : ""), text: feito ? "✓" : "",
        attr: { "aria-label": `${h.nome}, ${d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric" })}: ${feito ? "feito" : "não feito"}` },
      });
      cel.disabled = k > HOJE;
      cel.onclick = () => marcar(h, k);
    }
    const n = dias7.filter(d => h.dias.has(chave(d))).length;
    const meta = grade.createDiv({ cls: "hab-meta" + (n >= h.meta ? " ok" : "") });
    meta.createDiv({ cls: "hab-barra" }).createSpan().style.width = `${Math.min(100, (n / h.meta) * 100)}%`;
    meta.createSpan({ text: n >= h.meta ? `${n}/${h.meta} ✓` : `${n}/${h.meta}` });
  }
  if (!habitos.length) hab.createDiv({ cls: "cal-vazio", text: "Nenhum hábito na nota ainda." });
};
desenharSemana();

// ---- calendario: um ponto por area com trabalho no dia, losango para reuniao, sublinhado se tem diario
est.mes ??= new Date(hoje.getFullYear(), hoje.getMonth(), 1);
est.sel ??= HOJE;
const cal = dir.createDiv({ cls: "cal" });
const desenhar = () => {
  cal.empty();
  const cab = cal.createDiv({ cls: "cal-cab" });
  const ir = n => () => { est.mes = new Date(est.mes.getFullYear(), est.mes.getMonth() + n, 1); desenhar(); };
  cab.createEl("button", { cls: "home-nav", text: "‹", attr: { "aria-label": "Mês anterior" } }).onclick = ir(-1);
  cab.createDiv({ cls: "cal-mes", text: data(est.mes, { month: "long", year: "numeric" }) });
  cab.createEl("button", { cls: "home-nav", text: "›", attr: { "aria-label": "Próximo mês" } }).onclick = ir(1);
  cab.createEl("button", { cls: "home-nav home-nav-hoje", text: "Hoje" }).onclick = () => { est.mes = new Date(hoje.getFullYear(), hoje.getMonth(), 1); est.sel = HOJE; desenhar(); };

  const grade = cal.createDiv({ cls: "cal-grade" });
  for (const s of ["D", "S", "T", "Q", "Q", "S", "S"]) grade.createDiv({ cls: "cal-sem", text: s });
  const ano = est.mes.getFullYear(), mes = est.mes.getMonth(), recuo = est.mes.getDay();
  const semanas = Math.ceil((recuo + new Date(ano, mes + 1, 0).getDate()) / 7);
  for (let i = 0; i < semanas * 7; i++) {
    const d = new Date(ano, mes, 1 - recuo + i), k = chave(d), info = dias[k];
    const partes = [info?.registros.length && `${info.registros.length} registros`, info?.reunioes.length && `${info.reunioes.length} reunião`, info?.diario && "diário"].filter(Boolean);
    const cel = grade.createEl("button", {
      cls: ["cal-dia", d.getMonth() !== mes && "fora", k === HOJE && "hoje", k === est.sel && "sel", info?.diario && "diario"].filter(Boolean).join(" "),
      attr: { "aria-label": data(d, { day: "numeric", month: "long" }) + (partes.length ? `: ${partes.join(", ")}` : "") },
    });
    cel.createSpan({ cls: "cal-num", text: String(d.getDate()) });
    const marcas = cel.createSpan({ cls: "cal-marcas" });
    for (const area of [...new Set(info?.registros.map(r => r.area))].slice(0, 4)) marcas.createSpan({ cls: "cal-ponto" }).style.background = cor(area);
    if (info?.reunioes.length) marcas.createSpan({ cls: "cal-reuniao" });
    cel.onclick = () => { est.sel = k; est.tudo = false; desenhar(); };
  }
  const leg = cal.createDiv({ cls: "cal-legenda" });
  if (PASTA_REGISTROS) leg.createSpan({ text: "● trabalho registrado" });
  leg.createSpan({ text: "◆ reunião" });
  if (comDiario) leg.createSpan({ cls: "cal-leg-diario", text: "sublinhado: diário" });

  // o dia escolhido: diario, reunioes e um item por projeto (o registro mais recente)
  const info = dias[est.sel] ?? { registros: [], reunioes: [], diario: null };
  const [a, m, d] = est.sel.split("-").map(Number);
  const painel = cal.createDiv({ cls: "cal-painel" });
  painel.createDiv({ cls: "cal-painel-titulo", text: data(new Date(a, m - 1, d), { weekday: "long", day: "numeric", month: "long" }) });
  if (info.diario) link(painel, info.diario, "cal-item", "📓 Diário do dia");
  else if (est.sel === HOJE && comDiario) painel.createEl("button", { cls: "cal-botao", text: "Criar o diário de hoje" }).onclick = () => app.commands.executeCommandById(CMD_DIARIO_HOJE);
  for (const r of info.reunioes) link(painel, r.caminho, "cal-item", `◆ ${r.titulo}${r.aberta ? " (aberta)" : ""}`);
  const projetos = new Map();
  for (const r of [...info.registros].sort((x, y) => y.hora.localeCompare(x.hora))) {
    const g = projetos.get(r.projeto); if (g) g.n++; else projetos.set(r.projeto, { ...r, n: 1 });
  }
  const MAX = 6, todos = [...projetos.values()];
  for (const r of est.tudo ? todos : todos.slice(0, MAX)) {
    const titulo = app.metadataCache.getCache(r.caminho)?.headings?.[0]?.heading;
    const item = link(painel, r.caminho, "cal-item cal-reg");
    if (titulo) item.setAttr("aria-label", titulo);
    item.style.setProperty("--qg-cor", cor(r.area));
    item.createSpan({ cls: "cal-ponto" });
    item.createSpan({ cls: "cal-reg-hora", text: r.hora });
    item.createSpan({ cls: "cal-reg-projeto", text: r.projeto });
    if (r.n > 1) item.createSpan({ cls: "cal-reg-n", text: `×${r.n}` });
  }
  if (todos.length > MAX) painel.createEl("button", { cls: "cal-botao", text: est.tudo ? "Mostrar menos" : `+ ${todos.length - MAX} projetos neste dia` }).onclick = () => { est.tudo = !est.tudo; desenhar(); };
  if (!info.diario && !info.reunioes.length && !projetos.size && est.sel !== HOJE) painel.createDiv({ cls: "cal-vazio", text: "Nada neste dia." });
};
desenhar();

// ---- notas: o que esta em andamento (esquerda) e o que mexi por ultimo (direita)
const lista = (pai, titulo, paginas, comPasta) => {
  pai.createDiv({ cls: "home-h", text: titulo });
  const caixa = pai.createDiv({ cls: "home-caixa home-lista" });
  for (const p of paginas) {
    const a = link(caixa, p.file.path, "home-nota");
    a.createSpan({ cls: "home-nota-nome", text: String(p.title ?? p.file.name) }); // o title da nota, se houver
    if (comPasta && p.file.folder) a.createSpan({ cls: "home-nota-pasta", text: p.file.folder.split("/")[0] });
    a.createSpan({ cls: "home-nota-quando", text: ha(p.file.mtime.toMillis()) });
  }
  if (!paginas.length) caixa.createDiv({ cls: "cal-vazio", text: "Nada aqui." });
};
if (PASTA_EM_ANDAMENTO) lista(esq, TITULO_EM_ANDAMENTO || PASTA_EM_ANDAMENTO, dv.pages(`"${PASTA_EM_ANDAMENTO}"`).sort(p => p.file.mtime, "desc").limit(6).array());
const fora = p => dentro(p, [...FORA_DE_RECENTES, PASTA_EM_ANDAMENTO]) || [dv.current().file.path, NOTA_HABITOS].includes(p) || privada(p);
lista(RECENTES_NA_ESQUERDA ? esq : dir, "Mexidas por último", dv.pages()
  .where(p => !fora(p.file.path))
  .sort(p => p.file.mtime, "desc").limit(6).array(), true);
