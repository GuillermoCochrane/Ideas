// ? Lógica matemática de paginación

export function totalPaginas(filas, TAM_PAGINA) {
  return Math.max(1, Math.ceil(filas.length / TAM_PAGINA));
}

export function clampPagina(paginaActual, totalPaginas) {
  if (paginaActual >= totalPaginas) return totalPaginas - 1;
  if (paginaActual < 0) return 0;
  return paginaActual;
}