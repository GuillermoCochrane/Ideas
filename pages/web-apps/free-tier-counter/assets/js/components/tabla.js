// ? Constructores de la tabla
import { createElement, createButton } from '../utilities/dom.js';

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

  const $btnEditar = createButton("✎", null, `Editar fila ${idxGlobal + 1}`, () => onEdit(idxGlobal));
  const $btnEliminar = createButton("×", "peligro", `Eliminar fila ${idxGlobal + 1}`, () => onDelete(idxGlobal));

  $td.append($btnEditar, $btnEliminar);
  return $td;
}

export function crearCeldasPlaceholder() {
  const $tdIdx = createElement("td", "placeholder", "#");
  const $tdHora = createElement("td", "placeholder", "--:--");
  const $tdAcc = createElement("td", "placeholder");

  const $b1 = createButton("✎", null, null, null, true);
  const $b2 = createButton("×", null, null, null, true);

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