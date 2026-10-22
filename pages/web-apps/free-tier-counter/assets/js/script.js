//? orquestador encargado de manejar la aplicación

import { validarFilas } from "./utilities/validators.js";
import { getStorageItem, setStorageItem, removeStorageItem, descargarJSON, leerArchivoTexto } from './core/storage.js';
import { construirThead, crearCeldasGrupo } from './components/tabla.js';

const MAX = 65;
const TAM_PAGINA = 8;
const STORAGE_KEY = "capaGratis.v1";
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const mqDesktop = window.matchMedia("(min-width: 700px)");

const $ = (id) => document.getElementById(id);
const contadorEl = $("contador");
const meterEl = $("meter");
const form = $("form");
const inputHora = $("hora");
const btnSubmit = $("btn-submit");
const btnCancelar = $("btn-cancelar");
const formError = $("form-error");
const formFinalizada = $("form-finalizada");
const campoHora = $("campo-hora");
const legendHora = $("legend-hora");
const tablaThead = $("tabla-thead");
const tbody = $("tbody");
const tablaVacia = $("tabla-vacia");
const paginacion = $("paginacion");
const btnPagPrev = $("btn-pag-prev");
const btnPagNext = $("btn-pag-next");
const pagInfo = $("pag-info");
const btnExportar = $("btn-exportar");
const btnImportar = $("btn-importar");
const btnReiniciar = $("btn-reiniciar");
const archivoInput = $("archivo");

let filas = [];
let editando = null;
let paginaActual = 0;

// ---------- Persistencia ----------
function cargar() {
  const data = getStorageItem(STORAGE_KEY);
  if (!data) return;
  const validadas = validarFilas(data && data.filas, HORA_RE);
  if (validadas) filas = validadas;
}

function guardar() {
  setStorageItem(STORAGE_KEY, { filas });
}

// ---------- Export / Import ----------
function exportar() {
  const filename = `capa-gratis-${new Date().toISOString().slice(0, 10)}.json`;
  descargarJSON({ filas }, filename);
}

function importarArchivo(file) {
  leerArchivoTexto(file, (data) => {
    const candidatas = validarFilas(Array.isArray(data) ? data : data.filas, HORA_RE);
    if (!candidatas) {
      mostrarError("El archivo no tiene un formato válido.");
      return;
    }
    if (candidatas.length > MAX) {
      mostrarError(
        `El archivo tiene ${candidatas.length} filas; el máximo es ${MAX}.`,
      );
      return;
    }
    const ok = confirm(
      `Se reemplazarán los registros actuales (${filas.length}) ` +
        `por los del archivo (${candidatas.length}). ¿Continuar?`,
    );
    if (!ok) return;
    
    filas = candidatas;
    editando = null;
    paginaActual = 0;
    inputHora.value = "";
    legendHora.textContent = "Hora";
    campoHora.classList.remove("editando");
    btnSubmit.textContent = "Agregar";
    btnCancelar.hidden = true;
    limpiarError();
    guardar();
    render();
  }, () => {
    mostrarError("No se pudo leer el archivo.");
  });
}

// ---------- Reset ----------
function reiniciar() {
  const ok = confirm(
    "Se borrarán todos los registros y el contador volverá a 65. ¿Continuar?",
  );
  if (!ok) return;
  filas = [];
  editando = null;
  paginaActual = 0;
  inputHora.value = "";
  legendHora.textContent = "Hora";
  campoHora.classList.remove("editando");
  btnSubmit.textContent = "Agregar";
  btnCancelar.hidden = true;
  limpiarError();
  
  removeStorageItem(STORAGE_KEY);
  
  render();
  inputHora.focus();
}

// ---------- Paginación helpers ----------
function totalPaginas() {
  return Math.max(1, Math.ceil(filas.length / TAM_PAGINA));
}

function clampPagina() {
  const t = totalPaginas();
  if (paginaActual >= t) paginaActual = t - 1;
  if (paginaActual < 0) paginaActual = 0;
}

// ---------- Mensajes ----------
function mostrarError(msg) {
  formError.hidden = false;
  formError.textContent = msg;
}
function limpiarError() {
  formError.hidden = true;
  formError.textContent = "";
}

