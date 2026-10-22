// ? Funciones de validación puras
// * Reciben los datos y las reglas por parámetro (Inyección de Dependencias)

export function validarFilas(data, horaRegex) {
  if (!Array.isArray(data)) return null;
  const out = [];
  for (const item of data) {
    if (!item || typeof item.hora !== "string" || !horaRegex.test(item.hora))
      return null;
    out.push({ hora: item.hora });
  }
  return out;
}