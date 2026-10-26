// ? Handler de Event Listeners (Interacciones por dominio)
import { $ } from "../utilities/dom.js";

// Consultamos los elementos que necesitamos solo para los eventos
const $form = $("#form");
const $btnCancelar = $("#btn-cancelar");
const $btnExportar = $("#btn-exportar");
const $btnImportar = $("#btn-importar");
const $archivoInput = $("#archivo");
const $btnReiniciar = $("#btn-reiniciar");
const $btnPagPrev = $("#btn-pag-prev");
const $btnPagNext = $("#btn-pag-next");
const mqDesktop = window.matchMedia("(min-width: 700px)");

//* ---------- Inicialización de Eventos ----------

export function initFormEvents(enviarFormulario, cancelarEdicion, isEditing) {
  $form.addEventListener("submit", enviarFormulario);
  $btnCancelar.addEventListener("click", cancelarEdicion);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isEditing()) cancelarEdicion();
  });
}

export function initDataEvents(exportar, importarArchivo, reiniciar) {
  $btnExportar.addEventListener("click", exportar);
  $btnImportar.addEventListener("click", () => $archivoInput.click());
  $archivoInput.addEventListener("change", () => {
    const file = $archivoInput.files && $archivoInput.files[0];
    if (file) importarArchivo(file);
    $archivoInput.value = "";
  });
  $btnReiniciar.addEventListener("click", reiniciar);
}

export function initPaginationEvents(irAPagina, getPaginaActual) {
  $btnPagPrev.addEventListener("click", () => irAPagina(getPaginaActual() - 1));
  $btnPagNext.addEventListener("click", () => irAPagina(getPaginaActual() + 1));
}

export function initLayoutEvents(render) {
  mqDesktop.addEventListener("change", () => render());
}