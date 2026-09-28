const CORES = ["#0f766e", "#7c3aed", "#c2410c", "#1d4ed8", "#be123c", "#4d7c0f", "#a16207"];

const lista = document.getElementById("lista");
const status = document.getElementById("status");
const busca = document.getElementById("busca");
const modelo = document.getElementById("modelo-app");

let apps = [];

function corDe(texto) {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CORES[h % CORES.length];
}

function formatarData(iso) {
  const d = new Date(iso + "T12:00:00");
  return isNaN(d) ? iso : d.toLocaleDateString("pt-BR");
}

function semAcento(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function desenhar() {
  const termo = semAcento(busca.value.trim());
  const visiveis = apps.filter(a =>
    !termo || semAcento(`${a.nome} ${a.descricao || ""}`).includes(termo));

  lista.replaceChildren(...visiveis.map(app => {
    const el = modelo.content.firstElementChild.cloneNode(true);
    const icone = el.querySelector(".app-icone");
    if (app.icone) {
      icone.style.backgroundImage = `url("${app.icone}")`;
    } else {
      icone.textContent = app.nome.charAt(0).toUpperCase();
      icone.style.background = corDe(app.id);
    }
    el.querySelector(".app-nome").textContent = app.nome;
    el.querySelector(".app-descricao").textContent = app.descricao || "";
    const meta = [
      app.versao && `Versão ${app.versao}`,
      app.tamanho_mb && `${app.tamanho_mb.toLocaleString("pt-BR")} MB`,
      app.atualizado && `Atualizado em ${formatarData(app.atualizado)}`,
    ].filter(Boolean);
    el.querySelector(".app-meta").textContent = meta.join(" · ");
    const botao = el.querySelector(".botao");
    botao.href = app.apk;
    botao.setAttribute("aria-label", `Baixar APK do ${app.nome}`);
    return el;
  }));

  if (!apps.length) status.textContent = "Nenhum app publicado ainda.";
  else if (!visiveis.length) status.textContent = "Nenhum app encontrado.";
  else status.textContent = "";
}

busca.addEventListener("input", desenhar);

fetch("apps.json", { cache: "no-store" })
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(dados => {
    apps = (dados.apps || []).sort((a, b) =>
      (b.atualizado || "").localeCompare(a.atualizado || ""));
    desenhar();
  })
  .catch(() => { status.textContent = "Não foi possível carregar a lista de apps."; });
