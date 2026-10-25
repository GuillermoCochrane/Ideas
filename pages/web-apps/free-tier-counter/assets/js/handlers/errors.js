// ? Handlers visuales y lógicos del formulario

export function mostrarError(formError, msg) {
  formError.hidden = false;
  formError.textContent = msg;
}

export function limpiarError(formError) {
  formError.hidden = true;
  formError.textContent = "";
}