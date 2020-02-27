customElements.define('view-json', class extends HTMLElement {
  constructor() {
    super(); // always always
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    let colors = { 
      green: '#f1fa8c', 
      orange: '#bd93f9', 
      blue: '#bd93f9', 
      magenta: '#df9cf3', 
      red: '#66d9ef', 
      black: 'rgb(40, 42, 54)', 
      white: '#dbdff4'
    };
    this.shadowRoot.innerHTML = `
    <style>
    :host {
      font-size: 10px;
    }
    :host pre { background-color: var(--background-color, ${colors.black}); color: var(--color, ${colors.white}); overflow: auto !important; }
    view-json pre { background-color: var(--background-color, ${colors.black}); color: var(--color, ${colors.white}); overflow: auto !important; }
    :host([inline]) > pre { display: inline; }
    view-json[inline] > pre { display: inline; }
    :host([fit]) > pre { width: fit-content; width: -moz-fit-content; width: -webkit-fit-content; }
    view-json[fit] > pre { width: fit-content; width: -moz-fit-content; width: -webkit-fit-content; }
    :host .string { color: var(--string-color, ${colors.green}); }/* :host is SHADOW ONLY */
    view-json .string { color: var(--string-color, ${colors.green}); }
    :host .number { color: var(--number-color, ${colors.orange}); }
    view-json .number { color: var(--number-color, ${colors.orange}); }/* when no shadow is available (shady/light/regular DOM) */
    :host .boolean { color: var(--boolean-color, ${colors.blue}); }
    view-json .boolean { color: var(--boolean-color, ${colors.blue}); }
    :host .null { color: var(--null-color, ${colors.magenta}); }
    view-json .null { color: var(--null-color, ${colors.magenta}); }
    :host .key { color: var(--key-color, ${colors.red}); }
    view-json .key { color: var(--key-color, ${colors.red}); }
    #view-json__pre { 
      box-shadow: 0 2px 2px rgba(0, 0, 0, .3); overflow: scroll; padding: 5px; margin: 0px; }
    </style>
    <pre id="view-json__pre"></pre>
    `;
    this._refresh();
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.target.localName === 'view-json') this._refresh();
      }.bind(this));
    }.bind(this));
    observer.observe(this, { attributes: true, childList: true, characterData: true });
  }
  disconnectedCallback() {}
  _refresh() {
    const preEl = this.shadowRoot.querySelector('#view-json__pre');
    try {
      if (Array.from(this.attributes).map(item => item.name).includes('no-parse')) preEl.innerHTML = this.textContent;
      else preEl.innerHTML = this._syntaxHighlight(this.textContent);
    } catch(e) {
      preEl.innerHTML = `<span class='key'>${e}</span>`;
    }
  }
  _syntaxHighlight(json) {
    if (typeof json != 'string') json = JSON.stringify(json, undefined, 2);
    else json = JSON.stringify(JSON.parse(json), undefined, 2);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let colorCode = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) colorCode = 'key';
        else colorCode = 'string';
      } else if (/true|false/.test(match)) colorCode = 'boolean';
      else if (/null/.test(match)) colorCode = 'null';
      return '<span class="' + colorCode + '">' + match + '</span>';
    });
  }
});