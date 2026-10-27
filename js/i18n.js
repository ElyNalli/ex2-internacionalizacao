const IDIOMAS = {
  pt: {
    arquivo: "lang/pt.json",
    locale: "pt-BR",
    moeda: "BRL",
    htmlLang: "pt-BR",
  },
  en: {
    arquivo: "lang/en.json",
    locale: "en-US",
    moeda: "USD",
    htmlLang: "en",
  },
};

// Taxa fixa só para demonstrar a conversão de moeda (R$ -> US$)
const TAXA_USD = 0.2;

let textos = {};
let idiomaAtual = localStorage.getItem("idioma") || "pt";
if (!IDIOMAS[idiomaAtual]) idiomaAtual = "pt";

async function carregarIdioma(codigo) {
  const config = IDIOMAS[codigo];
  const resposta = await fetch(config.arquivo);
  textos = await resposta.json();
  idiomaAtual = codigo;
  localStorage.setItem("idioma", codigo);
  aplicarTraducao();
}

function t(chave) {
  return textos[chave] || chave;
}

function aplicarTraducao() {
  const config = IDIOMAS[idiomaAtual];

  document.documentElement.lang = config.htmlLang;

  const chaveTitulo = document.body.dataset.titulo;
  if (chaveTitulo) document.title = t(chaveTitulo);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  document.querySelectorAll("[data-preco]").forEach((el) => {
    el.textContent = formatarMoeda(parseFloat(el.dataset.preco));
  });
  document.querySelectorAll("[data-data]").forEach((el) => {
    el.textContent = formatarData(el.dataset.data);
  });

  const seletor = document.getElementById("seletor-idioma");
  if (seletor) seletor.value = idiomaAtual;

  document
    .querySelectorAll(".invalid-feedback")
    .forEach((el) => (el.textContent = ""));
}

function formatarMoeda(valorEmReais) {
  const config = IDIOMAS[idiomaAtual];
  const valor = config.moeda === "USD" ? valorEmReais * TAXA_USD : valorEmReais;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.moeda,
  }).format(valor);
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return new Intl.DateTimeFormat(IDIOMAS[idiomaAtual].locale).format(data);
}

function configurarFormulario() {
  const form = document.getElementById("form-contato");
  if (!form) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let valido = true;

    form.querySelectorAll("input, textarea").forEach((campo) => {
      const aviso = campo.parentElement.querySelector(".invalid-feedback");
      campo.classList.remove("is-invalid");
      aviso.textContent = "";

      if (campo.value.trim() === "") {
        aviso.textContent = t("erro_obrigatorio");
        campo.classList.add("is-invalid");
        valido = false;
      } else if (
        campo.type === "email" &&
        !/^\S+@\S+\.\S+$/.test(campo.value)
      ) {
        aviso.textContent = t("erro_email");
        campo.classList.add("is-invalid");
        valido = false;
      }
    });

    const sucesso = document.getElementById("msg-sucesso");
    if (valido) {
      sucesso.textContent = t("sucesso_envio");
      sucesso.classList.remove("d-none");
      form.reset();
    } else {
      sucesso.classList.add("d-none");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const seletor = document.getElementById("seletor-idioma");
  if (seletor)
    seletor.addEventListener("change", (e) => carregarIdioma(e.target.value));
  configurarFormulario();
  carregarIdioma(idiomaAtual);
});
