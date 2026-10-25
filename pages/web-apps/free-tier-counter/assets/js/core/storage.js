// ? Responsabilidad: Persistencia y Archivos
import { validarFilas } from "../utilities/validators.js";

export function cargar(STORAGE_KEY, HORA_RE) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    const validadas = validarFilas(data && data.filas, HORA_RE);
    return validadas || [];
  } catch (_) {
    return [];
  }
}

export function guardar(STORAGE_KEY, filas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ filas }));
  } catch (_) {
    /* modo privado / cuota: ignoramos */
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}

export function exportar(filas) {
  const data = JSON.stringify({ filas }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const filename = `capa-gratis-${new Date().toISOString().slice(0, 10)}.json`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}