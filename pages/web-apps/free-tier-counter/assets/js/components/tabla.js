// ? Constructores de la tabla y sus filas
import { createRow, createHeader } from '../utilities/dom.js';
import { crearCeldaIdx, crearCeldaHora, crearCeldaAcciones, crearCeldasPlaceholder } from './celdas.js';

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

export function crearCeldasGrupo(idxGlobal, filas, onEdit, onDelete) {
  if (idxGlobal >= filas.length) return crearCeldasPlaceholder();
  return [
    crearCeldaIdx(idxGlobal + 1),
    crearCeldaHora(filas[idxGlobal].hora),
    crearCeldaAcciones(idxGlobal, onEdit, onDelete),
  ];
}