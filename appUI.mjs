import { createHTMLElement, createModalHTML, getExistingHTMLElement, insertHTMLElement } from "./htmlInterface.mjs";

function addModalBody(bodyTarget, bodySrc) {
  if (typeof bodySrc === 'string') bodyTarget.innerText = bodySrc;
  else for (const element of bodySrc) {
    insertHTMLElement(element, bodyTarget);
  }
  return bodyTarget;
}

function addModalFooter(footerTarget, footerSrc) {
  if (typeof footerSrc === 'string') footerTarget.innerText = footerSrc;
  else for (const element of footerSrc) {
    insertHTMLElement(element, footerTarget);
  }
  return bodyTarget;
}

// idPostfix: string, title: string, body: string || array, footer: string || array
let MODALCOUNT = 0;
function createModalHTML(idPostfix, { title, body, footer } = {}) {
  const modal = createHTMLTemplateInstance(getExistingHTMLElement('#modal_instance_template'));
  modal.id += idPostfix == null ? '' : `_${idPostfix}`;
  const HTMLRef = { base: modal };
  HTMLRef.title = getExistingHTMLElement('#modal_x_title', modal);
  HTMLRef.title.innerText = title;
  HTMLRef.body = getExistingHTMLElement('#modal_x_body', modal);
  addModalBody(HTMLRef.body, body);
  HTMLRef.footer = getExistingHTMLElement('#modal_x_footer', modal);
  addModalFooter(HTMLRef.footer, footer);

  ++MODALCOUNT;
  return HTMLRef;
}

class Modal {
  constructor(idPostfix, { title, body, footer } = {}) {
    this.HTMLRef = createModalHTML(idPostfix, { title, body, footer });
    this._title = this.HTMLRef.title.innerText;
  }

  // Add functionality to add event listeners and handlers to instances
}