// ---------- Render ----------
function render(nuevaIdx = null) {
  const disponibles = MAX - filas.length;

  // Contador
  contadorEl.textContent = String(disponibles);
  meterEl.value = disponibles;
  meterEl.setAttribute(
    "aria-valuetext",
    `${disponibles} de ${MAX} usos disponibles`,
  );

  // Estado del formulario
  const sinCupo = disponibles <= 0;
  const bloqueado = sinCupo && editando === null;
  campoHora.hidden = bloqueado;
  formFinalizada.hidden = !bloqueado;

  // Paginación: clamps
  clampPagina();
  const total = totalPaginas();

    // Thead
  construirThead(tablaThead, mqDesktop.matches);

  // Tbody
  tbody.textContent = "";
  const esDesktop = mqDesktop.matches;
  const inicio = paginaActual * TAM_PAGINA;

  if (filas.length === 0) {
    // Sin filas: solo thead + mensaje. Sin placeholders.
  } else if (esDesktop) {
    for (let i = 0; i < 4; i++) {
      const tr = document.createElement("tr");
      const idx1 = inicio + i;
      const idx2 = inicio + 4 + i;
      if (idx1 === nuevaIdx || idx2 === nuevaIdx) tr.classList.add("nueva");
      
      tr.append(...crearCeldasGrupo(idx1, filas, iniciarEdicion, eliminarFila));
      tr.append(...crearCeldasGrupo(idx2, filas, iniciarEdicion, eliminarFila));
      tbody.appendChild(tr);
    }
  } else {
    for (let i = 0; i < TAM_PAGINA; i++) {
      const idx = inicio + i;
      const tr = document.createElement("tr");
      if (idx === nuevaIdx) tr.classList.add("nueva");
      
      tr.append(...crearCeldasGrupo(idx, filas, iniciarEdicion, eliminarFila));
      tbody.appendChild(tr);
    }
  }

  // Empty state
  tablaVacia.hidden = filas.length > 0;

  // Paginador
  const mostrarPag = total > 1;
  paginacion.hidden = !mostrarPag;
  if (mostrarPag) {
    pagInfo.textContent = `${paginaActual + 1} / ${total}`;
    btnPagPrev.disabled = editando !== null || paginaActual === 0;
    btnPagNext.disabled = editando !== null || paginaActual >= total - 1;
  }
}

// ---------- Navegación ----------
function irAPagina(n) {
  if (editando !== null) return;
  const total = totalPaginas();
  if (n < 0 || n >= total) return;
  paginaActual = n;
  render();
}

// ---------- Edición ----------
function iniciarEdicion(idx) {
  editando = idx;
  paginaActual = Math.floor(idx / TAM_PAGINA);
  inputHora.value = filas[idx].hora;
  legendHora.textContent = `Editando fila #${idx + 1}`;
  campoHora.classList.add("editando");
  btnSubmit.textContent = "Guardar";
  btnCancelar.hidden = false;
  limpiarError();
  render();
  inputHora.focus();
}

function cancelarEdicion() {
  editando = null;
  inputHora.value = "";
  legendHora.textContent = "Hora";
  campoHora.classList.remove("editando");
  btnSubmit.textContent = "Agregar";
  btnCancelar.hidden = true;
  limpiarError();
  render();
  inputHora.focus();
}

// ---------- Acciones ----------
function eliminarFila(idx) {
  if (editando === idx) {
    editando = null;
    inputHora.value = "";
    legendHora.textContent = "Hora";
    campoHora.classList.remove("editando");
    btnSubmit.textContent = "Agregar";
    btnCancelar.hidden = true;
  } else if (editando !== null && editando > idx) {
    editando -= 1;
  }
  filas.splice(idx, 1);
  guardar();
  limpiarError();
  render();
}

function enviarFormulario(e) {
  e.preventDefault();
  limpiarError();

  const valor = inputHora.value;
  if (!valor || !HORA_RE.test(valor)) {
    mostrarError("Ingresá una hora válida (HH:MM).");
    inputHora.focus();
    return;
  }

  if (editando !== null) {
    filas[editando].hora = valor;
    const idxEditado = editando;
    editando = null;
    inputHora.value = "";
    legendHora.textContent = "Hora";
    campoHora.classList.remove("editando");
    btnSubmit.textContent = "Agregar";
    btnCancelar.hidden = true;
    guardar();
    render(idxEditado);
    inputHora.focus();
    return;
  }

  if (MAX - filas.length <= 0) {
    mostrarError("No quedan usos disponibles.");
    return;
  }
  filas.push({ hora: valor });
  const idxNuevo = filas.length - 1;
  paginaActual = Math.floor(idxNuevo / TAM_PAGINA);
  guardar();
  inputHora.value = "";
  render(idxNuevo);
  inputHora.focus();
}



// ---------- Eventos ----------
form.addEventListener("submit", enviarFormulario);
btnCancelar.addEventListener("click", cancelarEdicion);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editando !== null) cancelarEdicion();
});

btnExportar.addEventListener("click", exportar);
btnImportar.addEventListener("click", () => archivoInput.click());
archivoInput.addEventListener("change", () => {
  const file = archivoInput.files && archivoInput.files[0];
  if (file) importarArchivo(file);
  archivoInput.value = "";
});
btnReiniciar.addEventListener("click", reiniciar);

btnPagPrev.addEventListener("click", () => irAPagina(paginaActual - 1));
btnPagNext.addEventListener("click", () => irAPagina(paginaActual + 1));

mqDesktop.addEventListener("change", () => render());

// ---------- Inicio ----------
cargar();
render();
