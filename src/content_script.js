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
  // Get list of custom-elements name to send to the pop-up extension window and display the list
  if(request.msg === "init") {
    allCustomElements = [];
    findAllCustomElements(document.querySelectorAll('*'));
    sendResponse(allCustomElements)
  }

  // Highlight all instances of a particular custom-element
  if(request.msg === "highlight") {
    if(lastElements.length > 0 ) lastElements.forEach(el => el.style.border = 'none');
    const elements = querySelectorAllDeep(request.elementName)
    elements.forEach(el => {
      el.setAttribute( 'style', 'border: dashed 3px red !important;' );
    })
    lastElements = elements;
  }

  // Remove styles
  if(request.msg === "cleanup") {
    if(lastElements.length > 0 ) lastElements.forEach(el => el.style.border = 'none');
  }

  // Tweak
  if(request.msg === "setVal") {
    const {valName, valType, newValue, type, elementName} = request.payload;
    const elements = querySelectorAllDeep(request.elementName);
    
    // Setting attributes
    if(type === "attribute") {
      // Set boolean attribute
      if(valType === 'boolean' && newValue) {
        elements[index].setAttribute(valName, '');
      } 

      // Remove boolean attribute
      if(valType === 'boolean' && !newValue) {
        elements[index].removeAttribute(valName);
      }

      // Set any other string attribute
      if(valType !== 'boolean') {
        elements[index].setAttribute(valName, newValue);
      }
    }

    // Setting properties
    if(type === "property") {
      // Setting Object type properties
      // if(valType === "{}") {

          /**
           * function to execute in the actual page to
           * - import the `querySelectorAllDeep` dependency
           * - `querySelectorAllDeep` the element
           * - set the property
           */
          const fn = `
            import {querySelectorAllDeep} from '${chrome.runtime.getURL("dist/inject.js")}';

            const elements = querySelectorAllDeep('${elementName}');
            elements[${index}]['${valName}'] = ${newValue};
          `

          // create script to inject to the page to execute the fn
          var script = document.createElement('script');
          script.type = "module";
          script.id = "__custom-elements-locator-injected-queryselector"

          // if the script already exists, remove it
          const existingInjectedScript = document.getElementById('__custom-elements-locator-injected-queryselector');
          if(existingInjectedScript) {
            existingInjectedScript.remove();
          } 

          // append script to the page to execute the fn
          script.appendChild(document.createTextNode(fn));
          document.body.appendChild(script);
      // }
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
