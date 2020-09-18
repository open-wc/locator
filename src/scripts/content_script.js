import { findAll, reset } from '../utils/content-script-utils.js';
import { querySelectorAllDeep } from 'query-selector-shadow-dom';

let lastElements = [];
let lastElement = '';
let index = 0;
let allCustomElements = [];

const s = document.createElement('script');
s.innerHTML = `
  ${findAll}

  window.addEventListener('load', function() {
    let allCustomElements = [];
    requestIdleCallback(() => {
      allCustomElements = findAllCustomElements(document.querySelectorAll('*'));
      document.dispatchEvent(new CustomEvent('__GET_CUSTOM_ELEMENTS', {
        detail: {
          elements: allCustomElements,
          host: window.location.host,
          href: window.location.href
        }
      }));

      setInterval(() => {
        requestIdleCallback(() => {
          const oldLength = allCustomElements.length;
          const newElements = findAllCustomElements(document.querySelectorAll('*'));
          const mergedElements = [...new Set([...allCustomElements, ...newElements])];
          if(oldLength !== mergedElements.length && !(mergedElements.length < oldLength)) {
            allCustomElements = mergedElements;
            document.dispatchEvent(new CustomEvent('__GET_CUSTOM_ELEMENTS', {
              detail: {
                elements: allCustomElements,
                host: window.location.host,
                href: window.location.href
              }
            }));
          }
        });
      }, 30 * 1000);
    }, { timeout: 2000 })
  });
`;
document.head.append(s);

document.addEventListener('__GET_CUSTOM_ELEMENTS', (e) => {
  const { href, host, elements } = e.detail;
  allCustomElements = elements;
  chrome.runtime.sendMessage({
    msg: 'found_new_elements',
    elements,
    host,
    href
  }, () => {
    /* no op */
  });
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if(request.msg === "get_latest") {
    sendResponse({
      elements: allCustomElements,
      host: window.location.host,
      href: window.location.href
    });
    return true;
  }

  if(request.msg === "highlight") {
    reset(lastElements);
    const elements = querySelectorAllDeep(request.elementName)
    elements.forEach(el => {
      el.setAttribute( 'style', 'border: dashed 3px red !important;' );
    })
    lastElements = elements;
  }

  if(request.msg === "cleanup") {
    reset(lastElements);
  }

  if(request.msg === "target") {
    reset(lastElements);
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
    sendResponse(true);
    return true;
  }
});
