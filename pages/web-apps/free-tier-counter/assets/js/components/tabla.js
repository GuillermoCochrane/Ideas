// ? Constructores de la tabla (Extracción textual)

export function construirThead(tablaThead, esDesktop) {
  tablaThead.textContent = "";
  const tr = document.createElement("tr");
  const grupos = esDesktop ? 2 : 1;
  for (let g = 0; g < grupos; g++) {
    for (const txt of ["#", "Hora", "Acciones"]) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = txt;
      tr.appendChild(th);
    }
  }
  tablaThead.appendChild(tr);
}

export function crearCeldaIdx(n) {
  const td = document.createElement("td");
  td.textContent = String(n);
  return td;
}

export function crearCeldaHora(txt) {
  const td = document.createElement("td");
  td.textContent = txt;
  return td;
}

export function crearCeldaAcciones(idxGlobal, onEdit, onDelete) {
  const td = document.createElement("td");

  const btnEditar = document.createElement("button");
  btnEditar.type = "button";
  btnEditar.textContent = "✎";
  btnEditar.setAttribute("aria-label", `Editar fila ${idxGlobal + 1}`);
  btnEditar.addEventListener("click", () => onEdit(idxGlobal));

  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.className = "peligro";
  btnEliminar.textContent = "×";
  btnEliminar.setAttribute("aria-label", `Eliminar fila ${idxGlobal + 1}`);
  btnEliminar.addEventListener("click", () => onDelete(idxGlobal));

  td.append(btnEditar, btnEliminar);
  return td;
}

export function crearCeldasPlaceholder() {
  const tdIdx = document.createElement("td");
  tdIdx.textContent = "#";
  tdIdx.className = "placeholder";

  const tdHora = document.createElement("td");
  tdHora.textContent = "--:--";
  tdHora.className = "placeholder";

  const tdAcc = document.createElement("td");
  tdAcc.className = "placeholder";

  const b1 = document.createElement("button");
  b1.type = "button";
  b1.textContent = "✎";
  b1.tabIndex = -1;
  b1.disabled = true;
  b1.setAttribute("aria-hidden", "true");

  const b2 = document.createElement("button");
  b2.type = "button";
  b2.textContent = "×";
  b2.tabIndex = -1;
  b2.disabled = true;
  b2.setAttribute("aria-hidden", "true");

  tdAcc.append(b1, b2);

  return [tdIdx, tdHora, tdAcc];
}

export function crearCeldasGrupo(idxGlobal, filas, onEdit, onDelete) {
  if (idxGlobal >= filas.length) return crearCeldasPlaceholder();
  return [
    crearCeldaIdx(idxGlobal + 1),
    crearCeldaHora(filas[idxGlobal].hora),
    crearCeldaAcciones(idxGlobal, onEdit, onDelete),
  ];
}