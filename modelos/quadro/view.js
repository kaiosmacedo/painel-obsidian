// Quadro geral: le os quadros Kanban de uma pasta e mostra os cartoes por estado. Nao grava nada.
// Usado pela nota Quadro geral (todos os estados) e pela Home (input.alvo e input.estados).
// Depois de rodar, input.cartoes tem os cartoes lidos e input.cor(area) a cor de cada area.
// Clique no cartao: abre o ultimo registro do projeto. Clique numa area: abre o quadro dela.
// Modelo da skill painel-obsidian. Guia: guias/modulos.md.

// ---- ajuste ao cofre (a skill preenche na instalacao)
const PASTA_QUADROS = "Central/Quadros"; // um quadro do plugin Kanban por area; o nome do arquivo e o nome da area
const CORES = { Trabalho: "#1f6feb", Estudos: "#db2777", Pessoal: "#1f9d55" }; // uma cor por area; area sem cor fica cinza
const SECOES = [ // os nomes sao os das colunas dos quadros, na ordem em que aparecem aqui
  { nome: "Esperando você", alerta: true },
  { nome: "Em andamento", alerta: true },
  { nome: "A fazer" },
  { nome: "Feito", dias: 7 }, // so a ultima semana; o resto fica no quadro da area
];
const DIAS_PARADO = 3; // sem registro novo ha 3 dias ou mais: a idade fica laranja
// ---- fim do ajuste

const opcoes = input ?? {};
const cor = opcoes.cor = area => CORES[area] ?? "var(--text-muted)";

// a conversa do app Claude (campo conversa do registro) so abre na maquina que gravou o registro
let MAQUINA = ""; try { MAQUINA = require("os").hostname().toUpperCase(); } catch { /* celular: sem link */ }
const conversaDe = link => { const r = dv.page(link); return r?.conversa && String(r.maquina).toUpperCase() === MAQUINA ? `claude://claude.ai/epitaxy/${r.conversa}` : null; };

const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
const quadros = dv.pages(`"${PASTA_QUADROS}"`).sort(p => p.file.name).array();
const cartoes = opcoes.cartoes = [];
for (const p of quadros) for (const t of p.file.tasks) {
  // cartao: **Projeto** · resumo [[AAAA-MM-DD HHmm MAQUINA Projeto]]
  const m = t.text.match(/^\*\*(.+?)\*\*\s*·?\s*(.*?)\s*(?:\[\[([^\]|]+)(?:\|[^\]]*)?\]\])?\s*$/);
  const reg = m?.[3];
  const d = reg?.match(/^(\d{4})-(\d\d)-(\d\d) (\d\d)(\d\d)/);
  const coluna = t.section?.subpath ?? "";
  const dias = d ? Math.round((hoje - new Date(d[1], d[2] - 1, d[3])) / 864e5) : null;
  cartoes.push({
    area: p.file.name, coluna, dias,
    projeto: m ? m[1] : t.text, resumo: m?.[2] ?? "", link: reg ?? p.file.path,
    quando: d ? d[0] : "", hora: d ? `${d[4]}:${d[5]}` : "",
    parado: dias >= DIAS_PARADO && SECOES.some(s => s.alerta && s.nome === coluna),
    conversa: reg ? conversaDe(reg) : null,
  });
}
cartoes.sort((a, b) => b.quando.localeCompare(a.quando));
const idade = c => c.dias === null ? "" : c.dias <= 0 ? `hoje ${c.hora}` : c.dias === 1 ? "ontem" : `há ${c.dias} dias`;

const raiz = (opcoes.alvo ?? dv.container).createDiv({ cls: "qg" });
const areas = raiz.createDiv({ cls: "qg-areas" });
for (const p of quadros) {
  const a = areas.createEl("a", { cls: "internal-link qg-area-link", text: p.file.name, href: p.file.path, attr: { "data-href": p.file.path } });
  a.style.setProperty("--qg-cor", cor(p.file.name));
}

for (const s of SECOES.filter(s => !opcoes.estados || opcoes.estados.includes(s.nome))) {
  const todos = cartoes.filter(c => c.coluna === s.nome);
  const itens = s.dias ? todos.filter(c => c.dias !== null && c.dias < s.dias) : todos;
  const sec = raiz.createDiv({ cls: (itens.length ? "" : "qg-vazia ") + (s.dias ? "qg-feito" : "") });
  const titulo = sec.createDiv({ cls: "qg-titulo", text: s.dias ? `${s.nome} nos últimos ${s.dias} dias` : s.nome });
  titulo.createSpan({ cls: "qg-conta", text: String(itens.length) });
  if (itens.length) {
    const grade = sec.createDiv({ cls: "qg-grade" });
    for (const c of itens) {
      const a = grade.createEl("a", { cls: "internal-link qg-card", href: c.link, attr: { "data-href": c.link, title: `${c.projeto}\n${c.resumo}` } });
      a.style.setProperty("--qg-cor", cor(c.area));
      const topo = a.createSpan({ cls: "qg-topo" });
      topo.createSpan({ cls: "qg-area", text: c.area });
      const lado = topo.createSpan({ cls: "qg-topo-lado" });
      if (c.conversa) {
        const abrir = e => { e.preventDefault(); e.stopPropagation(); window.open(c.conversa); };
        const b = lado.createSpan({ cls: "qg-conversa", text: "💬", attr: { role: "link", tabindex: "0", "aria-label": "Abrir a conversa no Claude" } });
        b.onclick = abrir;
        b.onkeydown = e => { if (e.key === "Enter") abrir(e); };
      }
      lado.createSpan({ cls: "qg-idade" + (c.parado ? " qg-parado" : ""), text: idade(c) });
      a.createSpan({ cls: "qg-projeto", text: c.projeto });
      if (c.resumo) a.createSpan({ cls: "qg-resumo", text: c.resumo });
    }
  }
  if (itens.length < todos.length) sec.createDiv({ cls: "qg-mais", text: `+ ${todos.length - itens.length} mais antigos nos quadros das áreas` });
}
