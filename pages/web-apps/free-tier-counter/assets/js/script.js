//? orquestador encargado de manejar la aplicación

import { validarFilas } from "./utilities/validators.js";
import { cargar, guardar, exportar, removeStorageItem } from './core/storage.js';
import { construirThead, crearCeldasGrupo } from './components/tabla.js';
import { totalPaginas, clampPagina } from './handlers/pagination.js';
import { mostrarError, limpiarError } from './handlers/errors.js';
import { $, createElement } from './utilities/dom.js';

//* Constantes
const MAX = 65;
const TAM_PAGINA = 8;
const STORAGE_KEY = "capaGratis.v1";
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const mqDesktop = window.matchMedia("(min-width: 700px)");

//* Variables de estado 
let filas = [];
let editando = null;
let paginaActual = 0;

//* Variables del DOM 
const $contadorEl = $("#contador");
const $meterEl = $("#meter");
const $form = $("#form");
const $inputHora = $("#hora");
const $btnSubmit = $("#btn-submit");
const $btnCancelar = $("#btn-cancelar");
const $formError = $("#form-error");
const $formFinalizada = $("#form-finalizada");
const $campoHora = $("#campo-hora");
const $legendHora = $("#legend-hora");
const $tablaThead = $("#tabla-thead");
const $tbody = $("#tbody");
const $tablaVacia = $("#tabla-vacia");
const $paginacion = $("#paginacion");
const $btnPagPrev = $("#btn-pag-prev");
const $btnPagNext = $("#btn-pag-next");
const $pagInfo = $("#pag-info");
const $btnExportar = $("#btn-exportar");
const $btnImportar = $("#btn-importar");
const $btnReiniciar = $("#btn-reiniciar");
const $archivoInput = $("#archivo");


//* ---------- Export / Import ----------
function importarArchivo(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      
      // Ajuste 1: Pasamos HORA_RE
      const candidatas = validarFilas(Array.isArray(data) ? data : data.filas, HORA_RE);
      
      if (!candidatas) {
        mostrarError($formError, "El archivo no tiene un formato válido.");
        return;
      }
      if (candidatas.length > MAX) {
        mostrarError($formError, `El archivo tiene ${candidatas.length} filas; el máximo es ${MAX}.`);
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
      $inputHora.value = "";
      $legendHora.textContent = "Hora";
      $campoHora.classList.remove("editando");
      $btnSubmit.textContent = "Agregar";
      $btnCancelar.hidden = true;
      limpiarError($formError);
      
      // Ajuste 2: Pasamos los parámetros a guardar
      guardar(STORAGE_KEY, filas);
      
      render();
    } catch (_) {
      mostrarError($formError, "No se pudo leer el archivo.");
    }
  };
  reader.onerror = () => mostrarError($formError, "No se pudo leer el archivo.");
  reader.readAsText(file);
}

//* ---------- Reset ----------
function reiniciar() {
  const ok = confirm(
    "Se borrarán todos los registros y el contador volverá a 65. ¿Continuar?",
  );
  if (!ok) return;
  filas = [];
  editando = null;
  paginaActual = 0;
  $inputHora.value = "";
  $legendHora.textContent = "Hora";
  $campoHora.classList.remove("editando");
  $btnSubmit.textContent = "Agregar";
  $btnCancelar.hidden = true;
  limpiarError($formError);
  
  removeStorageItem(STORAGE_KEY);
  
  render();
  $inputHora.focus();
}

//* ---------- Render ----------
function render(nuevaIdx = null) {
  const disponibles = MAX - filas.length;

  // Contador
  $contadorEl.textContent = String(disponibles);
  $meterEl.value = disponibles;
  $meterEl.setAttribute(
    "aria-valuetext",
    `${disponibles} de ${MAX} usos disponibles`,
  );

  // Estado del formulario
  const sinCupo = disponibles <= 0;
  const bloqueado = sinCupo && editando === null;
  $campoHora.hidden = bloqueado;
  $formFinalizada.hidden = !bloqueado;

  // Paginación: clamps
  const total = totalPaginas(filas, TAM_PAGINA);
  paginaActual = clampPagina(paginaActual, total);

  // Thead
  construirThead($tablaThead, mqDesktop.matches);

  // Tbody
  $tbody.textContent = "";
  const esDesktop = mqDesktop.matches;
  const inicio = paginaActual * TAM_PAGINA;

  if (filas.length === 0) {
    // Sin filas: solo thead + mensaje. Sin placeholders.
  } else if (esDesktop) {
    // 4 filas × 6 celdas (grupo 1: inicio+i, grupo 2: inicio+4+i)
    for (let i = 0; i < 4; i++) {
      const $tr = createElement("tr"); 
      const idx1 = inicio + i;
      const idx2 = inicio + 4 + i;
      if (idx1 === nuevaIdx || idx2 === nuevaIdx) $tr.classList.add("nueva");
      
      $tr.append(...crearCeldasGrupo(idx1, filas, iniciarEdicion, eliminarFila));
      $tr.append(...crearCeldasGrupo(idx2, filas, iniciarEdicion, eliminarFila));
      $tbody.appendChild($tr);
    }
  } else {
    // 8 filas × 3 celdas
    for (let i = 0; i < TAM_PAGINA; i++) {
      const idx = inicio + i;
      const $tr = createElement("tr"); 
      if (idx === nuevaIdx) $tr.classList.add("nueva");
      
      $tr.append(...crearCeldasGrupo(idx, filas, iniciarEdicion, eliminarFila));
      $tbody.appendChild($tr);
    }
  }

  // Empty state
  $tablaVacia.hidden = filas.length > 0;

  // Paginador
  const mostrarPag = total > 1;
  $paginacion.hidden = !mostrarPag;
  if (mostrarPag) {
    $pagInfo.textContent = `${paginaActual + 1} / ${total}`;
    $btnPagPrev.disabled = editando !== null || paginaActual === 0;
    $btnPagNext.disabled = editando !== null || paginaActual >= total - 1;
  }
}

