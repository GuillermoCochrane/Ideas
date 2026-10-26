// ? Utilidades para manipulación del DOM

//* Obtener elemento DOM
export const $ = (selector, context = document) => context.querySelector(selector);

//* Obtener todos los elementos DOM
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

//* Cambiar el texto de un elemento DOM (recibe el nodo)
export const setText = (element, text) => { element && (element.textContent = text); };

//* Cambiar el valor o propiedad de un elemento DOM (recibe el nodo)
export const setValue = (element, propietary, value) => { element && (element[propietary] = value); };

//* Crear elemento DOM
export function createElement(tagName, className = null, content = null, isHTML = false, id = null) {
    const element = document.createElement(tagName);
    className && (element.className = className);
    id && (element.id = id);
    if (content !== null) {
        isHTML ? (element.innerHTML = content) : (element.textContent = content);
    }
    return element;
}

//* Crear elemento Button
export function createButton(text, className = null, ariaLabel = null, onClick = null, isDisabled = false) {
    const $btn = createElement("button", className, text);
    $btn.type = "button";

    ariaLabel && $btn.setAttribute("aria-label", ariaLabel);
    onClick && $btn.addEventListener("click", onClick);
    
    if (isDisabled) {
        $btn.disabled = true;
        $btn.tabIndex = -1;
        $btn.setAttribute("aria-hidden", "true");
    }

    return $btn;
}

//* Crear elemento de celda de tabla (td)
export function createCell(className = null, content = null) {
    return createElement("td", className, content);
}

//* Crear elemento de fila de tabla (tr)
export function createRow(className = null) {
    return createElement("tr", className);
}

//* Crear elemento de cabecera de tabla (th)
export function createHeader(content = null, scope = "col") {
    const $th = createElement("th", null, content);
    if (scope) $th.scope = scope;
    return $th;
}