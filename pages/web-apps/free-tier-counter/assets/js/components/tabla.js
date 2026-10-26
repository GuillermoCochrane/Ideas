// ? Constructores de la tabla
import { createRow, createCell, createButton, createHeader } from '../utilities/dom.js';

export function construirThead($tablaThead, esDesktop) {
  $tablaThead.textContent = "";
  const $tr = createRow();
  const grupos = esDesktop ? 2 : 1;
  
  for (let g = 0; g < grupos; g++) {
    for (const txt of ["#", "Hora", "Acciones"]) {
      const $th = createHeader(txt); 
      $tr.appendChild($th);
    }
  }
  $tablaThead.appendChild($tr);
}

export function crearCeldaIdx(n) {
  return createCell(null, String(n));
}

export function crearCeldaHora(txt) {
  return createCell(null, txt);
}

export function crearCeldaAcciones(idxGlobal, onEdit, onDelete) {
  const $td = createCell();

  const $btnEditar = createButton("✎", null, `Editar fila ${idxGlobal + 1}`, () => onEdit(idxGlobal));
  const $btnEliminar = createButton("×", "peligro", `Eliminar fila ${idxGlobal + 1}`, () => onDelete(idxGlobal));

  $td.append($btnEditar, $btnEliminar);
  return $td;
}

export function crearCeldasPlaceholder() {
  const $tdIdx = createCell("placeholder", "#");
  const $tdHora = createCell("placeholder", "--:--");
  const $tdAcc = createCell("placeholder");

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