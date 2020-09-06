import { querySelectorAllDeep } from 'query-selector-shadow-dom';

let lastElements = [];
let lastElement = '';
let index = 0;

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    port.postMessage({counter: msg.counter+1});
  });
});

let allCustomElements = [];
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if(request.msg === "findAll") {
    const s = document.createElement('script');
    s.innerHTML = `
    requestIdleCallback(() => {
      function isCustomElement(el) {
        const isAttr = el.getAttribute('is');
        return customElements.get(el.localName) && el.localName.includes('-') || isAttr && isAttr.includes('-');
      }

      const allCustomElements = [];

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

      findAllCustomElements(document.querySelectorAll('*'));
      document.dispatchEvent(new CustomEvent('__GET_CUSTOM_ELEMENTS', {
          detail: allCustomElements
      }));
    }, {timeout: 1000});`;
    document.head.append(s);
    s.onload = () => s.remove();

    document.addEventListener('__GET_CUSTOM_ELEMENTS', ({detail}) => {
      allCustomElements = detail;
      sendResponse(allCustomElements.length > 0);
    }, {once: true});
    return true
  }

  if(request.msg === "init") {
    // Custom elements are already found.
    // Return cached ones.
    sendResponse({
      customElements: allCustomElements,
      host: window.location.host
    });
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
