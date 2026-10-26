// ? Constructores de la tabla
import { createElement } from '../utilities/dom.js';

export function construirThead($tablaThead, esDesktop) {
  $tablaThead.textContent = "";
  const $tr = createElement("tr");
  const grupos = esDesktop ? 2 : 1;
  
  for (let g = 0; g < grupos; g++) {
    for (const txt of ["#", "Hora", "Acciones"]) {
      const $th = createElement("th", null, txt); 
      $th.scope = "col";
      $tr.appendChild($th);
    }
  }
  $tablaThead.appendChild($tr);
}

export function crearCeldaIdx(n) {
  return createElement("td", null, String(n));
}

export function crearCeldaHora(txt) {
  return createElement("td", null, txt);
}

export function crearCeldaAcciones(idxGlobal, onEdit, onDelete) {
  const $td = createElement("td");

  const $btnEditar = createElement("button", null, "✎");
  $btnEditar.type = "button";
  $btnEditar.setAttribute("aria-label", `Editar fila ${idxGlobal + 1}`);
  $btnEditar.addEventListener("click", () => onEdit(idxGlobal));

  const $btnEliminar = createElement("button", "peligro", "×");
  $btnEliminar.type = "button";
  $btnEliminar.setAttribute("aria-label", `Eliminar fila ${idxGlobal + 1}`);
  $btnEliminar.addEventListener("click", () => onDelete(idxGlobal));

  $td.append($btnEditar, $btnEliminar);
  return $td;
}

export function crearCeldasPlaceholder() {
  const $tdIdx = createElement("td", "placeholder", "#");
  const $tdHora = createElement("td", "placeholder", "--:--");
  const $tdAcc = createElement("td", "placeholder");

  // Botones invisibles para preservar la altura de la fila
  const $b1 = createElement("button", null, "✎");
  $b1.type = "button";
  $b1.tabIndex = -1;
  $b1.disabled = true;
  $b1.setAttribute("aria-hidden", "true");

  const $b2 = createElement("button", null, "×");
  $b2.type = "button";
  $b2.tabIndex = -1;
  $b2.disabled = true;
  $b2.setAttribute("aria-hidden", "true");

  $tdAcc.append($b1, $b2);

  return [$tdIdx, $tdHora, $tdAcc];
}

export function crearCeldasGrupo(idxGlobal, filas, onEdit, onDelete) {
  if (idxGlobal >= filas.length) return crearCeldasPlaceholder();
  return [
    crearCeldaIdx(idxGlobal + 1),
    crearCeldaHora(filas[idxGlobal].hora),
    crearCeldaAcciones(idxGlobal, onEdit, onDelete),
  ];
}