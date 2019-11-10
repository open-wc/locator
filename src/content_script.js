import { querySelectorAllDeep } from 'query-selector-shadow-dom';

let allCustomElements = [];
let lastElements = [];
let lastElement = '';
let index = 0;

function isCustomElement(el) {
  const isAttr = el.getAttribute('is');

  return el.localName.includes('-') || isAttr && isAttr.includes('-');
}

function findAllCustomElements(nodes) {
  for (let i = 0, el; el = nodes[i]; ++i) {
    if (isCustomElement(el) && el.localName !== 'style' && !allCustomElements.find(ce => ce === el.localName)) {
      allCustomElements.push(el.localName);
    }
    
    if (el.shadowRoot) {
      findAllCustomElements(el.shadowRoot.querySelectorAll('*'));
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.msg === "init") {
    allCustomElements = [];
    findAllCustomElements(document.querySelectorAll('*'));
    sendResponse(allCustomElements)
  }

  if(request.msg === "highlight") {
    if(lastElements.length > 0 ) lastElements.forEach(el => el.style.border = 'none');
    const elements = querySelectorAllDeep(request.elementName)
    elements.forEach(el => {
      el.setAttribute( 'style', 'border: dashed 3px red !important;' );
    })
    lastElements = elements;
  }

  if(request.msg === "cleanup") {
    if(lastElements.length > 0 ) lastElements.forEach(el => el.style.border = 'none');
  }

  if(request.msg === "setVal") {
    const {valName, valType, newValue, type} = request.payload;
    const elements = [...querySelectorAllDeep(request.elementName)];
    
    if(type === "attribute") {
      if(valType === 'boolean' && newValue) {
        elements[index].setAttribute(valName, '');
      } 

      if(valType === 'boolean' && !newValue) {
        elements[index].removeAttribute(valName);
      }

      if(valType !== 'boolean') {
        elements[index].setAttribute(valName, newValue);
      }
    }

    console.log('setting property', valName, valType, newValue, type);
    if(type === "property") {
      if(valType === "{}") {
        console.log(elements[index]);
        console.log(elements[index].objProp);
        console.log(elements[index][`'${valName}'`]);
        // elements[index][valName] = JSON.parse(newValue);
      }
    }
  }

  if(request.msg === "target") {
    if(lastElements.length > 0 ) lastElements.forEach(el => el.style.border = 'none');

    const elements = [...querySelectorAllDeep(request.elementName)];

    if(lastElement === '') {
      lastElement = request.elementName;
    } else {
      if(request.elementName === lastElement && !(index >= elements.length - 1)) {
        index++;
      } else {
        index = 0;
      }
    }

    const isHidden = (el) => {
      if(el.getAttribute('hidden') || el.style.display === 'none') {
        index++;
        isHidden(elements[index]);
      }
    }

    isHidden(elements[index]);

    elements[index].scrollIntoView();

    window.scrollBy(0, -200); 
    elements[index].setAttribute( 'style', 'border: dashed 3px blue !important;' );

    console.group('Custom Element Locator');
    console.log("🎯", elements[index]);
    console.groupEnd();

    lastElements = [elements[index]];
    lastElement = request.elementName;
  }
});
