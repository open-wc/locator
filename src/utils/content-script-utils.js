export const reset = elements => {
  if(elements.length > 0 ) elements.forEach(el => el.style.border = 'none');
}

export const findAll = `
  function isCustomElement(el) {
    return customElements.get(el.localName) && el.localName.includes('-');
  }

  let allCustomElements = [];
  function findAllCustomElements(nodes) {
    for (let i = 0, el; el = nodes[i]; ++i) {
      if (isCustomElement(el) && el.localName !== 'style' && !allCustomElements.find(ce => ce === el.localName)) {
        allCustomElements.push(el.localName);
      }

      if (el.shadowRoot) {
        findAllCustomElements(el.shadowRoot.querySelectorAll('*'));
      }
    }
    return allCustomElements;
  }
`;