//* ---------- Navegación ----------
function irAPagina(n) {
  if (editando !== null) return;
  const total = totalPaginas(filas, TAM_PAGINA);
  if (n < 0 || n >= total) return;
  paginaActual = n;
  render();
}

//* ---------- Edición ----------
function iniciarEdicion(idx) {
  editando = idx;
  paginaActual = Math.floor(idx / TAM_PAGINA);
  $inputHora.value = filas[idx].hora;
  $legendHora.textContent = `Editando fila #${idx + 1}`;
  $campoHora.classList.add("editando");
  $btnSubmit.textContent = "Guardar";
  $btnCancelar.hidden = false;
  limpiarError($formError);
  render();
  $inputHora.focus();
}

function cancelarEdicion() {
  editando = null;
  $inputHora.value = "";
  $legendHora.textContent = "Hora";
  $campoHora.classList.remove("editando");
  $btnSubmit.textContent = "Agregar";
  $btnCancelar.hidden = true;
  limpiarError($formError);
  render();
  $inputHora.focus();
}

//* ---------- Acciones ----------
function eliminarFila(idx) {
  if (editando === idx) {
    editando = null;
    $inputHora.value = "";
    $legendHora.textContent = "Hora";
    $campoHora.classList.remove("editando");
    $btnSubmit.textContent = "Agregar";
    $btnCancelar.hidden = true;
  } else if (editando !== null && editando > idx) {
    editando -= 1;
  }
  filas.splice(idx, 1);
  guardar(STORAGE_KEY, filas);
  limpiarError($formError);
  render();
}

function enviarFormulario(e) {
  e.preventDefault();
  limpiarError($formError);

  const valor = $inputHora.value;
  if (!valor || !HORA_RE.test(valor)) {
    mostrarError($formError, "Ingresá una hora válida (HH:MM).");
    $inputHora.focus();
    return;
  }

  if (editando !== null) {
    filas[editando].hora = valor;
    const idxEditado = editando;
    editando = null;
    $inputHora.value = "";
    $legendHora.textContent = "Hora";
    $campoHora.classList.remove("editando");
    $btnSubmit.textContent = "Agregar";
    $btnCancelar.hidden = true;
    guardar(STORAGE_KEY, filas);
    render(idxEditado);
    $inputHora.focus();
    return;
  }

  if (MAX - filas.length <= 0) {
    mostrarError($formError, "No quedan usos disponibles.");
    return;
  }
  filas.push({ hora: valor });
  const idxNuevo = filas.length - 1;
  paginaActual = Math.floor(idxNuevo / TAM_PAGINA);
  guardar(STORAGE_KEY, filas);
  $inputHora.value = "";
  render(idxNuevo);
  $inputHora.focus();
}

//* ---------- Inicialización de Eventos ----------
function initFormEvents() {
  $form.addEventListener("submit", enviarFormulario);
  $btnCancelar.addEventListener("click", cancelarEdicion);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editando !== null) cancelarEdicion();
  });
}

function initDataEvents() {
  $btnExportar.addEventListener("click", () => exportar(filas));
  $btnImportar.addEventListener("click", () => $archivoInput.click());
  $archivoInput.addEventListener("change", () => {
    const file = $archivoInput.files && $archivoInput.files[0];
    if (file) importarArchivo(file);
    $archivoInput.value = "";
  });
  $btnReiniciar.addEventListener("click", reiniciar);
}

function initPaginationEvents() {
  $btnPagPrev.addEventListener("click", () => irAPagina(paginaActual - 1));
  $btnPagNext.addEventListener("click", () => irAPagina(paginaActual + 1));
}

function initLayoutEvents() {
  mqDesktop.addEventListener("change", () => render());
}

//* ---------- Inicio ----------
filas = cargar(STORAGE_KEY, HORA_RE);

initFormEvents();
initDataEvents();
initPaginationEvents();
initLayoutEvents();

render();