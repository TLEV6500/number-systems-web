function createHTMLElement(tagName) {
  return document.createElement(tagName);
}

// element:HTMLElement, props:{key:value,...}
function editHTMLElement(element, props) {
  for (const key in props) {
    if (element.hasAttribute(key)) element[key] = props[key] + '';
  }
  return element;
}

const insertElementPositions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend'];
// element: HTMLElement, target: HTMLElement, position: number[0-3]
function insertHTMLElement(element, target, position) {
  target?.insertAdjacentElement(insertElementPositions[position], element);
  return target;
}

// query: string
function getExistingHTMLElement(query, ref) {
  return (ref ?? document).querySelector(query);
}

function createHTMLTemplateInstance(templateElement) {
  return templateElement.content.cloneNode(true).children[0];
}

export { createHTMLElement, editHTMLElement, insertHTMLElement, getExistingHTMLElement, createHTMLTemplateInstance };