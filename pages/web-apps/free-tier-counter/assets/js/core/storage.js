// ? Manejo de persistencia en localStorage y archivos (APIs nativas)

export function getStorageItem(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function setStorageItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {
    /* modo privado / cuota: ignoramos */
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}

export function descargarJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function leerArchivoTexto(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      onSuccess(data);
    } catch (e) {
      onError(e);
    }
  };
  reader.onerror = () => onError(new Error("No se pudo leer el archivo."));
  reader.readAsText(file);
}